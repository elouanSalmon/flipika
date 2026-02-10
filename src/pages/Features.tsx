import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sparkles,
    CheckCircle,
    FileBarChart,
    FileText,
    Calendar,
    Download,
    Mail,
    Presentation,
    ArrowRight,
} from 'lucide-react';
import SEO from '../components/SEO';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
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

// Icon mapping
const iconMap: Record<string, typeof FileBarChart> = {
    FileBarChart,
    Sparkles,
    FileText,
    Calendar,
    Download,
    Mail,
    Presentation,
};

const Features: React.FC = () => {
    const { t, i18n } = useTranslation('features');
    const { t: tSeo } = useTranslation('seo');
    const navigate = useNavigate();

    const getLangPath = (path: string) => {
        return i18n.language === 'fr' ? `/fr${path}` : path;
    };

    const features = t('features', { returnObjects: true }) as Array<{
        id: string;
        icon: string;
        title: string;
        subtitle: string;
        description: string;
        benefits: string[];
    }>;

    return (
        <div className="relative overflow-hidden">
            <SEO
                title={tSeo('features.title')}
                description={tSeo('features.description')}
                keywords={tSeo('features.keywords')}
                canonicalPath="/features"
            />

            {/* ============================================================
                Background Effects (matching Pricing/Roadmap)
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
                        <Sparkles size={16} />
                        <span>{t('hero.badge')}</span>
                    </motion.div>

                    <motion.h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight"
                        variants={itemVariants}
                    >
                        {t('hero.title')}
                    </motion.h1>

                    <motion.p
                        className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                        variants={itemVariants}
                    >
                        {t('hero.subtitle')}
                    </motion.p>
                </motion.div>
            </section>

            {/* ============================================================
                Section 2 — Features Grid
            ============================================================ */}
            <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-6xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                >
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => {
                            const Icon = iconMap[feature.icon] || Sparkles;
                            return (
                                <motion.div
                                    key={feature.id}
                                    className="glass rounded-2xl p-6 sm:p-8 flex flex-col"
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    {/* Icon */}
                                    <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center mb-5">
                                        <Icon size={28} className="text-[var(--color-primary)]" />
                                    </div>

                                    {/* Title & Subtitle */}
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm font-medium text-primary mb-3">
                                        {feature.subtitle}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                                        {feature.description}
                                    </p>

                                    {/* Benefits */}
                                    <ul className="space-y-2.5 mt-auto">
                                        {feature.benefits.map((benefit, bi) => (
                                            <li
                                                key={bi}
                                                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                                            >
                                                <CheckCircle
                                                    className="w-4.5 h-4.5 text-green-500 flex-shrink-0 mt-0.5"
                                                    size={18}
                                                />
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </section>

            {/* ============================================================
                Section 3 — CTA
            ============================================================ */}
            <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="glass rounded-2xl overflow-hidden">
                        {/* Accent gradient line */}
                        <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-blue-500" />

                        <div className="p-8 sm:p-12 text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                {t('cta.title')}
                            </h2>
                            <p className="text-base text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                                {t('cta.subtitle')}
                            </p>

                            <div className="mb-6">
                                <motion.button
                                    onClick={() => navigate(getLangPath('/login'))}
                                    className="btn btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span>{t('cta.button')}</span>
                                    <ArrowRight size={18} />
                                </motion.button>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('cta.trustLine')}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Bottom spacer */}
            <div className="h-12" />
        </div>
    );
};

export default Features;
