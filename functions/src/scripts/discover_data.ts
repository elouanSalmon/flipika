import * as admin from 'firebase-admin';
import { GoogleAdsApi } from 'google-ads-api';

// Initialize with default credentials
if (!admin.apps.length) {
    admin.initializeApp();
}

async function main() {
    try {
        console.log("🔍 Starting Google Ads Data Discovery...");

        // 1. Find a target user with a connected Google Ads account
        const usersSnap = await admin.firestore().collection('users').get();
        let targetUser = null;
        let refreshToken = null;
        let customerId = null;

        console.log(`📂 Scanning ${usersSnap.size} users for connected accounts...`);

        for (const doc of usersSnap.docs) {
            const tokenDoc = await doc.ref.collection('tokens').doc('google_ads').get();
            if (tokenDoc.exists) {
                const rt = tokenDoc.data()?.refresh_token;
                if (rt) {
                    // Check for linked accounts
                    const accountsSnap = await doc.ref.collection('google_ads_accounts').limit(1).get();
                    if (!accountsSnap.empty) {
                        customerId = accountsSnap.docs[0].id;
                    } else {
                        customerId = doc.data()?.googleAdsDefaultAccountId;
                    }

                    if (customerId) {
                        targetUser = doc.id;
                        refreshToken = rt;
                        break;
                    }
                }
            }
        }

        if (!targetUser || !refreshToken || !customerId) {
            console.error('❌ No suitable user/account found for testing.');
            console.log('Ensure you have a user with a connected Google Ads account in Firestore.');
            process.exit(1);
        }

        console.log(`✅ Found User: ${targetUser}`);
        console.log(`✅ Using Customer ID: ${customerId}`);

        // 2. Initialize Google Ads Client
        // Ensure ENV vars are set when running this script
        if (!process.env.GOOGLE_ADS_CLIENT_ID || !process.env.GOOGLE_ADS_CLIENT_SECRET || !process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
            console.error('❌ Missing Google Ads Environment Variables (CLIENT_ID, CLIENT_SECRET, DEVELOPER_TOKEN)');
            process.exit(1);
        }

        const client = new GoogleAdsApi({
            client_id: process.env.GOOGLE_ADS_CLIENT_ID,
            client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
            developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
        });

        const customer = client.Customer({
            customer_id: customerId.replace('customers/', ''),
            refresh_token: refreshToken,
        });

        // 3. Define Discovery Queries
        const queries = [
            {
                name: 'Campaigns',
                query: `
                 SELECT 
                   campaign.id, 
                   campaign.name, 
                   campaign.advertising_channel_type,
                   campaign.status,
                   metrics.impressions,
                   metrics.clicks
                 FROM campaign 
                 WHERE campaign.status != 'REMOVED' 
                 LIMIT 3
               `
            },
            {
                name: 'AdGroups',
                query: `
                 SELECT 
                   ad_group.id, 
                   ad_group.name, 
                   ad_group.type,
                   ad_group.status
                 FROM ad_group 
                 WHERE ad_group.status = 'ENABLED' 
                 LIMIT 3
               `
            },
            {
                name: 'Responsive Search Ads (RSA)',
                query: `
                 SELECT 
                   ad_group_ad.ad.id, 
                   ad_group_ad.ad.type,
                   ad_group_ad.ad.responsive_search_ad.headlines,
                   ad_group_ad.ad.responsive_search_ad.descriptions
                 FROM ad_group_ad 
                 WHERE ad_group_ad.ad.type = 'RESPONSIVE_SEARCH_AD' 
                   AND ad_group_ad.status = 'ENABLED'
                 LIMIT 2
               `
            },
            {
                name: 'Expanded Text Ads (ETA)',
                query: `
                 SELECT 
                   ad_group_ad.ad.id, 
                   ad_group_ad.ad.type,
                   ad_group_ad.ad.expanded_text_ad.headline_part1,
                   ad_group_ad.ad.expanded_text_ad.headline_part2,
                   ad_group_ad.ad.expanded_text_ad.description
                 FROM ad_group_ad 
                 WHERE ad_group_ad.ad.type = 'EXPANDED_TEXT_AD'
                   AND ad_group_ad.status = 'ENABLED'
                 LIMIT 2
               `
            },
            {
                name: 'Performance Max Asset Groups',
                query: `
                 SELECT 
                   asset_group.id, 
                   asset_group.name, 
                   asset_group.status,
                   asset_group.final_urls
                 FROM asset_group 
                 WHERE asset_group.status = 'ENABLED' 
                 LIMIT 3
               `
            },
            {
                name: 'Image Assets',
                query: `
                 SELECT 
                   asset.id, 
                   asset.name, 
                   asset.type, 
                   asset.image_asset.full_size.url,
                   asset.image_asset.file_size
                 FROM asset 
                 WHERE asset.type = 'IMAGE' 
                 LIMIT 3
               `
            },
            {
                name: 'Asset Group Assets (PMax Linkage)',
                query: `
                  SELECT
                    asset_group_asset.asset_group,
                    asset_group_asset.asset,
                    asset_group_asset.field_type,
                    asset.type,
                    asset.image_asset.full_size.url,
                    asset.text_asset.text
                  FROM asset_group_asset
                  LIMIT 5
                `
            }
        ];

        // 4. Run Queries
        const results: any = {};

        for (const q of queries) {
            console.log(`\n⏳ Running ${q.name}...`);
            try {
                // Formatting query to single line for log readability
                console.log(`   Query: ${q.query.trim().replace(/\s+/g, ' ').substring(0, 100)}...`);

                const rows = await customer.query(q.query);
                console.log(`   ✅ Success: ${rows.length} rows returned`);

                results[q.name] = rows.map((r: any) => {
                    // Clean up the response object to make it more readable JSON
                    // The Google Ads API library returns complex objects, we want plain JSON
                    return JSON.parse(JSON.stringify(r));
                });

            } catch (e: any) {
                console.error(`   ❌ Error:`, e.message);
                if (e.errors) console.error('   Details:', JSON.stringify(e.errors));
                results[q.name] = { error: e.message, details: e.errors };
            }
        }

        console.log('\n\n================ RESULTS ================');
        console.log(JSON.stringify(results, null, 2));
        console.log('==========================================');

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
}

main();
