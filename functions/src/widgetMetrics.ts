import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const googleAdsDeveloperToken = defineSecret("GOOGLE_ADS_DEVELOPER_TOKEN");

/**
 * Get widget metrics for specific campaigns and date range
 * Used by report widgets to display performance data
 */
export const getWidgetMetrics = onRequest({
    memory: '512MiB',
    secrets: [googleAdsDeveloperToken],
    cors: true,
}, async (req, res) => {
    // Set CORS headers manually for better control
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
        const { customerId, campaignIds, startDate, endDate, widgetType } = req.body;

        console.log('📥 Request received:', {
            customerId,
            campaignIds,
            campaignIdsType: typeof campaignIds,
            campaignIdsIsArray: Array.isArray(campaignIds),
            campaignIdsLength: campaignIds?.length,
            startDate,
            endDate,
            widgetType
        });

        if (!customerId) {
            res.status(400).json({ error: "Missing customerId" });
            return;
        }

        if (!campaignIds || !Array.isArray(campaignIds) || campaignIds.length === 0) {
            res.status(400).json({ error: "Missing or invalid campaignIds" });
            return;
        }

        if (!startDate || !endDate) {
            res.status(400).json({ error: "Missing startDate or endDate" });
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

        console.log('✅ Retrieved Google Ads token for user:', userId);

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

        console.log('✅ Initialized Google Ads client for customer:', customerId);

        // 5. Build query based on widget type
        let query = '';

        if (widgetType === 'performance_overview' || widgetType === 'campaign_chart') {
            // Build campaign ID filter using IN clause (more efficient and avoids parentheses issues)
            const campaignIdList = campaignIds.map((id: string) => id).join(', ');

            console.log('🔧 Building query with campaign IDs:', {
                campaignIds,
                campaignIdList,
                startDate,
                endDate
            });

            query = `
          SELECT 
            campaign.id,
            campaign.name,
            metrics.impressions,
            metrics.clicks,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value,
            metrics.all_conversions_value
          FROM campaign
          WHERE campaign.id IN (${campaignIdList})
            AND segments.date BETWEEN '${startDate}' AND '${endDate}'
            AND campaign.status != 'REMOVED'
        `;

            // For chart data, we need daily breakdown
            if (widgetType === 'campaign_chart') {
                query = `
            SELECT 
              campaign.id,
              campaign.name,
              segments.date,
              metrics.impressions,
              metrics.clicks,
              metrics.cost_micros,
              metrics.conversions
            FROM campaign
            WHERE campaign.id IN (${campaignIdList})
              AND segments.date BETWEEN '${startDate}' AND '${endDate}'
              AND campaign.status != 'REMOVED'
            ORDER BY segments.date ASC
          `;
            }
        }

        // 6. Execute Query
        console.log('🔍 Executing Google Ads query for widget type:', widgetType);
        console.log('📝 GAQL Query:', query.trim());
        const results = await customer.query(query);
        console.log('✅ Query executed successfully, rows returned:', results.length);

        // 7. Format response based on widget type
        if (widgetType === 'performance_overview') {
            // Aggregate metrics across all campaigns
            interface AggregatedMetrics {
                impressions: number;
                clicks: number;
                cost_micros: number;
                conversions: number;
                conversions_value: number;
            }

            const aggregated = results.reduce((acc: AggregatedMetrics, row: any) => {
                return {
                    impressions: (acc.impressions || 0) + (row.metrics?.impressions || 0),
                    clicks: (acc.clicks || 0) + (row.metrics?.clicks || 0),
                    cost_micros: (acc.cost_micros || 0) + (row.metrics?.cost_micros || 0),
                    conversions: (acc.conversions || 0) + (row.metrics?.conversions || 0),
                    conversions_value: (acc.conversions_value || 0) + (row.metrics?.conversions_value || 0),
                };
            }, {
                impressions: 0,
                clicks: 0,
                cost_micros: 0,
                conversions: 0,
                conversions_value: 0,
            });

            // Calculate derived metrics
            const cost = aggregated.cost_micros / 1_000_000;
            const ctr = aggregated.impressions > 0 ? (aggregated.clicks / aggregated.impressions) * 100 : 0;
            const cpc = aggregated.clicks > 0 ? cost / aggregated.clicks : 0;
            const cpa = aggregated.conversions > 0 ? cost / aggregated.conversions : 0;
            const roas = cost > 0 ? aggregated.conversions_value / cost : 0;

            const metrics = [
                { name: 'impressions', value: aggregated.impressions, formatted: new Intl.NumberFormat('fr-FR').format(aggregated.impressions) },
                { name: 'clicks', value: aggregated.clicks, formatted: new Intl.NumberFormat('fr-FR').format(aggregated.clicks) },
                { name: 'ctr', value: ctr, formatted: `${ctr.toFixed(2)}%` },
                { name: 'cpc', value: cpc, formatted: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cpc) },
                { name: 'conversions', value: aggregated.conversions, formatted: new Intl.NumberFormat('fr-FR').format(aggregated.conversions) },
                { name: 'cost', value: cost, formatted: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cost) },
                { name: 'cpa', value: cpa, formatted: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cpa) },
                { name: 'roas', value: roas, formatted: `${roas.toFixed(2)}x` },
            ];

            res.status(200).json({
                success: true,
                metrics
            });

        } else if (widgetType === 'campaign_chart') {
            // Group by date and campaign
            const chartDataMap = new Map<string, any>();
            const campaignsMap = new Map<string, string>();

            results.forEach((row: any) => {
                const date = row.segments?.date;
                const campaignId = row.campaign?.id?.toString();
                const campaignName = row.campaign?.name;

                if (!date || !campaignId) return;

                // Track campaign names
                if (!campaignsMap.has(campaignId)) {
                    campaignsMap.set(campaignId, campaignName || `Campaign ${campaignId}`);
                }

                // Initialize date entry if needed
                if (!chartDataMap.has(date)) {
                    chartDataMap.set(date, { date });
                }

                // Add campaign data for this date
                const dataPoint = chartDataMap.get(date);
                dataPoint[campaignId] = row.metrics?.clicks || 0; // Using clicks as the metric
            });

            // Convert to array and sort by date
            const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

            const campaigns = Array.from(campaignsMap.entries()).map(([id, name]) => ({
                id,
                name
            }));

            res.status(200).json({
                success: true,
                chartData,
                campaigns
            });

        } else {
            res.status(400).json({ error: 'Invalid widgetType' });
        }

    } catch (error: any) {
        console.error("Google Ads Widget Metrics Error:", error);

        // Extract meaningful error message from Google Ads API errors
        let errorMessage = 'Unknown error';
        if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
            // Google Ads API error format
            errorMessage = error.errors.map((e: any) => e.message).join('; ');
        } else if (error?.message) {
            errorMessage = error.message;
        } else if (error?.toString) {
            errorMessage = error.toString();
        }

        res.status(500).json({
            error: `Failed to fetch widget metrics: ${errorMessage}`,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error?.stack,
                type: error?.name,
                code: error?.code
            } : undefined
        });
    }
});
