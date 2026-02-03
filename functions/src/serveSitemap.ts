import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";
import { logger } from "firebase-functions";

/**
 * Cloud Function HTTP qui génère et sert le sitemap.xml à la demande
 * Accessible via: https://flipika.com/sitemap.xml
 */
export const serveSitemap = onRequest(
    {
        region: "europe-west1",
        memory: "256MiB",
    },
    async (req, res) => {
        try {
            // Configuration CORS et headers
            res.set("Content-Type", "application/xml");
            res.set("Cache-Control", "public, max-age=3600"); // Cache 1h

            const db = admin.firestore();
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
            // 2. PAGES DYNAMIQUES - USERS/PROFILES
            // ========================================
            // TODO: Adapter le nom de la collection et les champs selon votre schéma
            // Exemple: collection "users" avec champs "uid" et "updatedAt"
            try {
                const usersSnapshot = await db
                    .collection("users")
                    .select("uid", "updatedAt") // Sélection uniquement des champs nécessaires
                    .limit(1000) // Limite pour éviter timeout
                    .get();

                usersSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const userId = data.uid || doc.id;
                    const lastmod = data.updatedAt?.toDate?.()?.toISOString();

                    links.push({
                        url: `/profile/${userId}`,
                        changefreq: "weekly",
                        priority: 0.6,
                        ...(lastmod && { lastmod }),
                    });
                });

                logger.info(
                    `Added ${usersSnapshot.size} user profiles to sitemap`
                );
            } catch (error) {
                logger.warn("Error fetching users for sitemap:", error);
                // Continue même en cas d'erreur sur une collection
            }

            // ========================================
            // 3. PAGES DYNAMIQUES - ARTICLES/POSTS
            // ========================================
            // TODO: Adapter selon vos collections
            // Exemple: collection "posts" avec champs "slug" et "publishedAt"
            try {
                const postsSnapshot = await db
                    .collection("posts")
                    .where("published", "==", true) // Seulement les articles publiés
                    .select("slug", "publishedAt", "updatedAt")
                    .limit(1000)
                    .get();

                postsSnapshot.forEach((doc) => {
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
                });

                logger.info(
                    `Added ${postsSnapshot.size} articles to sitemap`
                );
            } catch (error) {
                logger.warn("Error fetching posts for sitemap:", error);
            }

            // ========================================
            // 4. GÉNÉRATION DU XML
            // ========================================
            logger.info(`Generating sitemap with ${links.length} URLs`);

            // Écrire tous les liens dans le stream
            const stream = Readable.from(links).pipe(smStream);

            // Convertir le stream en buffer
            const sitemap = await streamToPromise(stream);

            // Envoyer la réponse
            res.status(200).send(sitemap.toString());

            logger.info("Sitemap generated and served successfully");
        } catch (error) {
            logger.error("Error generating sitemap:", error);
            res.status(500).send("Error generating sitemap");
        }
    }
);
