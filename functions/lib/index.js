"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeOAuth = exports.getAccessibleCustomers = exports.listCampaigns = exports.handleOAuthCallback = exports.initiateOAuth = void 0;
const admin = require("firebase-admin");
const https_1 = require("firebase-functions/v2/https");
const cors = require("cors");
admin.initializeApp();
// Initialize CORS middleware
const corsHandler = cors({ origin: true });
// Re-export OAuth functions
var oauth_1 = require("./oauth");
Object.defineProperty(exports, "initiateOAuth", { enumerable: true, get: function () { return oauth_1.initiateOAuth; } });
Object.defineProperty(exports, "handleOAuthCallback", { enumerable: true, get: function () { return oauth_1.handleOAuthCallback; } });
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
/**
 * List campaigns for a specific customer using stored refresh token
 */
exports.listCampaigns = (0, https_1.onRequest)({ memory: '512MiB' }, async (req, res) => {
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
                res.status(412).json({ error: "No Google Ads account connected. Please connect your account first." });
                return;
            }
            const tokenData = tokenDoc.data();
            const refreshToken = tokenData.refresh_token;
            // 4. Initialize Google Ads Client
            const { GoogleAdsApi } = await Promise.resolve().then(() => require("google-ads-api"));
            const client = new GoogleAdsApi({
                client_id: process.env.GOOGLE_ADS_CLIENT_ID,
                client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
                developer_token: DEVELOPER_TOKEN,
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
          metrics.cost_micros,
          metrics.impressions,
          metrics.clicks 
        FROM campaign 
        WHERE campaign.status != 'REMOVED'
        ORDER BY campaign.name
        LIMIT 100
      `;
            const campaigns = await customer.query(query);
            const formattedCampaigns = campaigns.map((row) => ({
                id: row.campaign.id?.toString() || '',
                name: row.campaign.name || 'Unnamed Campaign',
                status: row.campaign.status || 'UNKNOWN',
                cost: (row.metrics?.cost_micros || 0) / 1000000,
                impressions: row.metrics?.impressions || 0,
                clicks: row.metrics?.clicks || 0
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
exports.getAccessibleCustomers = (0, https_1.onRequest)({ memory: '512MiB' }, async (req, res) => {
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
                res.status(412).json({ error: "No Google Ads account connected. Please connect your account first." });
                return;
            }
            const tokenData = tokenDoc.data();
            const refreshToken = tokenData.refresh_token;
            // 3. Initialize Google Ads Client
            const { GoogleAdsApi } = await Promise.resolve().then(() => require("google-ads-api"));
            const client = new GoogleAdsApi({
                client_id: process.env.GOOGLE_ADS_CLIENT_ID,
                client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
                developer_token: DEVELOPER_TOKEN,
            });
            // 4. List accessible customers
            const response = await client.listAccessibleCustomers(refreshToken);
            res.status(200).json({
                success: true,
                customers: response.resource_names || []
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
//# sourceMappingURL=index.js.map