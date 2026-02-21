import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import SEO from '../../components/SEO';

const glossaryTermsList = [
    'cpc', 'cpa', 'ctr', 'cpm', 'roas', 'roi', 'cac', 'ltv', 'retargeting', 'lookalike',
    'cpl', 'cpv', 'rtb', 'dsp', 'ssp', 'cvr', 'bounce_rate', 'utm', 'ad_fatigue',
    'broad_match', 'negative_keyword', 'impression', 'reach', 'frequency', 'a_b_testing'
];

const MediaBuyingGlossary: React.FC = () => {
    const { t, i18n } = useTranslation(['tools']);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTerms = glossaryTermsList.filter(termKey => {
        const title = t(`glossary.terms.${termKey}.name`).toLowerCase();
        const definition = t(`glossary.terms.${termKey}.definition`).toLowerCase();
        const query = searchQuery.toLowerCase();
        return title.includes(query) || definition.includes(query);
    });

    // AEO Optimization: DefinedTermSet Schema.org for Glossaries
    // This perfectly formats the glossary for AI Overviews and Google rich snippets.
    const structuredData = {
        "@context": "https://schema.org/",
        "@type": "DefinedTermSet",
        "@id": "https://flipika.com/tools/media-buying-glossary",
        "name": t('glossary.seo.title'),
        "description": t('glossary.seo.description'),
        "hasDefinedTerm": glossaryTermsList.map(termKey => ({
            "@type": "DefinedTerm",
            "name": t(`glossary.terms.${termKey}.name`),
            "description": t(`glossary.terms.${termKey}.definition`),
            "inDefinedTermSet": "https://flipika.com/tools/media-buying-glossary"
        }))
    };

    return (
        <div className="flex-1 bg-[var(--color-bg-primary)] relative overflow-hidden min-h-screen">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-[var(--color-primary)]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] left-[-10%] w-[40vw] h-[40vw] bg-[var(--color-primary)]/5 rounded-full blur-[100px]" />
            </div>

            <SEO
                title={t('glossary.seo.title')}
                description={t('glossary.seo.description')}
                canonicalPath={`/tools/media-buying-glossary`}
                breadcrumbs={[
                    { name: 'Flipika', path: '/' },
                    { name: 'Tools', path: '/tools' },
                    { name: 'Media Buying Glossary', path: '/tools/media-buying-glossary' },
                ]}
            />

            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>

            <article className="py-20 px-4 md:py-32 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Hero */}
                    <section className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm font-bold mb-6 backdrop-blur-md"
                        >
                            <span className="flex items-center gap-2">
                                <BookOpen size={16} />
                                {t('glossary.hero.badge')}
                            </span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-6 text-[var(--color-text-primary)] tracking-tight"
                        >
                            {t('glossary.hero.title')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed"
                        >
                            {t('glossary.hero.subtitle')}
                        </motion.p>
                    </section>

                    {/* Search Bar */}
                    <section className="mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-2xl mx-auto relative"
                        >
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Search size={24} className="text-[var(--color-text-muted)]" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('glossary.search')}
                                className="w-full pl-14 pr-6 py-5 rounded-2xl glass border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 text-lg font-medium outline-none transition-all shadow-xl bg-white/50 dark:bg-black/20 text-[var(--color-text-primary)]"
                            />
                        </motion.div>
                    </section>

                    {/* Glossary Grid */}
                    <section className="mb-24">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AnimatePresence>
                                {filteredTerms.length > 0 ? (
                                    filteredTerms.map((termKey) => (
                                        <motion.div
                                            key={termKey}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="glass rounded-2xl p-8 border border-[var(--glass-border)] hover:border-[var(--color-primary)]/40 transition-colors shadow-lg hover:shadow-xl group"
                                        >
                                            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-3">
                                                <div className="w-2 h-6 rounded-full bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-light)] group-hover:scale-y-110 transition-transform" />
                                                {t(`glossary.terms.${termKey}.name`)}
                                            </h2>
                                            <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg">
                                                {t(`glossary.terms.${termKey}.definition`)}
                                            </p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="col-span-full py-12 text-center text-[var(--color-text-secondary)] text-lg"
                                    >
                                        Aucun terme ne correspond à "{searchQuery}".
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </section>

                    {/* CTA */}
                    <motion.section
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        viewport={{ once: true }}
                        className="text-center p-8 md:p-16 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-bl from-[var(--color-bg-elevated)] to-[var(--color-bg-primary)] border border-[var(--glass-border)] shadow-2xl glass"
                    >
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--color-text-primary)]">
                                {t('glossary.cta.title')}
                            </h2>
                            <p className="text-[var(--color-text-secondary)] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                                {t('glossary.cta.subtitle')}
                            </p>
                            <button
                                onClick={() => window.location.href = i18n.language === 'fr' ? '/fr/login' : '/login'}
                                className="group px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mx-auto w-full sm:w-auto"
                            >
                                {t('glossary.cta.button')}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.section>
                </div>
            </article>
        </div>
    );
};

export default MediaBuyingGlossary;
