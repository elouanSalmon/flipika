import { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { CreditCard, Calendar, Users, ExternalLink, Loader2, Check, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PricingInfoModal from '../billing/PricingInfoModal';
import CanceledSubscriptionNotice from '../billing/CanceledSubscriptionNotice';
import { useTranslation } from 'react-i18next';

export default function SubscriptionCard() {
    const { t } = useTranslation('settings');
    const { subscription, loading, isActive, isLifetime, openCustomerPortal, createLifetimeCheckout } = useSubscription();
    const navigate = useNavigate();
    const [isOpeningPortal, setIsOpeningPortal] = useState(false);
    const [isCreatingLifetimeCheckout, setIsCreatingLifetimeCheckout] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const PRICE_PER_SEAT = 10;
    const LIFETIME_PRICE = 100;

    const handleManageSubscription = async () => {
        try {
            setIsOpeningPortal(true);
            const returnUrl = `${window.location.origin}/app/settings?from=stripe-portal`;
            const url = await openCustomerPortal(returnUrl);
            window.location.href = url;
        } catch (error) {
            console.error('Error opening portal:', error);
            setIsOpeningPortal(false);
        }
    };

    const handleViewBilling = () => {
        navigate('/app/billing');
    };

    const handleLifetimePurchase = async () => {
        const lifetimePriceId = import.meta.env.VITE_STRIPE_LIFETIME_PRICE_ID || 'price_lifetime';
        try {
            setIsCreatingLifetimeCheckout(true);
            const url = await createLifetimeCheckout(lifetimePriceId);
            window.location.href = url;
        } catch (error) {
            console.error('Error creating lifetime checkout:', error);
            setIsCreatingLifetimeCheckout(false);
        }
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
            >
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            </motion.div>
        );
    }

    const totalMonthly = subscription ? subscription.currentSeats * PRICE_PER_SEAT : PRICE_PER_SEAT;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-2">
                            <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/10 dark:from-primary/20 dark:to-primary/20 rounded-lg border border-primary/20">
                                <CreditCard size={20} className="text-primary dark:text-primary-light" />
                            </div>
                            {t('subscription.title')}
                        </h2>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {t('subscription.description')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${subscription?.cancelAtPeriodEnd
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            : subscription?.status === 'trialing'
                                ? 'bg-primary-100 text-primary-dark dark:bg-primary-900/30 dark:text-primary-light'
                                : isActive
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-neutral-100 text-neutral-800 dark:bg-black dark:text-neutral-400'
                            }`}>
                            {subscription?.cancelAtPeriodEnd ? (
                                <>
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>
                                        {subscription.status === 'trialing' ? t('subscription.status.trialCanceled') : t('subscription.status.canceled')} - {t('subscription.status.activeUntil')} {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
                                    </span>
                                </>
                            ) : subscription?.status === 'trialing' && subscription.trialEndsAt ? (
                                <>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>
                                        {t('subscription.status.trial')} - {t('subscription.status.daysRemaining', { count: Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) })}
                                    </span>
                                </>
                            ) : (
                                <>
                                    {isActive && <CheckCircle className="w-3.5 h-3.5" />}
                                    <span>{isActive ? t('subscription.status.active') : t('subscription.status.inactive')}</span>
                                </>
                            )}
                        </div>
                        {subscription && isActive && (
                            <button
                                onClick={() => setShowPricingModal(true)}
                                className="p-1.5 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                aria-label={t('subscription.pricingInfoLabel')}
                            >
                                <Info className="w-4 h-4 text-primary dark:text-primary-light" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Cancellation Warning */}
                {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
                    <div className="mb-4">
                        <CanceledSubscriptionNotice
                            isTrialing={subscription.status === 'trialing'}
                            endDate={subscription.currentPeriodEnd}
                            onReactivate={handleManageSubscription}
                            isReactivating={isOpeningPortal}
                        />
                    </div>
                )}

                {subscription ? (
                    <>
                        {/* Subscription Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-start space-x-3">
                                <Users className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{t('subscription.info.seats')}</p>
                                    <p className="text-lg font-bold text-neutral-900 dark:text-neutral-200">{subscription.currentSeats}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{t('subscription.info.monthlyAmount')}</p>
                                    <p className="text-lg font-bold text-neutral-900 dark:text-neutral-200">{totalMonthly} €</p>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{PRICE_PER_SEAT}€ × {subscription.currentSeats}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                        {subscription.status === 'trialing' ? t('subscription.info.trialEnd') : t('subscription.info.nextPayment')}
                                    </p>
                                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">
                                        {subscription.status === 'trialing' && subscription.trialEndsAt
                                            ? new Date(subscription.trialEndsAt).toLocaleDateString('fr-FR')
                                            : subscription.currentPeriodEnd
                                                ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')
                                                : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Status Message */}
                        {subscription.status === 'trialing' && subscription.trialEndsAt && (
                            <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-dark">
                                <p className="text-sm text-primary-dark dark:text-primary-light font-medium">
                                    {t('subscription.messages.trialPeriod', { date: new Date(subscription.trialEndsAt).toLocaleDateString('fr-FR') })}
                                </p>
                            </div>
                        )}

                        {subscription.status === 'past_due' && (
                            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-900 dark:text-yellow-300 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-yellow-900 dark:text-yellow-300">
                                        {t('subscription.messages.paymentFailed')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleManageSubscription}
                                disabled={isOpeningPortal}
                                className="btn btn-primary btn-sm"
                            >
                                {isOpeningPortal ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ExternalLink className="w-4 h-4" />
                                )}
                                <span>{isOpeningPortal ? t('subscription.buttons.redirecting') : t('subscription.buttons.manage')}</span>
                            </button>
                            <button
                                onClick={handleViewBilling}
                                className="btn btn-secondary btn-sm"
                            >
                                <span>{t('subscription.buttons.viewBilling')}</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* No Subscription */}
                        <div className="mb-6 space-y-3">
                            <div className="bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-lg border border-neutral-200 dark:border-white/10 p-4">
                                <h3 className="font-semibold text-neutral-900 dark:text-neutral-200 mb-2">{t('subscription.noSubscription.title')}</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                                    {t('subscription.noSubscription.description')}
                                </p>
                                <div className="mb-3 p-3 bg-gradient-to-br from-white to-neutral-50 dark:from-black dark:to-black rounded-lg border border-neutral-200 dark:border-white/10">
                                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">{t('subscription.noSubscription.pricing')}</p>
                                    <p className="text-2xl font-bold text-primary dark:text-primary-light">{PRICE_PER_SEAT}€<span className="text-sm text-neutral-600 dark:text-neutral-400">{t('subscription.noSubscription.perMonth')}</span></p>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{t('subscription.noSubscription.perAccount')}</p>
                                </div>
                                <ul className="text-sm text-neutral-700 dark:text-neutral-300 space-y-1.5">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>{t('subscription.noSubscription.features.unlimitedReports')}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>{t('subscription.noSubscription.features.autoSync')}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>{t('subscription.noSubscription.features.customSlides')}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Security Badge */}
                            <div className="flex items-center justify-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>{t('subscription.noSubscription.securePayment')} <span className="font-semibold text-[#635BFF]">Stripe</span></span>
                            </div>
                        </div>

                        <button
                            onClick={handleViewBilling}
                            className="btn btn-primary w-full"
                        >
                            {t('subscription.noSubscription.startTrial')}
                        </button>
                    </>
                )}
            </div>

            {/* Lifetime Upgrade Option - shown for non-lifetime subscribers */}
            {/* Always rendered if !isLifetime, as a sibling to the p-6 div */}
            {subscription && !isLifetime && (
                <div className="pt-6 pb-6 px-6 border-t border-yellow-300/50 dark:border-yellow-600/30 bg-gradient-to-r from-yellow-50/60 to-[#FFF8E1]/60 dark:from-yellow-900/10 dark:to-yellow-800/10 w-full mt-auto">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                                {t('subscription.lifetime.title', 'Passez en accès à vie')}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {t('subscription.lifetime.description', 'Un paiement, accès permanent')}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{LIFETIME_PRICE}€</span>
                            <button
                                onClick={handleLifetimePurchase}
                                disabled={isCreatingLifetimeCheckout}
                                className="btn btn-sm bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-none shadow-[0_4px_12px_rgba(234,179,8,0.4)] hover:shadow-[0_6px_16px_rgba(234,179,8,0.5)] hover:-translate-y-0.5 transition-all duration-200"
                            >
                                {isCreatingLifetimeCheckout && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{isCreatingLifetimeCheckout ? '...' : t('subscription.lifetime.cta', 'Débloquer')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing Info Modal */}
            <PricingInfoModal
                isOpen={showPricingModal}
                onClose={() => setShowPricingModal(false)}
                pricePerSeat={PRICE_PER_SEAT}
            />
        </motion.div>
    );
}
