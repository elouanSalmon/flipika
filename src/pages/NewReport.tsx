import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import { createReport } from '../services/reportService';
import { fetchCampaigns, fetchAccessibleCustomers } from '../services/googleAds';
import ReportConfigModal, { type ReportConfig } from '../components/reports/ReportConfigModal';
import Spinner from '../components/common/Spinner';
import type { Campaign } from '../types/business';
import toast from 'react-hot-toast';

interface GoogleAdsAccount {
    id: string;
    name: string;
}

const NewReport: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { customerId, isConnected } = useGoogleAds();
    const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [contextReady, setContextReady] = useState(false);
    const [googleAuthError, setGoogleAuthError] = useState(false);

    // Wait for GoogleAdsContext to initialize
    useEffect(() => {
        const timer = setTimeout(() => {
            setContextReady(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!contextReady) return;

        if (!isConnected) {
            setLoading(false);
            return;
        }
        loadAccounts();
    }, [isConnected, contextReady]);

    // Load campaigns when account is selected
    useEffect(() => {
        if (selectedAccountId) {
            loadCampaigns(selectedAccountId);
        }
    }, [selectedAccountId]);

    const loadAccounts = async () => {
        try {
            setLoading(true);
            setGoogleAuthError(false);
            const response = await fetchAccessibleCustomers();

            if (response.success && response.customers) {
                const accountsList = response.customers.map((customer: any) => ({
                    id: customer.id,
                    name: customer.descriptiveName || customer.id
                }));
                setAccounts(accountsList);

                // Auto-select default account if available
                if (customerId) {
                    setSelectedAccountId(customerId);
                } else if (accountsList.length > 0) {
                    setSelectedAccountId(accountsList[0].id);
                }
            } else {
                setAccounts([]);
                if (response.error && (
                    response.error.includes('invalid_grant') ||
                    response.error.includes('UNAUTHENTICATED')
                )) {
                    setGoogleAuthError(true);
                    toast.error('Session Google Ads expirée');
                } else {
                    toast.error('Erreur lors du chargement des comptes');
                }
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
            toast.error('Erreur lors du chargement des comptes');
            setAccounts([]);
        } finally {
            setLoading(false);
        }
    };

    const loadCampaigns = async (accountId: string) => {
        try {
            const response = await fetchCampaigns(accountId);

            if (response.success && response.campaigns) {
                setCampaigns(Array.isArray(response.campaigns) ? response.campaigns : []);
            } else {
                console.error('Failed to load campaigns:', response.error);
                setCampaigns([]);
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
            setCampaigns([]);
        }
    };

    const handleAccountChange = (accountId: string) => {
        setSelectedAccountId(accountId);
        setCampaigns([]); // Clear campaigns while loading
    };

    const handleSubmit = async (config: ReportConfig) => {
        if (!currentUser) return;

        try {
            // Create report with configuration
            const reportId = await createReport(
                currentUser.uid,
                config.accountId,
                config.title,
                config.campaignIds,
                config.dateRange
            );

            toast.success('Rapport créé !');
            navigate(`/app/reports/${reportId}`);
        } catch (error) {
            console.error('Error creating report:', error);
            toast.error('Erreur lors de la création du rapport');
        }
    };

    const handleClose = () => {
        navigate('/app/reports');
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh'
            }}>
                <Spinner size={48} />
            </div>
        );
    }

    // Google Ads Auth Error
    if (googleAuthError) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: '24px'
            }}>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Session Google Ads expirée</h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                        Votre session Google Ads a expiré. Veuillez reconnecter votre compte pour continuer.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/app/settings')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Reconnecter le compte
                        </button>
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No Google Ads connection
    if (!isConnected) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                padding: '24px',
                textAlign: 'center'
            }}>
                <h2 style={{ marginBottom: '16px', color: 'var(--color-text-primary)' }}>
                    Compte Google Ads requis
                </h2>
                <p style={{ marginBottom: '24px', color: 'var(--color-text-secondary)', maxWidth: '500px' }}>
                    Vous devez connecter un compte Google Ads pour créer des rapports.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/app/settings')}
                        style={{
                            padding: '12px 24px',
                            background: 'var(--gradient-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '0.9375rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Connecter Google Ads
                    </button>
                    <button
                        onClick={handleClose}
                        style={{
                            padding: '12px 24px',
                            background: 'var(--color-bg-card)',
                            color: 'var(--color-text-primary)',
                            border: '2px solid var(--color-border)',
                            borderRadius: '10px',
                            fontSize: '0.9375rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ReportConfigModal
            onClose={handleClose}
            onSubmit={handleSubmit}
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            onAccountChange={handleAccountChange}
            campaigns={campaigns}
        />
    );
};

export default NewReport;
