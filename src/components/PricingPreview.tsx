import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, ArrowRight } from 'lucide-react';

const PricingPreview: React.FC = () => {
    const { t } = useTranslation('common');

    // Constants
    const PRICE_PER_SEAT = 10;
    const LIFETIME_PRICE = 100;

    return (
        <section className="py-24 relative overflow-hidden bg-[var(--color-bg-primary)]">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
                        {t('pricingPreview.title', 'Une tarification simple et transparente')}
                    </h2>
                    <p className="text-lg text-[var(--color-text-secondary)]">
                        {t('pricingPreview.subtitle', 'Commencez gratuitement, payez quand vous validez la valeur.')}
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
                    {/* Monthly Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="relative flex flex-col p-8 bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-2xl border border-neutral-200/60 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-200 mb-4">
                            {t('pricingPreview.monthly.title', 'Mensuel')}
                        </h3>

                        <div className="mb-6">
                            <span className="text-4xl font-extrabold text-primary dark:text-primary-light">
                                {PRICE_PER_SEAT}€
                            </span>
                            <span className="text-neutral-500 dark:text-neutral-400 ml-1">
                                {t('pricingPreview.monthly.period', '/mois')}
                            </span>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                {t('pricingPreview.monthly.perAccount', 'par compte client')}
                            </p>
                        </div>

                        <ul className="space-y-3 mb-8 flex-grow">
                            {[
                                t('pricingPreview.monthly.features.0', 'Rapports illimités'),
                                t('pricingPreview.monthly.features.1', 'Toutes les fonctionnalités'),
                                t('pricingPreview.monthly.features.2', 'Support prioritaire'),
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                                    <CheckCircle className="w-5 h-5 text-primary dark:text-primary-light flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link to="/login" className="mt-auto">
                            <button className="btn btn-outline w-full py-3">
                                {t('pricingPreview.monthly.cta', 'Essayer gratuitement')}
                            </button>
                        </Link>
                    </motion.div>

                    {/* Lifetime Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative flex flex-col p-8 bg-gradient-to-br from-yellow-50 via-[#FFF8E1] to-yellow-100 dark:from-yellow-900/10 dark:via-yellow-800/5 dark:to-yellow-900/10 backdrop-blur-xl rounded-2xl border border-yellow-400/60 dark:border-yellow-500/30 shadow-lg shadow-yellow-300/10"
                    >
                        {/* Badge */}
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl shadow-sm">
                            {t('pricingPreview.lifetime.badge', 'OFFRE LIMITÉE')}
                        </div>

                        <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-4">
                            {t('pricingPreview.lifetime.title', 'Accès à vie')}
                        </h3>

                        <div className="mb-6">
                            <span className="text-4xl font-extrabold text-yellow-600 dark:text-yellow-400">
                                {LIFETIME_PRICE}€
                            </span>
                            <p className="text-sm text-yellow-700/80 dark:text-yellow-400/80 mt-1">
                                {t('pricingPreview.lifetime.period', 'paiement unique')}
                            </p>
                        </div>

                        <ul className="space-y-3 mb-8 flex-grow">
                            {[
                                t('pricingPreview.lifetime.features.0', 'Comptes illimités'),
                                t('pricingPreview.lifetime.features.1', 'Mises à jour à vie'),
                                t('pricingPreview.lifetime.features.2', 'Pas d\'abonnement'),
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-yellow-900/80 dark:text-yellow-100/80">
                                    <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link to="/login" className="mt-auto">
                            <button className="btn w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-none shadow-md shadow-yellow-500/20">
                                {t('pricingPreview.lifetime.cta', 'Obtenir l\'accès à vie')}
                            </button>
                        </Link>
                    </motion.div>
                </div>

                {/* See All Pricing Link */}
                <div className="text-center">
                    <Link
                        to="/pricing"
                        className="inline-flex items-center gap-2 text-primary font-semibold hover:underline transition-all"
                    >
                        {t('pricingPreview.seeMore', 'Voir tous les détails')}
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default PricingPreview;
