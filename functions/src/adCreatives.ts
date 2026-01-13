import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const googleAdsDeveloperToken = defineSecret("GOOGLE_ADS_DEVELOPER_TOKEN");

/**
 * Get ad creatives (headlines, descriptions, images) for display in widgets
 * Supports Responsive Search Ads, Display Ads, and Performance Max Asset Groups
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

        if (!customerId) {
            res.status(400).json({ error: "Missing customerId" });
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

        const combinedCreatives: AdCreative[] = [];

        // 5. QUERY 1: Standard Search/Display Ads (AdGroupAd)
        let campaignFilter = '';
        if (campaignIds && Array.isArray(campaignIds) && campaignIds.length > 0) {
            const campaignIdList = campaignIds.join(', ');
            campaignFilter = `AND campaign.id IN (${campaignIdList})`;
        }

        const standardQuery = `
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
                campaign.advertising_channel_type,
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

        try {
            console.log('🔍 Executing Standard Ads query...');
            const standardResults = await customer.query(standardQuery.trim().replace(/\s+/g, ' '));
            console.log('✅ Standard Ads returned:', standardResults.length);

            const standardAds = standardResults.map((row: any) => transformStandardAd(row)).filter(ad => ad !== null) as AdCreative[];
            combinedCreatives.push(...standardAds);
        } catch (e: any) {
            console.warn("⚠️ Standard Ads query failed (ignoring):", e.message);
        }

        // 6. QUERY 2: Performance Max Asset Groups
        // PMax uses AssetGroups, not AdGroups. 
        // We first find AssetGroups linked to the campaigns.
        // We can include standard metrics from asset_group view or campaign view? 
        // asset_group view has metrics too.

        // Note: Field type enum mapping
        // UNKNOWN = 0, UNSPECIFIED = 1, HEADLINE = 2, DESCRIPTION = 3, MANDATORY_AD_TEXT = 4, 
        // MARKETING_IMAGE = 5, MEDIA_BUNDLE = 6, YOUTUBE_VIDEO = 7, BOOK_ON_GOOGLE = 8, 
        // LEAD_FORM = 9, PROMOTION = 10, CALLOUT = 11, STRUCTURED_SNIPPET = 12, SITELINK = 13, 
        // MOBILE_APP = 14, HOTEL_CALLOUT = 15, CALL = 16, PRICE = 17, LONG_HEADLINE = 18, 
        // SQUARE_MARKETING_IMAGE = 19, PORTRAIT_MARKETING_IMAGE = 20, LOGO = 21, 
        // LANDSCAPE_LOGO = 22, VIDEO = 23, CALL_TO_ACTION_SELECTION = 24

        const pmaxQuery = `
            SELECT
                asset_group.id,
                asset_group.name,
                asset_group.status,
                asset_group.final_urls,
                campaign.id,
                campaign.name,
                campaign.advertising_channel_type
            FROM asset_group
            WHERE asset_group.status = 'ENABLED'
            ${campaignFilter}
            LIMIT 20
        `;

        try {
            console.log('🔍 Executing PMax AssetGroup query...');
            // Need to handle if this query fails (e.g. if the customer has no PMax campaigns, valid GAQL should still return [], but permissions might vary)
            const pmaxGroups = await customer.query(pmaxQuery.trim().replace(/\s+/g, ' '));
            console.log('✅ PMax Groups returned:', pmaxGroups.length);

            // For each asset group, we need to fetch its assets
            // We can do this with a second query for asset_group_asset
            // filtering by the asset_groups we just found.

            if (pmaxGroups.length > 0) {
                const groupResourceNames = pmaxGroups.map((g: any) => g.assetGroup.resourceName);

                // Chunk queries if too many groups (unlikely for top 20 limit)
                const assetQuery = `
                    SELECT
                        asset_group_asset.asset_group,
                        asset_group_asset.field_type,
                        asset.id,
                        asset.type,
                        asset.text_asset.text,
                        asset.image_asset.full_size.url,
                        asset.youtube_video_asset.youtube_video_id
                    FROM asset_group_asset
                    WHERE asset_group_asset.asset_group IN ('${groupResourceNames.join("','")}')
                `;

                const assets = await customer.query(assetQuery.trim().replace(/\s+/g, ' '));
                console.log('✅ PMax Assets returned:', assets.length);

                // Group assets by asset_group
                const assetsByGroup: Record<string, any[]> = {};
                assets.forEach((row: any) => {
                    const groupName = row.assetGroupAsset.assetGroup;
                    if (!assetsByGroup[groupName]) assetsByGroup[groupName] = [];
                    assetsByGroup[groupName].push(row);
                });

                // Transform PMax groups into AdCreative objects
                const pmaxAds = pmaxGroups.map((row: any) => {
                    const group = row.assetGroup;
                    const camp = row.campaign;
                    const groupAssets = assetsByGroup[group.resourceName] || [];

                    return transformPMaxGroup(group, camp, groupAssets);
                });

                combinedCreatives.push(...pmaxAds);
            }

        } catch (e: any) {
            console.warn("⚠️ PMax query failed (likely no permissions or incompatible account type):", e.message);
        }

        res.status(200).json({
            success: true,
            ads: combinedCreatives,
            debug: {
                totalCreatives: combinedCreatives.length
            }
        });

    } catch (error: any) {
        console.error("Google Ads Creative Fetch Error:", error);
        res.status(500).json({
            error: `Failed to fetch ad creatives: ${error.message || 'Unknown error'}`
        });
    }
});


// ----------------------------------------------------------------------------
// DATA TRANSFORMATION HELPERS
// ----------------------------------------------------------------------------

interface AdCreative {
    id: string;
    type: 'SEARCH' | 'DISPLAY' | 'PMAX' | 'UNKNOWN';
    name: string;
    headlines: string[];
    descriptions: string[];
    finalUrl: string;
    imageUrl: string | null;
    images: { url: string, ratio: 'SQUARE' | 'PORTRAIT' | 'LANDSCAPE' }[];
    displayUrl: string;
    campaignId: string;
    campaignName: string;
    adGroupId: string;
    adGroupName: string;
    metrics?: {
        impressions: number;
        clicks: number;
        ctr: number;
        cost: number;
        conversions: number;
    };
}

function transformStandardAd(row: any): AdCreative | null {
    const ad = row.adGroupAd?.ad;
    if (!ad) return null;

    const adType = ad.type;
    let type: AdCreative['type'] = 'UNKNOWN';
    let headlines: string[] = [];
    let descriptions: string[] = [];
    let images: { url: string, ratio: 'SQUARE' | 'PORTRAIT' | 'LANDSCAPE' }[] = [];
    let imageUrl: string | null = null;

    // RSA
    if ((adType === 10 || adType === 'RESPONSIVE_SEARCH_AD') && ad.responsiveSearchAd) {
        type = 'SEARCH';
        headlines = ad.responsiveSearchAd.headlines?.map((h: any) => h.text || '') || [];
        descriptions = ad.responsiveSearchAd.descriptions?.map((d: any) => d.text || '') || [];
    }
    // RDA
    else if ((adType === 12 || adType === 'RESPONSIVE_DISPLAY_AD') && ad.responsiveDisplayAd) {
        type = 'DISPLAY';
        headlines = ad.responsiveDisplayAd.headlines?.map((h: any) => h.text || '') || [];
        descriptions = ad.responsiveDisplayAd.descriptions?.map((d: any) => d.text || '') || [];

        const marketingImages = ad.responsiveDisplayAd.marketingImages;
        if (marketingImages && marketingImages.length > 0) {
            // Note: AdGroupAd results usually just give 'asset' resource name, not the URL directly 
            // unless we JOINED metric/asset in the select, but standard query doesn't easily expand assets 
            // without explicit asset join which is complex.
            // However, older discovery showed ad.responsive_display_ad.marketing_images returns objects.
            // If we didn't select asset fields, we might not get URLs here. 
            // For standard ads, often just having text is enough for MVP or use generic placeholder. 
            // Only PMax definitely needs the asset URL for the grid.
            // Let's check what we get. If it's just 'asset' string, we can't show it easily without extra queries.
        }
    }
    // ETA (Legacy)
    else if ((adType === 3 || adType === 'EXPANDED_TEXT_AD') && ad.expandedTextAd) {
        type = 'SEARCH';
        headlines = [ad.expandedTextAd.headlinePart1, ad.expandedTextAd.headlinePart2].filter(Boolean);
        descriptions = [ad.expandedTextAd.description].filter(Boolean);
    }
    else {
        // Skip unknown
        return null;
    }

    if (headlines.length === 0 && descriptions.length === 0) return null;

    // Metrics
    const metrics = row.metrics || {};
    const costMicros = metrics.costMicros || 0;

    return {
        id: ad.id?.toString() || '',
        type,
        name: ad.name || `Ad ${ad.id}`,
        headlines,
        descriptions,
        finalUrl: ad.finalUrls ? ad.finalUrls[0] : '',
        displayUrl: getDisplayUrl(ad.finalUrls ? ad.finalUrls[0] : ''),
        imageUrl,
        images,
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
}

function transformPMaxGroup(group: any, campaign: any, assets: any[]): AdCreative {
    const headlines: string[] = [];
    const descriptions: string[] = [];
    const images: { url: string, ratio: 'SQUARE' | 'PORTRAIT' | 'LANDSCAPE' }[] = [];

    assets.forEach(row => {
        const fieldType = row.assetGroupAsset.fieldType; // Enum or string
        const asset = row.asset;

        // Text Assets
        if (asset.textAsset?.text) {
            // HEADLINE=2, LONG_HEADLINE=18, DESCRIPTION=3
            if (fieldType === 2 || fieldType === 'HEADLINE' || fieldType === 18 || fieldType === 'LONG_HEADLINE') {
                headlines.push(asset.textAsset.text);
            } else if (fieldType === 3 || fieldType === 'DESCRIPTION') {
                descriptions.push(asset.textAsset.text);
            }
        }

        // Image Assets
        if (asset.imageAsset?.fullSize?.url) {
            const url = asset.imageAsset.fullSize.url;
            // MARKETING_IMAGE=5 (Landscape usually), SQUARE_MARKETING_IMAGE=19, PORTRAIT_MARKETING_IMAGE=20
            if (fieldType === 19 || fieldType === 'SQUARE_MARKETING_IMAGE') {
                images.push({ url, ratio: 'SQUARE' });
            } else if (fieldType === 20 || fieldType === 'PORTRAIT_MARKETING_IMAGE') {
                images.push({ url, ratio: 'PORTRAIT' });
            } else if (fieldType === 5 || fieldType === 'MARKETING_IMAGE') {
                images.push({ url, ratio: 'LANDSCAPE' });
            }
        }
    });

    // PMax doesn't have individual ad metrics per asset group easily in this view, 
    // unless we query asset_group.metrics which we didn't strictly do. 
    // We can assume 0 or fetch separately if critical. 
    // For now, we return undefined metrics, or 0.

    return {
        id: group.id.toString(),
        type: 'PMAX',
        name: group.name,
        headlines: headlines.slice(0, 5), // Top 5
        descriptions: descriptions.slice(0, 5), // Top 5
        finalUrl: group.finalUrls ? group.finalUrls[0] : '',
        displayUrl: getDisplayUrl(group.finalUrls ? group.finalUrls[0] : ''),
        imageUrl: images.length > 0 ? images[0].url : null,
        images,
        campaignId: campaign.id?.toString() || '',
        campaignName: campaign.name || '',
        adGroupId: group.id.toString(), // Reuse group ID as adGroup ID for frontend compatibility
        adGroupName: group.name,
        metrics: {
            impressions: 0,
            clicks: 0,
            ctr: 0,
            cost: 0,
            conversions: 0
        }
    };
}

function getDisplayUrl(finalUrl: string): string {
    if (!finalUrl) return '';
    try {
        return new URL(finalUrl).hostname.replace('www.', '');
    } catch (e) {
        return finalUrl;
    }
}
