import { useSubscription } from '../../contexts/SubscriptionContext';
import { CreditCard, Calendar, Users, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionCard() {
    const { subscription, loading, isActive, openCustomerPortal } = useSubscription();
    const navigate = useNavigate();
    const PRICE_PER_SEAT = 10;

    const handleManageSubscription = async () => {
        try {
            await openCustomerPortal();
        } catch (error) {
            console.error('Error opening portal:', error);
        }
    };

    const handleViewBilling = () => {
        navigate('/app/billing');
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--color-bg-secondary)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm"
            >
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
            </motion.div>
        );
    }

    const totalMonthly = subscription ? subscription.currentSeats * PRICE_PER_SEAT : PRICE_PER_SEAT;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--color-bg-secondary)] rounded-xl p-6 border border-[var(--color-border)] shadow-sm"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        Abonnement
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        Gérez votre plan et votre facturation
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                    {isActive ? 'Actif' : 'Inactif'}
                </div>
            </div>

            {subscription ? (
                <>
                    {/* Subscription Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-xs text-[var(--color-text-secondary)]">Comptes Google Ads</p>
                                <p className="text-lg font-bold text-[var(--color-text-primary)]">{subscription.currentSeats}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-xs text-[var(--color-text-secondary)]">Montant mensuel</p>
                                <p className="text-lg font-bold text-[var(--color-text-primary)]">{totalMonthly} €</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">{PRICE_PER_SEAT}€ × {subscription.currentSeats}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                    {subscription.status === 'trialing' ? 'Fin de l\'essai' : 'Prochain paiement'}
                                </p>
                                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
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
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-900 dark:text-blue-300">
                                🎉 Vous êtes en période d'essai gratuit jusqu'au {new Date(subscription.trialEndsAt).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    )}

                    {subscription.status === 'past_due' && (
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-yellow-900 dark:text-yellow-300">
                                ⚠️ Votre paiement a échoué. Veuillez mettre à jour votre moyen de paiement.
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleManageSubscription}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>Gérer l'abonnement</span>
                        </button>
                        <button
                            onClick={handleViewBilling}
                            className="flex items-center space-x-2 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors text-sm font-medium"
                        >
                            <span>Voir la facturation</span>
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* No Subscription */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Aucun abonnement actif</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                            Commencez votre essai gratuit de 14 jours, puis {PRICE_PER_SEAT}€ par compte Google Ads géré par mois.
                        </p>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                            <li>✓ Rapports illimités</li>
                            <li>✓ Synchronisation automatique</li>
                            <li>✓ Widgets personnalisables</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleViewBilling}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Commencer l'essai gratuit
                    </button>
                </>
            )}
        </motion.div>
    );
}
