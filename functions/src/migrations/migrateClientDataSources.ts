import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import * as cors from "cors";

const corsHandler = cors({ origin: true });

/**
 * Idempotent migration: populate dataSources[] from legacy googleAdsCustomerId
 * for all clients across all users.
 *
 * Safe to run multiple times - skips clients that already have dataSources.
 */
export const migrateClientDataSources = onRequest({ memory: '512MiB' }, async (req, res) => {
    return corsHandler(req, res, async () => {
        // 1. Verify Authentication (admin only in practice)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        try {
            const idToken = authHeader.split('Bearer ')[1];
            await admin.auth().verifyIdToken(idToken);

            const db = admin.firestore();
            const usersSnapshot = await db.collection('users').get();

            let totalMigrated = 0;
            let totalSkipped = 0;
            let totalErrors = 0;

            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                const clientsSnapshot = await db
                    .collection('users')
                    .doc(userId)
                    .collection('clients')
                    .get();

                for (const clientDoc of clientsSnapshot.docs) {
                    try {
                        const data = clientDoc.data();

                        // Skip if already migrated
                        if (data.dataSources && Array.isArray(data.dataSources) && data.dataSources.length > 0) {
                            totalSkipped++;
                            continue;
                        }

                        // Skip if no legacy Google Ads ID
                        if (!data.googleAdsCustomerId) {
                            totalSkipped++;
                            continue;
                        }

                        // Migrate: create dataSources from googleAdsCustomerId
                        const dataSources = [{
                            platform: 'google_ads',
                            accountId: data.googleAdsCustomerId,
                            accountName: data.googleAdsCustomerName || null,
                            addedAt: data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
                        }];

                        await clientDoc.ref.update({ dataSources });
                        totalMigrated++;
                        console.log(`Migrated client ${clientDoc.id} for user ${userId}`);
                    } catch (err) {
                        totalErrors++;
                        console.error(`Error migrating client ${clientDoc.id} for user ${userId}:`, err);
                    }
                }
            }

            res.status(200).json({
                success: true,
                migrated: totalMigrated,
                skipped: totalSkipped,
                errors: totalErrors,
            });
        } catch (error: any) {
            console.error("Migration error:", error);
            res.status(500).json({ error: `Migration failed: ${error.message}` });
        }
    });
});
