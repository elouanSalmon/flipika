import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CreditCard, Calendar, Users, TrendingUp, ExternalLink, Loader2 } from 'lucide-react';
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
            toast.success('Subscription créé avec succès ! Bienvenue à bord 🎉');
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
            const url = await createCheckout(STRIPE_PRICE_ID);
            window.location.href = url;
        } catch (error: any) {
            console.error('Error creating checkout:', error);
            toast.error('Erreur lors de la création du paiement');
        }
    };

    const handleManageSubscription = async () => {
        try {
            await openCustomerPortal();
        } catch (error: any) {
            console.error('Error opening portal:', error);
            toast.error('Erreur lors de l\'ouverture du portail');
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
        <div className="min-h-screen bg-[var(--color-bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Facturation & Abonnement</h1>
                    <p className="mt-2 text-[var(--color-text-secondary)]">
                        Gérez votre abonnement et consultez votre historique de facturation
                    </p>
                </div>

                {/* Subscription Status Card */}
                <div className="bg-[var(--color-bg-secondary)] rounded-lg shadow-sm border border-[var(--color-border)] p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                {subscription ? 'Abonnement Actif' : 'Aucun Abonnement'}
                            </h2>
                            {subscription && (
                                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                    {subscription.status === 'trialing' && subscription.trialEndsAt
                                        ? `Période d'essai jusqu'au ${new Date(subscription.trialEndsAt).toLocaleDateString('fr-FR')}`
                                        : subscription.status === 'active'
                                            ? 'Abonnement actif'
                                            : `Statut: ${subscription.status}`}
                                </p>
                            )}
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {isActive ? 'Actif' : 'Inactif'}
                        </div>
                    </div>

                    {subscription ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="flex items-start space-x-3">
                                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-[var(--color-text-secondary)]">Comptes Google Ads</p>
                                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">{subscription.currentSeats}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-[var(--color-text-secondary)]">Montant mensuel</p>
                                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">{totalMonthly} €</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{PRICE_PER_SEAT}€ × {subscription.currentSeats} compte{subscription.currentSeats > 1 ? 's' : ''}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-[var(--color-text-secondary)]">Prochain paiement</p>
                                    <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                                        {subscription.currentPeriodEnd
                                            ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-900 mb-2">Commencez votre essai gratuit</h3>
                            <p className="text-sm text-blue-700 mb-4">
                                14 jours d'essai gratuit, puis {PRICE_PER_SEAT}€ par compte Google Ads géré par mois.
                            </p>
                            <ul className="text-sm text-blue-700 space-y-1 mb-4">
                                <li>✓ Rapports illimités</li>
                                <li>✓ Synchronisation automatique des données</li>
                                <li>✓ Widgets personnalisables</li>
                                <li>✓ Support prioritaire</li>
                            </ul>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        {subscription ? (
                            <>
                                <button
                                    onClick={handleManageSubscription}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>Gérer l'abonnement</span>
                                </button>
                                <button
                                    onClick={handleSyncBilling}
                                    disabled={syncing}
                                    className="flex items-center space-x-2 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors disabled:opacity-50"
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
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Commencer l'essai gratuit
                            </button>
                        )}
                    </div>
                </div>

                {/* Billing History */}
                <div className="bg-[var(--color-bg-secondary)] rounded-lg shadow-sm border border-[var(--color-border)] p-6">
                    <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Historique de facturation</h2>

                    {loadingHistory ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : billingHistory.length === 0 ? (
                        <p className="text-[var(--color-text-secondary)] text-center py-8">Aucun événement de facturation</p>
                    ) : (
                        <div className="space-y-3">
                            {billingHistory.map((event, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-[var(--color-text-primary)]">
                                            {event.eventType === 'sync' && 'Synchronisation de facturation'}
                                            {event.eventType === 'payment_succeeded' && 'Paiement réussi'}
                                            {event.eventType === 'payment_failed' && 'Échec du paiement'}
                                            {event.eventType === 'subscription_updated' && 'Abonnement mis à jour'}
                                            {event.eventType === 'subscription_created' && 'Abonnement créé'}
                                            {event.eventType === 'subscription_canceled' && 'Abonnement annulé'}
                                        </p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            {event.timestamp ? new Date(event.timestamp).toLocaleString('fr-FR') : '-'}
                                        </p>
                                        {event.previousSeats !== undefined && event.newSeats !== undefined && (
                                            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                                {event.previousSeats} → {event.newSeats} compte{event.newSeats > 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>
                                    {event.amount !== undefined && (
                                        <div className="text-right">
                                            <p className="font-semibold text-[var(--color-text-primary)]">
                                                {event.amount.toFixed(2)} {event.currency?.toUpperCase() || 'EUR'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
