"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOAuthCallback = exports.initiateOAuth = void 0;
const admin = require("firebase-admin");
const https_1 = require("firebase-functions/v2/https");
const cors = require("cors");
const rateLimiter_1 = require("./rateLimiter");
const validators_1 = require("./validators");
// CORS configuration - restrict to allowed origins
const allowedOrigins = [
    'https://flipika.com',
    'https://flipika.web.app',
    'https://flipika.firebaseapp.com',
    'http://localhost:5173', // Dev only
];
const corsHandler = cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
});
// Helper to safely get env vars
const getEnvVar = (name) => {
    const value = process.env[name];
    if (!value) {
        console.error(`Missing environment variable: ${name}`);
        // Don't throw here to allow function to start, but subsequent calls will fail
        return "";
    }
    return value;
};
// OAuth2 client configuration - initialized inside functions to avoid startup errors
const getOAuth2Client = async () => {
    // Lazy load googleapis to avoid startup issues
    const { google } = await Promise.resolve().then(() => require("googleapis"));
    // Get env vars at runtime
    const clientId = getEnvVar('GOOGLE_ADS_CLIENT_ID');
    const clientSecret = getEnvVar('GOOGLE_ADS_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
        throw new Error("Missing Google Ads credentials");
    }
    // Temporarily using flipika.com URL while Google propagates the Cloud Function URL
    // TODO: Switch back to direct Cloud Function URL once Google OAuth propagates:
    // const callbackUrl = 'https://handleoauthcallback-o3qo2yyzia-uc.a.run.app';
    const callbackUrl = 'https://flipika.com/oauth/callback';
    return new google.auth.OAuth2(clientId, clientSecret, callbackUrl);
};
// Generate a random state for CSRF protection
const generateState = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
/**
 * Initiates the OAuth flow by generating an authorization URL
 * Using onRequest with cors package for proper CORS handling
 */
exports.initiateOAuth = (0, https_1.onRequest)({ memory: '512MiB' }, async (req, res) => {
    // Wrap with CORS middleware
    return corsHandler(req, res, async () => {
        console.log("initiateOAuth called");
        try {
            // Get user ID from Authorization header (Firebase ID token)
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const idToken = authHeader.split('Bearer ')[1];
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const userId = decodedToken.uid;
            // Rate limiting: 5 requests per minute
            const allowed = await (0, rateLimiter_1.checkRateLimit)(userId, 'oauth_initiate', {
                maxRequests: 5,
                windowMs: 60000,
            });
            if (!allowed) {
                res.status(429).json({
                    error: 'Too many requests. Please try again later.'
                });
                return;
            }
            const state = generateState();
            // Store state in Firestore for verification
            await admin.firestore()
                .collection('oauth_states')
                .doc(state)
                .set({
                userId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 10 * 60 * 1000) // 10 minutes
            });
            const oauth2Client = await getOAuth2Client();
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: [
                    'https://www.googleapis.com/auth/adwords',
                    'https://www.googleapis.com/auth/analytics.readonly'
                ],
                state,
                prompt: 'consent' // Force consent to get refresh token
            });
            console.log("initiateOAuth successful, URL generated");
            res.status(200).json({
                success: true,
                authUrl
            });
        }
        catch (error) {
            console.error("Error in initiateOAuth:", error);
            // Don't expose internal error details to client
            res.status(500).json({
                error: 'An error occurred during authentication. Please try again.'
            });
        }
    });
});
/**
 * Handles the OAuth callback and exchanges the code for tokens
 */
exports.handleOAuthCallback = (0, https_1.onRequest)({ memory: '512MiB' }, async (req, res) => {
    // Wrap with CORS middleware
    return corsHandler(req, res, async () => {
        const { code, state, error } = req.query;
        // Handle OAuth errors
        if (error) {
            console.error("OAuth error:", error);
            res.status(400).json({ error: 'OAuth failed', details: error });
            return;
        }
        // Validate inputs
        if (!(0, validators_1.isValidState)(state)) {
            console.error("Invalid state parameter:", state);
            res.status(400).json({ error: "Invalid state parameter" });
            return;
        }
        if (!(0, validators_1.isValidOAuthCode)(code)) {
            console.error("Invalid code parameter");
            res.status(400).json({ error: "Invalid code parameter" });
            return;
        }
        let userId = 'unknown';
        try {
            console.log("OAuth callback started, code:", !!code, "state:", !!state);
            // Verify state to prevent CSRF
            const stateDoc = await admin.firestore()
                .collection('oauth_states')
                .doc(state)
                .get();
            if (!stateDoc.exists) {
                console.error("State document not found:", state);
                throw new Error("Invalid state parameter");
            }
            const stateData = stateDoc.data();
            userId = stateData.userId;
            console.log("Found userId from state:", userId);
            // Check if state has expired
            if (stateData.expiresAt.toMillis() < Date.now()) {
                console.error("State expired for userId:", userId);
                throw new Error("State has expired");
            }
            // Exchange code for tokens
            const oauth2Client = await getOAuth2Client();
            console.log("Exchanging code for tokens...");
            const { tokens } = await oauth2Client.getToken(code);
            console.log("Received tokens, has refresh_token:", !!tokens.refresh_token);
            if (!tokens.refresh_token) {
                console.error("No refresh token received for userId:", userId);
                throw new Error("No refresh token received. User may have already authorized this app.");
            }
            // Store refresh token in Firestore
            console.log("Storing refresh token for userId:", userId);
            const docRef = admin.firestore()
                .collection('users')
                .doc(userId)
                .collection('tokens')
                .doc('google_ads');
            await docRef.set({
                refresh_token: tokens.refresh_token,
                scopes: tokens.scope?.split(' ') || [],
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log("Token stored successfully for userId:", userId);
            // Trigger billing sync if user has an active subscription
            try {
                const subscriptionDoc = await admin.firestore()
                    .collection('subscriptions')
                    .doc(userId)
                    .get();
                if (subscriptionDoc.exists) {
                    // Get the first accessible customer ID (MCC or single account)
                    // We'll sync after the user selects their account on the frontend
                    console.log("User has active subscription, billing will sync when account is selected");
                }
            }
            catch (syncError) {
                // Don't fail the OAuth flow if sync fails
                console.error("Error checking subscription for billing sync:", syncError);
            }
            // Clean up state
            await stateDoc.ref.delete();
            console.log("State cleaned up, returning success...");
            // Return success JSON
            res.status(200).json({
                success: true,
                userId
            });
        }
        catch (error) {
            console.error("OAuth callback error for userId:", userId, "error:", error);
            res.status(500).json({
                error: error.message || 'An error occurred during authentication.'
            });
        }
    });
});
//# sourceMappingURL=oauth.js.map