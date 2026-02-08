import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check, CheckCircle, CreditCard } from 'lucide-react';
import PricingInfoModal from '../components/billing/PricingInfoModal';
import RoadmapPreview from '../components/RoadmapPreview';

export default function Pricing() {
    const { t } = useTranslation('billing');
    const [showPricingModal, setShowPricingModal] = useState(false);

    const PRICE_PER_SEAT = 10; // €10 per seat per month
    const LIFETIME_PRICE = 100; // €100 one-time

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header matching BillingPage */}
                <div className="mb-8 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                        <CreditCard className="w-8 h-8 text-[var(--color-primary)]" />
                        <h1 className="text-[2rem] font-bold text-[var(--color-text-primary)]">{t('pricing.simpleTransparent')}</h1>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                    {/* Main Pricing Card */}
                    <div className="flex-1 bg-white/70 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-600 p-6 flex flex-col">
                        <div className="flex-grow">
                            <div className="text-center mb-6">
                                <p className="text-4xl font-bold text-primary dark:text-primary-light mb-2">{PRICE_PER_SEAT}{t('pricing.perMonth')}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{t('pricing.perAccount')}</p>
                            </div>

                            {/* Pricing Examples Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                {[1, 2, 5, 10].map((seats) => (
                                    <div
                                        key={seats}
                                        className="p-3 bg-gradient-to-br from-white to-gray-50 dark:from-gray-600 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-500 text-center hover:border-primary-light dark:hover:border-primary hover:shadow-md transition-all duration-200"
                                    >
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('pricing.accountsCount', { count: seats })}</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{PRICE_PER_SEAT * seats}€</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('pricing.monthly')}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mb-6">
                                <button
                                    onClick={() => setShowPricingModal(true)}
                                    className="btn-link text-sm"
                                >
                                    {t('pricing.seeAllPricing')}
                                </button>
                            </div>

                            {/* Features */}
                            <div className="mb-8">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('pricing.features.title')}</p>
                                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                    <li className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span>{t('pricing.features.generation')}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span>{t('pricing.features.narrative')}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span>{t('pricing.features.customTemplates')}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span>{t('pricing.features.automation')}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span>{t('pricing.features.exports')}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span>{t('pricing.features.email')}</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                        </div>
                                        <span>{t('pricing.features.slideshow')}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="text-center mt-auto pt-6 border-t border-gray-200 dark:border-gray-600">
                            <Link
                                to="/login"
                                className="btn btn-primary w-full py-4 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center"
                            >
                                {t('subscription.startFreeTrial')}
                            </Link>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                {t('pricing.trialInfo')}
                            </p>
                        </div>
                    </div>

                    {/* Lifetime Deal Card - Golden Ticket */}
                    <div className="flex-1 bg-gradient-to-br from-yellow-50 via-[#FFF8E1] to-yellow-100 dark:from-yellow-900/20 dark:via-yellow-800/15 dark:to-yellow-900/25 backdrop-blur-sm rounded-xl border-2 border-yellow-400 dark:border-yellow-500/50 p-6 relative overflow-hidden shadow-lg shadow-yellow-300/40 dark:shadow-yellow-900/30 flex flex-col">
                        {/* Decorative sparkle */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-yellow-300/30 to-transparent rounded-full blur-3xl"></div>
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm z-10">
                            {t('lifetime.badge')}
                        </div>

                        <div className="flex-grow text-center relative z-0 flex flex-col justify-center">
                            <h4 className="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mb-4">
                                {t('lifetime.title')}
                            </h4>

                            <div className="bg-white/40 dark:bg-black/20 p-6 rounded-2xl border border-yellow-200/50 dark:border-yellow-700/30 backdrop-blur-sm mb-6 mx-auto w-full max-w-sm">
                                <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium mb-1 uppercase tracking-wide">{t('lifetime.payOnce')}</p>
                                <p className="text-5xl font-extrabold text-yellow-600 dark:text-yellow-400 mb-1 tracking-tight">
                                    {LIFETIME_PRICE}€
                                </p>
                                <p className="text-sm text-yellow-700/80 dark:text-yellow-400/80">
                                    {t('lifetime.oneTime')}
                                </p>
                            </div>

                            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-md mx-auto">
                                {t('lifetime.description')}
                            </p>

                            <ul className="space-y-3 text-sm text-yellow-900/80 dark:text-yellow-100/80 text-left max-w-sm mx-auto mb-8">
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                    <span>Accès à vie à toutes les fonctionnalités</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                    <span>Mises à jour futures incluses</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                    <span>Support prioritaire à vie</span>
                                </li>
                            </ul>
                        </div>

                        <div className="text-center mt-auto pt-6 border-t border-yellow-200 dark:border-yellow-700/30">
                            <Link
                                to="/login"
                                className="btn w-full py-4 text-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold border-none shadow-[0_4px_12px_rgba(234,179,8,0.4)] hover:shadow-[0_6px_16px_rgba(234,179,8,0.5)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
                            >
                                <span>{t('lifetime.cta')}</span>
                            </Link>
                            <p className="text-xs text-yellow-700/60 dark:text-yellow-400/60 mt-3">
                                {t('lifetime.limitedOffer')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-12 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>{t('pricing.securePayment')}</span>
                </div>

                {/* Timeline / Roadmap Preview */}
                <div className="mt-16">
                    <RoadmapPreview />
                </div>
            </div>

            {/* Pricing Info Modal */}
            <PricingInfoModal
                isOpen={showPricingModal}
                onClose={() => setShowPricingModal(false)}
                pricePerSeat={PRICE_PER_SEAT}
            />
        </div>
    );
}
