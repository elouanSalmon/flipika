import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { GoogleAdsApi } from 'google-ads-api';

// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY not configured - using placeholder for build');
}
const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.clover',
});

const db = admin.firestore();

/**
 * Synchronizes user billing with Google Ads account count
 * This is the core function that updates Stripe subscription quantity
 * based on the number of active Google Ads accounts
 */
export async function syncUserBilling(
    userId: string,
    googleAdsCustomerId: string,
    stripeSubscriptionId: string
): Promise<{
    success: boolean;
    previousSeats: number;
    newSeats: number;
    updated: boolean;
    error?: string;
}> {
    try {
        console.log(`Starting billing sync for user ${userId}`);

        // Step 1: Get OAuth tokens from Firestore
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new Error('User not found');
        }

        const userData = userDoc.data();
        const accessToken = userData?.googleAds?.accessToken;
        const refreshToken = userData?.googleAds?.refreshToken;

        if (!accessToken || !refreshToken) {
            throw new Error('Google Ads OAuth tokens not found');
        }

        // Step 2: Initialize Google Ads API client
        const client = new GoogleAdsApi({
            client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
            developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
        });

        const customer = client.Customer({
            customer_id: googleAdsCustomerId,
            refresh_token: refreshToken,
        });

        // Step 3: Query Google Ads for active child accounts
        // This GAQL query counts only ENABLED accounts that are NOT managers
        const query = `
      SELECT 
        customer_client.id,
        customer_client.descriptive_name,
        customer_client.status
      FROM customer_client
      WHERE customer_client.status = 'ENABLED'
        AND customer_client.manager = FALSE
    `;

        let activeAccountsCount = 0;
        try {
            const results = await customer.query(query);
            activeAccountsCount = results.length;
            console.log(`Found ${activeAccountsCount} active Google Ads accounts`);
        } catch (error: any) {
            console.error('Error querying Google Ads API:', error);
            throw new Error(`Failed to query Google Ads: ${error.message}`);
        }

        // Step 4: Get current Stripe subscription
        let subscription: Stripe.Subscription;
        try {
            subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        } catch (error: any) {
            console.error('Error retrieving Stripe subscription:', error);
            throw new Error(`Failed to retrieve subscription: ${error.message}`);
        }

        // Step 5: Find the subscription item (should be only one for per-seat pricing)
        const subscriptionItem = subscription.items.data[0];
        if (!subscriptionItem) {
            throw new Error('No subscription item found');
        }

        const currentQuantity = subscriptionItem.quantity || 1;
        console.log(`Current Stripe quantity: ${currentQuantity}, Active accounts: ${activeAccountsCount}`);

        // Step 6: Handle edge case - minimum 1 seat even if 0 accounts
        // This prevents errors and ensures users pay for at least 1 seat
        const newQuantity = Math.max(1, activeAccountsCount);

        // Step 7: Update Stripe subscription if quantity changed
        let updated = false;
        if (currentQuantity !== newQuantity) {
            try {
                await stripe.subscriptionItems.update(subscriptionItem.id, {
                    quantity: newQuantity,
                    proration_behavior: 'create_prorations', // Pro-rate the difference
                });
                console.log(`Updated subscription quantity from ${currentQuantity} to ${newQuantity}`);
                updated = true;

                // Update Firestore subscription record
                await db.collection('subscriptions').doc(userId).update({
                    currentSeats: newQuantity,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                // Log billing event
                await db.collection('billingHistory').add({
                    userId,
                    subscriptionId: stripeSubscriptionId,
                    eventType: 'sync',
                    previousSeats: currentQuantity,
                    newSeats: newQuantity,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    metadata: {
                        googleAdsCustomerId,
                        activeAccountsCount,
                    },
                });
            } catch (error: any) {
                console.error('Error updating Stripe subscription:', error);
                throw new Error(`Failed to update subscription: ${error.message}`);
            }
        } else {
            console.log('No update needed - quantity unchanged');
        }

        return {
            success: true,
            previousSeats: currentQuantity,
            newSeats: newQuantity,
            updated,
        };
    } catch (error: any) {
        console.error('Error in syncUserBilling:', error);

        // Log error to billing history
        try {
            await db.collection('billingHistory').add({
                userId,
                subscriptionId: stripeSubscriptionId,
                eventType: 'sync',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                metadata: {
                    error: error.message,
                    googleAdsCustomerId,
                },
            });
        } catch (logError) {
            console.error('Failed to log error to billing history:', logError);
        }

        return {
            success: false,
            previousSeats: 0,
            newSeats: 0,
            updated: false,
            error: error.message,
        };
    }
}

/**
 * Creates a Stripe Checkout session for new subscriptions
 */
export async function createCheckoutSession(
    userId: string,
    email: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    trialPeriodDays: number = 14
): Promise<{ sessionId: string; url: string }> {
    try {
        // Check if user already has a Stripe customer ID
        const userDoc = await db.collection('users').doc(userId).get();
        let customerId = userDoc.data()?.stripeCustomerId;

        // Create Stripe customer if doesn't exist
        if (!customerId) {
            const customer = await stripe.customers.create({
                email,
                metadata: {
                    userId,
                },
            });
            customerId = customer.id;

            // Save customer ID to Firestore
            await db.collection('users').doc(userId).update({
                stripeCustomerId: customerId,
            });
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1, // Start with 1 seat, will be synced after Google Ads connection
                },
            ],
            subscription_data: {
                trial_period_days: trialPeriodDays,
                metadata: {
                    userId,
                },
            },
            metadata: {
                userId, // Also add to session metadata for checkout.session.completed event
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
            allow_promotion_codes: true,
        });

        return {
            sessionId: session.id,
            url: session.url || '',
        };
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
}

/**
 * Creates a Stripe Customer Portal session for subscription management
 */
export async function createCustomerPortalSession(
    userId: string,
    returnUrl: string
): Promise<{ url: string }> {
    try {
        // Get Stripe customer ID
        const userDoc = await db.collection('users').doc(userId).get();
        const customerId = userDoc.data()?.stripeCustomerId;

        if (!customerId) {
            throw new functions.https.HttpsError('not-found', 'No Stripe customer found');
        }

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });

        return {
            url: session.url,
        };
    } catch (error: any) {
        console.error('Error creating portal session:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
}

/**
 * Handles Stripe webhook events
 */
export async function handleStripeWebhook(
    rawBody: Buffer,
    signature: string
): Promise<{ received: boolean }> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    try {
        // Verify webhook signature
        const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

        console.log(`Received Stripe webhook: ${event.type}`);

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentSucceeded(invoice);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentFailed(invoice);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return { received: true };
    } catch (error: any) {
        console.error('Webhook error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
}

// Webhook event handlers

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) {
        console.error('No userId in checkout session metadata');
        return;
    }

    console.log(`Checkout completed for user ${userId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    if (!userId) {
        console.error('No userId in subscription metadata');
        return;
    }

    // Validate and convert Stripe Unix timestamps (seconds) to milliseconds as integers
    // Stripe timestamps should always be present, but we guard against undefined/null
    const currentPeriodStart = (subscription as any).current_period_start;
    const currentPeriodEnd = (subscription as any).current_period_end;

    if (!currentPeriodStart || !currentPeriodEnd) {
        console.error('Missing required timestamp fields in subscription:', {
            subscriptionId: subscription.id,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
        });
        throw new Error('Missing required timestamp fields in subscription');
    }

    const currentPeriodStartMs = Math.floor(currentPeriodStart * 1000);
    const currentPeriodEndMs = Math.floor(currentPeriodEnd * 1000);

    const subscriptionData = {
        userId,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id || '',
        status: subscription.status,
        currentSeats: subscription.items.data[0]?.quantity || 1,
        currentPeriodStart: admin.firestore.Timestamp.fromMillis(currentPeriodStartMs),
        currentPeriodEnd: admin.firestore.Timestamp.fromMillis(currentPeriodEndMs),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Add trial end date if in trial
    if (subscription.trial_end) {
        const trialEndMs = Math.floor(subscription.trial_end * 1000);
        (subscriptionData as any).trialEndsAt = admin.firestore.Timestamp.fromMillis(trialEndMs);
    }

    // Create or update subscription document
    const subscriptionRef = db.collection('subscriptions').doc(userId);
    const existingDoc = await subscriptionRef.get();

    if (existingDoc.exists) {
        await subscriptionRef.update(subscriptionData);
    } else {
        await subscriptionRef.set({
            ...subscriptionData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    // Log event
    await db.collection('billingHistory').add({
        userId,
        subscriptionId: subscription.id,
        eventType: 'subscription_updated',
        newSeats: subscription.items.data[0]?.quantity || 1,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Subscription updated for user ${userId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    if (!userId) {
        console.error('No userId in subscription metadata');
        return;
    }

    // Update subscription status to canceled
    await db.collection('subscriptions').doc(userId).update({
        status: 'canceled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log event
    await db.collection('billingHistory').add({
        userId,
        subscriptionId: subscription.id,
        eventType: 'subscription_canceled',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Subscription canceled for user ${userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscription = (invoice as any).subscription;
    if (!subscription || typeof subscription !== 'string') return;

    const subscriptionDoc = await db
        .collection('subscriptions')
        .where('stripeSubscriptionId', '==', subscription)
        .limit(1)
        .get();

    if (subscriptionDoc.empty) return;

    const userId = subscriptionDoc.docs[0].data().userId;

    // Log payment success
    await db.collection('billingHistory').add({
        userId,
        subscriptionId: subscription,
        eventType: 'payment_succeeded',
        amount: invoice.amount_paid / 100, // Convert from cents
        currency: invoice.currency,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Payment succeeded for user ${userId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscription = (invoice as any).subscription;
    if (!subscription || typeof subscription !== 'string') return;

    const subscriptionDoc = await db
        .collection('subscriptions')
        .where('stripeSubscriptionId', '==', subscription)
        .limit(1)
        .get();

    if (subscriptionDoc.empty) return;

    const userId = subscriptionDoc.docs[0].data().userId;

    // Log payment failure
    await db.collection('billingHistory').add({
        userId,
        subscriptionId: subscription,
        eventType: 'payment_failed',
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
            attemptCount: invoice.attempt_count,
        },
    });

    console.log(`Payment failed for user ${userId}`);
}
