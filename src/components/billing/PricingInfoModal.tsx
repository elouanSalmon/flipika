import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface PricingInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    pricePerSeat: number;
}

export default function PricingInfoModal({ isOpen, onClose, pricePerSeat }: PricingInfoModalProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Tarification
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Fermer"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                {pricePerSeat}€/mois
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                par compte Google Ads connecté
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Comment ça marche ?
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Vous payez uniquement pour les comptes Google Ads que vous connectez à Flipika.
                                Le montant est ajusté automatiquement chaque mois.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Exemples de tarification :
                            </p>
                            <div className="max-h-64 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                {[1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100].map((seats) => (
                                    <div
                                        key={seats}
                                        className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <span className="text-gray-600 dark:text-gray-400">{seats} compte{seats > 1 ? 's' : ''}</span>
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{pricePerSeat * seats}€/mois</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Paiement sécurisé par <span className="font-semibold text-[#635BFF]">Stripe</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="mt-6 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                    >
                        Compris !
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
