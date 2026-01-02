import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import * as cors from "cors";

const corsHandler = cors({ origin: true });

/**
 * Utility function to migrate old reports to include accountName and campaignNames
 * This is a one-time migration script that can be called manually
 *
 * Usage:
 * POST https://us-central1-flipika.cloudfunctions.net/migrateReportsWithAccountNames
 * Authorization: Bearer <firebase-id-token>
 */
export const migrateReportsWithAccountNames = onRequest({
    memory: '1GiB',
    timeoutSeconds: 540
}, async (req, res) => {
    return corsHandler(req, res, async () => {
        // Verify Authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        try {
            const idToken = authHeader.split('Bearer ')[1];
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const userId = decodedToken.uid;

            console.log(`Starting migration for user ${userId}`);

            // Get user's Google Ads accounts
            const accountsDoc = await admin.firestore()
                .collection('users')
                .doc(userId)
                .collection('integrations')
                .doc('google_ads')
                .get();

            if (!accountsDoc.exists) {
                res.status(400).json({
                    error: 'No Google Ads accounts found. Please connect your Google Ads account first.'
                });
                return;
            }

            const accounts = accountsDoc.data()?.accounts || [];
            console.log(`Found ${accounts.length} accounts`);

            // Build a map of accountId -> accountName
            const accountMap = new Map<string, string>();
            accounts.forEach((account: any) => {
                accountMap.set(account.id, account.name);
            });

            // Get all reports for this user that don't have accountName
            const reportsSnapshot = await admin.firestore()
                .collection('reports')
                .where('userId', '==', userId)
                .get();

            console.log(`Found ${reportsSnapshot.size} reports to check`);

            let updatedCount = 0;
            let skippedCount = 0;

            const batch = admin.firestore().batch();
            let batchCount = 0;

            for (const reportDoc of reportsSnapshot.docs) {
                const reportData = reportDoc.data();

                // Skip if report already has accountName
                if (reportData.accountName) {
                    skippedCount++;
                    continue;
                }

                // Get account name from map
                const accountName = accountMap.get(reportData.accountId);

                if (accountName) {
                    batch.update(reportDoc.ref, {
                        accountName: accountName,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                    batchCount++;
                    updatedCount++;

                    // Firestore batch has a limit of 500 operations
                    if (batchCount >= 500) {
                        await batch.commit();
                        console.log(`Committed batch of ${batchCount} updates`);
                        batchCount = 0;
                    }
                } else {
                    console.warn(`No account name found for accountId: ${reportData.accountId}`);
                    skippedCount++;
                }
            }

            // Commit remaining updates
            if (batchCount > 0) {
                await batch.commit();
                console.log(`Committed final batch of ${batchCount} updates`);
            }

            console.log(`Migration completed. Updated: ${updatedCount}, Skipped: ${skippedCount}`);

            res.status(200).json({
                success: true,
                message: `Migration completed successfully`,
                updated: updatedCount,
                skipped: skippedCount,
                total: reportsSnapshot.size
            });

        } catch (error: any) {
            console.error('Migration error:', error);
            res.status(500).json({
                error: `Migration failed: ${error.message}`
            });
        }
    });
});
