import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { competitors } from '../../data/competitors';
import { ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import SEO from '../../components/SEO';

const ComparisonIndex: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { t: tSeo } = useTranslation('seo');
    const navigate = useNavigate();

    const getLangPath = (path: string) => {
        const isFrench = i18n.language === 'fr';
        return isFrench ? `/fr${path}` : path;
    };

    return (
        <div className="flex-1 bg-[var(--color-bg-primary)] py-20 px-4 relative overflow-hidden">
            <SEO
                title={tSeo('alternativesIndex.title')}
                description={tSeo('alternativesIndex.description')}
                keywords={tSeo('alternativesIndex.keywords')}
                canonicalPath="/alternatives"
            />
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-primary-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30vw] h-[30vw] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary/20 text-primary dark:text-primary-light text-sm font-semibold mb-6"
                    >
                        {t('alternatives:index.whyFlipika')}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold mb-6 text-primary tracking-tight text-balance"
                    >
                        {t('alternatives:index.title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed"
                    >
                        {t('alternatives:index.subtitle')}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-24">
                    {competitors.map((competitor, index) => (
                        <motion.div
                            key={competitor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            onClick={() => navigate(getLangPath(`/alternatives/${competitor.slug}`))}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-indigo-600/5 rounded-3xl blur-xl group-hover:opacity-100 transition-opacity opacity-0" />
                            <div className="relative glass-card border border-white/20 dark:border-white/10 rounded-3xl p-8 hover:translate-y-[-4px] transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Zap size={80} className="text-primary" />
                                </div>

                                <div className="flex items-center justify-between mb-8">
                                    <div className="px-4 py-1 rounded-lg bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-sm">
                                        <h3 className="text-2xl font-bold text-primary">{competitor.name}</h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>

                                <p className="text-lg text-secondary mb-8 flex-1 leading-relaxed">
                                    {t(`alternatives:competitors.${competitor.slug}.indexDescription`)}
                                </p>

                                <div className="flex items-center gap-2 text-sm font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                                    <span>{t('alternatives:common.viewComparison')}</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="relative rounded-[2rem] p-1 shadow-2xl overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-600 to-primary animate-gradient-x" />
                    <div className="relative bg-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-[1.9rem] p-10 md:p-14 border border-white/20 flex flex-col md:flex-row items-center gap-12 text-white">
                        <div className="flex-1">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('alternatives:index.whyFlipika')}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {[
                                    { icon: <Zap size={24} />, title: t('alternatives:index.highlight1'), desc: t('alternatives:index.highlight1Desc') },
                                    { icon: <CheckCircle2 size={24} />, title: t('alternatives:index.highlight2'), desc: t('alternatives:index.highlight2Desc') }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl mb-2">{item.title}</h4>
                                            <p className="text-white/70 leading-relaxed text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
                <div className="mt-32 max-w-4xl mx-auto space-y-24">
                    {/* SEO Section 1: The Problem */}
                    <section className="text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-bold mb-8 text-primary tracking-tight text-balance">
                            {t('alternatives:index.seoContent.problem.title')}
                        </h2>
                        <div className="space-y-6 text-xl text-secondary leading-relaxed">
                            <p>{t('alternatives:index.seoContent.problem.p1')}</p>
                            <p>{t('alternatives:index.seoContent.problem.p2')}</p>
                        </div>
                    </section>

                    {/* SEO Section 2: The Solution */}
                    <section>
                        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-primary tracking-tight text-balance">
                            {t('alternatives:index.seoContent.solution.title')}
                        </h2>
                        <p className="text-xl text-center text-secondary mb-12 max-w-2xl mx-auto">
                            {t('alternatives:index.seoContent.solution.intro')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white/50 dark:bg-white/5 p-8 rounded-3xl border border-white/20 dark:border-white/10 backdrop-blur-sm">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                        <span className="text-2xl font-bold text-primary">{i}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 text-primary">
                                        {t(`alternatives:index.seoContent.solution.point${i}Title`)}
                                    </h3>
                                    <p className="text-secondary leading-relaxed">
                                        {t(`alternatives:index.seoContent.solution.point${i}Desc`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SEO Section 3: FAQ */}
                    <section>
                        <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center text-primary tracking-tight text-balance">
                            {t('alternatives:index.seoContent.faq.title')}
                        </h2>
                        <div className="grid grid-cols-1 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="group p-8 rounded-3xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-lg shadow-black/5">
                                    <h3 className="text-xl font-bold mb-4 text-primary flex items-start gap-3">
                                        <span className="text-primary/40">Q.</span>
                                        {t(`alternatives:index.seoContent.faq.q${i}`)}
                                    </h3>
                                    <p className="text-lg text-secondary pl-8 border-l-2 border-primary/20">
                                        {t(`alternatives:index.seoContent.faq.a${i}`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ComparisonIndex;
