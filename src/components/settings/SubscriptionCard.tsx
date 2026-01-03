import { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { CreditCard, Calendar, Users, ExternalLink, Loader2, Check, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PricingInfoModal from '../billing/PricingInfoModal';
import CanceledSubscriptionNotice from '../billing/CanceledSubscriptionNotice';

export default function SubscriptionCard() {
    const { subscription, loading, isActive, openCustomerPortal } = useSubscription();
    const navigate = useNavigate();
    const [isOpeningPortal, setIsOpeningPortal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const PRICE_PER_SEAT = 10;

    const handleManageSubscription = async () => {
        try {
            setIsOpeningPortal(true);
            const url = await openCustomerPortal();
            window.open(url, '_blank');
            setIsOpeningPortal(false);
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
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
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
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/10 dark:from-primary/20 dark:to-primary/20 rounded-lg border border-primary/20">
                            <CreditCard size={20} className="text-primary dark:text-primary-light" />
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
                        : subscription?.status === 'trialing'
                            ? 'bg-blue-100 text-primary-dark dark:bg-blue-900/30 dark:text-primary-light'
                            : isActive
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                        {subscription?.cancelAtPeriodEnd ? (
                            <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>
                                    {subscription.status === 'trialing' ? 'Essai annulé' : 'Annulé'} - Actif jusqu'au {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
                                </span>
                            </>
                        ) : subscription?.status === 'trialing' && subscription.trialEndsAt ? (
                            <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>
                                    Essai - {Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}j restants
                                </span>
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
                                <p className="text-xs text-gray-600 dark:text-gray-400">Comptes Google Ads</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{subscription.currentSeats}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Montant mensuel</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalMonthly} €</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{PRICE_PER_SEAT}€ × {subscription.currentSeats}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-primary mt-0.5" />
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
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-primary-dark">
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
                            className="btn btn-primary btn-sm"
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
                            className="btn btn-secondary btn-sm"
                        >
                            <span>Voir la facturation</span>
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* No Subscription */}
                    <div className="mb-6 space-y-3">
                        <div className="bg-white/70 dark:bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucun abonnement actif</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                14 jours d'essai gratuit, puis facturation automatique selon vos besoins
                            </p>
                            <div className="mb-3 p-3 bg-gradient-to-br from-white to-gray-50 dark:from-gray-600 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-500">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tarification simple</p>
                                <p className="text-2xl font-bold text-primary dark:text-primary-light">{PRICE_PER_SEAT}€<span className="text-sm text-gray-600 dark:text-gray-400">/mois</span></p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">par compte Google Ads connecté</p>
                            </div>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
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
                            </ul>
                        </div>

                        {/* Security Badge */}
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Paiement sécurisé par <span className="font-semibold text-[#635BFF]">Stripe</span></span>
                        </div>
                    </div>

                    <button
                        onClick={handleViewBilling}
                        className="btn btn-primary w-full"
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
