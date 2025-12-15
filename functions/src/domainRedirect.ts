import { onRequest } from "firebase-functions/v2/https";

/**
 * Domain Redirect Function
 * 
 * Redirects all traffic from Firebase default domains to the custom domain.
 * This ensures SEO consolidation and brand consistency.
 * 
 * Redirects:
 * - flipika.web.app → flipika.com
 * - flipika.firebaseapp.com → flipika.com
 * 
 * Returns 301 (Permanent Redirect) for SEO juice transfer.
 */
export const domainRedirect = onRequest(
    {
        memory: "256MiB",
        region: "europe-west1", // Adjust to your preferred region
    },
    async (req, res) => {
        const hostname = req.hostname;
        const targetDomain = "flipika.com";

        // List of Firebase default domains to redirect
        const firebaseDomains = [
            "flipika.web.app",
            "flipika.firebaseapp.com",
        ];

        // Check if the request is coming from a Firebase default domain
        if (firebaseDomains.includes(hostname)) {
            const path = req.originalUrl || req.url || "/";

            // Construct the redirect URL
            const redirectUrl = `https://${targetDomain}${path}`;

            // Log for debugging (optional, remove in production if not needed)
            console.log(`Redirecting ${hostname}${path} → ${redirectUrl}`);

            // Send 301 Permanent Redirect
            res.redirect(301, redirectUrl);
            return;
        }

        // If already on the custom domain, continue normally
        // This should never be reached if configured correctly in firebase.json
        res.status(200).send("OK");
    }
);
