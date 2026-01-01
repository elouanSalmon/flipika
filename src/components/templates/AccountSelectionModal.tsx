import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, Loader2 } from 'lucide-react';

interface GoogleAdsAccount {
    id: string;
    name: string;
}

interface AccountSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (accountId: string) => void | Promise<void>;
    accounts: GoogleAdsAccount[];
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    accounts,
    title = 'Sélectionner un compte',
    message = 'Veuillez sélectionner le compte Google Ads à utiliser pour ce rapport.',
    confirmLabel = 'Continuer',
    cancelLabel = 'Annuler',
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');

    if (typeof document === 'undefined') return null;

    const handleConfirm = async () => {
        if (!selectedAccountId) return;

        try {
            const result = onConfirm(selectedAccountId);
            if (result instanceof Promise) {
                setIsLoading(true);
                await result;
            }
            // Note: onClose is usually called by parent after success, or we can call it here.
            // In ConfirmationModal it calls onClose.
            onClose();
        } catch (error) {
            console.error('Error in account selection modal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    <User size={24} />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {title}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
                                        {message}
                                    </p>

                                    <div className="mt-4">
                                        <select
                                            value={selectedAccountId}
                                            onChange={(e) => setSelectedAccountId(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
                                            disabled={isLoading}
                                        >
                                            {accounts.map(account => (
                                                <option key={account.id} value={account.id}>
                                                    {account.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={isLoading || !selectedAccountId}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default AccountSelectionModal;
