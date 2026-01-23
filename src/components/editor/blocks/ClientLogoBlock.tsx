import React, { useEffect, useState } from 'react';
import { useReportEditor } from '../../../contexts/ReportEditorContext';
import { clientService } from '../../../services/clientService';
import type { Client } from '../../../types/client';
import { Building2 } from 'lucide-react';

/**
 * Client Logo Block Component
 *
 * Displays the logo of the client associated with the report.
 * Fetches client data using the clientId from ReportEditorContext.
 */
export const ClientLogoBlock: React.FC = () => {
    const { clientId, userId, design, onOpenSettings } = useReportEditor();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isDarkMode = design?.mode === 'dark';

    useEffect(() => {
        const loadClient = async () => {
            // Debug log
            console.log('ClientLogoBlock - clientId from context:', clientId);

            // Check if clientId exists and is not null/empty
            if (!clientId || clientId === 'null' || clientId === '') {
                setLoading(false);
                setError('Client non défini');
                return;
            }

            if (!userId) {
                // If userId is missing, we can't fetch the client
                // This shouldn't happen in normal flow as report always has userId
                setLoading(false);
                setError('Erreur interne (User ID manquant)');
                return;
            }

            try {
                setLoading(true);
                const clientData = await clientService.getClient(userId, clientId);
                console.log('ClientLogoBlock - client loaded:', clientData?.name);

                if (!clientData) {
                    setError('Client introuvable');
                    return;
                }

                setClient(clientData);
                setError(null);
            } catch (err) {
                console.error('Error loading client:', err);
                setError('Erreur lors du chargement du client');
            } finally {
                setLoading(false);
            }
        };

        loadClient();
    }, [clientId, userId]);

    if (loading) {
        return (
            <div className="client-logo-block client-logo-loading">
                <div className="client-logo-placeholder">
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg w-full h-full" />
                </div>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="client-logo-block client-logo-error">
                <div className="client-logo-placeholder flex flex-col items-center justify-center p-4 text-center">
                    <Building2
                        size={48}
                        className={`mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                    />
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {error || 'Client non trouvé'}
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
