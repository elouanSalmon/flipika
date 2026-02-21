import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, Zap, Clock, Sparkles, Shield, Users,
    Headphones, ChevronDown, ArrowRight
} from 'lucide-react';
import { competitors } from '../../data/competitors';
import ComparisonTable from '../../components/alternatives/ComparisonTable';
import PainPointSelector from '../../components/alternatives/PainPointSelector';
import MigrationCTA from '../../components/alternatives/MigrationCTA';
import ComparisonJSONLD from '../../components/alternatives/ComparisonJSONLD';
import SEO from '../../components/SEO';

const ComparisonPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { i18n, t } = useTranslation();
    const [openFaq, setOpenFaq] = useState<string | null>(null);
    const [openUseCase, setOpenUseCase] = useState<string | null>(null);

    const competitor = competitors.find(c => c.slug === slug);

    if (!competitor) {
        return <Navigate to={i18n.language === 'fr' ? '/fr/alternatives' : '/alternatives'} replace />;
    }

    const toggleFaq = (id: string) => {
        setOpenFaq(openFaq === id ? null : id);
    };

    const toggleUseCase = (id: string) => {
        setOpenUseCase(openUseCase === id ? null : id);
    };

    // FAQ Schema
    const faqSchema = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'].map(qKey => ({
        "@type": "Question",
        "name": t(`${competitor.slug}:faq.${qKey}`),
        "acceptedAnswer": {
            "@type": "Answer",
            "text": t(`${competitor.slug}:faq.${qKey.replace('q', 'a')}`)
        }
    }));

    // Structured Data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": `Flipika - Alternative to ${competitor.name}`,
        "applicationCategory": "BusinessApplication",
        "description": t('alternatives:page.seoDescription', { competitor: competitor.name }),
        "author": {
            "@type": "Organization",
            "name": "Flipika",
            "url": "https://flipika.com"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": competitor.ratingValue,
            "reviewCount": competitor.reviewCount
        },
        "mainEntity": faqSchema
    };

    return (
        <div className="flex-1 bg-[var(--color-bg-primary)] relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-[var(--color-primary)]/5 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] left-[-10%] w-[40vw] h-[40vw] bg-[var(--color-primary)]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[var(--color-primary)]/5 rounded-full blur-[150px]" />
            </div>


            <SEO
                title={t(`${competitor.slug}:page.seoTitle`, { competitor: competitor.name, year: '2026' })}
                description={t(`${competitor.slug}:page.seoDescription`, { competitor: competitor.name })}
                canonicalPath={`/alternatives/${competitor.slug}`}
                breadcrumbs={[
                    { name: 'Flipika', path: '/' },
                    { name: 'Alternatives', path: '/alternatives' },
                    { name: competitor.name, path: `/alternatives/${competitor.slug}` },
                ]}
            />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>

            <ComparisonJSONLD competitor={competitor} />

            <article className="py-20 px-4 md:py-32 relative z-10">
                <div className="max-w-6xl mx-auto">
                    {/* Hero Section */}
                    <section className="text-center mb-28">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm font-bold mb-8 flex items-center gap-2 mx-auto w-fit backdrop-blur-md"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]"></span>
                            </span>
                            {t('alternatives:page.updatedBadge', { date: 'Janvier 2026' })}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold mb-10 text-[var(--color-text-primary)] leading-[1.1] tracking-tight whitespace-pre-line text-balance drop-shadow-sm"
                        >
                            {t(`${competitor.slug}:page.h1Title`, { competitor: competitor.name, year: '2026' })}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-3xl mx-auto leading-relaxed mb-8"
                        >
                            {t(`${competitor.slug}:page.subtitle`)}
                        </motion.p>

                        {/* Social Proof Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="flex items-center justify-center gap-2 mb-12 text-sm text-[var(--color-text-muted)]"
                        >
                            <Users size={16} />
                            <span>{t('alternatives:page.socialProof')}</span>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={() => window.location.href = i18n.language === 'fr' ? '/fr/login' : '/login'}
                            className="group px-10 py-5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:opacity-90 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-3 mx-auto"
                        >
                            {t('alternatives:page.cta')}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </section>

                    {/* How It Works Section */}
                    <section className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-[var(--color-text-primary)]">{t('alternatives:page.howItWorksTitle')}</h2>
                            <p className="text-xl text-[var(--color-text-secondary)]">{t('alternatives:page.howItWorksSubtitle')}</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {['step1', 'step2', 'step3', 'step4'].map((step, index) => (
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative p-8 rounded-3xl glass border border-[var(--glass-border)] hover:border-[var(--color-primary)]/30 transition-all"
                                >
                                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white font-black text-xl shadow-lg">
                                        {index + 1}
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3 mt-4">{t(`${competitor.slug}:howItWorks.${step}.title`)}</h3>
                                    <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm">{t(`${competitor.slug}:howItWorks.${step}.description`)}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Problem Section (Pain Points) */}
                    <section className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-[var(--color-text-primary)]">{t(`${competitor.slug}:page.painPointsTitle`, { competitor: competitor.name })}</h2>
                            <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">{t(`${competitor.slug}:page.painPointsSubtitle`)}</p>
                        </motion.div>
                        <PainPointSelector competitor={competitor} />
                    </section>

                    {/* Benefits Section */}
                    <section className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-[var(--color-text-primary)]">{t(`${competitor.slug}:page.benefitsTitle`)}</h2>
                            <p className="text-xl text-[var(--color-text-secondary)]">{t(`${competitor.slug}:page.benefitsSubtitle`)}</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { id: 'speed', icon: <Zap className="text-[var(--color-primary)]" size={28} /> },
                                { id: 'realtime', icon: <Clock className="text-[var(--color-primary)]" size={28} /> },
                                { id: 'design', icon: <Sparkles className="text-[var(--color-primary)]" size={28} /> },
                                { id: 'whitelabel', icon: <Shield className="text-[var(--color-primary)]" size={28} /> },
                                { id: 'ai', icon: <Sparkles className="text-[var(--color-primary)]" size={28} /> },
                                { id: 'support', icon: <Headphones className="text-[var(--color-primary)]" size={28} /> }
                            ].map((benefit, index) => (
                                <motion.div
                                    key={benefit.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-8 rounded-3xl glass border border-[var(--glass-border)] hover:border-[var(--color-primary)]/30 transition-all"
                                >
                                    <div className="mb-6 p-4 rounded-2xl bg-[var(--color-primary)]/10 w-fit backdrop-blur-md">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">{t(`${competitor.slug}:benefits.${benefit.id}.title`)}</h3>
                                    <p className="text-[var(--color-text-secondary)] leading-relaxed">{t(`${competitor.slug}:benefits.${benefit.id}.description`)}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Use Cases Section */}
                    <section className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-[var(--color-text-primary)]">{t(`${competitor.slug}:page.useCasesTitle`)}</h2>
                            <p className="text-xl text-[var(--color-text-secondary)]">{t(`${competitor.slug}:page.useCasesSubtitle`)}</p>
                        </motion.div>

                        <div className="space-y-4 max-w-4xl mx-auto">
                            {['ecommerce', 'leadgen', 'agency', 'local', 'saas'].map((useCase) => {
                                const isOpen = openUseCase === useCase;
                                return (
                                    <motion.div
                                        key={useCase}
                                        initial={false}
                                        className="rounded-2xl border border-[var(--glass-border)] overflow-hidden glass"
                                    >
                                        <button
                                            onClick={() => toggleUseCase(useCase)}
                                            className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--color-primary)]/5 transition-colors"
                                        >
                                            <span className="text-lg font-bold text-[var(--color-text-primary)]">{t(`${competitor.slug}:useCases.${useCase}.title`)}</span>
                                            <ChevronDown size={20} className={`text-[var(--color-text-secondary)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-6 pt-0 border-t border-[var(--color-border)]">
                                                        <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">{t(`${competitor.slug}:useCases.${useCase}.description`)}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(t(`${competitor.slug}:useCases.${useCase}.metrics`, { returnObjects: true }) as string[]).map((metric, i) => (
                                                                <span key={i} className="px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold border border-[var(--color-primary)]/20">
                                                                    {metric}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Battle Section (Table) */}
                    <section className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-[var(--color-text-primary)]">{t(`${competitor.slug}:page.comparisonTitle`)}</h2>
                            <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">{t(`${competitor.slug}:page.comparisonSubtitle`, { competitor: competitor.name })}</p>
                        </motion.div>
                        <div className="glass rounded-3xl border border-[var(--glass-border)] overflow-hidden p-4">
                            <ComparisonTable competitor={competitor} />
                        </div>
                    </section>

                    {/* Cost of Looker Studio Section */}
                    <section className="mb-32 relative">
                        <div className="absolute inset-0 bg-[var(--color-primary)]/5 rounded-[3rem] -m-4 blur-2xl" />
                        <div className="relative glass border border-[var(--glass-border)] rounded-[2.5rem] p-8 md:p-16 overflow-hidden">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-[var(--color-text-primary)]">{t(`${competitor.slug}:page.costTitle`, { competitor: competitor.name })}</h2>
                                <p className="text-xl text-[var(--color-text-secondary)]">{t(`${competitor.slug}:page.costSubtitle`)}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { id: 'time', icon: <Clock className="text-[var(--color-primary)]" size={32} /> },
                                    { id: 'maintenance', icon: <Shield className="text-[var(--color-primary)]" size={32} /> },
                                    { id: 'opportunity', icon: <Zap className="text-[var(--color-primary)]" size={32} /> }
                                ].map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-8 rounded-3xl glass border border-[var(--glass-border)]"
                                    >
                                        <div className="mb-6 p-4 rounded-2xl bg-[var(--color-primary)]/10 w-fit backdrop-blur-md">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">{t(`${competitor.slug}:cost.${item.id}.title`)}</h3>
                                        <p className="text-[var(--color-text-secondary)] leading-relaxed">{t(`${competitor.slug}:cost.${item.id}.description`)}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Visual Proof Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-32 relative"
                    >
                        <div className="absolute inset-0 bg-[var(--color-primary)]/5 rounded-[3rem] -m-4 blur-2xl" />
                        <div className="relative glass border border-[var(--glass-border)] rounded-[2.5rem] p-8 md:p-20 overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight text-[var(--color-text-primary)]">{t('alternatives:page.visualProofTitle')}</h2>
                                    <p className="text-xl text-[var(--color-text-secondary)] mb-10 leading-relaxed">
                                        {t('alternatives:page.visualProofDesc')}
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
                                                className="flex items-center gap-4 text-[var(--color-text-primary)] font-semibold text-lg"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg">
                                                    <CheckCircle2 size={18} />
                                                </div>
                                                {benefit}
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="relative">
                                    <div className="aspect-[4/3] glass border border-[var(--glass-border)] rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center group relative z-10 transition-transform duration-500 hover:scale-[1.02]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent" />
                                        <div className="text-[var(--color-text-secondary)]/50 flex flex-col items-center gap-4 group-hover:text-[var(--color-text-secondary)]/80 transition-colors">
                                            <Zap size={64} className="animate-pulse text-[var(--color-primary)]/40" />
                                            <span className="text-sm font-bold uppercase tracking-widest">[ Interface Flipika ]</span>
                                        </div>
                                    </div>
                                    {/* Glass decor elements */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--color-primary)]/20 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-6 -left-6 glass border border-[var(--glass-border)] p-6 rounded-2xl shadow-xl z-20 hidden md:block">
                                        <div className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Impact Temps</div>
                                        <div className="text-4xl font-black text-[var(--color-primary)]">-85%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>



                    {/* Expert Tips Section */}
                    <section className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-[var(--color-text-primary)]">{t(`${competitor.slug}:page.tipsTitle`)}</h2>
                            <p className="text-xl text-[var(--color-text-secondary)] max-w-4xl mx-auto">{t(`${competitor.slug}:page.tipsSubtitle`, { competitor: competitor.name })}</p>
                        </motion.div>

                        <div className="max-w-4xl mx-auto space-y-6">
                            {['tip1', 'tip2', 'tip3', 'tip4', 'tip5', 'tip6', 'tip7'].map((tip, index) => (
                                <motion.div
                                    key={tip}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex gap-6 p-6 rounded-2xl glass border border-[var(--glass-border)] hover:border-[var(--color-primary)]/30 transition-all"
                                >
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white font-black text-lg shadow-md">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">{t(`${competitor.slug}:tips.${tip}.title`)}</h3>
                                        <p className="text-[var(--color-text-secondary)] leading-relaxed">{t(`${competitor.slug}:tips.${tip}.description`)}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="mb-32 max-w-3xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-[var(--color-text-primary)]">{t(`${competitor.slug}:page.faqTitle`)}</h2>
                        </div>

                        <div className="space-y-4">
                            {['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'].map((qKey) => {
                                const isOpen = openFaq === qKey;
                                return (
                                    <motion.div
                                        key={qKey}
                                        initial={false}
                                        className="rounded-2xl border border-[var(--glass-border)] overflow-hidden glass"
                                    >
                                        <button
                                            onClick={() => toggleFaq(qKey)}
                                            className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--color-primary)]/5 transition-colors"
                                        >
                                            <span className="text-lg font-bold text-[var(--color-text-primary)]">{t(`${competitor.slug}:faq.${qKey}`)}</span>
                                            <ChevronDown size={20} className={`text-[var(--color-text-secondary)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-6 pt-0 text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)]">
                                                        {t(`${competitor.slug}:faq.${qKey.replace('q', 'a')}`)}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>

                    {/* CTA Section */}
                    <MigrationCTA competitor={competitor} />
                </div>
            </article>
        </div>
    );
};

export default ComparisonPage;
