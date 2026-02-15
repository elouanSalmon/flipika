import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import * as cors from "cors";
import { checkRateLimit } from "./rateLimiter";
import { encrypt } from "./utils/encryption";

const corsHandler = cors({ origin: true });

// Helper to safely get env vars
const getEnvVar = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        console.error(`Missing environment variable: ${name}`);
        return "";
    }
    return value;
};

// Generate a random state for CSRF protection
const generateState = (): string => {
    return Array(4).fill(0).map(() => Math.random().toString(36).substring(2)).join('');
};

// Meta Marketing API config
const META_API_VERSION = "v21.0";
const META_GRAPH_URL = "https://graph.facebook.com";

/**
 * Required Meta permissions for ads management.
 * Note: read_insights is deprecated/invalid — ads_read covers insights access.
 */
const META_SCOPES = [
    "ads_read",
    "ads_management",
    "business_management",
].join(",");

/**
 * Initiates the Meta Ads OAuth flow by generating a Facebook Login URL.
 */
export const initiateMetaOAuth = onRequest({ memory: '512MiB' }, async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            // 1. Verify Authentication
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const idToken = authHeader.split('Bearer ')[1];
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const userId = decodedToken.uid;

            // 2. Rate limiting: 5 requests per minute
            const allowed = await checkRateLimit(userId, 'meta_oauth_initiate', {
                maxRequests: 5,
                windowMs: 60000,
            });

            if (!allowed) {
                res.status(429).json({ error: 'Too many requests. Please try again later.' });
                return;
            }

            // 3. Get Meta App credentials
            const appId = getEnvVar('META_APP_ID');
            if (!appId) {
                res.status(500).json({ error: 'Meta App not configured' });
                return;
            }

            // 4. Get origin for callback
            const requestOrigin = req.body.origin || req.headers.origin || req.headers.referer;
            if (!requestOrigin) {
                res.status(400).json({ error: 'Missing origin' });
                return;
            }

            // Clean origin
            const cleanOrigin = requestOrigin.endsWith('/') ? requestOrigin.slice(0, -1) : requestOrigin;
            const redirectUri = `${cleanOrigin}/oauth/meta/callback`;

            // 5. Generate CSRF state and store it
            const state = generateState();
            await admin.firestore()
                .collection('oauth_states')
                .doc(state)
                .set({
                    userId,
                    provider: 'meta',
                    redirectUri,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000),
                });

            // 6. Build Facebook Login URL
            const authUrl = `https://www.facebook.com/${META_API_VERSION}/dialog/oauth`
                + `?client_id=${appId}`
                + `&redirect_uri=${encodeURIComponent(redirectUri)}`
                + `&scope=${encodeURIComponent(META_SCOPES)}`
                + `&state=${state}`
                + `&response_type=code`;

            console.log("[initiateMetaOAuth] Auth URL generated for user:", userId);
            res.status(200).json({ success: true, authUrl });
        } catch (error: any) {
            console.error("[initiateMetaOAuth] Error:", error);
            res.status(500).json({ error: 'An error occurred during Meta authentication.' });
        }
    });
});

/**
 * Handles the Meta OAuth callback:
 * 1. Verifies CSRF state
 * 2. Exchanges code for short-lived token
 * 3. Exchanges short-lived token for long-lived token (60 days)
 * 4. Encrypts and stores the long-lived token
 */
export const handleMetaOAuthCallback = onRequest({ memory: '512MiB' }, async (req, res) => {
    return corsHandler(req, res, async () => {
        // Support both GET (query params) and POST (body)
        const code = (req.query.code || req.body?.code) as string | undefined;
        const state = (req.query.state || req.body?.state) as string | undefined;
        const oauthError = req.query.error || req.body?.error;

        console.log("[handleMetaOAuthCallback] Method:", req.method,
            "Has state:", !!state, "State length:", state?.length,
            "Has code:", !!code);

        // Handle OAuth errors from Facebook
        if (oauthError) {
            console.error("[handleMetaOAuthCallback] OAuth error:", oauthError);
            res.status(400).json({ error: 'Meta OAuth failed', details: oauthError });
            return;
        }

        // Validate inputs - relaxed validation (accept any non-empty string >= 8 chars)
        if (!state || typeof state !== 'string' || state.length < 8) {
            console.error("[handleMetaOAuthCallback] Invalid state:", typeof state, "length:", state?.length);
            res.status(400).json({ error: "Invalid state parameter" });
            return;
        }

        if (!code || typeof code !== 'string') {
            res.status(400).json({ error: "Missing code parameter" });
            return;
        }

        let userId = 'unknown';

        try {
            // 1. Verify state for CSRF protection
            console.log("[handleMetaOAuthCallback] Looking up state:", state.substring(0, 12) + "...");
            const stateDoc = await admin.firestore()
                .collection('oauth_states')
                .doc(state)
                .get();

            if (!stateDoc.exists) {
                // Debug: list recent meta states
                const recentStates = await admin.firestore()
                    .collection('oauth_states')
                    .where('provider', '==', 'meta')
                    .limit(5)
                    .get();
                console.error("[handleMetaOAuthCallback] State NOT found. Recent meta states:",
                    recentStates.docs.map(d => d.id.substring(0, 12) + "..."));
                throw new Error("State not found - it may have expired or was already used");
            }

            const stateData = stateDoc.data()!;
            userId = stateData.userId;
            const redirectUri = stateData.redirectUri;
            console.log("[handleMetaOAuthCallback] State verified for user:", userId);

            // Check expiration
            if (stateData.expiresAt.toMillis() < Date.now()) {
                throw new Error("State has expired");
            }

            // Check provider
            if (stateData.provider !== 'meta') {
                throw new Error("Invalid state provider");
            }

            // 2. Get Meta App credentials
            const appId = getEnvVar('META_APP_ID');
            const appSecret = getEnvVar('META_APP_SECRET');
            if (!appId || !appSecret) {
                throw new Error("Meta App credentials not configured");
            }

            // 3. Exchange code for short-lived access token
            console.log("[handleMetaOAuthCallback] Exchanging code for short-lived token...");
            const tokenUrl = `${META_GRAPH_URL}/${META_API_VERSION}/oauth/access_token`
                + `?client_id=${appId}`
                + `&redirect_uri=${encodeURIComponent(redirectUri)}`
                + `&client_secret=${appSecret}`
                + `&code=${encodeURIComponent(code)}`;

            const shortLivedResponse = await fetch(tokenUrl);
            const shortLivedData = await shortLivedResponse.json();

            if (shortLivedData.error) {
                console.error("[handleMetaOAuthCallback] Short-lived token error:", shortLivedData.error);
                throw new Error(`Meta token exchange failed: ${shortLivedData.error.message}`);
            }

            const shortLivedToken = shortLivedData.access_token;
            console.log("[handleMetaOAuthCallback] Got short-lived token");

            // 4. Exchange short-lived token for long-lived token (60 days)
            console.log("[handleMetaOAuthCallback] Exchanging for long-lived token...");
            const longLivedUrl = `${META_GRAPH_URL}/${META_API_VERSION}/oauth/access_token`
                + `?grant_type=fb_exchange_token`
                + `&client_id=${appId}`
                + `&client_secret=${appSecret}`
                + `&fb_exchange_token=${shortLivedToken}`;

            const longLivedResponse = await fetch(longLivedUrl);
            const longLivedData = await longLivedResponse.json();

            if (longLivedData.error) {
                console.error("[handleMetaOAuthCallback] Long-lived token error:", longLivedData.error);
                throw new Error(`Meta long-lived token exchange failed: ${longLivedData.error.message}`);
            }

            const longLivedToken = longLivedData.access_token;
            const expiresIn = longLivedData.expires_in || 5184000; // Default 60 days
            const expiresAt = new Date(Date.now() + expiresIn * 1000);

            console.log("[handleMetaOAuthCallback] Got long-lived token, expires:", expiresAt.toISOString());

            // 5. Get user info from Meta
            const meResponse = await fetch(`${META_GRAPH_URL}/${META_API_VERSION}/me?fields=id,name,email&access_token=${longLivedToken}`);
            const meData = await meResponse.json();

            // 6. Encrypt and store the long-lived token
            const encryptedToken = encrypt(longLivedToken);

            const tokenDocRef = admin.firestore()
                .collection('users')
                .doc(userId)
                .collection('tokens')
                .doc('meta_ads');

            await tokenDocRef.set({
                encrypted_access_token: encryptedToken,
                expires_at: admin.firestore.Timestamp.fromDate(expiresAt),
                meta_user_id: meData.id || null,
                meta_user_name: meData.name || null,
                scopes: META_SCOPES.split(','),
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log("[handleMetaOAuthCallback] Token stored for user:", userId);

            // 7. Clean up state
            await stateDoc.ref.delete();

            res.status(200).json({ success: true, userId });
        } catch (error: any) {
            console.error("[handleMetaOAuthCallback] Error for user:", userId, error);
            res.status(500).json({ error: error.message || 'Meta OAuth callback failed' });
        }
    });
});

/**
 * Revokes Meta OAuth access and deletes stored tokens.
 */
export const revokeMetaOAuth = onRequest({ memory: '512MiB' }, async (req, res) => {
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
                .doc('meta_ads')
                .get();

            if (tokenDoc.exists) {
                // Delete the token document (we don't need to revoke at Meta side
                // since the token will expire naturally, but we clean up locally)
                await tokenDoc.ref.delete();
                console.log("[revokeMetaOAuth] Token deleted for user:", userId);
            }

            res.status(200).json({
                success: true,
                message: "Meta Ads access revoked successfully",
            });
        } catch (error: any) {
            console.error("[revokeMetaOAuth] Error:", error);
            res.status(500).json({ error: `Failed to revoke Meta OAuth: ${error.message}` });
        }
    });
});
