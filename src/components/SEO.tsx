import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
}

const SEO = ({ title, description, keywords }: SEOProps = {}) => {
    const { t, i18n } = useTranslation();

    const siteTitle = title || t('meta.title');
    const metaDescription = description || t('meta.description');
    const metaKeywords = keywords || t('meta.keywords');
    const webSiteUrl = 'https://flipika.com';

    return (
        <Helmet>
            {/* Html Attributes */}
            <html lang={i18n.language} />

            {/* Primary Meta Tags */}
            <title>{siteTitle}</title>
            <meta name="title" content={siteTitle} />
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={webSiteUrl} />
            <meta property="og:title" content={title || t('meta.ogTitle')} />
            <meta property="og:description" content={description || t('meta.ogDescription')} />
            <meta property="og:locale" content={i18n.language === 'fr' ? 'fr_FR' : 'en_US'} />

            {/* Twitter */}
            <meta property="twitter:url" content={webSiteUrl} />
            <meta property="twitter:title" content={title || t('meta.ogTitle')} />
            <meta property="twitter:description" content={description || t('meta.ogDescription')} />

            {/* Canonical */}
            <link rel="canonical" href={webSiteUrl} />
        </Helmet>
    );
};

export default SEO;
