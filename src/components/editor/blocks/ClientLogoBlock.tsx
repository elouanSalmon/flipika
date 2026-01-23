import React, { useEffect, useState } from 'react';
import { useReportEditor } from '../../../contexts/ReportEditorContext';
import { clientService } from '../../../services/clientService';
import { useAuth } from '../../../contexts/AuthContext';
import type { Client } from '../../../types/client';
import { Building2 } from 'lucide-react';

/**
 * Client Logo Block Component
 *
 * Displays the logo of the client associated with the report.
 * Fetches client data using the clientId from ReportEditorContext.
 */
export const ClientLogoBlock: React.FC = () => {
    const { clientId, design } = useReportEditor();
    const { currentUser } = useAuth();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isDarkMode = design?.mode === 'dark';

    useEffect(() => {
        const loadClient = async () => {
            if (!clientId || !currentUser) {
                setLoading(false);
                setError('Aucun client associe a ce rapport');
                return;
            }

            try {
                setLoading(true);
                const clientData = await clientService.getClient(clientId);
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
    }, [clientId, currentUser]);

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
                <div className="client-logo-placeholder">
                    <Building2
                        size={48}
                        className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}
                    />
                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {error || 'Client non trouve'}
                    </p>
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
