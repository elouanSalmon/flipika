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

        if (widgetType === 'performance_overview' || widgetType === 'key_metrics') {
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
        } else if (widgetType === 'campaign_chart') {
            // Build campaign ID filter using IN clause
            const campaignIdList = campaignIds.map((id: string) => id).join(', ');

            console.log('🔧 Building query with campaign IDs:', {
                campaignIds,
                campaignIdList,
                startDate,
                endDate
            });

            // For chart data, we need daily breakdown
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
        } else if (widgetType === 'device_platform_split') {
            // Build campaign ID filter using IN clause
            const campaignIdList = campaignIds.map((id: string) => id).join(', ');

            console.log('🔧 Building query with campaign IDs:', {
                campaignIds,
                campaignIdList,
                startDate,
                endDate
            });

            // Need separate queries for Device and Platform (Network) because querying them together might create too many rows/segments
            // However, we can try to query both segments in one go and aggregate in memory to save API calls
            // segments.device and segments.ad_network_type are compatible
            query = `
            SELECT
                segments.device,
                segments.ad_network_type,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions,
                metrics.conversions_value
            FROM campaign
            WHERE campaign.id IN (${campaignIdList})
                AND segments.date BETWEEN '${startDate}' AND '${endDate}'
                AND campaign.status != 'REMOVED'
                `;
        } else if (widgetType === 'top_performers') {
            const { dimension = 'KEYWORDS', metric = 'COST', limit = 10 } = req.body;
            // Build campaign ID filter using IN clause
            const campaignIdList = campaignIds.map((id: string) => id).join(', ');

            // Determine sort order
            let orderBy = 'metrics.cost_micros DESC';
            if (metric === 'CONVERSIONS') orderBy = 'metrics.conversions DESC';
            else if (metric === 'ROAS') orderBy = 'metrics.conversions_value DESC';

            // Common metrics
            const commonMetrics = `
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions,
                metrics.conversions_value
            `;

            if (dimension === 'KEYWORDS') {
                query = `
                    SELECT
                        ad_group_criterion.keyword.text,
                        ad_group.name,
                        campaign.name,
                        ${commonMetrics}
                    FROM keyword_view
                    WHERE campaign.id IN (${campaignIdList})
                      AND segments.date BETWEEN '${startDate}' AND '${endDate}'
                    ORDER BY ${orderBy}
                    LIMIT ${limit}
                `;
            } else if (dimension === 'SEARCH_TERMS') {
                query = `
                    SELECT
                        search_term_view.search_term,
                        ad_group.name,
                        campaign.name,
                        ${commonMetrics}
                    FROM search_term_view
                    WHERE campaign.id IN (${campaignIdList})
                      AND segments.date BETWEEN '${startDate}' AND '${endDate}'
                    ORDER BY ${orderBy}
                    LIMIT ${limit}
                `;
            } else if (dimension === 'LOCATIONS') {
                query = `
                    SELECT
                        user_location_view.country_criterion_id,
                        campaign.name,
                        ${commonMetrics}
                    FROM user_location_view
                    WHERE campaign.id IN (${campaignIdList})
                      AND segments.date BETWEEN '${startDate}' AND '${endDate}'
                    ORDER BY ${orderBy}
                    LIMIT ${limit}
                `;
            } else if (dimension === 'ADS') {
                query = `
                    SELECT
                        ad_group_ad.ad.name,
                        ad_group_ad.ad.id,
                        ad_group.name,
                        campaign.name,
                        ${commonMetrics}
                    FROM ad_group_ad
                    WHERE campaign.id IN (${campaignIdList})
                      AND segments.date BETWEEN '${startDate}' AND '${endDate}'
                    ORDER BY ${orderBy}
                    LIMIT ${limit}
                `;
            } else {
                // Default fallback if dimension doesn't match known types
                console.warn(`⚠️ Unknown dimension '${dimension}' for top_performers, defaulting to KEYWORDS`);
                query = `
                    SELECT
                        ad_group_criterion.keyword.text,
                        ad_group.name,
                        campaign.name,
                        ${commonMetrics}
                    FROM keyword_view
                    WHERE campaign.id IN (${campaignIdList})
                      AND segments.date BETWEEN '${startDate}' AND '${endDate}'
                    ORDER BY ${orderBy}
                    LIMIT ${limit}
                `;
            }
        } else if (widgetType === 'heatmap') {
            // Build campaign ID filter using IN clause
            const campaignIdList = campaignIds.map((id: string) => id).join(', ');

            console.log('🔧 Building query with campaign IDs:', {
                campaignIds,
                startDate,
                endDate
            });

            // Query segmented by Day of Week and Hour
            query = `
                SELECT
                    segments.day_of_week,
                    segments.hour,
                    metrics.impressions,
                    metrics.clicks,
                    metrics.cost_micros,
                    metrics.conversions,
                    metrics.conversions_value
                FROM campaign
                WHERE campaign.id IN (${campaignIdList})
                  AND segments.date BETWEEN '${startDate}' AND '${endDate}'
                  AND campaign.status != 'REMOVED'
            `;
        }


        if (!query || query.trim() === '') {
            throw new Error(`Failed to generate GAQL query for widget type: ${widgetType}`);
        }

        // 6. Execute Query
        console.log('🔍 Executing Google Ads query for widget type:', widgetType);
        console.log('📝 GAQL Query:', query.trim());
        const results = await customer.query(query.trim());
        console.log('✅ Query executed successfully, rows returned:', results.length);

        // 7. Format response based on widget type
        if (widgetType === 'performance_overview' || widgetType === 'key_metrics') {
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
                { name: 'conversion_value', value: aggregated.conversions_value, formatted: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(aggregated.conversions_value) },
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
                // Note: Using clicks as the primary metric for the chart
                // This is displayed on the Y-axis as "Clics" in the frontend
                const dataPoint = chartDataMap.get(date);
                dataPoint[campaignId] = row.metrics?.clicks || 0;
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

        } else if (widgetType === 'device_platform_split') {
            const deviceMap = new Map<string, any>();
            const platformMap = new Map<string, any>();

            results.forEach((row: any) => {
                const device = row.segments?.device; // 'MOBILE', 'DESKTOP', 'TABLET', 'OTHER', 'UNKNOWN'
                const network = row.segments?.adNetworkType; // 'SEARCH', 'DISPLAY', 'YOUTUBE_SEARCH', 'YOUTUBE_WATCH', 'MIXED', 'CONTENT'

                // Metrics
                const metrics = {
                    impressions: row.metrics?.impressions || 0,
                    clicks: row.metrics?.clicks || 0,
                    cost_micros: row.metrics?.costMicros || 0,
                    conversions: row.metrics?.conversions || 0,
                    conversions_value: row.metrics?.conversionsValue || 0,
                };

                // Aggregate Device
                if (device) {
                    if (!deviceMap.has(device)) {
                        deviceMap.set(device, { name: device, ...metrics });
                    } else {
                        const existing = deviceMap.get(device);
                        existing.impressions += metrics.impressions;
                        existing.clicks += metrics.clicks;
                        existing.cost_micros += metrics.cost_micros;
                        existing.conversions += metrics.conversions;
                        existing.conversions_value += metrics.conversions_value;
                    }
                }

                // Aggregate Platform (Network)
                if (network) {
                    if (!platformMap.has(network)) {
                        platformMap.set(network, { name: network, ...metrics });
                    } else {
                        const existing = platformMap.get(network);
                        existing.impressions += metrics.impressions;
                        existing.clicks += metrics.clicks;
                        existing.cost_micros += metrics.cost_micros;
                        existing.conversions += metrics.conversions;
                        existing.conversions_value += metrics.conversions_value;
                    }
                }
            });

            // Transform to array
            const deviceData = Array.from(deviceMap.values()).map(d => ({
                ...d,
                cost: d.cost_micros / 1_000_000,
                ctr: d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0,
                cpc: d.clicks > 0 ? (d.cost_micros / 1_000_000) / d.clicks : 0,
                cpa: d.conversions > 0 ? (d.cost_micros / 1_000_000) / d.conversions : 0,
                roas: d.cost_micros > 0 ? d.conversions_value / (d.cost_micros / 1_000_000) : 0,
            }));

            const platformData = Array.from(platformMap.values()).map(p => ({
                ...p,
                cost: p.cost_micros / 1_000_000,
                ctr: p.impressions > 0 ? (p.clicks / p.impressions) * 100 : 0,
                cpc: p.clicks > 0 ? (p.cost_micros / 1_000_000) / p.clicks : 0,
                cpa: p.conversions > 0 ? (p.cost_micros / 1_000_000) / p.conversions : 0,
                roas: p.cost_micros > 0 ? p.conversions_value / (p.cost_micros / 1_000_000) : 0,
            }));

            res.status(200).json({
                success: true,
                deviceData,
                platformData
            });

        } else if (widgetType === 'top_performers') {
            const { dimension = 'KEYWORDS' } = req.body;
            // Format Results
            const data = results.map((row: any) => {
                let name = 'Unknown';
                if (dimension === 'KEYWORDS') name = row.adGroupCriterion?.keyword?.text;
                else if (dimension === 'SEARCH_TERMS') name = row.searchTermView?.searchTerm;
                else if (dimension === 'LOCATIONS') name = `Location ID: ${row.userLocationView?.countryCriterionId}`;
                else if (dimension === 'ADS') name = row.adGroupAd?.ad?.name || `Ad #${row.adGroupAd?.ad?.id}`;

                return {
                    name,
                    campaignName: row.campaign?.name,
                    adGroupName: row.adGroup?.name,
                    impressions: row.metrics?.impressions || 0,
                    clicks: row.metrics?.clicks || 0,
                    cost: (row.metrics?.costMicros || 0) / 1_000_000,
                    conversions: row.metrics?.conversions || 0,
                    conversions_value: row.metrics?.conversionsValue || 0,
                    ctr: row.metrics?.impressions > 0 ? (row.metrics?.clicks / row.metrics?.impressions) * 100 : 0,
                    cpc: row.metrics?.clicks > 0 ? ((row.metrics?.costMicros || 0) / 1_000_000) / row.metrics?.clicks : 0,
                    roas: (row.metrics?.costMicros || 0) > 0 ? (row.metrics?.conversionsValue || 0) / ((row.metrics?.costMicros || 0) / 1_000_000) : 0,
                };
            });

            res.status(200).json({
                success: true,
                data
            });

        } else if (widgetType === 'heatmap') {
            // Map Day of Week enum to index (0 = Monday, 6 = Sunday)
            // GAQL returns: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
            const dayMap: Record<string, number> = {
                'MONDAY': 0,
                'TUESDAY': 1,
                'WEDNESDAY': 2,
                'THURSDAY': 3,
                'FRIDAY': 4,
                'SATURDAY': 5,
                'SUNDAY': 6
            };

            const heatmapDataMap = new Map<string, any>();

            results.forEach((row: any) => {
                const dayEnum = row.segments?.dayOfWeek; // e.g., 'MONDAY'
                const hour = row.segments?.hour; // 0-23

                if (!dayEnum || hour === undefined) return;

                const dayIndex = dayMap[dayEnum];
                const key = `${dayIndex}-${hour}`;

                if (!heatmapDataMap.has(key)) {
                    heatmapDataMap.set(key, {
                        day: dayIndex,
                        hour: parseInt(hour.toString(), 10),
                        metrics: {
                            impressions: 0,
                            clicks: 0,
                            cost_micros: 0,
                            conversions: 0,
                            conversions_value: 0
                        }
                    });
                }

                const cell = heatmapDataMap.get(key);
                cell.metrics.impressions += row.metrics?.impressions || 0;
                cell.metrics.clicks += row.metrics?.clicks || 0;
                cell.metrics.cost_micros += row.metrics?.costMicros || 0;
                cell.metrics.conversions += row.metrics?.conversions || 0;
                cell.metrics.conversions_value += row.metrics?.conversionsValue || 0;
            });

            // Transform to expected format
            const heatmapData = Array.from(heatmapDataMap.values()).map(cell => ({
                day: cell.day,
                hour: cell.hour,
                metrics: {
                    impressions: cell.metrics.impressions,
                    clicks: cell.metrics.clicks,
                    cost: cell.metrics.cost_micros / 1_000_000,
                    conversions: cell.metrics.conversions,
                    ctr: cell.metrics.impressions > 0 ? (cell.metrics.clicks / cell.metrics.impressions) * 100 : 0,
                    avgCpc: cell.metrics.clicks > 0 ? (cell.metrics.cost_micros / 1_000_000) / cell.metrics.clicks : 0,
                }
            }));

            res.status(200).json({
                success: true,
                heatmapData
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
