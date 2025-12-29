import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CreditCard, Calendar, Users, TrendingUp, ExternalLink, Loader2, Check, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import type { BillingEvent } from '../types/subscriptionTypes';

export default function BillingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const { subscription, loading, isActive, createCheckout, openCustomerPortal, syncBilling } = useSubscription();
    const [billingHistory, setBillingHistory] = useState<BillingEvent[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
    const [isOpeningPortal, setIsOpeningPortal] = useState(false);

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
            toast.success('Abonnement créé avec succès ! Bienvenue à bord');
            // Remove query param
            searchParams.delete('session');
            navigate({ search: searchParams.toString() }, { replace: true });
        } else if (session === 'canceled') {
            toast.error('Paiement annulé');
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
            toast.error('Erreur lors de la création du paiement');
            setIsCreatingCheckout(false);
        }
    };

    const handleManageSubscription = async () => {
        try {
            setIsOpeningPortal(true);
            await openCustomerPortal();
        } catch (error: any) {
            console.error('Error opening portal:', error);
            toast.error('Erreur lors de l\'ouverture du portail');
            setIsOpeningPortal(false);
        }
    };

    const handleSyncBilling = async () => {
        setSyncing(true);
        try {
            await syncBilling();
            toast.success('Facturation synchronisée avec succès');
        } catch (error: any) {
            console.error('Error syncing billing:', error);
            toast.error('Erreur lors de la synchronisation');
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const totalMonthly = subscription ? subscription.currentSeats * PRICE_PER_SEAT : PRICE_PER_SEAT;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Facturation & Abonnement</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Gérez votre abonnement, modifiez vos moyens de paiement et consultez l'historique de vos factures via le portail Stripe
                    </p>
                </div>

                {/* Subscription Status Card */}
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/10 dark:border-blue-500/20 p-6 mb-6 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {subscription ? 'Abonnement Actif' : 'Aucun Abonnement'}
                            </h2>
                            {subscription && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {subscription.status === 'trialing' && subscription.trialEndsAt
                                        ? `Période d'essai jusqu'au ${new Date(subscription.trialEndsAt).toLocaleDateString('fr-FR')}`
                                        : subscription.status === 'active'
                                            ? 'Abonnement actif'
                                            : `Statut: ${subscription.status}`}
                                </p>
                            )}
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                            {isActive ? 'Actif' : 'Inactif'}
                        </div>
                    </div>

                    {subscription ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="flex items-start space-x-3">
                                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Comptes Google Ads</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{subscription.currentSeats}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Montant mensuel</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalMonthly} €</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{PRICE_PER_SEAT}€ × {subscription.currentSeats} compte{subscription.currentSeats > 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
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
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Commencez votre essai gratuit</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                                14 jours d'essai gratuit, puis {PRICE_PER_SEAT}€ par compte Google Ads géré par mois.
                            </p>
                            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2 mb-4">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 flex-shrink-0" />
                                    <span>Rapports illimités</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 flex-shrink-0" />
                                    <span>Synchronisation automatique des données</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 flex-shrink-0" />
                                    <span>Widgets personnalisables</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 flex-shrink-0" />
                                    <span>Support prioritaire</span>
                                </li>
                            </ul>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        {subscription ? (
                            <>
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={isOpeningPortal}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
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
                                    className="flex items-center space-x-2 px-4 py-2 border-2 border-blue-500/30 dark:border-blue-500/40 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50"
                                >
                                    {syncing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <TrendingUp className="w-4 h-4" />
                                    )}
                                    <span>Synchroniser</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleSubscribe}
                                disabled={isCreatingCheckout}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                            >
                                {isCreatingCheckout && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{isCreatingCheckout ? 'Redirection vers Stripe...' : 'Commencer l\'essai gratuit'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Billing History */}
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/10 dark:border-blue-500/20 p-6 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
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
                                            return <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
                                        case 'subscription_updated':
                                            return <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
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
                                        className="flex items-center justify-between p-4 border border-blue-500/20 dark:border-blue-500/30 rounded-xl bg-white/30 dark:bg-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:border-blue-500/30 dark:hover:border-blue-500/40 transition-all duration-200"
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
        </div>
    );
}
