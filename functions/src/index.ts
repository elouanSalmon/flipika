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
export { serveSitemap } from "./serveSitemap";
export { generateSitemap } from "./generateSitemap";

// Re-export Backup function
export { backupFirestore } from "./backupFirestore";


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

          // Query details
          const query = `
            SELECT 
              customer.id, 
              customer.descriptive_name, 
              customer.currency_code, 
              customer.time_zone 
            FROM customer 
            LIMIT 1
          `;

          const rows = await customerClient.query(query);

          if (rows.length > 0 && rows[0].customer) {
            const info = rows[0].customer;
            const accountData = {
              id: info.id!.toString(),
              name: info.descriptive_name || `Account ${info.id}`,
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
