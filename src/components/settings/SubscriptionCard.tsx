import { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { CreditCard, Calendar, Users, ExternalLink, Loader2, Check, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatSubscriptionEndDate } from '../../types/subscriptionTypes';
import PricingInfoModal from '../billing/PricingInfoModal';

export default function SubscriptionCard() {
    const { subscription, loading, isActive, openCustomerPortal } = useSubscription();
    const navigate = useNavigate();
    const [isOpeningPortal, setIsOpeningPortal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const PRICE_PER_SEAT = 10;

    const handleManageSubscription = async () => {
        try {
            setIsOpeningPortal(true);
            await openCustomerPortal();
        } catch (error) {
            console.error('Error opening portal:', error);
            setIsOpeningPortal(false);
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
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/10 dark:border-blue-500/20 p-6 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
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
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/10 dark:border-blue-500/20 p-6 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-lg border border-blue-500/20">
                            <CreditCard size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        Abonnement
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Consultez votre plan actuel et gérez vos options de facturation
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${subscription?.cancelAtPeriodEnd
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                        : isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                        {subscription?.cancelAtPeriodEnd ? (
                            <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Expire le {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}</span>
                            </>
                        ) : (
                            <>
                                {isActive && <CheckCircle className="w-3.5 h-3.5" />}
                                <span>{isActive ? 'Actif' : 'Inactif'}</span>
                            </>
                        )}
                    </div>
                    {subscription && isActive && (
                        <button
                            onClick={() => setShowPricingModal(true)}
                            className="p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            aria-label="Information sur la tarification"
                        >
                            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* Cancellation Warning */}
            {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
                <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-orange-900 dark:text-orange-300 mb-0.5">Abonnement annulé</p>
                            <p className="text-xs text-orange-700 dark:text-orange-400">
                                Votre abonnement prendra fin le <strong>{formatSubscriptionEndDate(subscription.currentPeriodEnd)}</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {subscription ? (
                <>
                    {/* Subscription Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Comptes Google Ads</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{subscription.currentSeats}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Montant mensuel</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalMonthly} €</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{PRICE_PER_SEAT}€ × {subscription.currentSeats}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {subscription.status === 'trialing' ? 'Fin de l\'essai' : 'Prochain paiement'}
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
                            <p className="text-sm text-blue-900 dark:text-blue-300 font-medium">
                                Vous êtes en période d'essai gratuit jusqu'au {new Date(subscription.trialEndsAt).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    )}

                    {subscription.status === 'past_due' && (
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-900 dark:text-yellow-300 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-yellow-900 dark:text-yellow-300">
                                    Votre paiement a échoué. Veuillez mettre à jour votre moyen de paiement.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleManageSubscription}
                            disabled={isOpeningPortal}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isOpeningPortal ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ExternalLink className="w-4 h-4" />
                            )}
                            <span>{isOpeningPortal ? 'Redirection...' : 'Gérer l\'abonnement'}</span>
                        </button>
                        <button
                            onClick={handleViewBilling}
                            className="flex items-center space-x-2 px-4 py-2 border-2 border-blue-500/30 dark:border-blue-500/40 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all duration-200 text-sm font-semibold"
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
                            Profitez de 14 jours d'essai gratuit pour tester toutes les fonctionnalités. Aucune carte bancaire requise pour démarrer.
                        </p>
                        <div className="mb-3 p-3 bg-white/50 dark:bg-blue-800/30 rounded-lg">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Tarification simple</p>
                            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{PRICE_PER_SEAT}€ / mois</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">par compte Google Ads connecté</p>
                        </div>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 flex-shrink-0" />
                                <span>Rapports illimités</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 flex-shrink-0" />
                                <span>Synchronisation automatique</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 flex-shrink-0" />
                                <span>Widgets personnalisables</span>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={handleViewBilling}
                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                    >
                        Commencer l'essai gratuit
                    </button>
                </>
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
