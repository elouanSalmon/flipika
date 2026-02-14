
import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import { join, resolve } from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateSitemap() {
    const hostname = "https://flipika.com";
    const distPath = resolve(__dirname, "../dist");

    console.log("Generating sitemap...");

    // Helper to generate hrefLang links for a given path
    const langLinks = (path) => [
        { lang: 'fr', url: `${hostname}/fr${path}` },
        { lang: 'en', url: `${hostname}${path}` },
    ];

    const links = [
        // English Silo (Root)
        { url: "/", changefreq: "weekly", priority: 1.0, links: [{ lang: 'fr', url: `${hostname}/fr` }, { lang: 'en', url: `${hostname}/` }] },
        { url: "/features", changefreq: "weekly", priority: 0.9, links: langLinks('/features') },
        { url: "/pricing", changefreq: "weekly", priority: 0.9, links: langLinks('/pricing') },
        { url: "/roadmap", changefreq: "monthly", priority: 0.7, links: langLinks('/roadmap') },
        { url: "/legal-notices", changefreq: "monthly", priority: 0.3, links: langLinks('/legal-notices') },
        { url: "/privacy-policy", changefreq: "monthly", priority: 0.3, links: langLinks('/privacy-policy') },
        { url: "/terms-of-service", changefreq: "monthly", priority: 0.3, links: langLinks('/terms-of-service') },

        // Solutions Pages
        { url: "/solutions/freelancers", changefreq: "monthly", priority: 0.8, links: langLinks('/solutions/freelancers') },
        { url: "/solutions/agencies", changefreq: "monthly", priority: 0.8, links: langLinks('/solutions/agencies') },
        { url: "/solutions/media-buyers", changefreq: "monthly", priority: 0.8, links: langLinks('/solutions/media-buyers') },
        { url: "/solutions/marketing-managers", changefreq: "monthly", priority: 0.8, links: langLinks('/solutions/marketing-managers') },

        // Feature Detail Pages
        { url: "/features/report-generation", changefreq: "monthly", priority: 0.7, links: langLinks('/features/report-generation') },
        { url: "/features/ai-narration", changefreq: "monthly", priority: 0.7, links: langLinks('/features/ai-narration') },
        { url: "/features/custom-templates", changefreq: "monthly", priority: 0.7, links: langLinks('/features/custom-templates') },
        { url: "/features/scheduling-automation", changefreq: "monthly", priority: 0.7, links: langLinks('/features/scheduling-automation') },
        { url: "/features/multi-format-exports", changefreq: "monthly", priority: 0.7, links: langLinks('/features/multi-format-exports') },
        { url: "/features/email-sending", changefreq: "monthly", priority: 0.7, links: langLinks('/features/email-sending') },
        { url: "/features/slideshow-mode", changefreq: "monthly", priority: 0.7, links: langLinks('/features/slideshow-mode') },

        // Alternatives Pages
        { url: "/alternatives", changefreq: "weekly", priority: 0.8, links: langLinks('/alternatives') },
        { url: "/alternatives/looker-studio", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/looker-studio') },
        { url: "/alternatives/agency-analytics", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/agency-analytics') },
        { url: "/alternatives/dashthis", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/dashthis') },
        { url: "/alternatives/excel-spreadsheets", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/excel-spreadsheets') },
        { url: "/alternatives/swydo", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/swydo') },
        { url: "/alternatives/reportgarden", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/reportgarden') },
        { url: "/alternatives/whatagraph", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/whatagraph') },

        // Templates Pages
        { url: "/templates/google-ads", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/google-ads') },
        { url: "/templates/ppc", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/ppc') },
        { url: "/templates/marketing-agency", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/marketing-agency') },
        { url: "/templates/ecommerce", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/ecommerce') },
        { url: "/templates/executive", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/executive') },
        { url: "/templates/real-estate", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/real-estate') },
        { url: "/templates/freelancer", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/freelancer') },
        { url: "/templates/saas", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/saas') },

        // Resources Pages
        { url: "/resources/google-ads-excel-template", changefreq: "monthly", priority: 0.8, links: langLinks('/resources/google-ads-excel-template') },
        { url: "/resources/google-ads-powerpoint-template", changefreq: "monthly", priority: 0.8, links: langLinks('/resources/google-ads-powerpoint-template') },
        { url: "/resources/google-ads-pdf-example", changefreq: "monthly", priority: 0.8, links: langLinks('/resources/google-ads-pdf-example') },


        // French Silo
        { url: "/fr", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: `${hostname}/fr` }, { lang: 'en', url: `${hostname}/` }] },
        { url: "/fr/features", changefreq: "weekly", priority: 0.9, links: langLinks('/features') },
        { url: "/fr/pricing", changefreq: "weekly", priority: 0.9, links: langLinks('/pricing') },
        { url: "/fr/roadmap", changefreq: "monthly", priority: 0.7, links: langLinks('/roadmap') },
        { url: "/fr/legal-notices", changefreq: "monthly", priority: 0.3, links: langLinks('/legal-notices') },
        { url: "/fr/privacy-policy", changefreq: "monthly", priority: 0.3, links: langLinks('/privacy-policy') },
        { url: "/fr/terms-of-service", changefreq: "monthly", priority: 0.3, links: langLinks('/terms-of-service') },

        // French Solutions
        { url: "/fr/solutions/freelancers", changefreq: "monthly", priority: 0.8, links: langLinks('/solutions/freelancers') },
        { url: "/fr/solutions/agencies", changefreq: "monthly", priority: 0.8, links: langLinks('/solutions/agencies') },
        { url: "/fr/solutions/media-buyers", changefreq: "monthly", priority: 0.8, links: langLinks('/solutions/media-buyers') },
        { url: "/fr/solutions/marketing-managers", changefreq: "monthly", priority: 0.8, links: langLinks('/solutions/marketing-managers') },

        // French Feature Detail Pages
        { url: "/fr/features/report-generation", changefreq: "monthly", priority: 0.7, links: langLinks('/features/report-generation') },
        { url: "/fr/features/ai-narration", changefreq: "monthly", priority: 0.7, links: langLinks('/features/ai-narration') },
        { url: "/fr/features/custom-templates", changefreq: "monthly", priority: 0.7, links: langLinks('/features/custom-templates') },
        { url: "/fr/features/scheduling-automation", changefreq: "monthly", priority: 0.7, links: langLinks('/features/scheduling-automation') },
        { url: "/fr/features/multi-format-exports", changefreq: "monthly", priority: 0.7, links: langLinks('/features/multi-format-exports') },
        { url: "/fr/features/email-sending", changefreq: "monthly", priority: 0.7, links: langLinks('/features/email-sending') },
        { url: "/fr/features/slideshow-mode", changefreq: "monthly", priority: 0.7, links: langLinks('/features/slideshow-mode') },

        // French Alternatives
        { url: "/fr/alternatives", changefreq: "weekly", priority: 0.8, links: langLinks('/alternatives') },
        { url: "/fr/alternatives/looker-studio", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/looker-studio') },
        { url: "/fr/alternatives/agency-analytics", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/agency-analytics') },
        { url: "/fr/alternatives/dashthis", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/dashthis') },
        { url: "/fr/alternatives/excel-spreadsheets", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/excel-spreadsheets') },
        { url: "/fr/alternatives/swydo", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/swydo') },
        { url: "/fr/alternatives/reportgarden", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/reportgarden') },
        { url: "/fr/alternatives/whatagraph", changefreq: "monthly", priority: 0.7, links: langLinks('/alternatives/whatagraph') },

        // French Templates
        { url: "/fr/templates/google-ads", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/google-ads') },
        { url: "/fr/templates/ppc", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/ppc') },
        { url: "/fr/templates/marketing-agency", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/marketing-agency') },
        { url: "/fr/templates/ecommerce", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/ecommerce') },
        { url: "/fr/templates/executive", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/executive') },
        { url: "/fr/templates/real-estate", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/real-estate') },
        { url: "/fr/templates/freelancer", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/freelancer') },
        { url: "/fr/templates/saas", changefreq: "weekly", priority: 0.9, links: langLinks('/templates/saas') },

        // French Resources
        { url: "/fr/resources/google-ads-excel-template", changefreq: "monthly", priority: 0.8, links: langLinks('/resources/google-ads-excel-template') },
        { url: "/fr/resources/google-ads-powerpoint-template", changefreq: "monthly", priority: 0.8, links: langLinks('/resources/google-ads-powerpoint-template') },
        { url: "/fr/resources/google-ads-pdf-example", changefreq: "monthly", priority: 0.8, links: langLinks('/resources/google-ads-pdf-example') },
    ];

    const stream = new SitemapStream({ hostname });
    const data = await streamToPromise(Readable.from(links).pipe(stream));

    const sitemapPath = join(distPath, "sitemap.xml");
    createWriteStream(sitemapPath).write(data);

    console.log(`✅ Sitemap created at ${sitemapPath}`);
}

generateSitemap().catch(console.error);
