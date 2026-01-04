import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import * as cors from "cors";
import { checkRateLimit } from "./rateLimiter";
import { isValidState, isValidOAuthCode } from "./validators";

// CORS configuration - restrict to allowed origins
const allowedOrigins = [
    'https://flipika.com',
    'https://flipika.web.app',
    'https://flipika-dev.web.app',
    'https://flipika.firebaseapp.com',
    'http://localhost:5173', // Dev only
];

const corsHandler = cors({
    origin: true,
    credentials: true,
});

// Helper to safely get env vars
const getEnvVar = (name: string) => {
    const value = process.env[name];
    if (!value) {
        console.error(`Missing environment variable: ${name}`);
        // Don't throw here to allow function to start, but subsequent calls will fail
        return "";
    }
    return value;
};

// OAuth2 client configuration - initialized inside functions to avoid startup errors
const getOAuth2Client = async (origin: string) => {
    // Lazy load googleapis to avoid startup issues
    const { google } = await import("googleapis");

    // Validate origin against allowed list
    // Remove trailing slash if present for comparison
    const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    if (!allowedOrigins.includes(cleanOrigin)) {
        console.error(`Invalid origin: ${origin}`);
        throw new Error("Invalid origin");
    }

    // Get env vars at runtime
    const clientId = getEnvVar('GOOGLE_ADS_CLIENT_ID');
    const clientSecret = getEnvVar('GOOGLE_ADS_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
        throw new Error("Missing Google Ads credentials");
    }

    // Construct dynamic callback URL based on origin
    const callbackUrl = `${cleanOrigin}/oauth/callback`;
    console.log(`Using callback URL: ${callbackUrl}`);

    return new google.auth.OAuth2(
        clientId,
        clientSecret,
        callbackUrl
    );
};

// Generate a random state for CSRF protection
const generateState = () => {
    // Generate a sufficiently long random string (approx 40-50 chars)
    return Array(4).fill(0).map(() => Math.random().toString(36).substring(2)).join('');
};

/**
 * Initiates the OAuth flow by generating an authorization URL
 * Using onRequest with cors package for proper CORS handling
 */
export const initiateOAuth = onRequest({ memory: '512MiB' }, async (req, res) => {
    console.log(`initiateOAuth request: ${req.method} from ${req.headers.origin}`);

    // Wrap with CORS middleware
    return corsHandler(req, res, async () => {
        console.log("initiateOAuth called (inside CORS middleware)");

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

            // Get origin from request body (preferred) or Referer header
            const requestOrigin = req.body.origin || req.headers.origin || req.headers.referer;
            if (!requestOrigin) {
                res.status(400).json({ error: 'Missing origin' });
                return;
            }

            // Rate limiting: 5 requests per minute
            const allowed = await checkRateLimit(userId, 'oauth_initiate', {
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

            const oauth2Client = await getOAuth2Client(requestOrigin);

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
        } catch (error: any) {
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
export const handleOAuthCallback = onRequest({ memory: '512MiB' }, async (req, res) => {
    // Wrap with CORS middleware
    return corsHandler(req, res, async () => {
        const { code, state, error, origin } = req.query;

        // Handle OAuth errors
        if (error) {
            console.error("OAuth error:", error);
            res.status(400).json({ error: 'OAuth failed', details: error });
            return;
        }

        // Validate inputs
        if (!isValidState(state)) {
            console.error("Invalid state parameter:", state);
            res.status(400).json({ error: "Invalid state parameter" });
            return;
        }

        if (!isValidOAuthCode(code)) {
            console.error("Invalid code parameter");
            res.status(400).json({ error: "Invalid code parameter" });
            return;
        }

        if (!origin) {
            console.error("Missing origin parameter");
            res.status(400).json({ error: "Missing origin parameter" });
            return;
        }

        let userId = 'unknown';

        try {
            console.log("OAuth callback started, code:", !!code, "state:", !!state, "origin:", origin);

            // Verify state to prevent CSRF
            const stateDoc = await admin.firestore()
                .collection('oauth_states')
                .doc(state as string)
                .get();

            if (!stateDoc.exists) {
                console.error("State document not found:", state);
                throw new Error("Invalid state parameter");
            }

            const stateData = stateDoc.data()!;
            userId = stateData.userId;
            console.log("Found userId from state:", userId);

            // Check if state has expired
            if (stateData.expiresAt.toMillis() < Date.now()) {
                console.error("State expired for userId:", userId);
                throw new Error("State has expired");
            }

            // Exchange code for tokens
            const oauth2Client = await getOAuth2Client(origin as string);
            console.log("Exchanging code for tokens...");
            const { tokens } = await oauth2Client.getToken(code as string);
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
            } catch (syncError) {
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

        } catch (error: any) {
            console.error("OAuth callback error for userId:", userId, "error:", error);
            res.status(500).json({
                error: error.message || 'An error occurred during authentication.'
            });
        }
    });
});


