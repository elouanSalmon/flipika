import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CreditCard, Calendar, Users, ExternalLink, Loader2, Check, AlertCircle, CheckCircle, XCircle, RefreshCw, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import type { BillingEvent } from '../types/subscriptionTypes';
import PricingInfoModal from '../components/billing/PricingInfoModal';
import CanceledSubscriptionNotice from '../components/billing/CanceledSubscriptionNotice';

export default function BillingPage() {
    const { t, i18n } = useTranslation('billing');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const { subscription, loading, isActive, isLifetime, createCheckout, createLifetimeCheckout, openCustomerPortal, syncBilling } = useSubscription();
    const [billingHistory, setBillingHistory] = useState<BillingEvent[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
    const [isCreatingLifetimeCheckout, setIsCreatingLifetimeCheckout] = useState(false);
    const [isOpeningPortal, setIsOpeningPortal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);

    // Default price ID from environment or hardcoded
    const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1234567890';
    const STRIPE_LIFETIME_PRICE_ID = import.meta.env.VITE_STRIPE_LIFETIME_PRICE_ID || 'price_lifetime';
    const PRICE_PER_SEAT = 10; // €10 per seat per month
    const LIFETIME_PRICE = 100; // €100 one-time

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        // Check for checkout session status
        const session = searchParams.get('session');
        const fromStripePortal = searchParams.get('from');

        const syncWithRetry = async (maxRetries = 3, delayMs = 2000) => {
            const loadingToast = toast.loading(t('toast.syncing'));

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    // Wait a bit before syncing to let Stripe webhooks process
                    if (attempt === 1) {
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                    } else {
                        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
                    }

                    await syncBilling();
                    toast.dismiss(loadingToast);
                    toast.success(t('toast.syncSuccess'));
                    return;
                } catch (err) {
                    console.error(`Sync attempt ${attempt} failed:`, err);
                    if (attempt === maxRetries) {
                        toast.dismiss(loadingToast);
                        toast.error(t('toast.syncErrorRetry'));
                    }
                }
            }
        };

        if (session === 'success') {
            toast.success(t('toast.subscriptionCreated'));
            // Sync billing data from Stripe to refresh subscription status with retry logic
            syncWithRetry();
            // Remove query param
            searchParams.delete('session');
            navigate({ search: searchParams.toString() }, { replace: true });
        } else if (session === 'lifetime_success') {
            toast.success(t('lifetime.purchaseSuccess', 'Accès à vie activé ! Bienvenue parmi les membres lifetime'));
            // Sync billing data to get the new lifetime status
            syncWithRetry();
            searchParams.delete('session');
            navigate({ search: searchParams.toString() }, { replace: true });
        } else if (session === 'canceled') {
            toast.error(t('toast.paymentCanceled'));
            searchParams.delete('session');
            navigate({ search: searchParams.toString() }, { replace: true });
        } else if (fromStripePortal === 'stripe-portal') {
            // User returned from Stripe Customer Portal, sync billing data
            syncWithRetry();
            // Remove query param
            searchParams.delete('from');
            navigate({ search: searchParams.toString() }, { replace: true });
        }
    }, [currentUser, navigate, searchParams, syncBilling, t]);

    useEffect(() => {
        if (!currentUser) return;

        // Fetch billing history
        const fetchBillingHistory = async () => {
            try {
                const q = query(
                    collection(db, 'billingHistory'),
                    where('userId', '==', currentUser.uid),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                );

                const snapshot = await getDocs(q);
                const events: BillingEvent[] = snapshot.docs.map((doc) => ({
                    userId: doc.data().userId,
                    subscriptionId: doc.data().subscriptionId,
                    eventType: doc.data().eventType,
                    previousSeats: doc.data().previousSeats,
                    newSeats: doc.data().newSeats,
                    amount: doc.data().amount,
                    currency: doc.data().currency,
                    timestamp: doc.data().timestamp?.toDate(),
                    metadata: doc.data().metadata,
                }));

                setBillingHistory(events);
            } catch (error) {
                console.error('Error fetching billing history:', error);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchBillingHistory();
    }, [currentUser]);

    const handleSubscribe = async () => {
        try {
            setIsCreatingCheckout(true);
            const url = await createCheckout(STRIPE_PRICE_ID);
            window.location.href = url;
        } catch (error: any) {
            console.error('Error creating checkout:', error);
            toast.error(t('errors.creatingCheckout'));
            setIsCreatingCheckout(false);
        }
    };

    const handleManageSubscription = async () => {
        try {
            setIsOpeningPortal(true);
            const url = await openCustomerPortal();
            window.location.href = url;
        } catch (error: any) {
            console.error('Error opening portal:', error);
            toast.error(t('errors.openingPortal'));
            setIsOpeningPortal(false);
        }
    };

    const handleSyncBilling = async () => {
        setSyncing(true);
        try {
            await syncBilling();
            toast.success(t('toast.billingSynced'));
        } catch (error: any) {
            console.error('Error syncing billing:', error);
            toast.error(t('errors.syncing'));
        } finally {
            setSyncing(false);
        }
    };

    const handleLifetimePurchase = async () => {
        try {
            setIsCreatingLifetimeCheckout(true);
            const url = await createLifetimeCheckout(STRIPE_LIFETIME_PRICE_ID);
            window.location.href = url;
        } catch (error: any) {
            console.error('Error creating lifetime checkout:', error);
            toast.error(t('errors.creatingCheckout'));
            setIsCreatingLifetimeCheckout(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const totalMonthly = subscription ? subscription.currentSeats * PRICE_PER_SEAT : PRICE_PER_SEAT;

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <CreditCard className="w-8 h-8 text-[var(--color-primary)]" />
                        <h1 className="text-[2rem] font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-lg">
                        {t('description')}
                    </p>
                </div>

                {/* Subscription Status Card */}
                <div className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 mb-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                                {subscription
                                    ? (subscription.cancelAtPeriodEnd
                                        ? (subscription.status === 'trialing' ? t('status.trialCanceled') : t('status.subscriptionCanceled'))
                                        : (subscription.status === 'trialing' ? t('status.trialActive')
                                            : (isLifetime ? t('lifetime.statusTitle') : t('status.subscriptionActive'))))
                                    : t('status.noSubscription')}
                            </h2>
                            {subscription && (
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                    {isLifetime
                                        ? t('lifetime.statusDescription')
                                        : subscription.status === 'trialing'
                                            ? (subscription.cancelAtPeriodEnd
                                                ? t('status.accessUntil', { date: subscription.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString(i18n.language) : t('status.periodEnd') })
                                                : t('status.trialUntil', { date: subscription.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString(i18n.language) : '' }))
                                            : (subscription.cancelAtPeriodEnd
                                                ? t('status.accessUntil', { date: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString(i18n.language) : t('status.periodEnd') })
                                                : t('status.activeRenewing'))
                                    }
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${subscription?.cancelAtPeriodEnd
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                : subscription?.status === 'trialing'
                                    ? 'bg-blue-100 text-primary-dark dark:bg-blue-900/30 dark:text-primary-light'
                                    : isActive
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400'
                                }`}>
                                {subscription?.cancelAtPeriodEnd ? (
                                    <>
                                        <AlertCircle className="w-4 h-4" />
                                        <span>
                                            {subscription.status === 'trialing' ? t('status.trialCanceledBadge') : t('status.canceledBadge')} - {t('status.activeUntil', { date: subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' }) : '' })}
                                        </span>
                                    </>
                                ) : isLifetime ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        <span>{t('lifetime.badge')}</span>
                                    </>
                                ) : subscription?.status === 'trialing' && subscription.trialEndsAt ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        <span>
                                            {t('status.trialDaysLeft', { days: Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) })}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        {isActive && <CheckCircle className="w-4 h-4" />}
                                        <span>{isActive ? t('status.active') : t('status.inactive')}</span>
                                    </>
                                )}
                            </div>
                            {subscription && isActive && (
                                <button
                                    onClick={() => setShowPricingModal(true)}
                                    className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    aria-label={t('status.pricingInfo')}
                                >
                                    <Info className="w-5 h-5 text-primary dark:text-primary-light" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Cancellation Warning */}
                    {subscription?.cancelAtPeriodEnd && (
                        <div className="mb-6">
                            <CanceledSubscriptionNotice
                                isTrialing={subscription.status === 'trialing'}
                                endDate={subscription.currentPeriodEnd || new Date()}
                                onReactivate={handleManageSubscription}
                                isReactivating={isOpeningPortal}
                            />
                        </div>
                    )}

                    {/* Subscription Details - Only show for non-lifetime subscriptions */}
                    {subscription && !isLifetime ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="flex items-start space-x-3">
                                <Users className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('subscription.googleAdsAccounts')}</p>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{subscription.currentSeats}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('subscription.monthlyAmount')}</p>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{totalMonthly} €</p>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">{t('subscription.priceFormula', { seats: subscription.currentSeats })}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('subscription.nextPayment')}</p>
                                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                        {subscription.currentPeriodEnd
                                            ? new Date(subscription.currentPeriodEnd).toLocaleDateString(i18n.language)
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : !subscription ? (
                        <div className="mb-6 space-y-4">
                            {/* Header */}
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">{t('pricing.title')}</h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {t('pricing.subtitle')}
                                </p>
                            </div>

                            {/* Pricing Grid */}
                            <div className="bg-white/70 dark:bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-600 p-6">
                                <div className="text-center mb-4">
                                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">{t('pricing.simpleTransparent')}</p>
                                    <p className="text-3xl font-bold text-primary dark:text-primary-light">{PRICE_PER_SEAT}{t('pricing.perMonth')}</p>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{t('pricing.perAccount')}</p>
                                </div>

                                {/* Pricing Examples Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    {[1, 2, 5, 10].map((seats) => (
                                        <div
                                            key={seats}
                                            className="p-3 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-600 dark:to-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-500 text-center hover:border-primary-light dark:hover:border-primary hover:shadow-md transition-all duration-200"
                                        >
                                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">{t('pricing.accountsCount', { seats })}</p>
                                            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{PRICE_PER_SEAT * seats}€</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('pricing.monthly')}</p>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowPricingModal(true)}
                                    className="btn-link w-full justify-center text-sm"
                                >
                                    {t('pricing.seeAllPricing')}
                                </button>
                            </div>

                            {/* Features */}
                            <div className="bg-white/70 dark:bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-600 p-6">
                                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">{t('pricing.features.title')}</p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>{t('pricing.features.unlimitedReports')}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>{t('pricing.features.autoSync')}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>{t('pricing.features.customWidgets')}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>{t('pricing.features.prioritySupport')}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Security Badge */}
                            <div className="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>{t('pricing.securePayment')}</span>
                            </div>

                            {/* Lifetime Deal Card - Golden Ticket */}
                            <div className="bg-gradient-to-br from-yellow-50 via-[#FFF8E1] to-yellow-100 dark:from-yellow-900/20 dark:via-yellow-800/15 dark:to-yellow-900/25 backdrop-blur-sm rounded-2xl border-2 border-yellow-400 dark:border-yellow-500/50 p-6 relative overflow-hidden shadow-lg shadow-yellow-300/40 dark:shadow-yellow-900/30">
                                {/* Decorative sparkle */}
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-300/40 to-transparent rounded-full blur-2xl"></div>
                                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                                    {t('lifetime.badge')}
                                </div>
                                <div className="text-center relative">
                                    <h4 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                                        {t('lifetime.title')}
                                    </h4>
                                    <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                                        {LIFETIME_PRICE}€
                                    </p>
                                    <p className="text-sm text-yellow-700/80 dark:text-yellow-400/80 mb-3">
                                        {t('lifetime.oneTime')}
                                    </p>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-5">
                                        {t('lifetime.description')}
                                    </p>
                                    <button
                                        onClick={handleLifetimePurchase}
                                        disabled={isCreatingLifetimeCheckout}
                                        className="btn w-full py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold border-none shadow-[0_4px_12px_rgba(234,179,8,0.4)] hover:shadow-[0_6px_16px_rgba(234,179,8,0.5)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
                                    >
                                        {isCreatingLifetimeCheckout && <Loader2 className="w-4 h-4 animate-spin" />}
                                        <span>{isCreatingLifetimeCheckout ? t('subscription.redirecting') : t('lifetime.cta')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : !subscription ? (
                        <div className="mb-6 space-y-4">
                            {/* Header */}
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">{t('pricing.title')}</h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {t('pricing.subtitle')}
                                </p>
                            </div>

                            {/* Pricing Grid */}
                            <div className="bg-white/70 dark:bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-600 p-6">
                                <div className="text-center mb-4">
                                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">{t('pricing.simpleTransparent')}</p>
                                    <p className="text-3xl font-bold text-primary dark:text-primary-light">{PRICE_PER_SEAT}{t('pricing.perMonth')}</p>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{t('pricing.perAccount')}</p>
                                </div>

                                {/* Pricing Examples Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    {[1, 2, 5, 10].map((seats) => (
                                        <div
                                            key={seats}
                                            className="p-3 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-600 dark:to-neutral-700 rounded-lg border border-neutral-200 dark:border-neutral-500 text-center hover:border-primary-light dark:hover:border-primary hover:shadow-md transition-all duration-200"
                                        >
                                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">{t('pricing.accountsCount', { seats })}</p>
                                            <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{PRICE_PER_SEAT * seats}€</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('pricing.monthly')}</p>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowPricingModal(true)}
                                    className="btn-link w-full justify-center text-sm"
                                >
                                    {t('pricing.seeAllPricing')}
                                </button>
                            </div>

                            {/* Features */}
                            <div className="bg-white/70 dark:bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-200 dark:border-neutral-600 p-6">
                                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">{t('pricing.features.title')}</p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>{t('pricing.features.unlimitedReports')}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>{t('pricing.features.autoSync')}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>{t('pricing.features.customWidgets')}</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>{t('pricing.features.prioritySupport')}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Security Badge */}
                            <div className="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>{t('pricing.securePayment')}</span>
                            </div>

                            {/* Lifetime Deal Card - Golden Ticket */}
                            <div className="bg-gradient-to-br from-yellow-50 via-[#FFF8E1] to-yellow-100 dark:from-yellow-900/20 dark:via-yellow-800/15 dark:to-yellow-900/25 backdrop-blur-sm rounded-2xl border-2 border-yellow-400 dark:border-yellow-500/50 p-6 relative overflow-hidden shadow-lg shadow-yellow-300/40 dark:shadow-yellow-900/30">
                                {/* Decorative sparkle */}
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-300/40 to-transparent rounded-full blur-2xl"></div>
                                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                                    {t('lifetime.badge')}
                                </div>
                                <div className="text-center relative">
                                    <h4 className="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                                        {t('lifetime.title')}
                                    </h4>
                                    <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                                        {LIFETIME_PRICE}€
                                    </p>
                                    <p className="text-sm text-yellow-700/80 dark:text-yellow-400/80 mb-3">
                                        {t('lifetime.oneTime')}
                                    </p>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-5">
                                        {t('lifetime.description')}
                                    </p>
                                    <button
                                        onClick={handleLifetimePurchase}
                                        disabled={isCreatingLifetimeCheckout}
                                        className="btn w-full py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold border-none shadow-[0_4px_12px_rgba(234,179,8,0.4)] hover:shadow-[0_6px_16px_rgba(234,179,8,0.5)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
                                    >
                                        {isCreatingLifetimeCheckout && <Loader2 className="w-4 h-4 animate-spin" />}
                                        <span>{isCreatingLifetimeCheckout ? t('subscription.redirecting') : t('lifetime.cta')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {subscription ? (
                            <>
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={isOpeningPortal}
                                    className="btn btn-primary"
                                >
                                    {isOpeningPortal ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <ExternalLink className="w-4 h-4" />
                                    )}
                                    <span>{isOpeningPortal ? t('subscription.redirecting') : t('subscription.manage')}</span>
                                </button>
                                <button
                                    onClick={handleSyncBilling}
                                    disabled={syncing}
                                    className="btn btn-secondary"
                                    title={t('subscription.refreshDescription')}
                                >
                                    {syncing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4" />
                                    )}
                                    <span>{t('subscription.refreshBilling')}</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleSubscribe}
                                disabled={isCreatingCheckout}
                                className="btn btn-primary"
                            >
                                {isCreatingCheckout && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{isCreatingCheckout ? t('subscription.redirectingStripe') : t('subscription.startFreeTrial')}</span>
                            </button>
                        )}
                    </div>

                    {/* Lifetime Upgrade Card - shown for non-lifetime subscribers */}
                    {subscription && !isLifetime && (
                        <div className="mt-6 bg-gradient-to-r from-yellow-50 via-[#FFF8E1] to-yellow-100 dark:from-yellow-900/15 dark:via-yellow-800/10 dark:to-yellow-900/20 backdrop-blur-sm rounded-2xl border border-yellow-400/60 dark:border-yellow-500/40 p-5 pt-8 relative overflow-hidden">
                            <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-yellow-300/30 to-transparent rounded-full blur-xl"></div>
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">
                                {t('lifetime.upgradeBadge')}
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1">
                                    <h4 className="text-base font-bold text-yellow-900 dark:text-yellow-200 mb-1">
                                        {t('lifetime.upgradeTitle')}
                                    </h4>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {t('lifetime.upgradeDescription')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{LIFETIME_PRICE}€</p>
                                        <p className="text-xs text-yellow-700/70 dark:text-yellow-400/70">{t('lifetime.oneTime')}</p>
                                    </div>
                                    <button
                                        onClick={handleLifetimePurchase}
                                        disabled={isCreatingLifetimeCheckout}
                                        className="btn px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold border-none shadow-[0_4px_12px_rgba(234,179,8,0.4)] hover:shadow-[0_6px_16px_rgba(234,179,8,0.5)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        {isCreatingLifetimeCheckout && <Loader2 className="w-4 h-4 animate-spin" />}
                                        <span>{isCreatingLifetimeCheckout ? '...' : t('lifetime.upgradeCta')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Billing History */}
                <div className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">{t('history.title')}</h2>

                    {loadingHistory ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                        </div>
                    ) : billingHistory.length === 0 ? (
                        <p className="text-neutral-600 dark:text-neutral-400 text-center py-8">{t('history.noEvents')}</p>
                    ) : (
                        <div className="space-y-3">
                            {billingHistory.map((event, index) => {
                                const getEventIcon = () => {
                                    switch (event.eventType) {
                                        case 'payment_succeeded':
                                            return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
                                        case 'payment_failed':
                                            return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
                                        case 'subscription_created':
                                            return <CheckCircle className="w-5 h-5 text-primary dark:text-primary-light" />;
                                        case 'subscription_updated':
                                            return <RefreshCw className="w-5 h-5 text-primary dark:text-primary-light" />;
                                        case 'subscription_canceled':
                                            return <XCircle className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />;
                                        case 'sync':
                                            return <RefreshCw className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />;
                                        case 'lifetime_purchase':
                                            return <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
                                        case 'trial_will_end':
                                            return <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
                                        default:
                                            return <AlertCircle className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />;
                                    }
                                };

                                const getEventLabel = () => {
                                    switch (event.eventType) {
                                        case 'sync':
                                            return t('history.events.sync');
                                        case 'payment_succeeded':
                                            return t('history.events.paymentSuccess');
                                        case 'payment_failed':
                                            return t('history.events.paymentFailed');
                                        case 'subscription_updated':
                                            return t('history.events.subscriptionUpdated');
                                        case 'subscription_created':
                                            return t('history.events.subscriptionCreated');
                                        case 'subscription_canceled':
                                            return t('history.events.subscriptionCanceled');
                                        case 'lifetime_purchase':
                                            return t('history.events.lifetimePurchase', { defaultValue: t('lifetime.purchaseEvent') });
                                        case 'trial_will_end':
                                            return t('history.events.trialWillEnd');
                                        default:
                                            return event.eventType;
                                    }
                                };

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 border border-primary/20 dark:border-primary/30 rounded-xl bg-white/30 dark:bg-neutral-700/30 hover:bg-white/50 dark:hover:bg-neutral-700/50 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-200"
                                    >
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="mt-0.5">
                                                {getEventIcon()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                                    {getEventLabel()}
                                                </p>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                                                    {event.timestamp ? new Date(event.timestamp).toLocaleString(i18n.language) : '-'}
                                                </p>
                                                {event.previousSeats !== undefined && event.newSeats !== undefined && (
                                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                                        {t('history.seatsChange', { previous: event.previousSeats, new: event.newSeats })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {event.amount !== undefined && (
                                            <div className="text-right ml-4">
                                                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                    {event.amount.toFixed(2)} {event.currency?.toUpperCase() || 'EUR'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
