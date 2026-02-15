import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import * as cors from "cors";
import { decrypt } from "./utils/encryption";

const corsHandler = cors({ origin: true });
const META_API_VERSION = "v21.0";
const META_GRAPH_URL = "https://graph.facebook.com";

/**
 * Get all accessible ad accounts for the connected Meta user.
 * Returns account_id, name, currency, timezone, etc.
 */
export const getMetaAdAccounts = onRequest({ memory: '512MiB' }, async (req, res) => {
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

            // 2. Get stored Meta token
            const tokenDoc = await admin.firestore()
                .collection('users')
                .doc(userId)
                .collection('tokens')
                .doc('meta_ads')
                .get();

            if (!tokenDoc.exists) {
                res.status(412).json({
                    error: 'No Meta Ads account connected. Please connect your account first.',
                });
                return;
            }

            const tokenData = tokenDoc.data()!;

            // Check token expiration
            if (tokenData.expires_at && tokenData.expires_at.toMillis() < Date.now()) {
                res.status(401).json({
                    error: 'Meta Ads token has expired. Please reconnect your account.',
                    code: 'TOKEN_EXPIRED',
                });
                return;
            }

            // 3. Decrypt token
            const accessToken = decrypt(tokenData.encrypted_access_token);

            // 4. Fetch ad accounts from Meta API
            const accountsUrl = `${META_GRAPH_URL}/${META_API_VERSION}/me/adaccounts`
                + `?fields=account_id,name,currency,timezone_name,account_status`
                + `&limit=100`
                + `&access_token=${accessToken}`;

            const response = await fetch(accountsUrl);
            const data = await response.json();

            if (data.error) {
                console.error("[getMetaAdAccounts] Meta API error:", data.error);

                // Handle expired token
                if (data.error.code === 190) {
                    res.status(401).json({
                        error: 'Meta Ads token is invalid or expired. Please reconnect.',
                        code: 'TOKEN_EXPIRED',
                    });
                    return;
                }

                throw new Error(`Meta API error: ${data.error.message}`);
            }

            // 5. Format accounts
            const accounts = (data.data || []).map((account: any) => ({
                id: account.account_id,
                name: account.name || `Ad Account ${account.account_id}`,
                currency: account.currency,
                timezone: account.timezone_name,
                status: account.account_status === 1 ? 'active' : 'inactive',
            }));

            // 6. Cache in Firestore
            const batch = admin.firestore().batch();
            for (const account of accounts) {
                const docRef = admin.firestore()
                    .collection('users')
                    .doc(userId)
                    .collection('meta_ads_accounts')
                    .doc(account.id);

                batch.set(docRef, {
                    ...account,
                    lastSync: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }

            if (accounts.length > 0) {
                await batch.commit();
            }

            // Also store in integrations doc for frontend listening
            const integrationsDocRef = admin.firestore()
                .collection('users')
                .doc(userId)
                .collection('integrations')
                .doc('meta_ads');

            await integrationsDocRef.set({
                accounts: accounts.map((a: any) => ({ id: a.id, name: a.name })),
                lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });

            // Sort by name
            accounts.sort((a: any, b: any) => a.name.localeCompare(b.name));

            console.log(`[getMetaAdAccounts] Found ${accounts.length} ad accounts for user ${userId}`);

            res.status(200).json({
                success: true,
                accounts,
            });
        } catch (error: any) {
            console.error("[getMetaAdAccounts] Error:", error);
            res.status(500).json({ error: `Failed to fetch Meta ad accounts: ${error.message}` });
        }
    });
});
