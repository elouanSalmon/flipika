import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import { createReport } from '../services/reportService';
import { fetchCampaigns, fetchAccessibleCustomers } from '../services/googleAds';
import ReportConfigModal, { type ReportConfig } from '../components/reports/ReportConfigModal';
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
                toast.error('Erreur lors du chargement des comptes');
                setAccounts([]);
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
                height: '100vh',
                fontSize: '1.125rem',
                color: 'var(--color-text-secondary)'
            }}>
                Chargement...
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
