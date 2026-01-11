import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import { createReport } from '../services/reportService';
import { fetchCampaigns } from '../services/googleAds';
import ReportConfigModal, { type ReportConfig } from '../components/reports/ReportConfigModal';
import GoogleAdsGuard from '../components/common/GoogleAdsGuard';
import type { Campaign } from '../types/business';
import toast from 'react-hot-toast';

const NewReport: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { accounts } = useGoogleAds(); // Use context
    // const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]); // Removed local state
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);

    // Auto-select removed: Driven by Client Selection in Modal now.
    /*
    useEffect(() => {
        // ...
    }, [customerId, accounts, selectedAccountId]);
    */

    // Load campaigns when account is selected
    useEffect(() => {
        if (selectedAccountId) {
            loadCampaigns(selectedAccountId);
        }
    }, [selectedAccountId]);

    // Removed loadAccounts function

    const loadCampaigns = async (accountId: string) => {
        setLoadingCampaigns(true);
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
        } finally {
            setLoadingCampaigns(false);
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
                campaigns.filter(c => config.campaignIds.includes(c.id)).map(c => c.name),
                config.clientId // Pass Client ID
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

    // Removed spinner for global loading


    return (
        <GoogleAdsGuard mode="block">
            <ReportConfigModal
                onClose={handleClose}
                onSubmit={handleSubmit}
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onAccountChange={handleAccountChange}
                campaigns={campaigns}
                isLoadingCampaigns={loadingCampaigns}
            />
        </GoogleAdsGuard>
    );
};

export default NewReport;
