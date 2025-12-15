import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";

/**
 * Cloud Function planifiée qui génère le sitemap.xml toutes les 24h
 * et l'enregistre dans Firebase Storage
 *
 * Cron: Tous les jours à 2h du matin (heure UTC)
 *
 * Note: Cette fonction est optionnelle si vous utilisez serveSitemap (génération à la demande)
 * Elle peut être utile pour:
 * - Avoir une copie de backup du sitemap
 * - Monitorer les changements de contenu
 * - Générer des statistiques
 */
export const generateSitemap = functions.scheduler.onSchedule(
    {
        schedule: "0 2 * * *", // Tous les jours à 2h UTC (3h en hiver, 4h en été en France)
        timeZone: "Europe/Paris",
        memory: "512MiB",
        timeoutSeconds: 540, // 9 minutes max
    },
    async (event) => {
        try {
            functions.logger.info("Starting scheduled sitemap generation");

            const db = admin.firestore();
            const storage = admin.storage();
            const bucket = storage.bucket();
            const hostname = "https://flipika.com";

            // Créer le stream sitemap
            const smStream = new SitemapStream({ hostname });
            const links: Array<{
                url: string;
                changefreq?: string;
                priority?: number;
                lastmod?: string;
            }> = [];

            // ========================================
            // 1. PAGES STATIQUES
            // ========================================
            const staticPages = [
                { url: "/", changefreq: "daily", priority: 1.0 },
                { url: "/login", changefreq: "monthly", priority: 0.5 },
                { url: "/pricing", changefreq: "weekly", priority: 0.8 },
                { url: "/app/dashboard", changefreq: "daily", priority: 0.7 },
                { url: "/app/audit", changefreq: "weekly", priority: 0.7 },
                { url: "/app/reports", changefreq: "weekly", priority: 0.7 },
                { url: "/app/settings", changefreq: "monthly", priority: 0.5 },
            ];

            staticPages.forEach((page) => {
                links.push({
                    url: page.url,
                    changefreq: page.changefreq as any,
                    priority: page.priority,
                });
            });

            // ========================================
            // 2. PAGES DYNAMIQUES AVEC PAGINATION
            // ========================================
            // Fonction helper pour paginer les requêtes Firestore
            async function fetchPaginated(
                collectionName: string,
                processDoc: (doc: FirebaseFirestore.QueryDocumentSnapshot) => void,
                whereClause?: { field: string; op: FirebaseFirestore.WhereFilterOp; value: any }
            ) {
                let query: FirebaseFirestore.Query = db.collection(collectionName);

                if (whereClause) {
                    query = query.where(whereClause.field, whereClause.op, whereClause.value);
                }

                let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;
                let hasMore = true;
                let totalDocs = 0;
                const batchSize = 500;

                while (hasMore) {
                    let batchQuery = query.limit(batchSize);

                    if (lastDoc) {
                        batchQuery = batchQuery.startAfter(lastDoc);
                    }

                    const snapshot = await batchQuery.get();

                    if (snapshot.empty) {
                        hasMore = false;
                        break;
                    }

                    snapshot.forEach(processDoc);
                    totalDocs += snapshot.size;

                    if (snapshot.size < batchSize) {
                        hasMore = false;
                    } else {
                        lastDoc = snapshot.docs[snapshot.docs.length - 1];
                    }
                }

                return totalDocs;
            }

            // Users/Profiles
            try {
                const userCount = await fetchPaginated(
                    "users",
                    (doc) => {
                        const data = doc.data();
                        const userId = data.uid || doc.id;
                        const lastmod = data.updatedAt?.toDate?.()?.toISOString();

                        links.push({
                            url: `/profile/${userId}`,
                            changefreq: "weekly",
                            priority: 0.6,
                            ...(lastmod && { lastmod }),
                        });
                    }
                );

                functions.logger.info(`Added ${userCount} user profiles to sitemap`);
            } catch (error) {
                functions.logger.warn("Error fetching users for sitemap:", error);
            }

            // Articles/Posts
            try {
                const postCount = await fetchPaginated(
                    "posts",
                    (doc) => {
                        const data = doc.data();
                        const slug = data.slug || doc.id;
                        const lastmod = (
                            data.updatedAt ||
                            data.publishedAt
                        )?.toDate?.()?.toISOString();

                        links.push({
                            url: `/article/${slug}`,
                            changefreq: "monthly",
                            priority: 0.7,
                            ...(lastmod && { lastmod }),
                        });
                    },
                    { field: "published", op: "==", value: true }
                );

                functions.logger.info(`Added ${postCount} articles to sitemap`);
            } catch (error) {
                functions.logger.warn("Error fetching posts for sitemap:", error);
            }

            // ========================================
            // 3. GÉNÉRATION DU XML
            // ========================================
            functions.logger.info(`Generating sitemap with ${links.length} URLs`);

            const stream = Readable.from(links).pipe(smStream);
            const sitemap = await streamToPromise(stream);

            // ========================================
            // 4. SAUVEGARDE DANS STORAGE
            // ========================================
            const file = bucket.file("sitemap.xml");

            await file.save(sitemap.toString(), {
                metadata: {
                    contentType: "application/xml",
                    cacheControl: "public, max-age=3600",
                },
                public: true, // Rendre le fichier accessible publiquement
            });

            functions.logger.info(
                `Sitemap generated successfully with ${links.length} URLs and saved to Storage`
            );

            // Optionnel: Envoyer une notification ou mettre à jour une métrique
        } catch (error) {
            functions.logger.error("Error in scheduled sitemap generation:", error);
            throw error; // Rethrow pour que Cloud Scheduler marque l'exécution comme failed
        }
    }
);
