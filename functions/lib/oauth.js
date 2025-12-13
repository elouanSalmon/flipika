"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOAuthCallback = exports.initiateOAuth = void 0;
const admin = require("firebase-admin");
const https_1 = require("firebase-functions/v2/https");
const cors = require("cors");
// Initialize CORS middleware
const corsHandler = cors({ origin: true });
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
    const appUrl = process.env.APP_URL || 'https://flipika.web.app';
    if (!clientId || !clientSecret) {
        throw new Error("Missing Google Ads credentials");
    }
    return new google.auth.OAuth2(clientId, clientSecret, `${appUrl}/oauth/callback`);
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
            res.status(500).json({ error: `Failed to initiate OAuth: ${error.message}` });
        }
    });
});
/**
 * Handles the OAuth callback and exchanges the code for tokens
 */
exports.handleOAuthCallback = (0, https_1.onRequest)({ memory: '512MiB' }, async (req, res) => {
    const { code, state, error } = req.query;
    // Handle OAuth errors
    if (error) {
        console.error("OAuth error:", error);
        res.redirect(`${process.env.APP_URL || 'https://flipika.web.app'}/app/dashboard?error=oauth_failed`);
        return;
    }
    if (!code || !state) {
        res.status(400).send("Missing code or state parameter");
        return;
    }
    try {
        // Verify state to prevent CSRF
        const stateDoc = await admin.firestore()
            .collection('oauth_states')
            .doc(state)
            .get();
        if (!stateDoc.exists) {
            throw new Error("Invalid state parameter");
        }
        const stateData = stateDoc.data();
        const userId = stateData.userId;
        // Check if state has expired
        if (stateData.expiresAt.toMillis() < Date.now()) {
            throw new Error("State has expired");
        }
        // Exchange code for tokens
        const oauth2Client = await getOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);
        if (!tokens.refresh_token) {
            throw new Error("No refresh token received. User may have already authorized this app.");
        }
        // Store refresh token in Firestore
        await admin.firestore()
            .collection('users')
            .doc(userId)
            .collection('tokens')
            .doc('google_ads')
            .set({
            refresh_token: tokens.refresh_token,
            scopes: tokens.scope?.split(' ') || [],
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        // Clean up state
        await stateDoc.ref.delete();
        // Redirect back to app
        res.redirect(`${process.env.APP_URL || 'https://flipika.web.app'}/app/dashboard?oauth=success`);
    }
    catch (error) {
        console.error("OAuth callback error:", error);
        res.redirect(`${process.env.APP_URL || 'https://flipika.web.app'}/app/dashboard?error=oauth_failed&message=${encodeURIComponent(error.message)}`);
    }
});
//# sourceMappingURL=oauth.js.map