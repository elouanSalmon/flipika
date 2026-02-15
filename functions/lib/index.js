"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugTriggerSchedule = exports.syncBillingScheduled = exports.syncBillingManual = exports.stripeWebhook = exports.createLifetimeCheckout = exports.createStripePortal = exports.createStripeCheckout = exports.revokeOAuth = exports.getAccessibleCustomers = exports.listCampaigns = exports.getMetaCampaigns = exports.getMetaInsights = exports.getMetaAdAccounts = exports.revokeMetaOAuth = exports.handleMetaOAuthCallback = exports.initiateMetaOAuth = exports.migrateClientDataSources = exports.migrateReportsWithAccountNames = exports.processScheduledReports = exports.generateScheduledReports = exports.googleAdsQuery = exports.getAdCreatives = exports.getWidgetMetrics = exports.backupFirestore = exports.generateSitemap = exports.domainRedirect = exports.handleOAuthCallback = exports.initiateOAuth = void 0;
const admin = require("firebase-admin");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const cors = require("cors");
admin.initializeApp();
// Initialize CORS middleware
const corsHandler = cors({ origin: true });
// Re-export OAuth functions
var oauth_1 = require("./oauth");
Object.defineProperty(exports, "initiateOAuth", { enumerable: true, get: function () { return oauth_1.initiateOAuth; } });
Object.defineProperty(exports, "handleOAuthCallback", { enumerable: true, get: function () { return oauth_1.handleOAuthCallback; } });
// Re-export Domain Redirect function
var domainRedirect_1 = require("./domainRedirect");
Object.defineProperty(exports, "domainRedirect", { enumerable: true, get: function () { return domainRedirect_1.domainRedirect; } });
// Re-export Sitemap functions
var generateSitemap_1 = require("./generateSitemap");
Object.defineProperty(exports, "generateSitemap", { enumerable: true, get: function () { return generateSitemap_1.generateSitemap; } });
// Re-export Backup function
var backupFirestore_1 = require("./backupFirestore");
Object.defineProperty(exports, "backupFirestore", { enumerable: true, get: function () { return backupFirestore_1.backupFirestore; } });
// Re-export Widget Metrics function
var widgetMetrics_1 = require("./widgetMetrics");
Object.defineProperty(exports, "getWidgetMetrics", { enumerable: true, get: function () { return widgetMetrics_1.getWidgetMetrics; } });
// Re-export Ad Creatives function
var adCreatives_1 = require("./adCreatives");
Object.defineProperty(exports, "getAdCreatives", { enumerable: true, get: function () { return adCreatives_1.getAdCreatives; } });
// Re-export Query Playground
var queryPlayground_1 = require("./queryPlayground");
Object.defineProperty(exports, "googleAdsQuery", { enumerable: true, get: function () { return queryPlayground_1.googleAdsQuery; } });
// Re-export Scheduled Reports function
const generateScheduledReports_1 = require("./generateScheduledReports");
Object.defineProperty(exports, "generateScheduledReports", { enumerable: true, get: function () { return generateScheduledReports_1.generateScheduledReports; } });
Object.defineProperty(exports, "processScheduledReports", { enumerable: true, get: function () { return generateScheduledReports_1.processScheduledReports; } });
// Re-export Migration functions
var migrateReports_1 = require("./migrateReports");
Object.defineProperty(exports, "migrateReportsWithAccountNames", { enumerable: true, get: function () { return migrateReports_1.migrateReportsWithAccountNames; } });
var migrateClientDataSources_1 = require("./migrations/migrateClientDataSources");
Object.defineProperty(exports, "migrateClientDataSources", { enumerable: true, get: function () { return migrateClientDataSources_1.migrateClientDataSources; } });
// Re-export Meta Ads OAuth functions
var metaOAuth_1 = require("./metaOAuth");
Object.defineProperty(exports, "initiateMetaOAuth", { enumerable: true, get: function () { return metaOAuth_1.initiateMetaOAuth; } });
Object.defineProperty(exports, "handleMetaOAuthCallback", { enumerable: true, get: function () { return metaOAuth_1.handleMetaOAuthCallback; } });
Object.defineProperty(exports, "revokeMetaOAuth", { enumerable: true, get: function () { return metaOAuth_1.revokeMetaOAuth; } });
// Re-export Meta Ads Account functions
var metaAdAccounts_1 = require("./metaAdAccounts");
Object.defineProperty(exports, "getMetaAdAccounts", { enumerable: true, get: function () { return metaAdAccounts_1.getMetaAdAccounts; } });
// Re-export Meta Ads Insights functions
// Re-export Meta Ads Insights functions
var metaInsights_1 = require("./metaInsights");
Object.defineProperty(exports, "getMetaInsights", { enumerable: true, get: function () { return metaInsights_1.getMetaInsights; } });
// Re-export Meta Ads Campaigns functions
var metaCampaigns_1 = require("./metaCampaigns");
Object.defineProperty(exports, "getMetaCampaigns", { enumerable: true, get: function () { return metaCampaigns_1.getMetaCampaigns; } });
// Re-export AI Analyst functions (Genkit Flow)
// export { analyzeCampaignPerformanceFlow } from "./insights";
// Import Stripe functions
const stripe_1 = require("./stripe");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_2 = require("firebase-functions/v2/https");
// Define the secret
const googleAdsDeveloperToken = (0, params_1.defineSecret)("GOOGLE_ADS_DEVELOPER_TOKEN");
/**
 * List campaigns for a specific customer using stored refresh token
 */
exports.listCampaigns = (0, https_1.onRequest)({
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
            const tokenData = tokenDoc.data();
            const refreshToken = tokenData.refresh_token;
            // 4. Initialize Google Ads Client
            const { GoogleAdsApi } = await Promise.resolve().then(() => require("google-ads-api"));
            const client = new GoogleAdsApi({
                client_id: process.env.GOOGLE_ADS_CLIENT_ID,
                client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
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
            const formattedCampaigns = campaigns.map((row) => ({
                id: row.campaign.id?.toString() || '',
                customerId: customerId,
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
        }
        catch (error) {
            console.error("Google Ads API Error:", error);
            res.status(500).json({ error: `Failed to fetch campaigns: ${error.message}` });
        }
    });
});
/**
 * Get accessible customer accounts using stored refresh token
 */
exports.getAccessibleCustomers = (0, https_1.onRequest)({
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
            const tokenData = tokenDoc.data();
            const refreshToken = tokenData.refresh_token;
            // 3. Initialize Google Ads Client (now using v21+ which supports Node.js 22)
            const { GoogleAdsApi } = await Promise.resolve().then(() => require("google-ads-api"));
            const client = new GoogleAdsApi({
                client_id: process.env.GOOGLE_ADS_CLIENT_ID,
                client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
                developer_token: googleAdsDeveloperToken.value(),
            });
            // 4. List accessible customers
            const response = await client.listAccessibleCustomers(refreshToken);
            const resourceNames = response.resource_names || [];
            const accounts = [];
            const batch = admin.firestore().batch();
            // Process concurrent requests
            await Promise.all(resourceNames.slice(0, 20).map(async (resourceName) => {
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
                        const customerId = info.id.toString();
                        let accountName;
                        // Check if descriptive_name is valid and not just the ID
                        if (descriptiveName &&
                            descriptiveName !== customerId &&
                            descriptiveName !== `customers/${customerId}` &&
                            descriptiveName.trim() !== '') {
                            accountName = descriptiveName.trim();
                        }
                        else {
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
                }
                catch (err) {
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
        }
        catch (error) {
            console.error("Google Ads List Customers Error:", error);
            res.status(500).json({ error: `Failed to list customers: ${error.message}` });
        }
    });
});
/**
 * Revokes OAuth access and deletes stored tokens
 */
exports.revokeOAuth = (0, https_1.onRequest)({ memory: '512MiB' }, async (req, res) => {
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
                const tokenData = tokenDoc.data();
                // Revoke with Google via oauth.ts helper (need to import or duplicate logic)
                // Duplicating simplified logic to avoid strict dependency loop or mess
                const { google } = await Promise.resolve().then(() => require("googleapis"));
                const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_ADS_CLIENT_ID, process.env.GOOGLE_ADS_CLIENT_SECRET);
                oauth2Client.setCredentials({
                    refresh_token: tokenData.refresh_token
                });
                try {
                    await oauth2Client.revokeCredentials();
                }
                catch (error) {
                    console.warn("Failed to revoke token with Google:", error);
                }
                await tokenDoc.ref.delete();
            }
            res.status(200).json({
                success: true,
                message: "OAuth access revoked successfully"
            });
        }
        catch (error) {
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
exports.createStripeCheckout = (0, https_2.onCall)({ memory: '512MiB' }, async (request) => {
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
    const result = await (0, stripe_1.createCheckoutSession)(userId, email, priceId, successUrl, cancelUrl, trialPeriodDays || 14);
    return result;
});
/**
 * Creates a Stripe Customer Portal session
 * Callable function from frontend
 */
exports.createStripePortal = (0, https_2.onCall)({ memory: '512MiB' }, async (request) => {
    const userId = request.auth?.uid;
    if (!userId) {
        throw new Error('Unauthorized');
    }
    const { returnUrl } = request.data;
    if (!returnUrl) {
        throw new Error('Missing returnUrl parameter');
    }
    const result = await (0, stripe_1.createCustomerPortalSession)(userId, returnUrl);
    return result;
});
/**
 * Creates a Stripe Checkout session for lifetime deal (one-time payment)
 * Callable function from frontend
 */
exports.createLifetimeCheckout = (0, https_2.onCall)({ memory: '512MiB' }, async (request) => {
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
    const result = await (0, stripe_1.createLifetimeCheckoutSession)(userId, email, priceId, successUrl, cancelUrl);
    return result;
});
/**
 * Handles Stripe webhook events
 * HTTP endpoint for Stripe webhooks
 */
exports.stripeWebhook = (0, https_1.onRequest)({ memory: '512MiB' }, async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
        res.status(400).send('Missing stripe-signature header');
        return;
    }
    try {
        // Get raw body for signature verification
        const rawBody = req.rawBody;
        const result = await (0, stripe_1.handleStripeWebhook)(rawBody, signature);
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});
/**
 * Manually trigger billing sync for a user
 * Callable function from frontend (admin/debug use)
 */
exports.syncBillingManual = (0, https_2.onCall)({ memory: '512MiB' }, async (request) => {
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
        const email = userDoc.data().email;
        if (!email) {
            throw new Error('User email not found');
        }
        // Search for customer in Stripe by email
        const customers = await stripe_1.stripe.customers.list({
            email: email,
            limit: 1,
        });
        if (customers.data.length === 0) {
            throw new Error('No Stripe customer found for this email');
        }
        const customer = customers.data[0];
        // Get customer's subscriptions
        const subscriptions = await stripe_1.stripe.subscriptions.list({
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
        const result = await (0, stripe_1.syncUserBillingByCount)(userId, accountCount, subscription.id);
        return result;
    }
    const subscriptionData = subscriptionDoc.data();
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
    const result = await (0, stripe_1.syncUserBillingByCount)(userId, accountCount, stripeSubscriptionId);
    return result;
});
/**
 * Scheduled function to sync billing for all active subscriptions
 * Runs daily at 2 AM UTC
 */
exports.syncBillingScheduled = (0, scheduler_1.onSchedule)({
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
                const result = await (0, stripe_1.syncUserBilling)(userId, googleAdsCustomerId, stripeSubscriptionId);
                if (result.success) {
                    console.log(`✓ Synced billing for user ${userId}: ${result.previousSeats} → ${result.newSeats} seats`);
                }
                else {
                    console.error(`✗ Failed to sync billing for user ${userId}: ${result.error}`);
                }
            }
            catch (error) {
                console.error(`Error syncing billing for user ${userId}:`, error);
            }
        });
        await Promise.all(syncPromises);
        console.log('Scheduled billing sync completed');
    }
    catch (error) {
        console.error('Error in scheduled billing sync:', error);
    }
});
/**
 * Debug function to manually trigger schedule generation
 * Only for development/testing purposes
 */
exports.debugTriggerSchedule = (0, https_1.onRequest)({ memory: '1GiB' }, async (req, res) => {
    return corsHandler(req, res, async () => {
        // 1. Verify Authentication - DISABLED FOR TESTING
        try {
            // Import the function dynamically or use the exported one if available
            // Since we are in the same package, we can just call it
            // Call the imported functions directly
            await (0, generateScheduledReports_1.processScheduledReports)();
            res.status(200).json({ success: true, message: "Schedule generation triggered manually" });
        }
        catch (error) {
            console.error("Debug trigger error:", error);
            res.status(500).json({ error: `Failed to trigger schedule: ${error.message}` });
        }
    });
});
//# sourceMappingURL=index.js.map