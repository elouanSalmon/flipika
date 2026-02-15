import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import * as cors from "cors";
import { decrypt } from "./utils/encryption";

const corsHandler = cors({ origin: true });
const META_API_VERSION = "v21.0";
const META_GRAPH_URL = "https://graph.facebook.com";

/**
 * Fetch Meta Ads insights (campaign-level metrics) for a given ad account.
 *
 * Accepts:
 *   - accountId: Meta ad account ID (e.g., "123456789")
 *   - startDate: YYYY-MM-DD
 *   - endDate: YYYY-MM-DD
 *   - level: "campaign" | "adset" | "ad" (default: "campaign")
 *   - fields: string[] (optional, default performance fields)
 */
export const getMetaInsights = onRequest({ memory: '512MiB' }, async (req, res) => {
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

            // 2. Parse request body
            const {
                accountId,
                startDate,
                endDate,
                level = 'campaign',
                fields,
                timeIncrement,
                breakdowns,
            } = req.body;

            if (!accountId || !startDate || !endDate) {
                res.status(400).json({ error: 'Missing required fields: accountId, startDate, endDate' });
                return;
            }

            // Validate level
            if (!['campaign', 'adset', 'ad', 'account'].includes(level)) {
                res.status(400).json({ error: 'Invalid level. Must be campaign, adset, ad, or account.' });
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

            // Check expiration
            if (tokenData.expires_at && tokenData.expires_at.toMillis() < Date.now()) {
                res.status(401).json({
                    error: 'Meta Ads token has expired. Please reconnect your account.',
                    code: 'TOKEN_EXPIRED',
                });
                return;
            }

            // 4. Decrypt token
            const accessToken = decrypt(tokenData.encrypted_access_token);

            // 5. Build fields list
            const defaultFields = [
                'campaign_name',
                'campaign_id',
                'impressions',
                'clicks',
                'spend',
                'cpc',
                'cpm',
                'ctr',
                'reach',
                'frequency',
                'actions',
                'cost_per_action_type',
                'conversions',
                'conversion_values',
            ];

            const requestFields = fields && Array.isArray(fields) && fields.length > 0
                ? fields
                : defaultFields;

            // 6. Fetch insights from Meta API
            let insightsUrl = `${META_GRAPH_URL}/${META_API_VERSION}/act_${accountId}/insights`
                + `?fields=${requestFields.join(',')}`
                + `&time_range={"since":"${startDate}","until":"${endDate}"}`
                + `&level=${level}`
                + `&limit=500`
                + `&access_token=${accessToken}`;

            console.log(`[getMetaInsights] Requesting URL (token redacted): ${insightsUrl.replace(accessToken, 'REDACTED')}`);

            if (timeIncrement) {
                insightsUrl += `&time_increment=${timeIncrement}`;
            }

            if (breakdowns && Array.isArray(breakdowns) && breakdowns.length > 0) {
                insightsUrl += `&breakdowns=${breakdowns.join(',')}`;
            }

            const response = await fetch(insightsUrl);
            const data = await response.json();

            if (data.error) {
                console.error("[getMetaInsights] Meta API Full Error:", JSON.stringify(data.error, null, 2));

                if (data.error.code === 190) {
                    res.status(401).json({
                        error: 'Meta Ads token is invalid or expired. Please reconnect.',
                        code: 'TOKEN_EXPIRED',
                        metaError: data.error,
                    });
                    return;
                }

                res.status(500).json({
                    error: `Meta API error: ${data.error.message}`,
                    code: data.error.code,
                    subcode: data.error.error_subcode,
                    fbtrace_id: data.error.fbtrace_id,
                });
                return;
            }

            // 7. Format response
            const insights = (data.data || []).map((row: any) => {
                // Extract key conversion actions
                const actions = row.actions || [];
                const costPerAction = row.cost_per_action_type || [];

                const getActionValue = (actionType: string) => {
                    const action = actions.find((a: any) => a.action_type === actionType);
                    return action ? parseFloat(action.value) : 0;
                };

                const getCostPerAction = (actionType: string) => {
                    const cost = costPerAction.find((c: any) => c.action_type === actionType);
                    return cost ? parseFloat(cost.value) : 0;
                };

                // Create a clean object with parsed metrics, but keep original fields for breakdowns/dates
                return {
                    ...row,
                    campaignId: row.campaign_id,
                    campaignName: row.campaign_name,
                    impressions: parseInt(row.impressions || '0'),
                    clicks: parseInt(row.clicks || '0'),
                    spend: parseFloat(row.spend || '0'),
                    cpc: parseFloat(row.cpc || '0'),
                    cpm: parseFloat(row.cpm || '0'),
                    ctr: parseFloat(row.ctr || '0'),
                    reach: parseInt(row.reach || '0'),
                    frequency: parseFloat(row.frequency || '0'),
                    // Key actions
                    purchases: getActionValue('purchase'),
                    leads: getActionValue('lead'),
                    addToCart: getActionValue('add_to_cart'),
                    linkClicks: getActionValue('link_click'),
                    pageViews: getActionValue('landing_page_view'),
                    // Cost per action
                    costPerPurchase: getCostPerAction('purchase'),
                    costPerLead: getCostPerAction('lead'),
                };
            });

            console.log(`[getMetaInsights] Fetched ${insights.length} rows for account ${accountId}`);

            res.status(200).json({
                success: true,
                insights,
                pagination: data.paging || null,
            });
        } catch (error: any) {
            console.error("[getMetaInsights] Error:", error);
            res.status(500).json({ error: `Failed to fetch Meta insights: ${error.message}` });
        }
    });
});
