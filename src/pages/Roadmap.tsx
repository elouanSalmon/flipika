import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight, Loader2, Shield, Rocket,
    TrendingUp, Lock, Users,
    CheckCircle, Zap,
    MousePointerClick, Layout, Palette, Share2, CalendarClock, FileDown,
    Link, FileBarChart, GitMerge, Activity, LayoutTemplate, ArrowLeftRight,
    Globe, LayoutDashboard, Bot, Bell, Workflow
} from 'lucide-react';
import {
    SiGoogleads, SiMeta,
    SiTiktok, SiLinkedin, SiPinterest,
    SiAmazon, SiSnapchat, SiX, SiReddit
} from 'react-icons/si';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, type: 'spring' as const, stiffness: 100 },
    },
};

const Roadmap: React.FC = () => {
    const { t, i18n } = useTranslation('roadmap');
    const { t: tSeo } = useTranslation('seo');
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

    const nowFeatures = t('timeline.now.features', { returnObjects: true }) as string[];
    const soonFeatures = t('timeline.soon.features', { returnObjects: true }) as string[];
    const futureFeatures = t('timeline.future.features', { returnObjects: true }) as string[];
    const visionPoints = t('vision.points', { returnObjects: true }) as { title: string; description: string }[];

    const phases = [
        {
            icon: SiGoogleads,
            color: 'green',
            badge: t('timeline.now.badge'),
            title: t('timeline.now.title'),
            subtitle: t('timeline.now.subtitle'),
            description: t('timeline.now.description'),
            features: nowFeatures,
            featureIcons: [MousePointerClick, Layout, Palette, Share2, CalendarClock, FileDown],
            dotBg: 'bg-green-500',
            dotShadow: 'shadow-green-500/30',
            badgeBg: 'bg-green-500/10',
            badgeText: 'text-green-600 dark:text-green-400',
            subtitleText: 'text-green-600 dark:text-green-400',
            bulletColor: 'text-green-500',
            accentBorder: 'border-green-500/20',
            glowColor: 'from-green-500/20',
            status: 'live' as const,
        },
        {
            icon: SiMeta,
            color: 'blue',
            badge: t('timeline.soon.badge'),
            title: t('timeline.soon.title'),
            subtitle: t('timeline.soon.subtitle'),
            description: t('timeline.soon.description'),
            features: soonFeatures,
            featureIcons: [Link, FileBarChart, GitMerge, Activity, LayoutTemplate, ArrowLeftRight],
            dotBg: 'bg-primary-500',
            dotShadow: 'shadow-primary/30',
            badgeBg: 'bg-primary-500/10',
            badgeText: 'text-primary dark:text-primary-light',
            subtitleText: 'text-primary dark:text-primary-light',
            bulletColor: 'text-primary',
            accentBorder: 'border-primary/20',
            glowColor: 'from-primary/20',
            status: 'next' as const,
        },
        {
            icon: Rocket,
            color: 'purple',
            badge: t('timeline.future.badge'),
            title: t('timeline.future.title'),
            subtitle: t('timeline.future.subtitle'),
            description: t('timeline.future.description'),
            features: futureFeatures,
            featureIcons: [Globe, LayoutDashboard, Bot, Bell, Workflow, Users],
            footerLogos: [SiTiktok, SiLinkedin, SiPinterest, SiAmazon, SiSnapchat, SiX, SiReddit],
            dotBg: 'bg-purple-500',
            dotShadow: 'shadow-purple-500/30',
            badgeBg: 'bg-purple-500/10',
            badgeText: 'text-purple-600 dark:text-purple-400',
            subtitleText: 'text-purple-600 dark:text-purple-400',
            bulletColor: 'text-purple-500',
            accentBorder: 'border-purple-500/20',
            glowColor: 'from-purple-500/20',
            status: 'vision' as const,
        },
    ];

    const visionIcons = [Users, Lock, TrendingUp];

    return (
        <div className="relative overflow-hidden">
            <SEO
                title={tSeo('roadmap.title')}
                description={tSeo('roadmap.description')}
                keywords={tSeo('roadmap.keywords')}
                canonicalPath="/roadmap"
            />

            {/* ============================================================
                Background Effects (matching Pricing page)
            ============================================================ */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div
                    style={{
                        position: 'absolute',
                        top: '-10%',
                        left: '-10%',
                        width: '40vw',
                        height: '40vw',
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        opacity: 0.08,
                        filter: 'blur(100px)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '10%',
                        right: '-5%',
                        width: '35vw',
                        height: '35vw',
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        opacity: 0.06,
                        filter: 'blur(100px)',
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            'linear-gradient(var(--color-grid) 1px, transparent 1px), linear-gradient(90deg, var(--color-grid) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                    }}
                />
            </div>

            {/* ============================================================
                Section 1 — Hero
            ============================================================ */}
            <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-4xl mx-auto text-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-2 glass text-primary rounded-full text-sm font-medium mb-6"
                        variants={itemVariants}
                    >
                        <span>{t('hero.badge')}</span>
                    </motion.div>

                    <motion.h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-neutral-200 mb-6 tracking-tight"
                        variants={itemVariants}
                    >
                        {t('hero.title')}
                    </motion.h1>

                    <motion.p
                        className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-12"
                        variants={itemVariants}
                    >
                        {t('hero.description')}
                    </motion.p>

                    {/* ── Horizontal Progress Stepper ── */}
                    <motion.div
                        className="max-w-2xl mx-auto"
                        variants={itemVariants}
                    >
                        <div className="relative flex items-center justify-between">
                            {/* Connecting line */}
                            <div className="absolute top-5 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-green-500 via-primary to-purple-500 opacity-30" />
                            {/* Progress fill */}
                            <div className="absolute top-5 left-[15%] h-0.5 bg-green-500 opacity-80" style={{ width: '20%' }} />

                            {phases.map((phase, i) => {
                                const Icon = phase.icon;
                                return (
                                    <div key={i} className="relative flex flex-col items-center z-10">
                                        <div className={`w-10 h-10 ${phase.dotBg} rounded-full flex items-center justify-center shadow-lg ${phase.dotShadow} ring-4 ring-white dark:ring-neutral-900`}>
                                            <Icon size={18} className="text-white" />
                                        </div>
                                        <span className={`mt-2 text-xs font-bold ${phase.badgeText}`}>
                                            {phase.badge}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* ============================================================
                Section 2 — Timeline Phase Cards
            ============================================================ */}
            <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    {phases.map((phase, i) => {
                        const Icon = phase.icon;
                        const isEven = i % 2 === 1;

                        return (
                            <motion.div
                                key={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-80px' }}
                                variants={containerVariants}
                            >
                                <motion.div
                                    className={`glass rounded-2xl overflow-hidden ${phase.status === 'live' ? 'border-green-500/30' : ''}`}
                                    variants={itemVariants}
                                    whileHover={{ y: -4 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    {/* Accent top bar */}
                                    <div className={`h-1 bg-gradient-to-r ${phase.glowColor} to-transparent`} />

                                    <div className={`p-6 sm:p-8 md:p-10 ${isEven ? 'md:flex md:flex-row-reverse md:gap-10' : 'md:flex md:gap-10'}`}>
                                        {/* Left: Info */}
                                        <div className="flex-1 mb-6 md:mb-0">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={`w-11 h-11 ${phase.dotBg} rounded-xl flex items-center justify-center shadow-lg ${phase.dotShadow}`}>
                                                    <Icon size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <span className={`inline-block px-3 py-1 ${phase.badgeBg} ${phase.badgeText} text-xs font-bold rounded-full`}>
                                                        {phase.badge}
                                                    </span>
                                                </div>
                                                {phase.status === 'live' && (
                                                    <div className="flex items-center gap-1.5 ml-auto">
                                                        <span className="relative flex h-2.5 w-2.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                                                        </span>
                                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Live</span>
                                                    </div>
                                                )}
                                            </div>

                                            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-200 mb-2 tracking-tight">
                                                {phase.title}
                                            </h2>
                                            <p className={`text-base font-medium ${phase.subtitleText} mb-3`}>
                                                {phase.subtitle}
                                            </p>
                                            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                {phase.description}
                                            </p>
                                        </div>

                                        {/* Right: Feature list */}
                                        <div className="flex-1 flex flex-col gap-6">
                                            <div className="bg-neutral-50/50 dark:bg-black/30 rounded-xl p-5 sm:p-6 border border-neutral-100/50 dark:border-white/10">
                                                <ul className="space-y-3">
                                                    {Array.isArray(phase.features) && phase.features.map((feature, fi) => {
                                                        const FeatureIcon = phase.featureIcons[fi] || CheckCircle;
                                                        return (
                                                            <motion.li
                                                                key={fi}
                                                                className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300"
                                                                initial={{ opacity: 0, x: -10 }}
                                                                whileInView={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: fi * 0.05 }}
                                                                viewport={{ once: true }}
                                                            >
                                                                <FeatureIcon className={`w-4.5 h-4.5 ${phase.bulletColor} flex-shrink-0 mt-0.5`} size={18} />
                                                                <span>{feature}</span>
                                                            </motion.li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>

                                            {phase.footerLogos && (
                                                <div className="flex flex-col gap-3 px-2">
                                                    <span className="text-xs font-semibold uppercase tracking-wider opacity-100 text-neutral-500 dark:text-neutral-400">Coming Next:</span>
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        {phase.footerLogos.map((Logo, li) => (
                                                            <Logo key={li} size={24} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors" />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* ============================================================
                Section 3 — Why Join Now (Vision)
            ============================================================ */}
            <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-5xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                >
                    <motion.div className="text-center mb-16" variants={itemVariants}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 glass text-primary rounded-full text-sm font-medium mb-6">
                            <span>{t('vision.badge')}</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-200 mb-4 tracking-tight">
                            {t('vision.title')}
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            {t('vision.description')}
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        variants={containerVariants}
                    >
                        {Array.isArray(visionPoints) && visionPoints.map((point, i) => {
                            const Icon = visionIcons[i] || Zap;
                            return (
                                <motion.div
                                    key={i}
                                    className="glass rounded-2xl p-6 sm:p-8 text-center group"
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="w-14 h-14 mx-auto mb-5 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center group-hover:bg-[var(--color-primary)]/15 transition-colors">
                                        <Icon size={26} className="text-[var(--color-primary)]" />
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-200 mb-3">
                                        {point.title}
                                    </h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                        {point.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </motion.div>
            </section>

            {/* ============================================================
                Section 4 — Lifetime Deal CTA (Premium golden card)
            ============================================================ */}
            <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="relative glass rounded-2xl border-2 border-yellow-400 dark:border-yellow-500/50 overflow-hidden">
                        {/* Top accent gradient */}
                        <div className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600" />

                        {/* Badge */}
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[10px] font-bold px-5 py-1.5 rounded-bl-xl z-10">
                            {t('cta.badge')}
                        </div>

                        {/* Glow orbs */}
                        <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-yellow-300/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-gradient-to-tr from-yellow-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />

                        <div className="relative p-8 sm:p-12 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium mb-6">
                                <span>{t('cta.includes')}</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-bold text-yellow-900 dark:text-yellow-200 mb-4 tracking-tight">
                                {t('cta.title')}
                            </h2>
                            <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 mb-8 max-w-xl mx-auto">
                                {t('cta.description')}
                            </p>

                            {/* Price */}
                            <div className="mb-8">
                                <span className="text-5xl sm:text-6xl font-extrabold text-yellow-600 dark:text-yellow-400">
                                    {t('cta.price')}{'€'}
                                </span>
                                <p className="text-sm text-yellow-700/80 dark:text-yellow-400/80 mt-1.5">
                                    {t('cta.priceLabel')}
                                </p>
                            </div>

                            {/* CTA Button */}
                            <div className="mb-8">
                                <motion.button
                                    onClick={handleLifetimePurchase}
                                    disabled={isCheckoutLoading}
                                    className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white text-lg font-bold rounded-xl border-none shadow-[0_4px_16px_rgba(234,179,8,0.4)] hover:shadow-[0_8px_24px_rgba(234,179,8,0.5)] transition-all duration-200 flex items-center justify-center gap-3 mx-auto"
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
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
                                </motion.button>
                            </div>

                            {/* Trust signals */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                                <div className="flex items-center gap-1.5">
                                    <Shield size={14} className="text-green-600 dark:text-green-500" />
                                    <span>{t('cta.guarantee')}</span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-neutral-400/40" />
                                <div className="flex items-center gap-1.5">
                                    <Lock size={14} className="text-green-600 dark:text-green-500" />
                                    <span>{t('cta.noSubscription')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Bottom spacer */}
            <div className="h-12" />
        </div>
    );
};

export default Roadmap;
