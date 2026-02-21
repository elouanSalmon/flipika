import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calculator, BookOpen, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const ToolsIndex: React.FC = () => {
    const { t } = useTranslation(['tools', 'common']);

    // Hardcoded for simplicity but should ideally be in i18n
    const tools = [
        {
            id: 'roas',
            path: 'roas-calculator',
            icon: Calculator,
            title: t('tools:roas.hero.title', 'ROAS Calculator'),
            description: t('tools:roas.hero.subtitle', 'Instantly calculate the profitability of your Google Ads or Meta Ads campaigns.'),
            badge: t('tools:roas.hero.badge', 'Free Tool')
        },
        {
            id: 'glossary',
            path: 'media-buying-glossary',
            icon: BookOpen,
            title: t('tools:glossary.hero.title', 'Media Buying Glossary'),
            description: t('tools:glossary.hero.subtitle', 'Decode online advertising jargon. From A/B Testing to ROAS.'),
            badge: t('tools:glossary.hero.badge', 'Free Resource')
        }
    ];

    return (
        <div className="flex-1 bg-[var(--color-bg-primary)] relative overflow-hidden min-h-screen">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-[var(--color-primary)]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] bg-[var(--color-primary)]/5 rounded-full blur-[100px]" />
            </div>

            <SEO
                title={t('tools:index.seo.title', 'Free Marketing Tools for Agencies | Flipika')}
                description={t('tools:index.seo.description', 'A collection of free tools for marketers and agencies: ROAS Calculator, Media Buying Glossary, and more.')}
                canonicalPath={`/tools`}
                breadcrumbs={[
                    { name: 'Flipika', path: '/' },
                    { name: 'Free Tools', path: '/tools' },
                ]}
            />

            <article className="py-20 px-4 md:py-32 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Hero */}
                    <section className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm font-bold mb-6 backdrop-blur-md items-center gap-2"
                        >
                            <Zap size={16} />
                            {t('tools:index.hero.badge', 'Free Resources for Marketers')}
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-6 text-[var(--color-text-primary)] tracking-tight"
                        >
                            {t('tools:index.hero.title', 'Growth Marketing Tools')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed"
                        >
                            {t('tools:index.hero.subtitle', 'Everything you need to calculate ROI, understand ad jargon, and impress your clients. 100% free.')}
                        </motion.p>
                    </section>

                    {/* Tools Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
                        {tools.map((tool, index) => (
                            <Link key={tool.id} to={`/tools/${tool.path}`}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + (index * 0.1) }}
                                    className="h-full group p-8 rounded-3xl glass border border-[var(--glass-border)] hover:border-[var(--color-primary)]/40 transition-all cursor-pointer flex flex-col items-start relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent dark:from-white/5 dark:to-transparent hover:shadow-2xl"
                                >
                                    {/* Hover gradient effect inside card */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:bg-[var(--color-primary)]/20 transition-colors" />

                                    <div className="relative z-10">
                                        <div className="mb-6 flex items-center justify-between w-full gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center p-3 backdrop-blur-md group-hover:scale-110 transition-transform">
                                                <tool.icon size={28} />
                                            </div>
                                            <span className="px-3 py-1 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-full text-xs font-bold text-[var(--color-text-secondary)] shadow-sm">
                                                {tool.badge}
                                            </span>
                                        </div>

                                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                                            {tool.title}
                                        </h2>
                                        <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8 flex-grow">
                                            {tool.description}
                                        </p>

                                        <div className="mt-auto flex items-center gap-2 text-[var(--color-primary)] font-bold group-hover:gap-4 transition-all uppercase tracking-wider text-sm">
                                            {t('common:actions.try', 'Try it now')}
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </section>
                </div>
            </article>
        </div>
    );
};

export default ToolsIndex;
