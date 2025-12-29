import { AlertTriangle, RefreshCw } from 'lucide-react';
import { formatSubscriptionEndDate } from '../../types/subscriptionTypes';

interface CanceledSubscriptionNoticeProps {
    isTrialing: boolean;
    endDate: Date;
    onReactivate: () => void;
    isReactivating?: boolean;
}

export default function CanceledSubscriptionNotice({
    isTrialing,
    endDate,
    onReactivate,
    isReactivating = false
}: CanceledSubscriptionNoticeProps) {
    const formattedEndDate = formatSubscriptionEndDate(endDate);

    return (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">
                        {isTrialing ? 'Essai gratuit annulé' : 'Abonnement annulé'}
                    </h3>
                    <p className="text-sm text-orange-800 dark:text-orange-400 mb-3">
                        {isTrialing ? (
                            <>
                                Votre essai gratuit a été annulé mais reste actif jusqu'au{' '}
                                <span className="font-semibold">{formattedEndDate}</span>.
                                Après cette date, vous n'aurez plus accès aux fonctionnalités premium.
                            </>
                        ) : (
                            <>
                                Votre abonnement a été annulé mais reste actif jusqu'au{' '}
                                <span className="font-semibold">{formattedEndDate}</span>.
                                Vous ne serez plus facturé après cette date et perdrez l'accès aux fonctionnalités premium.
                            </>
                        )}
                    </p>
                    <button
                        onClick={onReactivate}
                        disabled={isReactivating}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                        {isReactivating ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Redirection...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                {isTrialing ? 'Réactiver l\'essai gratuit' : 'Réactiver l\'abonnement'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
