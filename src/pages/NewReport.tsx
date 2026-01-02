import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import { createReport } from '../services/reportService';
import { fetchCampaigns } from '../services/googleAds';
import ReportConfigModal, { type ReportConfig } from '../components/reports/ReportConfigModal';
import Spinner from '../components/common/Spinner';
import GoogleAdsGuard from '../components/common/GoogleAdsGuard';
import type { Campaign } from '../types/business';
import toast from 'react-hot-toast';

const NewReport: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { customerId, accounts } = useGoogleAds(); // Use context
    // const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]); // Removed local state
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [loading, setLoading] = useState(false); // Changed default to false, or rely on context loading? context loading is better but let's keep local for campaign loading

    useEffect(() => {
        // Auto-select default account if available and not set
        if (!selectedAccountId) {
            if (customerId) {
                setSelectedAccountId(customerId);
            } else if (accounts.length > 0) {
                setSelectedAccountId(accounts[0].id);
            }
        }
    }, [customerId, accounts, selectedAccountId]);

    // Load campaigns when account is selected
    useEffect(() => {
        if (selectedAccountId) {
            loadCampaigns(selectedAccountId);
        }
    }, [selectedAccountId]);

    // Removed loadAccounts function

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
