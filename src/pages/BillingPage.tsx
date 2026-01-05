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
    const { t } = useTranslation('billing');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const { subscription, loading, isActive, createCheckout, openCustomerPortal, syncBilling } = useSubscription();
    const [billingHistory, setBillingHistory] = useState<BillingEvent[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
    const [isOpeningPortal, setIsOpeningPortal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);

    // Default price ID from environment or hardcoded
    const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1234567890';
    const PRICE_PER_SEAT = 10; // €10 per seat per month

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        // Check for checkout session status
        const session = searchParams.get('session');
        if (session === 'success') {
            toast.success(t('toast.subscriptionCreated'));
            // Remove query param
            searchParams.delete('session');
            navigate({ search: searchParams.toString() }, { replace: true });
        } else if (session === 'canceled') {
            toast.error(t('toast.paymentCanceled'));
            searchParams.delete('session');
            navigate({ search: searchParams.toString() }, { replace: true });
        }
    }, [currentUser, navigate, searchParams]);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const totalMonthly = subscription ? subscription.currentSeats * PRICE_PER_SEAT : PRICE_PER_SEAT;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <CreditCard className="w-8 h-8 text-[var(--color-primary)]" />
                        <h1 className="text-[2rem] font-bold text-[var(--color-text-primary)]">{t('title')}</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
                        {t('description')}
                    </p>
                </div>

                {/* Subscription Status Card */}
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 mb-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {subscription
                                    ? (subscription.cancelAtPeriodEnd
                                        ? (subscription.status === 'trialing' ? 'Essai Gratuit Annulé' : 'Abonnement Résilié')
                                        : (subscription.status === 'trialing' ? 'Essai Gratuit Actif' : 'Abonnement Actif'))
                                    : 'Aucun Abonnement'}
                            </h2>
                            {subscription && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {subscription.status === 'trialing'
                                        ? (subscription.cancelAtPeriodEnd
                                            ? `Accès conservé jusqu'au ${subscription.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString('fr-FR') : 'fin de la période'}`
                                            : `Période d'essai jusqu'au ${subscription.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString('fr-FR') : ''}`)
                                        : (subscription.cancelAtPeriodEnd
                                            ? `Accès conservé jusqu'au ${subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR') : 'fin de la période'}`
                                            : 'Abonnement actif et renouvellement automatique activé')
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
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                {subscription?.cancelAtPeriodEnd ? (
                                    <>
                                        <AlertCircle className="w-4 h-4" />
                                        <span>
                                            {subscription.status === 'trialing' ? 'Essai annulé' : 'Annulé'} - Actif jusqu'au {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
                                        </span>
                                    </>
                                ) : subscription?.status === 'trialing' && subscription.trialEndsAt ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        <span>
                                            Essai gratuit - {Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} jours restants
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        {isActive && <CheckCircle className="w-4 h-4" />}
                                        <span>{isActive ? 'Actif' : 'Inactif'}</span>
                                    </>
                                )}
                            </div>
                            {subscription && isActive && (
                                <button
                                    onClick={() => setShowPricingModal(true)}
                                    className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    aria-label="Information sur la tarification"
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

                    {subscription ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="flex items-start space-x-3">
                                <Users className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Comptes Google Ads</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{subscription.currentSeats}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Montant mensuel</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalMonthly} €</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{PRICE_PER_SEAT}€ × {subscription.currentSeats} compte{subscription.currentSeats > 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Prochain paiement</p>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {subscription.currentPeriodEnd
                                            ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 space-y-4">
                            {/* Header */}
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Commencez votre essai gratuit</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    14 jours d'essai gratuit, puis facturation automatique selon vos besoins
                                </p>
                            </div>

                            {/* Pricing Grid */}
                            <div className="bg-white/70 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                                <div className="text-center mb-4">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tarification simple et transparente</p>
                                    <p className="text-3xl font-bold text-primary dark:text-primary-light">{PRICE_PER_SEAT}€<span className="text-lg text-gray-600 dark:text-gray-400">/mois</span></p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">par compte Google Ads connecté</p>
                                </div>

                                {/* Pricing Examples Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    {[1, 2, 5, 10].map((seats) => (
                                        <div
                                            key={seats}
                                            className="p-3 bg-gradient-to-br from-white to-gray-50 dark:from-gray-600 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-500 text-center hover:border-primary-light dark:hover:border-primary hover:shadow-md transition-all duration-200"
                                        >
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{seats} compte{seats > 1 ? 's' : ''}</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{PRICE_PER_SEAT * seats}€</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">/mois</p>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowPricingModal(true)}
                                    className="btn-link w-full justify-center text-sm"
                                >
                                    Voir tous les niveaux de tarification →
                                </button>
                            </div>

                            {/* Features */}
                            <div className="bg-white/70 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Fonctionnalités incluses</p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>Rapports illimités</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>Synchronisation automatique</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>Widgets personnalisables</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                                        <span>Support prioritaire</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Security Badge */}
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Paiement sécurisé par <span className="font-semibold text-[#635BFF]">Stripe</span></span>
                            </div>
                        </div>
                    )}

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
                                    <span>{isOpeningPortal ? 'Redirection...' : 'Gérer l\'abonnement'}</span>
                                </button>
                                <button
                                    onClick={handleSyncBilling}
                                    disabled={syncing}
                                    className="btn btn-secondary"
                                    title="Actualise les informations de facturation depuis votre compte de paiement"
                                >
                                    {syncing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4" />
                                    )}
                                    <span>Actualiser la facturation</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleSubscribe}
                                disabled={isCreatingCheckout}
                                className="btn btn-primary"
                            >
                                {isCreatingCheckout && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{isCreatingCheckout ? 'Redirection vers Stripe...' : 'Commencer l\'essai gratuit'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Billing History */}
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Historique de facturation</h2>

                    {loadingHistory ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : billingHistory.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400 text-center py-8">Aucun événement de facturation</p>
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
                                            return <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
                                        case 'sync':
                                            return <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
                                        default:
                                            return <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
                                    }
                                };

                                const getEventLabel = () => {
                                    switch (event.eventType) {
                                        case 'sync':
                                            return 'Synchronisation de facturation';
                                        case 'payment_succeeded':
                                            return 'Paiement réussi';
                                        case 'payment_failed':
                                            return 'Échec du paiement';
                                        case 'subscription_updated':
                                            return 'Abonnement mis à jour';
                                        case 'subscription_created':
                                            return 'Abonnement créé';
                                        case 'subscription_canceled':
                                            return 'Abonnement annulé';
                                        default:
                                            return event.eventType;
                                    }
                                };

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 border border-primary/20 dark:border-primary/30 rounded-xl bg-white/30 dark:bg-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-200"
                                    >
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="mt-0.5">
                                                {getEventIcon()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    {getEventLabel()}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                                    {event.timestamp ? new Date(event.timestamp).toLocaleString('fr-FR') : '-'}
                                                </p>
                                                {event.previousSeats !== undefined && event.newSeats !== undefined && (
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                        {event.previousSeats} → {event.newSeats} compte{event.newSeats > 1 ? 's' : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {event.amount !== undefined && (
                                            <div className="text-right ml-4">
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">
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
