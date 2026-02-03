import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as cors from "cors";

admin.initializeApp();

// Initialize CORS middleware
const corsHandler = cors({ origin: true });

// Re-export OAuth functions
export { initiateOAuth, handleOAuthCallback } from "./oauth";

// Re-export Domain Redirect function
export { domainRedirect } from "./domainRedirect";

// Re-export Sitemap functions
export { generateSitemap } from "./generateSitemap";

// Re-export Backup function
export { backupFirestore } from "./backupFirestore";

// Re-export Widget Metrics function
export { getWidgetMetrics } from "./widgetMetrics";

// Re-export Ad Creatives function
export { getAdCreatives } from "./adCreatives";

// Re-export Query Playground
export { googleAdsQuery } from "./queryPlayground";

// Re-export Scheduled Reports function
import { generateScheduledReports, processScheduledReports } from "./generateScheduledReports";
export { generateScheduledReports, processScheduledReports };

// Re-export Migration functions
export { migrateReportsWithAccountNames } from "./migrateReports";

// Re-export AI Analyst functions (Genkit Flow)
// export { analyzeCampaignPerformanceFlow } from "./insights";


// Import Stripe functions
import {
  createCheckoutSession,
  createLifetimeCheckoutSession,
  createCustomerPortalSession,
  handleStripeWebhook,
  syncUserBilling,
  syncUserBillingByCount,
  stripe
} from "./stripe";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall } from "firebase-functions/v2/https";


// Define the secret
const googleAdsDeveloperToken = defineSecret("GOOGLE_ADS_DEVELOPER_TOKEN");

/**
 * List campaigns for a specific customer using stored refresh token
 */
export const listCampaigns = onRequest({
  memory: '512MiB',
  secrets: [googleAdsDeveloperToken]
}, async (req, res) => {
  return corsHandler(req, res, async () => {
    // 1. Verify Authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
      return;
    }

    try {
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      // 2. Parse Request Body
      const { customerId } = req.body;
      if (!customerId) {
        res.status(400).json({ error: "Missing customerId" });
        return;
      }

      // 3. Get Refresh Token
      const tokenDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('tokens')
        .doc('google_ads')
        .get();

      if (!tokenDoc.exists) {
        res.status(412).json({ error: `No Google Ads account connected for user ${userId}. Please connect your account first.` });
        return;
      }

      const tokenData = tokenDoc.data()!;
      const refreshToken = tokenData.refresh_token;

      // 4. Initialize Google Ads Client
      const { GoogleAdsApi } = await import("google-ads-api");
      const client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        developer_token: googleAdsDeveloperToken.value(),
      });

      const customer = client.Customer({
        customer_id: customerId.replace('customers/', ''),
        refresh_token: refreshToken,
      });

      // 5. Query Campaigns
      const query = `
        SELECT 
          campaign.id, 
          campaign.name, 
          campaign.status,
          campaign.advertising_channel_type,
          campaign.start_date,
          campaign.end_date,
          metrics.cost_micros,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.conversions,
          metrics.conversions_value
        FROM campaign 
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
        LIMIT 100
      `;

      const campaigns = await customer.query(query);

      const formattedCampaigns = campaigns.map((row: any) => ({
        id: row.campaign.id?.toString() || '',
        customerId: customerId, // Inject customerId for frontend mapping
        name: row.campaign.name || 'Unnamed Campaign',
        status: row.campaign.status || 'UNKNOWN',
        type: row.campaign.advertising_channel_type || 'UNKNOWN',
        startDate: row.campaign.start_date || null,
        endDate: row.campaign.end_date || null,
        // Nest metrics to match liveDataService expectations
        metrics: {
          cost_micros: row.metrics?.cost_micros || 0,
          impressions: row.metrics?.impressions || 0,
          clicks: row.metrics?.clicks || 0,
          ctr: row.metrics?.ctr || 0,
          average_cpc: row.metrics?.average_cpc || 0,
          conversions: row.metrics?.conversions || 0,
          conversions_value: row.metrics?.conversions_value || 0
        }
      }));

      res.status(200).json({
        success: true,
        campaigns: formattedCampaigns
      });

    } catch (error: any) {
      console.error("Google Ads API Error:", error);
      res.status(500).json({ error: `Failed to fetch campaigns: ${error.message}` });
    }
  });
});

/**
 * Get accessible customer accounts using stored refresh token
 */
export const getAccessibleCustomers = onRequest({
  memory: '512MiB',
  secrets: [googleAdsDeveloperToken]
}, async (req, res) => {
  return corsHandler(req, res, async () => {
    // 1. Verify Authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      // 2. Get Refresh Token
      const tokenDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('tokens')
        .doc('google_ads')
        .get();

      if (!tokenDoc.exists) {
        res.status(412).json({ error: `No Google Ads account connected for user ${userId}. Please connect your account first.` });
        return;
      }

      const tokenData = tokenDoc.data()!;
      const refreshToken = tokenData.refresh_token;

      // 3. Initialize Google Ads Client (now using v21+ which supports Node.js 22)
      const { GoogleAdsApi } = await import("google-ads-api");
      const client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        developer_token: googleAdsDeveloperToken.value(),
      });

      // 4. List accessible customers
      const response = await client.listAccessibleCustomers(refreshToken);
      const resourceNames = response.resource_names || [];

      const accounts: any[] = [];
      const batch = admin.firestore().batch();

      // Process concurrent requests
      await Promise.all(resourceNames.slice(0, 20).map(async (resourceName: string) => {
        try {
          const customerId = resourceName.split('/')[1];
          const customerClient = client.Customer({
            customer_id: customerId,
            refresh_token: refreshToken,
          });

          // Query details - using manager and descriptive_name fields
          const query = `
            SELECT
              customer.id,
              customer.resource_name,
              customer.descriptive_name,
              customer.manager,
              customer.currency_code,
              customer.time_zone
            FROM customer
            WHERE customer.id = '${customerId}'
            LIMIT 1
          `;

          const rows = await customerClient.query(query);

          if (rows.length > 0 && rows[0].customer) {
            const info = rows[0].customer;

            // Debug: Log what Google Ads returns
            console.log(`[getAccessibleCustomers] Customer ${info.id}:`, {
              id: info.id,
              resource_name: info.resource_name,
              descriptive_name: info.descriptive_name,
              manager: info.manager,
              has_descriptive_name: !!info.descriptive_name,
              descriptive_name_type: typeof info.descriptive_name,
              descriptive_name_length: info.descriptive_name?.length
            });

            // Get the name, handling cases where descriptive_name is empty, null, or equals ID
            const descriptiveName = info.descriptive_name;
            const customerId = info.id!.toString();

            let accountName: string;

            // Check if descriptive_name is valid and not just the ID
            if (descriptiveName &&
              descriptiveName !== customerId &&
              descriptiveName !== `customers/${customerId}` &&
              descriptiveName.trim() !== '') {
              accountName = descriptiveName.trim();
            } else {
              // Fallback to a readable format
              accountName = `Compte Google Ads ${customerId}`;
              console.warn(`[getAccessibleCustomers] No valid descriptive_name for ${customerId}, using fallback name`);
            }

            const accountData = {
              id: customerId,
              name: accountName,
              currency: info.currency_code,
              timezone: info.time_zone,
              status: 'active',
              lastSync: admin.firestore.FieldValue.serverTimestamp()
            };

            accounts.push(accountData);

            // Cache in Firestore
            const docRef = admin.firestore()
              .collection('users')
              .doc(userId)
              .collection('google_ads_accounts')
              .doc(accountData.id);

            batch.set(docRef, accountData, { merge: true });
          }
        } catch (err) {
          console.warn(`Error fetching details for ${resourceName}:`, err);
        }
      }));

      // Commit cache
      if (accounts.length > 0) {
        await batch.commit();
      }

      // Sort by name
      accounts.sort((a, b) => a.name.localeCompare(b.name));

      res.status(200).json({
        success: true,
        customers: accounts
      });

    } catch (error: any) {
      console.error("Google Ads List Customers Error:", error);
      res.status(500).json({ error: `Failed to list customers: ${error.message}` });
    }
  });
});

/**
 * Revokes OAuth access and deletes stored tokens
 */
export const revokeOAuth = onRequest({ memory: '512MiB' }, async (req, res) => {
  return corsHandler(req, res, async () => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;

      const tokenDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('tokens')
        .doc('google_ads')
        .get();

      if (tokenDoc.exists) {
        const tokenData = tokenDoc.data()!;

        // Revoke with Google via oauth.ts helper (need to import or duplicate logic)
        // Duplicating simplified logic to avoid strict dependency loop or mess
        const { google } = await import("googleapis");
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_ADS_CLIENT_ID,
          process.env.GOOGLE_ADS_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
          refresh_token: tokenData.refresh_token
        });

        try {
          await oauth2Client.revokeCredentials();
        } catch (error) {
          console.warn("Failed to revoke token with Google:", error);
        }

        await tokenDoc.ref.delete();
      }

      res.status(200).json({
        success: true,
        message: "OAuth access revoked successfully"
      });

    } catch (error: any) {
      console.error("Revoke OAuth error:", error);
      res.status(500).json({ error: `Failed to revoke OAuth: ${error.message}` });
    }
  });
});

// ============================================================================
// STRIPE SUBSCRIPTION FUNCTIONS
// ============================================================================

/**
 * Creates a Stripe Checkout session for new subscriptions
 * Callable function from frontend
 */
export const createStripeCheckout = onCall({ memory: '512MiB' }, async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const { priceId, successUrl, cancelUrl, trialPeriodDays } = request.data;

  if (!priceId || !successUrl || !cancelUrl) {
    throw new Error('Missing required parameters');
  }

  // Get user email
  const userRecord = await admin.auth().getUser(userId);
  const email = userRecord.email || '';

  const result = await createCheckoutSession(
    userId,
    email,
    priceId,
    successUrl,
    cancelUrl,
    trialPeriodDays || 14
  );

  return result;
});

/**
 * Creates a Stripe Customer Portal session
 * Callable function from frontend
 */
export const createStripePortal = onCall({ memory: '512MiB' }, async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const { returnUrl } = request.data;

  if (!returnUrl) {
    throw new Error('Missing returnUrl parameter');
  }

  const result = await createCustomerPortalSession(userId, returnUrl);
  return result;
});

/**
 * Creates a Stripe Checkout session for lifetime deal (one-time payment)
 * Callable function from frontend
 */
export const createLifetimeCheckout = onCall({ memory: '512MiB' }, async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const { priceId, successUrl, cancelUrl } = request.data;

  if (!priceId || !successUrl || !cancelUrl) {
    throw new Error('Missing required parameters');
  }

  // Get user email
  const userRecord = await admin.auth().getUser(userId);
  const email = userRecord.email || '';

  const result = await createLifetimeCheckoutSession(
    userId,
    email,
    priceId,
    successUrl,
    cancelUrl
  );

  return result;
});

/**
 * Handles Stripe webhook events
 * HTTP endpoint for Stripe webhooks
 */
export const stripeWebhook = onRequest({ memory: '512MiB' }, async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    res.status(400).send('Missing stripe-signature header');
    return;
  }

  try {
    // Get raw body for signature verification
    const rawBody = req.rawBody;

    const result = await handleStripeWebhook(rawBody, signature);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

/**
 * Manually trigger billing sync for a user
 * Callable function from frontend (admin/debug use)
 */
export const syncBillingManual = onCall({ memory: '512MiB' }, async (request) => {
  const userId = request.auth?.uid;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Get user's subscription
  const subscriptionDoc = await admin.firestore()
    .collection('subscriptions')
    .doc(userId)
    .get();

  if (!subscriptionDoc.exists) {
    // If no subscription doc exists yet, check Stripe directly
    // This handles the case where webhooks haven't finished processing yet
    console.log(`No subscription doc found for ${userId}, checking Stripe directly...`);

    // Get user's email to search for customer in Stripe
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const email = userDoc.data()!.email;
    if (!email) {
      throw new Error('User email not found');
    }

    // Search for customer in Stripe by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      throw new Error('No Stripe customer found for this email');
    }

    const customer = customers.data[0];

    // Get customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
      status: 'all',
    });

    if (subscriptions.data.length === 0) {
      throw new Error('No subscription found in Stripe');
    }

    const subscription = subscriptions.data[0];

    // Count Google Ads accounts
    const accountsSnapshot = await admin.firestore()
      .collection('users')
      .doc(userId)
      .collection('google_ads_accounts')
      .get();

    const accountCount = accountsSnapshot.size;
    console.log(`Found ${accountCount} Google Ads accounts for user ${userId}`);

    // Sync using Stripe subscription ID
    const result = await syncUserBillingByCount(userId, accountCount, subscription.id);
    return result;
  }

  const subscriptionData = subscriptionDoc.data()!;
  const stripeSubscriptionId = subscriptionData.stripeSubscriptionId;

  // Count Google Ads accounts from Firestore subcollection
  const accountsSnapshot = await admin.firestore()
    .collection('users')
    .doc(userId)
    .collection('google_ads_accounts')
    .get();

  const accountCount = accountsSnapshot.size;
  console.log(`Found ${accountCount} Google Ads accounts for user ${userId}`);

  // Use the simplified sync function that accepts account count
  const result = await syncUserBillingByCount(userId, accountCount, stripeSubscriptionId);
  return result;
});

/**
 * Scheduled function to sync billing for all active subscriptions
 * Runs daily at 2 AM UTC
 */
export const syncBillingScheduled = onSchedule({
  schedule: 'every day 02:00',
  timeZone: 'UTC',
  memory: '1GiB',
}, async () => {
  console.log('Starting scheduled billing sync...');

  try {
    // Get all active subscriptions
    const subscriptionsSnapshot = await admin.firestore()
      .collection('subscriptions')
      .where('status', 'in', ['active', 'trialing'])
      .get();

    console.log(`Found ${subscriptionsSnapshot.size} active subscriptions to sync`);

    const syncPromises = subscriptionsSnapshot.docs.map(async (doc) => {
      const subscriptionData = doc.data();
      const userId = subscriptionData.userId;
      const stripeSubscriptionId = subscriptionData.stripeSubscriptionId;

      try {
        // Get Google Ads customer ID
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(userId)
          .get();

        const googleAdsCustomerId = userDoc.data()?.googleAds?.customerId;

        if (!googleAdsCustomerId) {
          console.warn(`User ${userId} has no Google Ads account connected, skipping sync`);
          return;
        }

        const result = await syncUserBilling(userId, googleAdsCustomerId, stripeSubscriptionId);

        if (result.success) {
          console.log(`✓ Synced billing for user ${userId}: ${result.previousSeats} → ${result.newSeats} seats`);
        } else {
          console.error(`✗ Failed to sync billing for user ${userId}: ${result.error}`);
        }
      } catch (error: any) {
        console.error(`Error syncing billing for user ${userId}:`, error);
      }
    });

    await Promise.all(syncPromises);
    console.log('Scheduled billing sync completed');
  } catch (error: any) {
    console.error('Error in scheduled billing sync:', error);
  }
});

/**
 * Debug function to manually trigger schedule generation
 * Only for development/testing purposes
 */
export const debugTriggerSchedule = onRequest({ memory: '1GiB' }, async (req, res) => {
  return corsHandler(req, res, async () => {
    // 1. Verify Authentication - DISABLED FOR TESTING
    try {
      // Import the function dynamically or use the exported one if available
      // Since we are in the same package, we can just call it
      // Call the imported functions directly
      await processScheduledReports();

      res.status(200).json({ success: true, message: "Schedule generation triggered manually" });
    } catch (error: any) {
      console.error("Debug trigger error:", error);
      res.status(500).json({ error: `Failed to trigger schedule: ${error.message}` });
    }
  });
});
