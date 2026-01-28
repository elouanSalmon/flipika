import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, ChevronDown, CheckCircle2, AlertTriangle, TrendingUp, Sparkles, Clock } from 'lucide-react';
import SEO from '../../components/SEO';
import TemplateGallery from '../../components/templates/TemplateGallery';

const GoogleAdsTemplatePage: React.FC = () => {
    const { t, i18n } = useTranslation('templates-pillar');
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState<string | null>(null);

    const getLangPath = (path: string) => {
        return i18n.language === 'fr' ? `/fr${path}` : path;
    };

    const toggleFaq = (id: string) => {
        setOpenFaq(openFaq === id ? null : id);
    };

    return (
        <div className="flex-1 bg-[var(--color-bg-primary)] relative overflow-hidden">
            <SEO
                title={t('page.title')}
                description={t('page.metaDescription')}
            />

            {/* Background decorative elements (Identical to ComparisonPage) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-600/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-blue-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="py-20 px-4 md:py-32 relative z-10">
                <div className="max-w-6xl mx-auto">

                    {/* Hero Section */}
                    <div className="text-center mb-28">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-bold mb-8 flex items-center gap-2 mx-auto w-fit backdrop-blur-md"
                        >
                            <Sparkles size={14} className="text-amber-400 fill-amber-400" />
                            {i18n.language === 'fr' ? 'Nouveau Standard 2026' : 'New 2026 Standard'}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-7xl font-bold mb-10 text-primary leading-[1.1] tracking-tight whitespace-pre-line"
                        >
                            {t('page.h1')}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl md:text-2xl text-secondary max-w-3xl mx-auto leading-relaxed mb-12"
                        >
                            {t('page.subtitle')}
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={() => navigate(getLangPath('/login'))}
                            className="px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all flex items-center gap-3 mx-auto"
                        >
                            {t('page.cta')}
                            <ArrowRight size={20} />
                        </motion.button>
                    </div>

                    {/* Gallery Section */}
                    <div className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-primary">{t('page.galleryTitle')}</h2>
                        </motion.div>
                        <TemplateGallery />
                    </div>

                    {/* Cost of Manual Reporting Section (New Content) */}
                    <div className="mb-32 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-orange-600/5 to-transparent rounded-[3rem] -m-4 blur-2xl" />
                        <div className="relative glass-card border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 md:p-16 overflow-hidden">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-primary">{t('page.costTitle')}</h2>
                                <p className="text-xl text-secondary">{t('page.costSubtitle')}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { id: 'time', icon: <Clock className="text-amber-500" size={32} /> },
                                    { id: 'errors', icon: <AlertTriangle className="text-red-500" size={32} /> },
                                    { id: 'opportunity', icon: <TrendingUp className="text-blue-500" size={32} /> }
                                ].map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20"
                                    >
                                        <div className="mb-6 p-4 rounded-2xl bg-white/50 dark:bg-black/20 w-fit backdrop-blur-md">
                                            {item.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold text-primary mb-4">{t(`cost.${item.id}.title`)}</h3>
                                        <p className="text-secondary leading-relaxed">{t(`cost.${item.id}.description`)}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Comparison Table (Glassmorphism) */}
                    <div className="mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-primary">{t('page.comparisonTitle')}</h2>
                        </motion.div>

                        <div className="glass-card rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 text-lg">
                                <div className="hidden md:block p-8 bg-gray-50/50 dark:bg-white/5 border-b md:border-b-0 md:border-r border-white/10" />
                                <div className="p-6 md:p-8 bg-red-50/50 dark:bg-red-900/10 text-center font-bold text-red-600 dark:text-red-400 border-b md:border-b-0 md:border-r border-red-200/20">
                                    {t('comparison.columns.excel')}
                                </div>
                                <div className="relative p-6 md:p-8 bg-blue-50/50 dark:bg-blue-900/10 text-center font-bold text-blue-600 dark:text-blue-400">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                                    {t('comparison.columns.flipika')}
                                </div>

                                {/* Rows */}
                                {['realtime', 'maintenance', 'sharing', 'design'].map((rowKey) => (
                                    <React.Fragment key={rowKey}>
                                        <div className="p-6 md:p-8 font-semibold text-secondary flex items-center border-t border-white/10 bg-white/30 dark:bg-white/5 md:bg-transparent">
                                            {t(`comparison.rows.${rowKey}.feature`)}
                                        </div>
                                        <div className="p-6 md:p-8 flex items-center justify-center text-center text-red-500/80 border-t border-white/10 border-r md:border-r border-red-200/10 md:bg-red-50/30 md:dark:bg-red-900/5">
                                            <div className="flex flex-col items-center gap-2">
                                                <X size={24} />
                                                <span className="text-sm md:text-base text-secondary">{t(`comparison.rows.${rowKey}.excel`)}</span>
                                            </div>
                                        </div>
                                        <div className="p-6 md:p-8 flex items-center justify-center text-center text-blue-600 dark:text-blue-400 border-t border-white/10 md:bg-blue-50/30 md:dark:bg-blue-900/5">
                                            <div className="flex flex-col items-center gap-2">
                                                <CheckCircle2 size={24} className="fill-blue-100 dark:fill-blue-900 stroke-[2.5]" />
                                                <span className="font-bold text-sm md:text-base">{t(`comparison.rows.${rowKey}.flipika`)}</span>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section (Accordion) */}
                    <div className="mb-32 max-w-3xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-primary">{t('page.faqTitle')}</h2>
                        </div>

                        <div className="space-y-4">
                            {['q1', 'q2', 'q3', 'q4'].map((qKey) => {
                                const isOpen = openFaq === qKey;
                                return (
                                    <motion.div
                                        key={qKey}
                                        initial={false}
                                        className="rounded-2xl border border-white/20 dark:border-white/10 overflow-hidden bg-white/40 dark:bg-white/5 backdrop-blur-sm"
                                    >
                                        <button
                                            onClick={() => toggleFaq(qKey)}
                                            className="w-full flex items-center justify-between p-6 text-left"
                                        >
                                            <span className="text-lg font-bold text-primary">{t(`faq.${qKey}`)}</span>
                                            <ChevronDown size={20} className={`text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-6 pt-0 text-secondary leading-relaxed border-t border-white/10">
                                                        {t(`faq.${qKey.replace('q', 'a')}`)}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="rounded-[3rem] bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-12 md:p-24 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        <div className="absolute top-0 left-0 w-full h-full bg-blue-600/20 blur-[100px] group-hover:bg-blue-500/30 transition-all duration-700" />

                        <div className="relative z-10 max-w-4xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-loose">
                                {t('page.h1')}
                            </h2>
                            <button
                                onClick={() => navigate(getLangPath('/login'))}
                                className="px-12 py-6 bg-white text-blue-900 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)] flex items-center gap-3 mx-auto"
                            >
                                {t('page.cta')}
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GoogleAdsTemplatePage;
