import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import SimpleHeader from '../components/SimpleHeader';
import Hero from '../components/Hero';
import TrustBar from '../components/TrustBar';
import BigStatement from '../components/BigStatement';
import FeatureShowcase from '../components/FeatureShowcase';
import Testimonials from '../components/Testimonials';
import ClosingCTA from '../components/ClosingCTA';
import Footer from '../components/Footer';
import CookieConsent from '../components/CookieConsent';
import SEO from '../components/SEO';

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
        },
        {
            badge: tc('showcase.ai.badge'),
            title: tc('showcase.ai.title'),
            description: tc('showcase.ai.description'),
            bullets: tc('showcase.ai.bullets', { returnObjects: true }) as string[],
            imagePlaceholder: tc('showcase.ai.imagePlaceholder'),
            imagePosition: 'left' as const,
        },
        {
            badge: tc('showcase.scheduling.badge'),
            title: tc('showcase.scheduling.title'),
            description: tc('showcase.scheduling.description'),
            bullets: tc('showcase.scheduling.bullets', { returnObjects: true }) as string[],
            imagePlaceholder: tc('showcase.scheduling.imagePlaceholder'),
            imagePosition: 'right' as const,
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
                <ClosingCTA />
            </main>

            <Footer />

            <CookieConsent />

            {/* Structured Data for Google Knowledge Graph */}
            <Helmet>
                <script type="application/ld+json">
                    {`
                        {
                          "@context": "https://schema.org",
                          "@type": "SoftwareApplication",
                          "name": "Flipika",
                          "operatingSystem": "Web, iOS, Android",
                          "applicationCategory": "ProductivityApplication",
                          "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "EUR"
                          }
                        }
                    `}
                </script>
            </Helmet>
        </>
    );
};

export default Landing;
