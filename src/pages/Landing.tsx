import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Problem from '../components/Problem';
import Features from '../components/Features';
import Differentiation from '../components/Differentiation';
import SocialProof from '../components/Testimonials';
import EmailCapture from '../components/EmailCapture';
import RoadmapPreview from '../components/RoadmapPreview';
import Footer from '../components/Footer';
import CookieConsent from '../components/CookieConsent';
import SEO from '../components/SEO';

const Landing = () => {
    const { t } = useTranslation('seo');

    return (
        <>
            <SEO
                title={t('landing.title')}
                description={t('landing.description')}
                keywords={t('landing.keywords')}
                canonicalPath="/"
            />
            <div className="bg-gradient"></div>
            <div className="bg-grid"></div>

            <Header />

            <main>
                <Hero />
                <Problem />
                <Features />
                <Differentiation />
                <SocialProof />
                <RoadmapPreview />
                <EmailCapture />
            </main>

            <Footer />

            {/* Floating elements for visual appeal */}
            <motion.div
                className="floating-orb orb-1"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
            <motion.div
                className="floating-orb orb-2"
                animate={{
                    x: [0, -150, 0],
                    y: [0, 150, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            <CookieConsent />

            {/* Structured Data for Google Knowledge Graph */}
            {/* Note: aggregateRating is commented out until more reviews are visible on the page to avoid penalties */}
            <Helmet>
                <script type="application/ld+json">
                    {`
                        {
                          "@context": "https://schema.org",
                          "@type": "SoftwareApplication",
                          "name": "Flipika",
                          "operatingSystem": "Web, iOS, Android",
                          "applicationCategory": "ProductivityApplication",
                          /* 
                          "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.8",
                            "ratingCount": "127"
                          },
                          */
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
