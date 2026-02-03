
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

    const links = [
        // English Silo (Root)
        { url: "/", changefreq: "weekly", priority: 1.0, links: [{ lang: 'fr', url: 'https://flipika.com/fr' }, { lang: 'en', url: 'https://flipika.com/' }] },
        { url: "/login", changefreq: "monthly", priority: 0.5, links: [{ lang: 'fr', url: 'https://flipika.com/fr/login' }, { lang: 'en', url: 'https://flipika.com/login' }] },
        { url: "/legal-notices", changefreq: "monthly", priority: 0.3, links: [{ lang: 'fr', url: 'https://flipika.com/fr/legal-notices' }, { lang: 'en', url: 'https://flipika.com/legal-notices' }] },
        { url: "/privacy-policy", changefreq: "monthly", priority: 0.3, links: [{ lang: 'fr', url: 'https://flipika.com/fr/privacy-policy' }, { lang: 'en', url: 'https://flipika.com/privacy-policy' }] },
        { url: "/terms-of-service", changefreq: "monthly", priority: 0.3, links: [{ lang: 'fr', url: 'https://flipika.com/fr/terms-of-service' }, { lang: 'en', url: 'https://flipika.com/terms-of-service' }] },

        // Alternatives Pages
        // Alternatives Pages
        { url: "/alternatives", changefreq: "weekly", priority: 0.8, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives' }, { lang: 'en', url: 'https://flipika.com/alternatives' }] },
        { url: "/alternatives/looker-studio", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/looker-studio' }, { lang: 'en', url: 'https://flipika.com/alternatives/looker-studio' }] },
        { url: "/alternatives/agency-analytics", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/agency-analytics' }, { lang: 'en', url: 'https://flipika.com/alternatives/agency-analytics' }] },
        { url: "/alternatives/dashthis", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/dashthis' }, { lang: 'en', url: 'https://flipika.com/alternatives/dashthis' }] },
        { url: "/alternatives/excel-spreadsheets", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/excel-spreadsheets' }, { lang: 'en', url: 'https://flipika.com/alternatives/excel-spreadsheets' }] },
        { url: "/alternatives/swydo", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/swydo' }, { lang: 'en', url: 'https://flipika.com/alternatives/swydo' }] },
        { url: "/alternatives/reportgarden", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/reportgarden' }, { lang: 'en', url: 'https://flipika.com/alternatives/reportgarden' }] },
        { url: "/alternatives/whatagraph", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/whatagraph' }, { lang: 'en', url: 'https://flipika.com/alternatives/whatagraph' }] },

        // Templates Pages
        { url: "/templates/google-ads", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/google-ads' }, { lang: 'en', url: 'https://flipika.com/templates/google-ads' }] },
        { url: "/templates/ppc", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/ppc' }, { lang: 'en', url: 'https://flipika.com/templates/ppc' }] },
        { url: "/templates/marketing-agency", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/marketing-agency' }, { lang: 'en', url: 'https://flipika.com/templates/marketing-agency' }] },
        { url: "/templates/ecommerce", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/ecommerce' }, { lang: 'en', url: 'https://flipika.com/templates/ecommerce' }] },
        { url: "/templates/executive", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/executive' }, { lang: 'en', url: 'https://flipika.com/templates/executive' }] },
        { url: "/templates/real-estate", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/real-estate' }, { lang: 'en', url: 'https://flipika.com/templates/real-estate' }] },
        { url: "/templates/freelancer", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/freelancer' }, { lang: 'en', url: 'https://flipika.com/templates/freelancer' }] },
        { url: "/templates/saas", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/saas' }, { lang: 'en', url: 'https://flipika.com/templates/saas' }] },

        // Resources Pages
        { url: "/resources/google-ads-excel-template", changefreq: "monthly", priority: 0.8, links: [{ lang: 'fr', url: 'https://flipika.com/fr/resources/google-ads-excel-template' }, { lang: 'en', url: 'https://flipika.com/resources/google-ads-excel-template' }] },
        { url: "/resources/google-ads-powerpoint-template", changefreq: "monthly", priority: 0.8, links: [{ lang: 'fr', url: 'https://flipika.com/fr/resources/google-ads-powerpoint-template' }, { lang: 'en', url: 'https://flipika.com/resources/google-ads-powerpoint-template' }] },
        { url: "/resources/google-ads-pdf-example", changefreq: "monthly", priority: 0.8, links: [{ lang: 'fr', url: 'https://flipika.com/fr/resources/google-ads-pdf-example' }, { lang: 'en', url: 'https://flipika.com/resources/google-ads-pdf-example' }] },


        // French Silo
        { url: "/fr", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr' }, { lang: 'en', url: 'https://flipika.com/' }] },
        { url: "/fr/login", changefreq: "monthly", priority: 0.5, links: [{ lang: 'fr', url: 'https://flipika.com/fr/login' }, { lang: 'en', url: 'https://flipika.com/login' }] },
        { url: "/fr/legal-notices", changefreq: "monthly", priority: 0.3, links: [{ lang: 'fr', url: 'https://flipika.com/fr/legal-notices' }, { lang: 'en', url: 'https://flipika.com/legal-notices' }] },
        { url: "/fr/privacy-policy", changefreq: "monthly", priority: 0.3, links: [{ lang: 'fr', url: 'https://flipika.com/fr/privacy-policy' }, { lang: 'en', url: 'https://flipika.com/privacy-policy' }] },
        { url: "/fr/terms-of-service", changefreq: "monthly", priority: 0.3, links: [{ lang: 'fr', url: 'https://flipika.com/fr/terms-of-service' }, { lang: 'en', url: 'https://flipika.com/terms-of-service' }] },

        // French Alternatives
        { url: "/fr/alternatives", changefreq: "weekly", priority: 0.8, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives' }, { lang: 'en', url: 'https://flipika.com/alternatives' }] },
        { url: "/fr/alternatives/looker-studio", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/looker-studio' }, { lang: 'en', url: 'https://flipika.com/alternatives/looker-studio' }] },
        { url: "/fr/alternatives/agency-analytics", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/agency-analytics' }, { lang: 'en', url: 'https://flipika.com/alternatives/agency-analytics' }] },
        { url: "/fr/alternatives/dashthis", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/dashthis' }, { lang: 'en', url: 'https://flipika.com/alternatives/dashthis' }] },
        { url: "/fr/alternatives/excel-spreadsheets", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/excel-spreadsheets' }, { lang: 'en', url: 'https://flipika.com/alternatives/excel-spreadsheets' }] },
        { url: "/fr/alternatives/swydo", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/swydo' }, { lang: 'en', url: 'https://flipika.com/alternatives/swydo' }] },
        { url: "/fr/alternatives/reportgarden", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/reportgarden' }, { lang: 'en', url: 'https://flipika.com/alternatives/reportgarden' }] },
        { url: "/fr/alternatives/whatagraph", changefreq: "monthly", priority: 0.7, links: [{ lang: 'fr', url: 'https://flipika.com/fr/alternatives/whatagraph' }, { lang: 'en', url: 'https://flipika.com/alternatives/whatagraph' }] },

        // French Templates
        { url: "/fr/templates/google-ads", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/google-ads' }, { lang: 'en', url: 'https://flipika.com/templates/google-ads' }] },
        { url: "/fr/templates/ppc", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/ppc' }, { lang: 'en', url: 'https://flipika.com/templates/ppc' }] },
        { url: "/fr/templates/marketing-agency", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/marketing-agency' }, { lang: 'en', url: 'https://flipika.com/templates/marketing-agency' }] },
        { url: "/fr/templates/ecommerce", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/ecommerce' }, { lang: 'en', url: 'https://flipika.com/templates/ecommerce' }] },
        { url: "/fr/templates/executive", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/executive' }, { lang: 'en', url: 'https://flipika.com/templates/executive' }] },
        { url: "/fr/templates/real-estate", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/real-estate' }, { lang: 'en', url: 'https://flipika.com/templates/real-estate' }] },
        { url: "/fr/templates/freelancer", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/freelancer' }, { lang: 'en', url: 'https://flipika.com/templates/freelancer' }] },
        { url: "/fr/templates/saas", changefreq: "weekly", priority: 0.9, links: [{ lang: 'fr', url: 'https://flipika.com/fr/templates/saas' }, { lang: 'en', url: 'https://flipika.com/templates/saas' }] },

        // French Resources
        { url: "/fr/resources/google-ads-excel-template", changefreq: "monthly", priority: 0.8, links: [{ lang: 'fr', url: 'https://flipika.com/fr/resources/google-ads-excel-template' }, { lang: 'en', url: 'https://flipika.com/resources/google-ads-excel-template' }] },
        { url: "/fr/resources/google-ads-powerpoint-template", changefreq: "monthly", priority: 0.8, links: [{ lang: 'fr', url: 'https://flipika.com/fr/resources/google-ads-powerpoint-template' }, { lang: 'en', url: 'https://flipika.com/resources/google-ads-powerpoint-template' }] },
        { url: "/fr/resources/google-ads-pdf-example", changefreq: "monthly", priority: 0.8, links: [{ lang: 'fr', url: 'https://flipika.com/fr/resources/google-ads-pdf-example' }, { lang: 'en', url: 'https://flipika.com/resources/google-ads-pdf-example' }] },
    ];

    const stream = new SitemapStream({ hostname });
    const data = await streamToPromise(Readable.from(links).pipe(stream));

    const sitemapPath = join(distPath, "sitemap.xml");
    createWriteStream(sitemapPath).write(data);

    console.log(`✅ Sitemap created at ${sitemapPath}`);
}

generateSitemap().catch(console.error);
