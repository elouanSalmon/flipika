import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import { createReport } from '../services/reportService';
import { fetchCampaigns, fetchAccessibleCustomers } from '../services/googleAds';
import ReportConfigModal, { type ReportConfig } from '../components/reports/ReportConfigModal';
import Spinner from '../components/common/Spinner';
import GoogleAdsGuard from '../components/common/GoogleAdsGuard';
import type { Campaign } from '../types/business';
import toast from 'react-hot-toast';

interface GoogleAdsAccount {
    id: string;
    name: string;
}

const NewReport: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { customerId } = useGoogleAds();
    const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAccounts();
    }, []);

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
                setAccounts([]);
                if (response.error && (
                    response.error.includes('invalid_grant') ||
                    response.error.includes('UNAUTHENTICATED')
                )) {
                    // Handled by context/guard ideally, but good to keep local feedback just in case
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
                config.dateRange,
                accounts.find(a => a.id === config.accountId)?.name,
                campaigns.filter(c => config.campaignIds.includes(c.id)).map(c => c.name)
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

    return (
        <GoogleAdsGuard mode="block">
            <ReportConfigModal
                onClose={handleClose}
                onSubmit={handleSubmit}
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onAccountChange={handleAccountChange}
                campaigns={campaigns}
            />
        </GoogleAdsGuard>
    );
};

export default NewReport;
