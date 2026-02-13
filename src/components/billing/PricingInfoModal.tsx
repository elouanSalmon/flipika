import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface PricingInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    pricePerSeat: number;
}

export default function PricingInfoModal({ isOpen, onClose, pricePerSeat }: PricingInfoModalProps) {
    const { t } = useTranslation('billing');

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                            {t('pricingModal.title')}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                            aria-label={t('pricingModal.close')}
                        >
                            <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                {t('pricingModal.pricePerMonth', { price: `${pricePerSeat}€` })}
                            </p>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                {t('pricingModal.perGoogleAdsAccount')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {t('pricingModal.howItWorks')}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {t('pricingModal.howItWorksDescription')}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                                {t('pricingModal.pricingExamples')}
                            </p>
                            <div className="max-h-64 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent">
                                {[1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100].map((seats) => (
                                    <div
                                        key={seats}
                                        className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                                    >
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            {t('pricingModal.accountCount', { count: seats })}
                                        </span>
                                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                            {pricePerSeat * seats}€{t('pricingModal.perMonth')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>
                                    {t('pricing.securePayment')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="btn btn-primary w-full mt-6"
                    >
                        {t('pricingModal.understood')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
