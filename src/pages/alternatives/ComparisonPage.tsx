import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap } from 'lucide-react';
import { competitors } from '../../data/competitors';
import ComparisonTable from '../../components/alternatives/ComparisonTable';
import PainPointSelector from '../../components/alternatives/PainPointSelector';
import MigrationCTA from '../../components/alternatives/MigrationCTA';
import ComparisonJSONLD from '../../components/alternatives/ComparisonJSONLD';
import SEO from '../../components/SEO';

const ComparisonPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { i18n, t } = useTranslation();

    const competitor = competitors.find(c => c.slug === slug);

    if (!competitor) {
        return <Navigate to={i18n.language === 'fr' ? '/fr/alternatives' : '/alternatives'} replace />;
    }

    return (
        <div className="flex-1 bg-[var(--color-bg-primary)] relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-600/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <SEO
                title={t('alternatives:page.seoTitle', { competitor: competitor.name, year: '2026' })}
                description={t('alternatives:page.seoDescription', { competitor: competitor.name })}
            />
            <ComparisonJSONLD competitor={competitor} />

            <div className="py-20 px-4 md:py-32 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-28">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-bold mb-8 flex items-center gap-2 mx-auto w-fit backdrop-blur-md"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            {t('alternatives:page.updatedBadge', { date: 'Janvier 2026' })}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-7xl font-bold mb-10 text-primary leading-[1.1] tracking-tight"
                        >
                            {t('alternatives:page.h1Title', { competitor: competitor.name, year: '2026' })}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl md:text-2xl text-secondary max-w-3xl mx-auto leading-relaxed"
                        >
                            {t(`alternatives:competitors.${competitor.slug}.heroSubtitle`, { competitor: competitor.name })}
                        </motion.p>
                    </div>

                    {/* Problem Section (Pain Points) */}
                    <div className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">{t('alternatives:page.painPointsTitle', { competitor: competitor.name })}</h2>
                            <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">{t('alternatives:page.painPointsSubtitle')}</p>
                        </motion.div>
                        <PainPointSelector competitor={competitor} />
                    </div>

                    {/* Battle Section (Table) */}
                    <div className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">{t('alternatives:page.comparisonTitle')}</h2>
                            <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">{t('alternatives:page.comparisonSubtitle', { competitor: competitor.name })}</p>
                        </motion.div>
                        <ComparisonTable competitor={competitor} />
                    </div>

                    {/* Visual Proof Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-32 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-transparent rounded-[3rem] -m-4 blur-2xl" />
                        <div className="relative glass-card border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 md:p-20 overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">{t('alternatives:page.visualProofTitle')}</h2>
                                    <p className="text-xl text-secondary mb-10 leading-relaxed">
                                        {t('alternatives:page.visualProofDesc', { competitor: competitor.name })}
                                    </p>
                                    <ul className="space-y-6">
                                        {[
                                            t('alternatives:page.benefit1'),
                                            t('alternatives:page.benefit2'),
                                            t('alternatives:page.benefit3')
                                        ].map((benefit, i) => (
                                            <motion.li
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-center gap-4 text-primary font-semibold text-lg"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                                                    <CheckCircle2 size={18} />
                                                </div>
                                                {benefit}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="relative">
                                    <div className="aspect-[4/3] bg-white/40 dark:bg-black/40 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden flex items-center justify-center group relative z-10 transition-transform duration-500 hover:scale-[1.02]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
                                        <div className="text-secondary/50 flex flex-col items-center gap-4 group-hover:text-secondary/80 transition-colors">
                                            <Zap size={64} className="animate-pulse text-blue-600/40" />
                                            <span className="text-sm font-bold uppercase tracking-widest">[ Interface Flipika ]</span>
                                        </div>
                                    </div>
                                    {/* Glass decor elements */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-6 -left-6 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl z-20 hidden md:block">
                                        <div className="text-sm font-bold text-secondary uppercase tracking-wider mb-1">Impact Temps</div>
                                        <div className="text-4xl font-black text-blue-600">-85%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* CTA Section */}
                    <MigrationCTA competitor={competitor} />
                </div>
            </div>
        </div>
    );
};

export default ComparisonPage;
