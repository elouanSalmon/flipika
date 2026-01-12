import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const googleAdsDeveloperToken = defineSecret("GOOGLE_ADS_DEVELOPER_TOKEN");

/**
 * Get ad creatives (headlines, descriptions, images) for display in widgets
 * Supports Responsive Search Ads and Display Ads
 */
export const getAdCreatives = onRequest({
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
        const { customerId, campaignIds } = req.body;

        console.log('📥 Ad Creatives Request:', {
            customerId,
            campaignIds,
            userId
        });

        if (!customerId) {
            res.status(400).json({ error: "Missing customerId" });
            return;
        }

        if (!campaignIds || !Array.isArray(campaignIds)) {
            // It's okay if campaignIds is undefined or empty array - we'll fetch for the whole account
            // But if it's provided, it must be an array
            console.log('ℹ️ No campaign IDs provided, fetching for entire account');
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

        // 5. Build GAQL Query for Ad Creatives
        let campaignFilter = '';
        if (campaignIds && Array.isArray(campaignIds) && campaignIds.length > 0) {
            const campaignIdList = campaignIds.map((id: string) => id).join(', ');
            campaignFilter = `AND campaign.id IN (${campaignIdList})`;
        }

        const query = `
            SELECT 
                ad_group_ad.ad.id,
                ad_group_ad.ad.type,
                ad_group_ad.ad.final_urls,
                ad_group_ad.ad.name,
                ad_group_ad.ad.responsive_search_ad.headlines,
                ad_group_ad.ad.responsive_search_ad.descriptions,
                ad_group_ad.ad.responsive_display_ad.headlines,
                ad_group_ad.ad.responsive_display_ad.descriptions,
                ad_group_ad.ad.responsive_display_ad.marketing_images,
                ad_group_ad.ad.expanded_text_ad.headline_part1,
                ad_group_ad.ad.expanded_text_ad.headline_part2,
                ad_group_ad.ad.expanded_text_ad.description,
                ad_group_ad.status,
                campaign.id,
                campaign.name,
                ad_group.id,
                ad_group.name,
                metrics.impressions,
                metrics.clicks,
                metrics.ctr,
                metrics.cost_micros,
                metrics.conversions
            FROM ad_group_ad
            WHERE ad_group_ad.status IN ('ENABLED', 'PAUSED')
                ${campaignFilter}
            ORDER BY metrics.impressions DESC
            LIMIT 50
        `;

        // 6. Execute Query
        // Normalize query: trim and collapse multiple whitespace to fix parsing issues
        const normalizedQuery = query.trim().replace(/\s+/g, ' ');

        console.log('🔍 Executing Ad Creatives query');
        console.log('📝 Normalized GAQL Query:', normalizedQuery);

        const results = await customer.query(normalizedQuery);
        console.log('✅ Query executed successfully, ads returned:', results.length);

        // 7. Transform Data for Frontend
        interface AdCreative {
            id: string;
            type: 'SEARCH' | 'DISPLAY' | 'UNKNOWN';
            name: string;
            headlines: string[];
            descriptions: string[];
            finalUrl: string;
            imageUrl: string | null;
            displayUrl: string;
            campaignId: string;
            campaignName: string;
            adGroupId: string;
            adGroupName: string;
            metrics: {
                impressions: number;
                clicks: number;
                ctr: number;
                cost: number;
                conversions: number;
            };
        }

        const adCreatives: AdCreative[] = results.map((row: any) => {
            const ad = row.adGroupAd?.ad;
            const adType = ad?.type || 'UNKNOWN';

            console.log('🔍 Processing ad:', {
                adId: ad?.id,
                adType,
                hasRSA: !!ad?.responsiveSearchAd,
                hasDisplay: !!ad?.responsiveDisplayAd,
                hasETA: !!ad?.expandedTextAd,
            });

            let headlines: string[] = [];
            let descriptions: string[] = [];
            let imageUrl: string | null = null;
            let type: 'SEARCH' | 'DISPLAY' | 'UNKNOWN' = 'UNKNOWN';

            // Google Ads API returns numeric enum values for ad types:
            // 3 = EXPANDED_TEXT_AD
            // 10 = RESPONSIVE_SEARCH_AD  
            // 12 = RESPONSIVE_DISPLAY_AD
            // Note: The google-ads-api Node library returns properties in camelCase!

            // Handle Responsive Search Ads (type 10 or string 'RESPONSIVE_SEARCH_AD')
            if ((adType === 10 || adType === 'RESPONSIVE_SEARCH_AD') && ad?.responsiveSearchAd) {
                type = 'SEARCH';
                headlines = ad.responsiveSearchAd.headlines?.map((h: any) => h.text || '') || [];
                descriptions = ad.responsiveSearchAd.descriptions?.map((d: any) => d.text || '') || [];
                console.log('✅ RSA ad:', { headlines: headlines.length, descriptions: descriptions.length });
            }
            // Handle Responsive Display Ads (type 12 or string 'RESPONSIVE_DISPLAY_AD')
            else if ((adType === 12 || adType === 'RESPONSIVE_DISPLAY_AD') && ad?.responsiveDisplayAd) {
                type = 'DISPLAY';
                headlines = ad.responsiveDisplayAd.headlines?.map((h: any) => h.text || '') || [];
                descriptions = ad.responsiveDisplayAd.descriptions?.map((d: any) => d.text || '') || [];

                // Get first marketing image if available
                const marketingImages = ad.responsiveDisplayAd.marketingImages;
                if (marketingImages && marketingImages.length > 0) {
                    imageUrl = marketingImages[0].asset || null;
                }
                console.log('✅ Display ad:', { headlines: headlines.length, descriptions: descriptions.length });
            }
            // Handle Legacy Expanded Text Ads (type 3 or string 'EXPANDED_TEXT_AD')
            else if ((adType === 3 || adType === 'EXPANDED_TEXT_AD') && ad?.expandedTextAd) {
                type = 'SEARCH';
                const eta = ad.expandedTextAd;
                headlines = [
                    eta.headlinePart1 || '',
                    eta.headlinePart2 || ''
                ].filter(h => h);
                descriptions = [eta.description || ''].filter(d => d);
                console.log('✅ ETA ad:', { headlines: headlines.length, descriptions: descriptions.length });
            } else {
                console.warn('⚠️ Unknown ad type or missing data:', adType, 'Available keys:', Object.keys(ad || {}));
            }

            // Extract final URL and create display URL
            const finalUrls = ad?.finalUrls || [];
            const finalUrl = finalUrls[0] || '';
            let displayUrl = '';
            try {
                if (finalUrl) {
                    displayUrl = new URL(finalUrl).hostname.replace('www.', '');
                }
            } catch (e) {
                displayUrl = finalUrl;
            }

            // Extract metrics (also use camelCase)
            const metrics = row.metrics || {};
            const costMicros = metrics.costMicros || 0;

            return {
                id: ad?.id?.toString() || '',
                type,
                name: ad?.name || `Ad ${ad?.id}`,
                headlines,
                descriptions,
                finalUrl,
                imageUrl,
                displayUrl,
                campaignId: row.campaign?.id?.toString() || '',
                campaignName: row.campaign?.name || '',
                adGroupId: row.adGroup?.id?.toString() || '',
                adGroupName: row.adGroup?.name || '',
                metrics: {
                    impressions: metrics.impressions || 0,
                    clicks: metrics.clicks || 0,
                    ctr: metrics.ctr || 0,
                    cost: costMicros / 1_000_000,
                    conversions: metrics.conversions || 0,
                }
            };
        }).filter(ad => {
            const hasContent = ad.headlines.length > 0;
            if (!hasContent) {
                console.warn('⚠️ Filtering out ad with no headlines:', ad.id, ad.type);
            }
            return hasContent;
        }); // Only return ads with content

        console.log('✅ Transformed ad creatives:', {
            total: adCreatives.length,
            searchAds: adCreatives.filter(a => a.type === 'SEARCH').length,
            displayAds: adCreatives.filter(a => a.type === 'DISPLAY').length,
        });

        res.status(200).json({
            success: true,
            ads: adCreatives,
            debug: {
                query: normalizedQuery,
                rowsReturned: results.length
            }
        });

    } catch (error: any) {
        console.error("Google Ads Creative Fetch Error:", error);

        // Extract meaningful error message
        let errorMessage = 'Unknown error';
        if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
            errorMessage = error.errors.map((e: any) => e.message).join('; ');
        } else if (error?.message) {
            errorMessage = error.message;
        }

        res.status(500).json({
            error: `Failed to fetch ad creatives: ${errorMessage}`,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error?.stack,
                type: error?.name,
            } : undefined
        });
    }
});
