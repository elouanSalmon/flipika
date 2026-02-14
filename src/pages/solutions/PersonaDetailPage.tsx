import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle,
    ChevronDown,
    ArrowLeft,
    User,
    Building2,
    Target,
    PieChart,
    Sparkles,
} from 'lucide-react';
import {
    HeroDashboardIllustration,
    TemplateIllustration,
    AIInsightIllustration,
    SchedulingIllustration,
} from '../../components/LandingIllustrations';
import SEO from '../../components/SEO';

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
const iconMap: Record<string, any> = {
    User,
    Building2,
    Target,
    PieChart,
};

const illustrationMap: Record<string, React.FC> = {
    'freelancers': HeroDashboardIllustration,
    'agencies': TemplateIllustration,
    'media-buyers': AIInsightIllustration,
    'marketing-managers': SchedulingIllustration,
};

const PersonaDetailPage: React.FC = () => {
    const { personaId } = useParams<{ personaId: string }>();
    const { t, i18n } = useTranslation('solutions');
    const { t: tSeo } = useTranslation('seo');
    const navigate = useNavigate();
    const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

    const getLangPath = (path: string) => {
        return i18n.language === 'fr' ? `/fr${path}` : path;
    };

    if (!personaId) {
        navigate(getLangPath('/'));
        return null;
    }

    // Get persona data
    const solutions = t('solutions', { returnObjects: true }) as Array<{
        id: string;
        icon: string;
        title: string;
    }>;

    const persona = solutions.find((s) => s.id === personaId);
    if (!persona) {
        navigate(getLangPath('/'));
        return null;
    }

    const personaTitle = persona.title;
    const Icon = iconMap[persona.icon] || Sparkles;
    const PersonaIllustration = illustrationMap[personaId];

    const details = t(`solutionDetails.${personaId}`, { returnObjects: true }) as {
        hero: { title: string; subtitle: string; cta: string };
        whyItMatters: {
            title: string;
            description: string;
            points: Array<{ title: string; description: string }>;
        };
        howItWorks: {
            title: string;
            steps: Array<{ number: string; title: string; description: string }>;
        };
        useCases: Array<{ title: string; description: string }>;
        beforeAfter: {
            title: string;
            before: { title: string; points: string[] };
            after: { title: string; points: string[] };
        };
        faq: Array<{ question: string; answer: string }>;
    };

    return (
        <div className="relative overflow-hidden">
            <SEO
                title={tSeo('solutions.title', { persona: personaTitle })}
                description={tSeo('solutions.description', { persona: personaTitle })}
                keywords={tSeo('solutions.keywords', { persona: personaTitle })}
                canonicalPath={`/solutions/${personaId}`}
                breadcrumbs={[
                    { name: 'Flipika', path: '/' },
                    { name: personaTitle, path: `/solutions/${personaId}` },
                ]}
            />

            {/* Background Effects */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                <motion.div
                    style={{
                        position: 'absolute',
                        top: '0',
                        left: '-10%',
                        width: '40vw',
                        height: '40vw',
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        opacity: 0.06,
                        filter: 'blur(100px)',
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, 20, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
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

            {/* Back Button */}
            <div className="relative pt-20 pb-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.button
                        onClick={() => navigate(getLangPath('/'))}
                        className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors"
                        whileHover={{ x: -4 }}
                    >
                        <ArrowLeft size={16} />
                        <span>{i18n.language === 'fr' ? 'Retour' : 'Back'}</span>
                    </motion.button>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-4xl mx-auto text-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6"
                        variants={itemVariants}
                    >
                        <Icon size={40} className="text-primary" />
                    </motion.div>

                    <motion.h1
                        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-neutral-200 mb-4 tracking-tight"
                        variants={itemVariants}
                    >
                        {details.hero.title}
                    </motion.h1>

                    <motion.p
                        className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8"
                        variants={itemVariants}
                    >
                        {details.hero.subtitle}
                    </motion.p>

                    <motion.button
                        onClick={() => navigate(getLangPath('/login'))}
                        className="btn btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span>{details.hero.cta}</span>
                        <ArrowRight size={18} />
                    </motion.button>

                    {PersonaIllustration && (
                        <motion.div
                            className="mt-16 w-full max-w-5xl mx-auto"
                            variants={itemVariants}
                        >
                            <PersonaIllustration />
                        </motion.div>
                    )}
                </motion.div>
            </section>

            {/* Why It Matters Section */}
            <section className="relative py-16 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-5xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-200 mb-4 text-center">
                        {details.whyItMatters.title}
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 text-center mb-12 max-w-3xl mx-auto">
                        {details.whyItMatters.description}
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {details.whyItMatters.points.map((point, idx) => (
                            <motion.div
                                key={idx}
                                className="glass rounded-2xl p-6"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                                    <CheckCircle className="text-primary" size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-200 mb-2">
                                    {point.title}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {point.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* How It Works Section */}
            <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50/50 dark:bg-black/20">
                <motion.div
                    className="max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-200 mb-12 text-center">
                        {details.howItWorks.title}
                    </h2>

                    <div className="space-y-8">
                        {details.howItWorks.steps.map((step, idx) => (
                            <motion.div
                                key={idx}
                                className="flex gap-6"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                    {step.number}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-200 mb-1">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Use Cases Section */}
            <section className="relative py-16 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-200 mb-8 text-center">
                        {i18n.language === 'fr' ? "Cas d'usage" : 'Use Cases'}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {details.useCases.map((useCase, idx) => (
                            <motion.div
                                key={idx}
                                className="glass rounded-xl p-6"
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-200 mb-2">
                                    {useCase.title}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {useCase.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Before/After Section */}
            <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50/50 dark:bg-black/20">
                <motion.div
                    className="max-w-5xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-200 mb-12 text-center">
                        {details.beforeAfter.title}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Before */}
                        <motion.div
                            className="glass rounded-2xl p-8"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="text-center mb-6">
                                <div className="inline-block px-4 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold mb-3">
                                    {details.beforeAfter.before.title}
                                </div>
                            </div>
                            <ul className="space-y-3">
                                {details.beforeAfter.before.points.map((point, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-600 dark:text-neutral-400">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mt-0.5">
                                            <span className="text-red-600 dark:text-red-400 text-xs">✕</span>
                                        </span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* After */}
                        <motion.div
                            className="glass rounded-2xl p-8 border-2 border-primary/20"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="text-center mb-6">
                                <div className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/20 text-primary-dark dark:text-primary-light rounded-full text-sm font-semibold mb-3">
                                    {details.beforeAfter.after.title}
                                </div>
                            </div>
                            <ul className="space-y-3">
                                {details.beforeAfter.after.points.map((point, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-sm text-neutral-700 dark:text-neutral-300">
                                        <CheckCircle className="flex-shrink-0 w-5 h-5 text-primary mt-0.5" size={20} />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* FAQ Section */}
            <section className="relative py-16 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-200 mb-8 text-center">
                        {i18n.language === 'fr' ? 'Questions fréquentes' : 'Frequently Asked Questions'}
                    </h2>

                    <div className="space-y-4">
                        {details.faq.map((item, idx) => (
                            <motion.div
                                key={idx}
                                className="glass rounded-xl overflow-hidden"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <button
                                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                                >
                                    <span className="font-semibold text-neutral-900 dark:text-neutral-200 pr-4">
                                        {item.question}
                                    </span>
                                    <ChevronDown
                                        size={20}
                                        className={`flex-shrink-0 text-neutral-500 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>
                                {openFaqIndex === idx && (
                                    <motion.div
                                        className="px-6 pb-4 text-sm text-neutral-600 dark:text-neutral-400"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        {item.answer}
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Final CTA */}
            <section className="relative py-16 px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="glass rounded-2xl p-8 sm:p-12 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-200 mb-4">
                            {t('cta.title')}
                        </h2>
                        <p className="text-base text-neutral-600 dark:text-neutral-400 mb-8">
                            {t('cta.subtitle')}
                        </p>
                        <motion.button
                            onClick={() => navigate(getLangPath('/login'))}
                            className="btn btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span>{t('cta.button')}</span>
                            <ArrowRight size={18} />
                        </motion.button>
                        <p className="mt-4 text-xs text-neutral-500 italic">
                            {t('cta.trustLine')}
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* FAQPage Structured Data */}
            {details.faq && details.faq.length > 0 && (
                <Helmet>
                    <script type="application/ld+json">
                        {JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'FAQPage',
                            'mainEntity': details.faq.map((item) => ({
                                '@type': 'Question',
                                'name': item.question,
                                'acceptedAnswer': {
                                    '@type': 'Answer',
                                    'text': item.answer,
                                },
                            })),
                        })}
                    </script>
                </Helmet>
            )}

            {/* Bottom spacer */}
            <div className="h-12" />
        </div>
    );
};

export default PersonaDetailPage;
