import React, { useEffect } from 'react';
import { useReportEditor } from '../../../contexts/ReportEditorContext';
import { Building2 } from 'lucide-react';

/**
 * Client Logo Block Component
 *
 * Displays the logo of the client associated with the report.
 * Fetches client data using the clientId from ReportEditorContext.
 * In template mode, shows a demo placeholder.
 */
export const ClientLogoBlock: React.FC = () => {
    const { client, design, onOpenSettings, isTemplateMode } = useReportEditor();

    // Debug
    useEffect(() => {
        if (client) {
            console.log('ClientLogoBlock: Using client from context', client);
        }
    }, [client]);

    const isDarkMode = design?.mode === 'dark';

    // In template mode, show a demo placeholder
    if (isTemplateMode) {
        return (
            <div className="client-logo-block">
                <div className="client-logo-placeholder flex flex-col items-center justify-center p-4 text-center">
                    <Building2
                        size={48}
                        className={`mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    />
                    <p className={`text-lg font-semibold mt-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Logo du Client
                    </p>
                    <span className="mt-2 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/30 rounded">
                        Apercu - Sera remplace par le logo du client
                    </span>
                </div>
            </div>
        );
    }

    // If no client is linked or client doesn't exist
    if (!client) {
        return (
            <div className="client-logo-block client-logo-error">
                <div className="client-logo-placeholder flex flex-col items-center justify-center p-4 text-center">
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
            </div>
        );
    }

    return (
        <div className="client-logo-block">
            {client.logoUrl ? (
                <div className="client-logo-container">
                    <img
                        src={client.logoUrl}
                        alt={`Logo ${client.name}`}
                        className="client-logo-image"
                    />
                </div>
            ) : (
                <div className="client-logo-placeholder">
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

export default ClientLogoBlock;
