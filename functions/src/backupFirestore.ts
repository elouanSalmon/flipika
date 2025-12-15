import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";

/**
 * Scheduled Cloud Function pour backup automatique de Firestore
 * 
 * Planification: Tous les jours à 2h00 du matin (Europe/Paris)
 * Destination: gs://flipika-firestore-backups/backup-YYYY-MM-DD-HHmmss/
 * 
 * Prérequis:
 * - Bucket GCS créé (via setup-backup-bucket.sh)
 * - Permissions IAM configurées (via setup-backup-permissions.sh)
 * - Rôle roles/datastore.importExportAdmin assigné au compte de service
 */
export const backupFirestore = onSchedule({
    // Exécution quotidienne à 2h du matin (heure creuse)
    schedule: "0 2 * * *",
    timeZone: "Europe/Paris",
    memory: "512MiB" as const,
    timeoutSeconds: 540, // 9 minutes max
}, async (event) => {
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "flipika";
    const bucketName = `${projectId}-firestore-backups`;

    // Générer un nom de backup avec timestamp
    const timestamp = new Date().toISOString()
        .replace(/:/g, '')
        .replace(/\..+/, '')
        .replace('T', '-');
    const backupPath = `gs://${bucketName}/backup-${timestamp}`;

    logger.info("🚀 Démarrage du backup Firestore", {
        projectId,
        bucketName,
        backupPath,
        scheduledTime: event.scheduleTime,
        executionTime: new Date().toISOString()
    });

    try {
        // Utiliser l'API Firestore Admin pour l'export
        // Note: exportDocuments est disponible via l'API REST, pas le SDK standard
        const databasePath = `projects/${projectId}/databases/(default)`;

        // Utiliser l'API REST via fetch
        const { GoogleAuth } = await import('google-auth-library');
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/datastore']
        });
        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();

        const response = await fetch(
            `https://firestore.googleapis.com/v1/${databasePath}:exportDocuments`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    outputUriPrefix: backupPath
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Export failed: ${response.status} - ${errorData}`);
        }

        const operation = await response.json();

        logger.info("✅ Export Firestore démarré avec succès", {
            operationName: operation.name,
            backupPath,
            metadata: operation.metadata
        });

        // Note: L'opération d'export est asynchrone et continue après la fin de la fonction
        // Les logs de progression peuvent être consultés dans Cloud Logging

    } catch (error: any) {
        logger.error("❌ Erreur lors du backup Firestore", {
            error: error.message,
            stack: error.stack,
            backupPath,
            projectId
        });

        // En cas d'erreur, relancer l'exception pour que Cloud Functions puisse logger l'échec
        throw new Error(`Backup Firestore échoué: ${error.message}`);
    }
});

/**
 * Fonction utilitaire pour déclencher un backup manuel
 * 
 * Utilisation:
 * - Via Firebase Console: Functions > backupFirestoreManual > Test
 * - Via CLI: gcloud functions call backupFirestoreManual
 * - Via HTTP: Décommenter l'export ci-dessous et déployer
 */
/*
import { onRequest } from "firebase-functions/v2/https";

export const backupFirestoreManual = onRequest({
  memory: "512MiB",
  timeoutSeconds: 540
}, async (req, res) => {
  // Vérifier l'authentification (optionnel mais recommandé)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Vérifier que l'utilisateur est admin (custom claim)
    if (!decodedToken.admin) {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    const projectId = process.env.GCLOUD_PROJECT || "flipika";
    const bucketName = `${projectId}-firestore-backups`;
    const timestamp = new Date().toISOString()
      .replace(/:/g, '')
      .replace(/\..+/, '')
      .replace('T', '-');
    const backupPath = `gs://${bucketName}/backup-manual-${timestamp}`;

    const [operation] = await admin.firestore().exportDocuments(backupPath);

    res.status(200).json({
      success: true,
      message: "Backup manuel démarré",
      backupPath,
      operationName: operation.name
    });

  } catch (error: any) {
    logger.error("Erreur backup manuel:", error);
    res.status(500).json({ error: error.message });
  }
});
*/
