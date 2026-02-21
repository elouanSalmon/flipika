import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ImagePlus, TrendingUp, LayoutGrid, LayoutDashboard, Share2, ChevronDown } from 'lucide-react';
import { SiInstagram } from 'react-icons/si';
import React from 'react';

import PricingPreview from '../../components/PricingPreview';
import TrustBar from '../../components/TrustBar';
import SEO from '../../components/SEO';

const InstagramAdsLanding = () => {
    const { i18n } = useTranslation();
    const { t } = useTranslation('seo-instagram-ads');
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = React.useState<number | null>(null);

    const getLangPath = (path: string) => {
        if (i18n.language === 'fr') return `/fr${path}`;
        if (i18n.language === 'es') return `/es${path}`;
        return path;
    };

    const isFr = i18n.language === 'fr';

    const faqItems = t('faq.items', { returnObjects: true }) as Array<{ question: string; answer: string }>;

    const instagramSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Flipika - Instagram Ads Reporting",
        "applicationCategory": "BusinessApplication",
        "description": t('landing.description'),
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock"
        },
        "featureList": [
            "Instagram Ads automated reporting",
            "Stories, Reels & Feed performance breakdown",
            "Creative analysis with visual embeds",
            "Engagement rate & CTR tracking",
            "ROAS & CPA by placement",
            "White-label Instagram Ads reports",
            "Facebook & Instagram combined reporting"
        ]
    };

    const faqSchema = Array.isArray(faqItems) ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    } : null;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 selection:bg-pink-500/20 selection:text-pink-600 pt-20">
            <SEO
                title={t('landing.title')}
                description={t('landing.description')}
                keywords={t('landing.keywords')}
                canonicalPath="/instagram-ads-reporting"
                breadcrumbs={[
                    { name: 'Flipika', path: '/' },
                    { name: isFr ? 'Reporting Instagram Ads' : 'Instagram Ads Reporting', path: '/instagram-ads-reporting' },
                ]}
            />
            <Helmet>
                <script type="application/ld+json">{JSON.stringify(instagramSchema)}</script>
                {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
            </Helmet>

            <main>
                {/* Hero */}
                <section className="relative py-20 lg:py-32 overflow-hidden">
                    <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-3xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-600 dark:text-pink-400 font-medium text-sm mb-8"
                            >
                                <SiInstagram className="w-4 h-4" />
                                <span>{t('hero.badge')}</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-6 leading-tight"
                            >
                                {isFr ? (
                                    <>Vos rapports <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Instagram Ads</span>, prêts en 2 minutes.</>
                                ) : (
                                    <>Your <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Instagram Ads</span> reports, ready in 2 minutes.</>
                                )}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl text-neutral-600 dark:text-neutral-400 mb-10"
                            >
                                {t('hero.subtitle')}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            >
                                <button
                                    onClick={() => navigate(getLangPath('/login'))}
                                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-pink-500/30 transition-all flex items-center justify-center gap-2"
                                >
                                    {t('hero.cta')} <ArrowRight className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-neutral-500 dark:text-neutral-400">{t('hero.noCreditCard')}</span>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <TrustBar />

                {/* Placement breakdown highlight */}
                <section className="py-12 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 border-y border-pink-100 dark:border-white/5">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            {['Feed', 'Stories', 'Reels', 'Shopping'].map((placement) => (
                                <div key={placement} className="p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10">
                                    <div className="text-2xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-1">{placement}</div>
                                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {isFr ? 'Rapport dédié' : 'Dedicated reporting'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-24 bg-white dark:bg-neutral-800/20 border-b border-neutral-100 dark:border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                                {t('features.title')}
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                {t('features.subtitle')}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: LayoutGrid, key: 'card1' },
                                { icon: TrendingUp, key: 'card2' },
                                { icon: ImagePlus, key: 'card3' },
                            ].map(({ icon: Icon, key }) => (
                                <motion.div
                                    key={key}
                                    className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow"
                                    whileHover={{ y: -4 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <Icon className="w-10 h-10 text-pink-500 mb-6" />
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                        {t(`features.${key}.title`)}
                                    </h3>
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        {t(`features.${key}.description`)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Workflow */}
                <section className="py-24 bg-neutral-50 dark:bg-neutral-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                                {t('workflow.title')}
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                {t('workflow.subtitle')}
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12 text-center">
                            {[
                                { icon: SiInstagram, step: '1', key: 'step1' },
                                { icon: LayoutDashboard, step: '2', key: 'step2' },
                                { icon: Share2, step: '3', key: 'step3' },
                            ].map(({ icon: Icon, step, key }) => (
                                <motion.div
                                    key={key}
                                    className="flex flex-col items-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: parseInt(step) * 0.1 }}
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-500/20 dark:to-purple-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-6">
                                        <Icon size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                        {step}. {t(`workflow.${key}.title`)}
                                    </h4>
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        {t(`workflow.${key}.description`)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                {Array.isArray(faqItems) && faqItems.length > 0 && (
                    <section className="py-24 bg-white dark:bg-neutral-800/20 border-t border-neutral-100 dark:border-white/5">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-12 text-center">
                                {t('faq.title')}
                            </h2>
                            <div className="space-y-4">
                                {faqItems.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 overflow-hidden"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <button
                                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors"
                                            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        >
                                            <span className="font-semibold text-neutral-900 dark:text-white pr-4">{item.question}</span>
                                            <ChevronDown
                                                size={20}
                                                className={`flex-shrink-0 text-neutral-500 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        {openFaq === idx && (
                                            <motion.div
                                                className="px-6 pb-4 text-sm text-neutral-600 dark:text-neutral-400"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                            >
                                                {item.answer}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <PricingPreview />

                {/* Closing CTA */}
                <section className="py-24 bg-neutral-50 dark:bg-neutral-900">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <motion.div
                            className="glass rounded-3xl p-12"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                                {t('closingCta.title')}
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                                {t('closingCta.subtitle')}
                            </p>
                            <button
                                onClick={() => navigate(getLangPath('/login'))}
                                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-pink-500/30 transition-all inline-flex items-center gap-2"
                            >
                                {t('closingCta.cta')} <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default InstagramAdsLanding;
