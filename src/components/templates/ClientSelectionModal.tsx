import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Loader2 } from 'lucide-react';
import { useClients } from '../../hooks/useClients';
import { useTranslation } from 'react-i18next';

interface ClientSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (clientId: string, accountId: string, clientName: string, accountName: string) => void | Promise<void>;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

const ClientSelectionModal: React.FC<ClientSelectionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel,
    cancelLabel,
}) => {
    const { t } = useTranslation('templates'); // or 'common'
    const { clients, isLoading: loadingClients } = useClients();

    const [isLoading, setIsLoading] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string>('');

    // Reset selection when opening
    useEffect(() => {
        if (isOpen && clients.length > 0 && !selectedClientId) {
            // Optional: select first client? Or force user to select.
            // keeping it empty forces explicit selection
        }
    }, [isOpen, clients, selectedClientId]);

    if (typeof document === 'undefined') return null;

    const handleConfirm = async () => {
        if (!selectedClientId) return;

        const client = clients.find(c => c.id === selectedClientId);
        if (!client) return;

        // Ensure client has googleAdsCustomerId
        if (!client.googleAdsCustomerId) {
            // Should show error or UI feedback. 
            // For now, validation is in UI (button disabled if no account logic?)
            // But let's handle it gracefully
            return;
        }

        try {
            const result = onConfirm(
                client.id,
                client.googleAdsCustomerId,
                client.name,
                // We don't have account Name easily available unless we fetch it or client has it. 
                // Client usually has googleAdsCustomerId. 
                // We might need to lookup accountName from context or just use ID as fallback.
                'Google Ads Account' // Fallback or if client object has it. 
                // Looking at clientService/types: Client might not store account Name.
            );
            if (result instanceof Promise) {
                setIsLoading(true);
                await result;
            }
            onClose();
        } catch (error) {
            console.error('Error in client selection modal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedClient = clients.find(c => c.id === selectedClientId);
    const hasLinkedAccount = selectedClient && !!selectedClient.googleAdsCustomerId;

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
                                    <Users size={24} />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {title || t('clientSelector.title', { defaultValue: 'Sélectionner un client' })}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
                                        {message || t('clientSelector.message', { defaultValue: 'Veuillez sélectionner le client pour qui créer ce rapport.' })}
                                    </p>

                                    <div className="mt-4">
                                        {loadingClients ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>Chargement des clients...</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <select
                                                    value={selectedClientId}
                                                    onChange={(e) => setSelectedClientId(e.target.value)}
                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
                                                    disabled={isLoading}
                                                >
                                                    <option value="">{t('clientSelector.placeholder', { defaultValue: 'Choisir un client...' })}</option>
                                                    {clients.map(client => (
                                                        <option key={client.id} value={client.id}>
                                                            {client.name}
                                                        </option>
                                                    ))}
                                                </select>

                                                {selectedClientId && !hasLinkedAccount && (
                                                    <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg flex items-center gap-2">
                                                        <span>⚠</span>
                                                        {t('clientSelector.noAccount', { defaultValue: 'Ce client n\'a pas de compte Google Ads lié.' })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
                                    {cancelLabel || t('common.cancel', { defaultValue: 'Annuler' })}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={isLoading || !selectedClientId || !hasLinkedAccount}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                                    {confirmLabel || t('common.continue', { defaultValue: 'Continuer' })}
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

export default ClientSelectionModal;
