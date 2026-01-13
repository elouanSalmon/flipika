import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const googleAdsDeveloperToken = defineSecret("GOOGLE_ADS_DEVELOPER_TOKEN");

/**
 * Execute arbitrary GAQL queries against Google Ads API
 * Used for debugging and exploration
 */
export const googleAdsQuery = onRequest({
    memory: '512MiB',
    secrets: [googleAdsDeveloperToken],
    cors: true,
}, async (req, res) => {
    // Set CORS headers manually
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

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
        const { customerId, query } = req.body;

        if (!customerId) {
            res.status(400).json({ error: "Missing customerId" });
            return;
        }

        if (!query || typeof query !== 'string') {
            res.status(400).json({ error: "Missing or invalid query" });
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
            res.status(412).json({ error: `No Google Ads account connected for user ${userId}` });
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

        console.log('🔍 Executing Custom GAQL Query for:', customerId);
        console.log('📝 Query:', query);

        // 5. Execute Query
        // Normalize query slightly but keep user formatting mostly intact, just simple trim
        const results = await customer.query(query.trim());

        console.log('✅ Query executed successfully, rows returned:', results.length);

        res.status(200).json({
            success: true,
            results,
            info: {
                query: query.trim(),
                count: results.length
            }
        });

    } catch (error: any) {
        console.error("Google Ads Query Error:", error);

        // Extract meaningful error message
        let errorMessage = 'Unknown error';
        if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
            errorMessage = error.errors.map((e: any) => e.message).join('; ');
        } else if (error?.message) {
            errorMessage = error.message;
        }

        res.status(500).json({
            success: false,
            error: `Query failed: ${errorMessage}`,
            fullError: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
