import React, { useEffect, useState } from 'react';
import { useReportEditor } from '../../../contexts/ReportEditorContext';
import { Building2, X } from 'lucide-react';
import ReportBlock from './ReportBlock';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ClientLogoBlockProps {
    editable?: boolean;
    onDelete?: () => void;
}

/**
 * Client Logo Block Component
 *
 * Displays the logo of the client associated with the report.
 * Fetches client data using the clientId from ReportEditorContext.
 * In template mode, shows a demo placeholder.
 */
export const ClientLogoBlock: React.FC<ClientLogoBlockProps> = ({
    editable = false,
    onDelete
}) => {
    const { client, design, onOpenSettings, isTemplateMode } = useReportEditor();
    const { t } = useTranslation('reports');
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // Debug
    useEffect(() => {
        if (client) {
            console.log('ClientLogoBlock: Using client from context', client);
        }
    }, [client]);

    const isDarkMode = design?.mode === 'dark';


    const ConfigModal = (
        <AnimatePresence>
            {isConfigOpen && (
                <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsConfigOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-[var(--color-bg-primary)] rounded-3xl shadow-2xl flex flex-col w-[500px] max-w-full overflow-hidden border border-[var(--color-border)]"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                            <h4 className="text-xl font-bold">{t('flexibleBlock.modalTitle', 'Paramètres')}</h4>
                            <button onClick={() => setIsConfigOpen(false)} className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-[var(--color-text-muted)]">
                                Ce bloc affiche automatiquement le logo du client associé au rapport.
                                Vous pouvez modifier le client dans les paramètres généraux du rapport.
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-3">
                            <button onClick={() => setIsConfigOpen(false)} className="btn btn-primary px-6">{t('common.close', 'Fermer')}</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    const renderContent = () => {
        // In template mode, show a demo placeholder
        if (isTemplateMode) {
            return (
                <div className="client-logo-placeholder flex flex-col items-center justify-center p-4 text-center h-full">
                    <Building2
                        size={48}
                        className={`mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    />
                    <p className={`text-lg font-semibold mt-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Logo du Client
                    </p>
                    <span className="mt-2 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30 rounded">
                        Aperçu - Sera remplacé par le logo du client
                    </span>
                </div>
            );
        }

        // If no client is linked or client doesn't exist
        if (!client) {
            return (
                <div className="client-logo-placeholder flex flex-col items-center justify-center p-4 text-center h-full">
                    <Building2
                        size={48}
                        className={`mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                    />
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Client non associé
                    </p>
                    {onOpenSettings && (
                        <button
                            onClick={onOpenSettings}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Associer un client
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center h-full w-full">
                {client.logoUrl ? (
                    <div className="client-logo-container p-4">
                        <img
                            src={client.logoUrl}
                            alt={`Logo ${client.name}`}
                            className="client-logo-image max-h-32 object-contain"
                        />
                    </div>
                ) : (
                    <div className="client-logo-placeholder p-4 text-center">
                        <Building2
                            size={48}
                            className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                        />
                        <p className={`text-lg font-semibold mt-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {client.name}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="client-logo-block h-full">
            <ReportBlock
                title={client?.name || "Logo Client"}
                design={design!}
                editable={editable}
                onEdit={() => setIsConfigOpen(true)}
                onDelete={onDelete}
                className="h-full"
            >
                {renderContent()}
            </ReportBlock>
            {typeof document !== 'undefined' && createPortal(ConfigModal, document.body)}
        </div>
    );
};

export default ClientLogoBlock;
