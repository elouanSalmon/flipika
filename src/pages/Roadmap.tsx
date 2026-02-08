import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight, Loader2, Shield, Rocket,
    BarChart3, Target, TrendingUp, Sparkles, Lock, Users
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const Roadmap: React.FC = () => {
    const { t, i18n } = useTranslation('roadmap');
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { createLifetimeCheckout } = useSubscription();
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

    const getLangPath = (path: string) => {
        return i18n.language === 'fr' ? `/fr${path}` : path;
    };

    const handleLifetimePurchase = async () => {
        if (!currentUser) {
            navigate(getLangPath('/login'));
            return;
        }
        const lifetimePriceId = import.meta.env.VITE_STRIPE_LIFETIME_PRICE_ID;
        try {
            setIsCheckoutLoading(true);
            const url = await createLifetimeCheckout(lifetimePriceId);
            window.location.href = url;
        } catch (error) {
            console.error('Error creating lifetime checkout:', error);
            setIsCheckoutLoading(false);
        }
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
    };

    const nowFeatures = t('timeline.now.features', { returnObjects: true }) as string[];
    const soonFeatures = t('timeline.soon.features', { returnObjects: true }) as string[];
    const futureFeatures = t('timeline.future.features', { returnObjects: true }) as string[];
    const visionPoints = t('vision.points', { returnObjects: true }) as { title: string; description: string }[];

    return (
        <div className="flex-1 bg-[var(--color-bg-primary)] relative overflow-hidden">
            <SEO
                title={t('page.title')}
                description={t('page.metaDescription')}
            />

            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-[var(--color-primary)]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] bg-yellow-500/5 rounded-full blur-[120px]" />
            </div>

            {/* Hero Section */}
            <section className="relative py-20 md:py-28">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold rounded-full mb-6 tracking-wider">
                            {t('hero.badge')}
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text-primary)] mb-6 leading-tight">
                            {t('hero.title')}
                        </h1>
                        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">
                            {t('hero.description')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="relative py-16 md:py-24">
                <div className="max-w-5xl mx-auto px-6 relative">

                    {/* Vertical timeline line — visible on both mobile and desktop */}
                    <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-green-500/40 via-blue-500/40 to-purple-500/40" />

                    {/* Phase 1 - Now */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                        className="relative mb-20 md:mb-28 pl-16 md:pl-0"
                    >
                        {/* Timeline dot */}
                        <div className="absolute left-6 md:left-1/2 top-0 -translate-x-1/2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 z-10">
                            <BarChart3 size={22} className="text-white" />
                        </div>

                        <div className="md:grid md:grid-cols-2 md:gap-16">
                            <div className="md:text-right md:pr-12">
                                <span className="inline-block px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-full mb-4">
                                    {t('timeline.now.badge')}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
                                    {t('timeline.now.title')}
                                </h2>
                                <p className="text-lg font-medium text-[var(--color-primary)] mb-4">
                                    {t('timeline.now.subtitle')}
                                </p>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                    {t('timeline.now.description')}
                                </p>
                            </div>
                            <div className="mt-6 md:mt-0 md:pl-12">
                                <div className="glass border border-[var(--glass-border)] rounded-2xl p-6">
                                    <ul className="space-y-2.5">
                                        {Array.isArray(nowFeatures) && nowFeatures.map((feature, i) => (
                                            <li key={i} className="text-sm text-[var(--color-text-primary)] pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[9px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-green-500">
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Phase 2 - Soon (Meta Ads) */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                        className="relative mb-20 md:mb-28 pl-16 md:pl-0"
                    >
                        {/* Timeline dot */}
                        <div className="absolute left-6 md:left-1/2 top-0 -translate-x-1/2 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 z-10">
                            <Target size={22} className="text-white" />
                        </div>

                        <div className="md:grid md:grid-cols-2 md:gap-16">
                            <div className="md:order-2 md:pl-12">
                                <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full mb-4">
                                    {t('timeline.soon.badge')}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
                                    {t('timeline.soon.title')}
                                </h2>
                                <p className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-4">
                                    {t('timeline.soon.subtitle')}
                                </p>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                    {t('timeline.soon.description')}
                                </p>
                            </div>
                            <div className="mt-6 md:mt-0 md:order-1 md:pr-12">
                                <div className="glass border border-[var(--glass-border)] rounded-2xl p-6">
                                    <ul className="space-y-2.5">
                                        {Array.isArray(soonFeatures) && soonFeatures.map((feature, i) => (
                                            <li key={i} className="text-sm text-[var(--color-text-primary)] pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[9px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-blue-500">
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Phase 3 - Future (Super App) */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                        className="relative pl-16 md:pl-0"
                    >
                        {/* Timeline dot */}
                        <div className="absolute left-6 md:left-1/2 top-0 -translate-x-1/2 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 z-10">
                            <Rocket size={22} className="text-white" />
                        </div>

                        <div className="md:grid md:grid-cols-2 md:gap-16">
                            <div className="md:text-right md:pr-12">
                                <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full mb-4">
                                    {t('timeline.future.badge')}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
                                    {t('timeline.future.title')}
                                </h2>
                                <p className="text-lg font-medium text-purple-600 dark:text-purple-400 mb-4">
                                    {t('timeline.future.subtitle')}
                                </p>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                                    {t('timeline.future.description')}
                                </p>
                            </div>
                            <div className="mt-6 md:mt-0 md:pl-12">
                                <div className="glass border border-[var(--glass-border)] rounded-2xl p-6">
                                    <ul className="space-y-2.5">
                                        {Array.isArray(futureFeatures) && futureFeatures.map((feature, i) => (
                                            <li key={i} className="text-sm text-[var(--color-text-primary)] pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[9px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-purple-500">
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Why Now Section */}
            <section className="relative py-16 md:py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
                            {t('vision.title')}
                        </h2>
                        <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                            {t('vision.description')}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array.isArray(visionPoints) && visionPoints.map((point, i) => {
                            const icons = [Users, Lock, TrendingUp];
                            const Icon = icons[i] || Sparkles;
                            return (
                                <motion.div
                                    key={i}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-50px" }}
                                    variants={fadeUp}
                                    transition={{ duration: 0.5, delay: i * 0.15 }}
                                    className="glass border border-[var(--glass-border)] rounded-2xl p-6 text-center"
                                >
                                    <div className="w-12 h-12 mx-auto mb-4 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
                                        <Icon size={24} className="text-[var(--color-primary)]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                                        {point.title}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                        {point.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Lifetime Deal CTA Section */}
            <section className="relative py-16 md:py-24">
                <div className="max-w-3xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={fadeUp}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-br from-yellow-50 via-[#FFF8E1] to-yellow-100 dark:from-yellow-900/20 dark:via-yellow-800/15 dark:to-yellow-900/25 rounded-3xl border-2 border-yellow-400 dark:border-yellow-500/50 p-8 md:p-12 relative overflow-hidden shadow-xl shadow-yellow-300/20 dark:shadow-yellow-900/30"
                    >
                        {/* Decorative elements */}
                        <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-yellow-300/40 to-transparent rounded-full blur-3xl" />
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-yellow-400/20 to-transparent rounded-full blur-2xl" />
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl z-10">
                            {t('cta.badge')}
                        </div>

                        <div className="relative text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-yellow-900 dark:text-yellow-200 mb-4">
                                {t('cta.title')}
                            </h2>
                            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-xl mx-auto">
                                {t('cta.description')}
                            </p>

                            {/* Price */}
                            <div className="mb-6">
                                <p className="text-5xl md:text-6xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {t('cta.price')}<span className="text-2xl">{'\u20AC'}</span>
                                </p>
                                <p className="text-sm text-yellow-700/80 dark:text-yellow-400/80 mt-1">
                                    {t('cta.priceLabel')}
                                </p>
                            </div>

                            {/* Includes */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-full mb-8">
                                <span className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                                    {t('cta.includes')}
                                </span>
                            </div>

                            {/* CTA Button */}
                            <div className="mb-6">
                                <button
                                    onClick={handleLifetimePurchase}
                                    disabled={isCheckoutLoading}
                                    className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-lg font-bold rounded-xl border-none shadow-[0_4px_16px_rgba(234,179,8,0.4)] hover:shadow-[0_8px_24px_rgba(234,179,8,0.5)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 mx-auto"
                                >
                                    {isCheckoutLoading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>{t('cta.redirecting')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{t('cta.button')}</span>
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Trust signals */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-yellow-700/80 dark:text-yellow-400/70">
                                <div className="flex items-center gap-1.5">
                                    <Shield size={14} className="text-green-600 dark:text-green-500" />
                                    <span>{t('cta.guarantee')}</span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-yellow-600/40" />
                                <div className="flex items-center gap-1.5">
                                    <Lock size={14} className="text-green-600 dark:text-green-500" />
                                    <span>{t('cta.noSubscription')}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Bottom spacer */}
            <div className="h-12" />
        </div>
    );
};

export default Roadmap;
