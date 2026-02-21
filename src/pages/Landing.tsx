import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import SimpleHeader from '../components/SimpleHeader';
import Hero from '../components/Hero';
import TrustBar from '../components/TrustBar';
import BigStatement from '../components/BigStatement';
import FeatureShowcase from '../components/FeatureShowcase';
import { TemplateIllustration, AIInsightIllustration, SchedulingIllustration } from '../components/LandingIllustrations';
import Testimonials from '../components/Testimonials';
import ClosingCTA from '../components/ClosingCTA';
import Footer from '../components/Footer';
import CookieConsent from '../components/CookieConsent';
import SEO from '../components/SEO';
import RoadmapPreview from '../components/RoadmapPreview';
import PricingPreview from '../components/PricingPreview';

const Landing = () => {
    const { t } = useTranslation('seo');
    const { t: tc } = useTranslation('common');

    // Showcase data from i18n
    const showcases = [
        {
            badge: tc('showcase.templates.badge'),
            title: tc('showcase.templates.title'),
            description: tc('showcase.templates.description'),
            bullets: tc('showcase.templates.bullets', { returnObjects: true }) as string[],
            imagePlaceholder: tc('showcase.templates.imagePlaceholder'),
            imagePosition: 'right' as const,
            illustration: <TemplateIllustration />,
        },
        {
            badge: tc('showcase.ai.badge'),
            title: tc('showcase.ai.title'),
            description: tc('showcase.ai.description'),
            bullets: tc('showcase.ai.bullets', { returnObjects: true }) as string[],
            imagePlaceholder: tc('showcase.ai.imagePlaceholder'),
            imagePosition: 'left' as const,
            illustration: <AIInsightIllustration />,
        },
        {
            badge: tc('showcase.scheduling.badge'),
            title: tc('showcase.scheduling.title'),
            description: tc('showcase.scheduling.description'),
            bullets: tc('showcase.scheduling.bullets', { returnObjects: true }) as string[],
            imagePlaceholder: tc('showcase.scheduling.imagePlaceholder'),
            imagePosition: 'right' as const,
            illustration: <SchedulingIllustration />,
        },
    ];

    return (
        <>
            <SEO
                title={t('landing.title')}
                description={t('landing.description')}
                keywords={t('landing.keywords')}
                canonicalPath="/"
            />

            <SimpleHeader />

            <main>
                <Hero />
                <TrustBar />
                <BigStatement />
                {showcases.map((showcase, index) => (
                    <FeatureShowcase key={index} {...showcase} />
                ))}
                <Testimonials />
                <PricingPreview />
                <RoadmapPreview />
                <ClosingCTA />
            </main>

            <Footer />

            <CookieConsent />

            {/* Structured Data for Google Knowledge Graph */}
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "Flipika",
                        "url": "https://flipika.com",
                        "image": "https://flipika.com/og-image.png",
                        "description": "Generate professional Google Ads & Meta Ads reports in 2 minutes. Automated data sync, AI-powered insights, white-label ready.",
                        "operatingSystem": "Web",
                        "applicationCategory": "BusinessApplication",
                        "author": {
                            "@type": "Organization",
                            "name": "Flipika",
                            "url": "https://flipika.com"
                        },
                        "offers": {
                            "@type": "AggregateOffer",
                            "lowPrice": "0",
                            "highPrice": "100",
                            "priceCurrency": "EUR",
                            "offerCount": "3"
                        }
                    })}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Flipika",
                        "alternateName": "Flipika Report",
                        "url": "https://flipika.com",
                        "logo": "https://flipika.com/logo.png",
                        "description": "Automated Google Ads & Meta Ads reporting platform for media buyers, agencies and freelancers.",
                        "foundingDate": "2024",
                        "email": "helloflipika@gmail.com",
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "email": "helloflipika@gmail.com",
                            "contactType": "customer service",
                            "url": "https://flipika.com",
                            "availableLanguage": ["English", "French", "Spanish"]
                        },
                        "sameAs": [
                            "https://www.wikidata.org/wiki/Q138391914",
                            "https://www.linkedin.com/company/flipika/"
                        ]
                    })}
                </script>
            </Helmet>
        </>
    );
};

export default Landing;
