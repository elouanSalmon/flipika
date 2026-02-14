import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, ChevronDown, CheckCircle2,
    Sparkles, Clock, Zap, Shield, Users, Smartphone, Headphones
} from 'lucide-react';
import SEO from '../../components/SEO';
import TemplateGallery from '../../components/templates/TemplateGallery';

const GoogleAdsTemplatePage: React.FC = () => {
    const { t, i18n } = useTranslation('templates-pillar');
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState<string | null>(null);
    const [openUseCase, setOpenUseCase] = useState<string | null>(null);

    const getLangPath = (path: string) => {
        return i18n.language === 'fr' ? `/fr${path}` : path;
    };

    const toggleFaq = (id: string) => {
        setOpenFaq(openFaq === id ? null : id);
    };

    const toggleUseCase = (id: string) => {
        setOpenUseCase(openUseCase === id ? null : id);
    };

    // Structured Data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Flipika Google Ads Report Template",
        "applicationCategory": "BusinessApplication",
        "description": t('page.metaDescription'),
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "500"
        }
    };

    return (
        <div className="flex-1 bg-[var(--color-bg-primary)] relative overflow-hidden">
            <SEO
                title={t('page.title')}
                description={t('page.metaDescription')}
                canonicalPath="/templates/google-ads"
                breadcrumbs={[
                    { name: 'Flipika', path: '/' },
                    { name: t('page.title').split(' | ')[0], path: '/templates/google-ads' },
                ]}
            />

            {/* JSON-LD Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>

            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-[var(--color-primary)]/5 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] left-[-10%] w-[40vw] h-[40vw] bg-[var(--color-primary)]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[var(--color-primary)]/5 rounded-full blur-[150px]" />
            </div>

            <article className="py-20 px-4 md:py-32 relative z-10">
                <div className="max-w-6xl mx-auto">

                    {/* Hero Section */}
                    <section className="text-center mb-28">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm font-bold mb-8 flex items-center gap-2 mx-auto w-fit backdrop-blur-md"
                        >
                            <Sparkles size={14} className="text-[var(--color-primary)]" />
                            {i18n.language === 'fr' ? 'Nouveau Standard 2026' : 'New 2026 Standard'}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-7xl font-bold mb-10 text-[var(--color-text-primary)] leading-[1.1] tracking-tight whitespace-pre-line"
                        >
                            {t('page.h1')}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-3xl mx-auto leading-relaxed mb-8"
                        >
                            {t('page.subtitle')}
                        </motion.p>

                        {/* Social Proof Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="flex items-center justify-center gap-2 mb-12 text-sm text-[var(--color-text-muted)]"
                        >
                            <Users size={16} />
                            <span>{t('page.socialProof')}</span>
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={() => navigate(getLangPath('/login'))}
                            className="px-10 py-5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] hover:opacity-90 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-[var(--shadow-glow-blue)] hover:-translate-y-1 transition-all flex items-center gap-3 mx-auto"
                        >
                            {t('page.cta')}
                            <ArrowRight size={20} />
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
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-[var(--color-text-primary)]">{t('page.howItWorksTitle')}</h2>
                            <p className="text-xl text-[var(--color-text-secondary)]">{t('page.howItWorksSubtitle')}</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {['step1', 'step2', 'step3', 'step4'].map((step, index) => (
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative p-8 rounded-3xl glass border border-[var(--glass-border)]"
                                >
                                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white font-black text-xl shadow-lg">
                                        {index + 1}
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3 mt-4">{t(`howItWorks.${step}.title`)}</h3>
                                    <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm">{t(`howItWorks.${step}.description`)}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Gallery Section */}
                    <section className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-[var(--color-text-primary)]">{t('page.galleryTitle')}</h2>
                        </motion.div>
                        <TemplateGallery />
                    </section>

                    {/* Benefits Section */}
                    <section className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-[var(--color-text-primary)]">{t('page.benefitsTitle')}</h2>
                            <p className="text-xl text-[var(--color-text-secondary)]">{t('page.benefitsSubtitle')}</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { id: 'automation', icon: <Zap className="text-[var(--color-primary)]" size={28} /> },
                                { id: 'realtime', icon: <Clock className="text-[var(--color-primary)]" size={28} /> },
                                { id: 'design', icon: <Sparkles className="text-[var(--color-primary)]" size={28} /> },
                                { id: 'whitelabel', icon: <Shield className="text-[var(--color-primary)]" size={28} /> },
                                { id: 'multidevice', icon: <Smartphone className="text-[var(--color-primary)]" size={28} /> },
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
                                    <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">{t(`benefits.${benefit.id}.title`)}</h3>
                                    <p className="text-[var(--color-text-secondary)] leading-relaxed">{t(`benefits.${benefit.id}.description`)}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Cost of Manual Reporting Section */}
                    <section className="mb-32 relative">
                        <div className="absolute inset-0 bg-[var(--color-primary)]/5 rounded-[3rem] -m-4 blur-2xl" />
                        <div className="relative glass border border-[var(--glass-border)] rounded-[2.5rem] p-8 md:p-16 overflow-hidden">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-[var(--color-text-primary)]">{t('page.costTitle')}</h2>
                                <p className="text-xl text-[var(--color-text-secondary)]">{t('page.costSubtitle')}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { id: 'time', icon: <Clock className="text-[var(--color-primary)]" size={32} /> },
                                    { id: 'errors', icon: <Shield className="text-[var(--color-primary)]" size={32} /> },
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
                                        <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">{t(`cost.${item.id}.title`)}</h3>
                                        <p className="text-[var(--color-text-secondary)] leading-relaxed">{t(`cost.${item.id}.description`)}</p>
                                    </motion.div>
                                ))}
                            </div>
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
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-[var(--color-text-primary)]">{t('page.useCasesTitle')}</h2>
                            <p className="text-xl text-[var(--color-text-secondary)]">{t('page.useCasesSubtitle')}</p>
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
                                            <span className="text-lg font-bold text-[var(--color-text-primary)]">{t(`useCases.${useCase}.title`)}</span>
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
                                                        <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">{t(`useCases.${useCase}.description`)}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(t(`useCases.${useCase}.metrics`, { returnObjects: true }) as string[]).map((metric, i) => (
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

                    {/* Comparison Table */}
                    <section className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-[var(--color-text-primary)]">{t('page.comparisonTitle')}</h2>
                        </motion.div>

                        <div className="glass rounded-3xl border border-[var(--glass-border)] overflow-hidden shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 text-lg">
                                <div className="hidden md:block p-8 bg-[var(--color-bg-secondary)] border-b md:border-b-0 md:border-r border-[var(--color-border)]" />
                                <div className="p-6 md:p-8 bg-[var(--color-primary)]/5 text-center font-bold text-[var(--color-text-muted)] border-b md:border-b-0 md:border-r border-[var(--color-border)]">
                                    {t('comparison.columns.excel')}
                                </div>
                                <div className="relative p-6 md:p-8 bg-[var(--color-primary)]/10 text-center font-bold text-[var(--color-primary)]">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]" />
                                    {t('comparison.columns.flipika')}
                                </div>

                                {/* Rows */}
                                {['realtime', 'maintenance', 'sharing'].map((rowKey) => (
                                    <React.Fragment key={rowKey}>
                                        <div className="p-6 md:p-8 font-semibold text-[var(--color-text-secondary)] flex items-center border-t border-[var(--color-border)]">
                                            {t(`comparison.rows.${rowKey}.feature`)}
                                        </div>
                                        <div className="p-6 md:p-8 flex items-center justify-center text-center text-[var(--color-text-muted)] border-t border-[var(--color-border)] border-r">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                <span className="text-sm md:text-base">{t(`comparison.rows.${rowKey}.excel`)}</span>
                                            </div>
                                        </div>
                                        <div className="p-6 md:p-8 flex items-center justify-center text-center text-[var(--color-primary)] border-t border-[var(--color-border)] bg-[var(--color-primary)]/5">
                                            <div className="flex flex-col items-center gap-2">
                                                <CheckCircle2 size={24} className="fill-[var(--color-primary)]/20" />
                                                <span className="font-bold text-sm md:text-base">{t(`comparison.rows.${rowKey}.flipika`)}</span>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Testimonials Section */}
                    <section className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-[var(--color-text-primary)]">{t('page.testimonialsTitle')}</h2>
                            <p className="text-xl text-[var(--color-text-secondary)]">{t('page.testimonialsSubtitle')}</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {['testimonial1', 'testimonial2', 'testimonial3'].map((testimonial, index) => (
                                <motion.div
                                    key={testimonial}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-8 rounded-3xl glass border border-[var(--glass-border)] relative hover:border-[var(--color-primary)]/30 transition-all"
                                >
                                    <div className="flex gap-1 mb-6">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg key={star} className="w-5 h-5 text-[var(--color-primary)] fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-[var(--color-text-secondary)] italic mb-6 leading-relaxed">"{t(`testimonials.${testimonial}.quote`)}"</p>
                                    <div className="border-t border-[var(--color-border)] pt-6">
                                        <p className="font-bold text-[var(--color-text-primary)]">{t(`testimonials.${testimonial}.author`)}</p>
                                        <p className="text-sm text-[var(--color-text-muted)]">{t(`testimonials.${testimonial}.role`)}</p>
                                        <p className="text-sm text-[var(--color-primary)]">{t(`testimonials.${testimonial}.company`)}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Expert Tips Section */}
                    <section className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-[var(--color-text-primary)]">{t('page.tipsTitle')}</h2>
                            <p className="text-xl text-[var(--color-text-secondary)] max-w-4xl mx-auto">{t('page.tipsSubtitle')}</p>
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
                                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">{t(`tips.${tip}.title`)}</h3>
                                        <p className="text-[var(--color-text-secondary)] leading-relaxed">{t(`tips.${tip}.description`)}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section className="mb-32 max-w-3xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-[var(--color-text-primary)]">{t('page.faqTitle')}</h2>
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
                                            <span className="text-lg font-bold text-[var(--color-text-primary)]">{t(`faq.${qKey}`)}</span>
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
                                                        {t(`faq.${qKey.replace('q', 'a')}`)}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Bottom CTA */}
                    <section className="rounded-[3rem] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-12 md:p-24 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        <div className="absolute top-0 left-0 w-full h-full bg-[var(--color-primary)]/20 blur-[100px] group-hover:bg-[var(--color-primary)]/30 transition-all duration-700" />

                        <div className="relative z-10 max-w-4xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-tight">
                                {t('page.h1')}
                            </h2>
                            <button
                                onClick={() => navigate(getLangPath('/login'))}
                                className="px-12 py-6 bg-white text-[var(--color-primary)] rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)] flex items-center gap-3 mx-auto"
                            >
                                {t('page.cta')}
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    </section>

                </div>
            </article>
        </div>
    );
};

export default GoogleAdsTemplatePage;
