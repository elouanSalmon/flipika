import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    canonicalPath?: string;  // e.g., "/roadmap" — if not provided, uses current path
    ogImage?: string;        // Custom Open Graph image URL
    noIndex?: boolean;       // Set to true for pages that shouldn't be indexed (e.g., 404)
}

const SEO = ({ title, description, keywords, canonicalPath, ogImage, noIndex }: SEOProps = {}) => {
    const { t, i18n } = useTranslation('seo');
    const location = useLocation();

    // Build the canonical URL
    const baseUrl = 'https://flipika.com';
    const currentPath = canonicalPath ?? location.pathname;

    // Remove language prefix for canonical URL (EN is default, FR has /fr prefix)
    const cleanPath = currentPath.replace(/^\/fr/, '') || '/';
    const canonicalUrl = `${baseUrl}${i18n.language === 'fr' ? '/fr' : ''}${cleanPath === '/' ? '' : cleanPath}`;

    // Get SEO values with fallbacks
    const siteTitle = title || t('default.title');
    const metaDescription = description || t('default.description');
    const metaKeywords = keywords || t('default.keywords');
    const ogTitle = title || t('default.ogTitle');
    const ogDescription = description || t('default.ogDescription');
    const ogImageUrl = ogImage || `${baseUrl}/og-image.png`;

    return (
        <Helmet>
            {/* Html Attributes */}
            <html lang={i18n.language} />

            {/* Primary Meta Tags */}
            <title>{siteTitle}</title>
            <meta name="title" content={siteTitle} />
            <meta name="description" content={metaDescription} />
            {metaKeywords && <meta name="keywords" content={metaKeywords} />}

            {/* Robots */}
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={ogTitle} />
            <meta property="og:description" content={ogDescription} />
            <meta property="og:image" content={ogImageUrl} />
            <meta property="og:locale" content={i18n.language === 'fr' ? 'fr_FR' : 'en_US'} />
            <meta property="og:site_name" content="Flipika" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonicalUrl} />
            <meta property="twitter:title" content={ogTitle} />
            <meta property="twitter:description" content={ogDescription} />
            <meta property="twitter:image" content={ogImageUrl} />

            {/* Canonical */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Alternate language versions */}
            <link rel="alternate" hrefLang="en" href={`${baseUrl}${cleanPath === '/' ? '' : cleanPath}`} />
            <link rel="alternate" hrefLang="fr" href={`${baseUrl}/fr${cleanPath === '/' ? '' : cleanPath}`} />
            <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${cleanPath === '/' ? '' : cleanPath}`} />
        </Helmet>
    );
};

export default SEO;
