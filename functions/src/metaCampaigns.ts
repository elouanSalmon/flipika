import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import * as cors from "cors";
import { decrypt } from "./utils/encryption";

const corsHandler = cors({ origin: true });
const META_API_VERSION = "v21.0";
const META_GRAPH_URL = "https://graph.facebook.com";

/**
 * Get campaigns for a specific Meta Ad Account.
 * Returns id, name, status, objective, etc.
 */
export const getMetaCampaigns = onRequest({ memory: '512MiB' }, async (req, res) => {
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

            // 2. Parse Request
            const { accountId } = req.body;
            if (!accountId) {
                res.status(400).json({ error: "Missing accountId" });
                return;
            }

            // 3. Get stored Meta token
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

            // 4. Decrypt token
            const accessToken = decrypt(tokenData.encrypted_access_token);

            // 5. Fetch campaigns from Meta API
            const accountIdWithPrefix = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
            const campaignsUrl = `${META_GRAPH_URL}/${META_API_VERSION}/${accountIdWithPrefix}/campaigns`
                + `?fields=id,name,status,objective,start_time,stop_time`
                + `&limit=500`
                + `&access_token=${accessToken}`;

            const response = await fetch(campaignsUrl);
            const data = await response.json();

            if (data.error) {
                console.error("[getMetaCampaigns] Meta API error:", data.error);

                if (data.error.code === 190) {
                    res.status(401).json({
                        error: 'Meta Ads token is invalid or expired. Please reconnect.',
                        code: 'TOKEN_EXPIRED',
                    });
                    return;
                }

                throw new Error(`Meta API error: ${data.error.message}`);
            }

            // 6. Format campaigns
            const campaigns = (data.data || []).map((campaign: any) => ({
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                objective: campaign.objective,
                startTime: campaign.start_time,
                stopTime: campaign.stop_time,
            }));

            // Sort by name
            campaigns.sort((a: any, b: any) => a.name.localeCompare(b.name));

            res.status(200).json({
                success: true,
                campaigns,
            });

        } catch (error: any) {
            console.error("[getMetaCampaigns] Error:", error);
            res.status(500).json({ error: `Failed to fetch Meta campaigns: ${error.message}` });
        }
    });
});
