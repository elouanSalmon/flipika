import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight, TrendingUp, DollarSign, Euro, PoundSterling } from 'lucide-react';
import SEO from '../../components/SEO';

const RoasCalculator: React.FC = () => {
    const { t, i18n } = useTranslation(['tools']);
    const [adSpend, setAdSpend] = useState<string>('');
    const [revenue, setRevenue] = useState<string>('');
    const [currency, setCurrency] = useState<string>('EUR');

    // Outputs
    const [roas, setRoas] = useState<number | null>(null);
    const [roi, setRoi] = useState<number | null>(null);
    const [profit, setProfit] = useState<number | null>(null);

    // Currencies mapping for UI
    const currencies = [
        { value: 'EUR', icon: Euro },
        { value: 'USD', icon: DollarSign },
        { value: 'GBP', icon: PoundSterling }
    ];

    useEffect(() => {
        const spend = parseFloat(adSpend);
        const rev = parseFloat(revenue);

        if (!isNaN(spend) && !isNaN(rev) && spend > 0) {
            const currentRoas = (rev / spend) * 100;
            const currentProfit = rev - spend;
            const currentRoi = (currentProfit / spend) * 100;

            setRoas(currentRoas);
            setProfit(currentProfit);
            setRoi(currentRoi);
        } else {
            setRoas(null);
            setProfit(null);
            setRoi(null);
        }
    }, [adSpend, revenue]);

    const getStatusColor = (roasValue: number | null) => {
        if (!roasValue) return 'text-[var(--color-text-secondary)]';
        if (roasValue >= 400) return 'text-green-500';
        if (roasValue >= 250) return 'text-blue-500';
        if (roasValue >= 100) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getStatusMessage = (roasValue: number | null) => {
        if (!roasValue) return '';
        if (roasValue >= 400) return t('roas.calculator.status.excellent');
        if (roasValue >= 250) return t('roas.calculator.status.good');
        if (roasValue >= 100) return t('roas.calculator.status.average');
        return t('roas.calculator.status.bad');
    };

    const CurrencyIcon = currencies.find(c => c.value === currency)?.icon || DollarSign;

    // Schema.org implementation specifically for SoftwareApplication / WebApplication (AEO)
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": t('roas.seo.title'),
        "description": t('roas.seo.description'),
        "url": `https://flipika.com/tools/roas-calculator`,
        "applicationCategory": "BusinessApplication",
        "browserRequirements": "Requires JavaScript",
        "author": {
            "@type": "Organization",
            "name": "Flipika",
            "url": "https://flipika.com"
        }
    };

    return (
        <div className="flex-1 bg-[var(--color-bg-primary)] relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-[var(--color-primary)]/5 rounded-full blur-[120px]" />
                <div className="absolute top-[30%] left-[-10%] w-[40vw] h-[40vw] bg-[var(--color-primary)]/5 rounded-full blur-[100px]" />
            </div>

            <SEO
                title={t('roas.seo.title')}
                description={t('roas.seo.description')}
                canonicalPath={`/tools/roas-calculator`}
                breadcrumbs={[
                    { name: 'Flipika', path: '/' },
                    { name: 'Tools', path: '/tools' },
                    { name: 'ROAS Calculator', path: '/tools/roas-calculator' },
                ]}
            />

            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>

            <article className="py-20 px-4 md:py-32 relative z-10">
                <div className="max-w-4xl mx-auto">
                    {/* Hero */}
                    <section className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-sm font-bold mb-6 backdrop-blur-md"
                        >
                            {t('roas.hero.badge')}
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold mb-6 text-[var(--color-text-primary)] tracking-tight"
                        >
                            {t('roas.hero.title')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto"
                        >
                            {t('roas.hero.subtitle')}
                        </motion.p>
                    </section>

                    {/* Interactive Calculator Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                        {/* Inputs */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass rounded-3xl p-8 border border-[var(--glass-border)] shadow-xl relative"
                        >
                            <h2 className="text-2xl font-bold mb-8 text-[var(--color-text-primary)] flex items-center gap-3">
                                <Calculator className="text-[var(--color-primary)]" />
                                {t('roas.calculator.title')}
                            </h2>

                            <div className="space-y-6">
                                {/* Currency Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">
                                        {t('roas.calculator.currency')}
                                    </label>
                                    <div className="flex gap-2">
                                        {currencies.map(c => (
                                            <button
                                                key={c.value}
                                                onClick={() => setCurrency(c.value)}
                                                className={`flex-1 py-3 rounded-xl border flex items-center justify-center font-bold transition-all ${currency === c.value
                                                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                                                    : 'bg-transparent border-[var(--glass-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/50'
                                                    }`}
                                            >
                                                <c.icon size={18} className="mr-2" />
                                                {c.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Ad Spend Input */}
                                <div>
                                    <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">
                                        {t('roas.calculator.adSpend')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <CurrencyIcon size={20} className="text-[var(--color-text-muted)]" />
                                        </div>
                                        <input
                                            type="number"
                                            value={adSpend}
                                            onChange={(e) => setAdSpend(e.target.value)}
                                            placeholder={t('roas.calculator.adSpendPlaceholder')}
                                            className="w-full pl-12 pr-4 py-4 rounded-xl glass border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-black/5 dark:bg-white/5 text-xl font-medium outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Revenue Input */}
                                <div>
                                    <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2">
                                        {t('roas.calculator.revenue')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <CurrencyIcon size={20} className="text-[var(--color-text-muted)]" />
                                        </div>
                                        <input
                                            type="number"
                                            value={revenue}
                                            onChange={(e) => setRevenue(e.target.value)}
                                            placeholder={t('roas.calculator.revenuePlaceholder')}
                                            className="w-full pl-12 pr-4 py-4 rounded-xl glass border border-[var(--glass-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-black/5 dark:bg-white/5 text-xl font-medium outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Outputs */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent rounded-3xl p-8 border border-[var(--glass-border)] shadow-xl flex flex-col justify-center"
                        >
                            <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-8">
                                {t('roas.calculator.results.title')}
                            </h3>

                            <div className="space-y-8">
                                {/* Main ROAS Result */}
                                <div>
                                    <div className="text-sm text-[var(--color-text-secondary)] mb-1">{t('roas.calculator.results.roas')}</div>
                                    <div className={`text-6xl font-black tracking-tighter ${getStatusColor(roas)}`}>
                                        {roas !== null ? `${roas.toFixed(0)}%` : '0%'}
                                    </div>
                                    <div className="text-sm mt-2 font-medium flex items-center gap-2">
                                        {roas !== null && (
                                            <>
                                                <TrendingUp size={16} className={getStatusColor(roas)} />
                                                <span className={getStatusColor(roas)}>{getStatusMessage(roas)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent" />

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Profit */}
                                    <div>
                                        <div className="text-sm text-[var(--color-text-secondary)] mb-1">{t('roas.calculator.results.profit')}</div>
                                        <div className={`text-2xl font-bold ${profit !== null && profit < 0 ? 'text-red-500' : 'text-[var(--color-text-primary)]'}`}>
                                            {profit !== null ? `${profit > 0 ? '+' : ''}${profit.toLocaleString()} ${currency}` : '-'}
                                        </div>
                                    </div>

                                    {/* ROI */}
                                    <div>
                                        <div className="text-sm text-[var(--color-text-secondary)] mb-1">{t('roas.calculator.results.roi')}</div>
                                        <div className={`text-2xl font-bold ${roi !== null && roi < 0 ? 'text-red-500' : 'text-[var(--color-text-primary)]'}`}>
                                            {roi !== null ? `${roi.toFixed(2)}%` : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* AEO Friendly Text Block (Schema logic should apply here naturally for bots parsing H2/P) */}
                    <section className="glass rounded-3xl p-8 md:p-12 border border-[var(--glass-border)] mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
                            {t('roas.explanation.title')}
                        </h2>
                        <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6 text-lg">
                            {t('roas.explanation.p1')}
                        </p>

                        <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-2xl p-6">
                            <h3 className="font-bold text-[var(--color-text-primary)] mb-2">{t('roas.explanation.formulaTitle')}</h3>
                            <code className="text-[var(--color-primary)] text-lg block font-mono">
                                {t('roas.explanation.formula')}
                            </code>
                        </div>
                    </section>

                    {/* CTA */}
                    <motion.section
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        viewport={{ once: true }}
                        className="text-center p-8 md:p-16 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] text-white shadow-2xl"
                    >
                        {/* Decorative circles CTA */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl mix-blend-overlay"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                {t('roas.cta.title')}
                            </h2>
                            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                                {t('roas.cta.subtitle')}
                            </p>
                            <button
                                onClick={() => window.location.href = i18n.language === 'fr' ? '/fr/login' : '/login'}
                                className="group px-8 py-4 bg-white text-[var(--color-primary)] rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto w-full sm:w-auto"
                            >
                                {t('roas.cta.button')}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.section>

                </div>
            </article>
        </div>
    );
};

export default RoasCalculator;
