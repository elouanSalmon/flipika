import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    X as XIcon,
    ChevronDown,
    ArrowRight,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import PricingInfoModal from '../components/billing/PricingInfoModal';
import RoadmapPreview from '../components/RoadmapPreview';
import TrustBar from '../components/TrustBar';
import SEO from '../components/SEO';

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

const PRICE_PER_SEAT = 10;
const LIFETIME_PRICE = 100;

export default function Pricing() {
    const { t } = useTranslation(['billing', 'seo']);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [sliderAccounts, setSliderAccounts] = useState(3);

    const features = [
        t('billing:pricing.features.generation'),
        t('billing:pricing.features.narrative'),
        t('billing:pricing.features.customTemplates'),
        t('billing:pricing.features.automation'),
        t('billing:pricing.features.exports'),
        t('billing:pricing.features.email'),
        t('billing:pricing.features.slideshow'),
    ];

    const comparisonRows = [
        { key: 'row1', monthly: true, lifetime: true },
        { key: 'row2', monthly: true, lifetime: true },
        { key: 'row3', monthly: true, lifetime: true },
        { key: 'row4', monthly: true, lifetime: true },
        { key: 'row5', monthly: true, lifetime: true },
        { key: 'row6', monthly: true, lifetime: true },
        { key: 'row7', monthly: true, lifetime: true },
        { key: 'row8', monthly: false, lifetime: true },
        { key: 'row9', monthly: false, lifetime: true },
        { key: 'row10', monthly: false, lifetime: true },
    ];

    const faqItems = Array.from({ length: 8 }, (_, i) => ({
        question: t(`billing:pricing.faq.q${i + 1}`),
        answer: t(`billing:pricing.faq.a${i + 1}`),
    }));

    return (
        <>
            <SEO
                title={t('seo:pricing.title')}
                description={t('seo:pricing.description')}
                keywords={t('seo:pricing.keywords')}
                canonicalPath="/pricing"
            />

            <div className="relative overflow-hidden">
                {/* ============================================================
                    Background Effects (shared across sections)
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
                            <span>{t('billing:pricing.hero.badge')}</span>
                        </motion.div>

                        <motion.h1
                            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-neutral-200 mb-6 tracking-tight"
                            variants={itemVariants}
                        >
                            {t('billing:pricing.hero.title')}
                        </motion.h1>

                        <motion.p
                            className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto"
                            variants={itemVariants}
                        >
                            {t('billing:pricing.hero.subtitle')}
                        </motion.p>
                    </motion.div>
                </section>


                {/* ============================================================
                    Section 2 — Pricing Cards
                ============================================================ */}
                <section className="relative pb-24 px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                    >
                        {/* Monthly Card */}
                        <motion.div
                            className="relative flex flex-col p-8 glass rounded-2xl overflow-hidden"
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                        >
                            {/* Unique Subscription Badge */}
                            <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary text-white text-xs font-bold px-6 py-1.5 rounded-b-xl shadow-sm z-10 whitespace-nowrap">
                                {t('billing:pricing.monthlyCard.uniqueLabel')}
                            </div>

                            {/* ── Row 1: Title ── */}
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-200 mt-4 mb-6">
                                {t('billing:pricing.monthlyCard.title')}
                            </h3>

                            {/* ── Row 2: Price ── */}
                            <div className="mb-6">
                                <span className="text-5xl font-extrabold text-primary dark:text-primary-light">
                                    {PRICE_PER_SEAT}€
                                </span>
                                <span className="text-lg text-neutral-500 dark:text-neutral-400 ml-1">
                                    {t('billing:pricing.monthlyCard.priceSuffix')}
                                </span>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                    {t('billing:pricing.monthlyCard.perAccountLabel')}
                                </p>
                            </div>

                            {/* ── Row 3: Slider estimate ── */}
                            <div className="mb-6">
                                <div className="flex items-baseline justify-between mb-4">
                                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        {t('billing:pricing.accountsCount', { count: sliderAccounts })}
                                    </span>
                                    <span className="text-2xl font-extrabold text-primary dark:text-primary-light">
                                        {PRICE_PER_SEAT * sliderAccounts}€<span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">/{t('billing:pricing.monthlyCard.priceSuffix').replace('/', '')}</span>
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={20}
                                    value={sliderAccounts}
                                    onChange={(e) => setSliderAccounts(Number(e.target.value))}
                                    className="pricing-slider w-full"
                                    style={{ '--val': sliderAccounts } as React.CSSProperties}
                                />
                                <div className="flex justify-between text-xs text-neutral-400 dark:text-neutral-500 mt-1.5">
                                    <span>1</span>
                                    <span>20</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowPricingModal(true)}
                                className="btn-link text-sm mb-6 block"
                            >
                                {t('billing:pricing.seeAllPricing')} →
                            </button>

                            {/* ── Row 4: Features (flex-grow to push CTA down) ── */}
                            <div className="flex-grow">
                                <ul className="space-y-3 mb-8">
                                    {features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                                            <CheckCircle className="w-5 h-5 text-primary dark:text-primary-light flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* ── Row 5: CTA (always at bottom) ── */}
                            <div className="pt-6 border-t border-neutral-200/50 dark:border-white/10 mt-auto">
                                <Link to="/login">
                                    <motion.div
                                        className="btn btn-outline w-full py-3.5 text-base font-semibold flex items-center justify-center gap-2"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span>{t('billing:pricing.monthlyCard.cta')}</span>
                                        <ArrowRight size={18} />
                                    </motion.div>
                                </Link>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 text-center">
                                    {t('billing:pricing.monthlyCard.trialNote')}
                                </p>
                            </div>
                        </motion.div>

                        {/* Lifetime Card */}
                        <motion.div
                            className="relative flex flex-col p-8 glass rounded-2xl border-2 border-yellow-400 dark:border-yellow-500/50 overflow-hidden"
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                        >
                            {/* Best value badge */}
                            <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-6 py-1.5 rounded-b-xl shadow-sm z-10">
                                {t('billing:pricing.lifetimeCard.bestValue')}
                            </div>

                            {/* Glow orb */}
                            <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-yellow-300/20 to-transparent rounded-full blur-3xl pointer-events-none" />

                            {/* ── Row 1: Title (same mt-4 as monthly) ── */}
                            <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mt-4 mb-6">
                                {t('billing:lifetime.title')}
                            </h3>

                            {/* ── Row 2: Price ── */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-extrabold text-yellow-600 dark:text-yellow-400">
                                        {LIFETIME_PRICE}€
                                    </span>
                                </div>
                                <p className="text-sm text-yellow-700/80 dark:text-yellow-400/80 mt-1">
                                    {t('billing:lifetime.oneTime')}
                                </p>
                            </div>

                            {/* ── Row 3: Middle content (unique to this card) ── */}
                            <p className="text-base text-neutral-700 dark:text-neutral-300 mb-8">
                                {t('billing:lifetime.description')}
                            </p>

                            {/* ── Row 4: Features (flex-grow to push CTA down) ── */}
                            <div className="flex-grow">
                                <ul className="space-y-3 mb-8">
                                    {[
                                        t('billing:pricing.lifetimeCard.feature1'),
                                        t('billing:pricing.lifetimeCard.feature2'),
                                        t('billing:pricing.lifetimeCard.feature3'),
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-yellow-900/80 dark:text-yellow-100/80">
                                            <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* ── Row 5: CTA (always at bottom) ── */}
                            <div className="pt-6 border-t border-yellow-200/50 dark:border-yellow-700/30 mt-auto">
                                <Link to="/login">
                                    <motion.div
                                        className="btn w-full py-3.5 text-base font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-none shadow-[0_4px_12px_rgba(234,179,8,0.4)] hover:shadow-[0_6px_16px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span>{t('billing:lifetime.cta')}</span>
                                        <ArrowRight size={18} />
                                    </motion.div>
                                </Link>
                                <p className="text-xs text-yellow-700/60 dark:text-yellow-400/60 mt-3 text-center">
                                    {t('billing:pricing.lifetimeCard.earlyAdopter')}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </section>

                <TrustBar />

                {/* ============================================================
                    Section 3 — Feature Comparison Table
                ============================================================ */}
                <section className="relative py-24 px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-4xl mx-auto"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                    >
                        <motion.div className="text-center mb-16" variants={itemVariants}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 glass text-primary rounded-full text-sm font-medium mb-6">
                                <span>{t('billing:pricing.comparison.badge')}</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-200 mb-4 tracking-tight">
                                {t('billing:pricing.comparison.title')}
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                                {t('billing:pricing.comparison.subtitle')}
                            </p>
                        </motion.div>

                        <motion.div
                            className="glass rounded-2xl overflow-hidden"
                            variants={itemVariants}
                        >
                            {/* Table header */}
                            <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-neutral-50/50 dark:bg-black/50 border-b border-neutral-200/50 dark:border-white/10">
                                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">
                                    {t('billing:pricing.comparison.feature')}
                                </div>
                                <div className="text-sm font-semibold text-primary text-center">
                                    {t('billing:pricing.comparison.monthlyCol')}
                                </div>
                                <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 text-center">
                                    {t('billing:pricing.comparison.lifetimeCol')}
                                </div>
                            </div>

                            {/* Table rows */}
                            {comparisonRows.map((row, i) => (
                                <motion.div
                                    key={row.key}
                                    className={`grid grid-cols-3 gap-4 px-6 py-3.5 ${i % 2 === 0
                                        ? 'bg-white/30 dark:bg-black/20'
                                        : 'bg-neutral-50/30 dark:bg-black/20'
                                        } ${i < comparisonRows.length - 1 ? 'border-b border-neutral-100/50 dark:border-white/10' : ''}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="text-sm text-neutral-700 dark:text-neutral-300">
                                        {t(`billing:pricing.comparison.${row.key}`)}
                                    </div>
                                    <div className="flex justify-center">
                                        {row.monthly ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <XIcon className="w-5 h-5 text-neutral-300 dark:text-neutral-600" />
                                        )}
                                    </div>
                                    <div className="flex justify-center">
                                        <CheckCircle className="w-5 h-5 text-yellow-500" />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </section>



                {/* ============================================================
                    Section 5 — FAQ Accordion
                ============================================================ */}
                <section className="relative py-24 px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-3xl mx-auto"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                    >
                        <motion.div className="text-center mb-16" variants={itemVariants}>
                            <div className="inline-flex items-center gap-2 px-4 py-2 glass text-primary rounded-full text-sm font-medium mb-6">
                                <span>{t('billing:pricing.faq.badge')}</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-200 mb-4 tracking-tight">
                                {t('billing:pricing.faq.title')}
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                                {t('billing:pricing.faq.subtitle')}
                            </p>
                        </motion.div>

                        <div className="space-y-3">
                            {faqItems.map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="glass rounded-xl overflow-hidden"
                                    variants={itemVariants}
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between gap-4 p-5 text-left"
                                        aria-expanded={openFaq === i}
                                        aria-controls={`faq-answer-${i}`}
                                        id={`faq-question-${i}`}
                                    >
                                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                                            {item.question}
                                        </span>
                                        <motion.div
                                            animate={{ rotate: openFaq === i ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex-shrink-0"
                                            aria-hidden="true"
                                        >
                                            <ChevronDown className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                                        </motion.div>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {openFaq === i && (
                                            <motion.div
                                                id={`faq-answer-${i}`}
                                                role="region"
                                                aria-labelledby={`faq-question-${i}`}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                    {item.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* ============================================================
                    Section 7 — Roadmap Preview (existing, unchanged)
                ============================================================ */}
                <section className="relative pb-24 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <RoadmapPreview />
                    </div>
                </section>

                {/* ============================================================
                    Section 6 — Final CTA
                ============================================================ */}
                <section className="relative py-24 px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <div className="glass rounded-2xl overflow-hidden">
                            {/* Accent gradient line */}
                            <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-yellow-500" />

                            <div className="p-8 sm:p-12 text-center">
                                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-200 mb-4">
                                    {t('billing:pricing.finalCta.title')}
                                </h2>
                                <p className="text-base text-neutral-600 dark:text-neutral-400 mb-8 max-w-lg mx-auto">
                                    {t('billing:pricing.finalCta.subtitle')}
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                                    <Link to="/login" className="w-full sm:w-auto">
                                        <motion.div
                                            className="btn btn-lg btn-primary w-full sm:min-w-[260px] flex items-center justify-center gap-2 leading-none"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span>{t('billing:pricing.finalCta.primaryCta')}</span>
                                            <ArrowRight size={18} />
                                        </motion.div>
                                    </Link>
                                    <Link to="/login" className="w-full sm:w-auto">
                                        <motion.div
                                            className="btn btn-lg w-full sm:min-w-[260px] flex items-center justify-center gap-2 leading-none bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-none shadow-[0_4px_12px_rgba(234,179,8,0.3)]"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span>{t('billing:pricing.finalCta.secondaryCta')}</span>
                                            <ArrowRight size={18} />
                                        </motion.div>
                                    </Link>
                                </div>

                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {t('billing:pricing.finalCta.trustLine')}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </section>


            </div>

            {/* Pricing Info Modal */}
            <PricingInfoModal
                isOpen={showPricingModal}
                onClose={() => setShowPricingModal(false)}
                pricePerSeat={PRICE_PER_SEAT}
            />

            {/* FAQPage Structured Data */}
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        'mainEntity': faqItems.map((item) => ({
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
        </>
    );
}
