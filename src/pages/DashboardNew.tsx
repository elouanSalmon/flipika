import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import { useDemoMode } from '../contexts/DemoModeContext';
import MetricsGrid from '../components/dashboard/MetricsGrid';
import DateRangePicker from '../components/common/DateRangePicker';
import SpendingChart from '../components/dashboard/SpendingChart';
import BudgetDistributionChart from '../components/dashboard/BudgetDistributionChart';
import CampaignPerformanceChart from '../components/dashboard/CampaignPerformanceChart';
import ConversionTrendChart from '../components/dashboard/ConversionTrendChart';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import AccountsList from '../components/dashboard/AccountsList';
import EmptyDashboardState from '../components/dashboard/EmptyDashboardState';
import dataService from '../services/dataService';
import type { Account, Campaign, DateRange, Alert, TimeSeriesMetrics } from '../types/business';

const DashboardNew = () => {
    const navigate = useNavigate();
    const { isConnected } = useGoogleAds();
    const { isDemoMode } = useDemoMode();

    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [timeSeriesMetrics, setTimeSeriesMetrics] = useState<TimeSeriesMetrics | null>(null);

    // Previous period data for calculating changes
    const [previousCampaigns, setPreviousCampaigns] = useState<Campaign[]>([]);

    const [dateRange, setDateRange] = useState<DateRange>(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return { start, end, preset: '30d' };
    });

    // Check if we should show dashboard content
    const shouldShowDashboard = isConnected || isDemoMode;

    useEffect(() => {
        if (shouldShowDashboard) {
            loadDashboardData();
        } else {
            setLoading(false);
        }
    }, [dateRange, shouldShowDashboard]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Load current period data
            const [accountsData, campaignsData, alertsData, metricsData] = await Promise.all([
                dataService.getAccounts(),
                dataService.getAllCampaigns(),
                dataService.getAlerts(),
                dataService.getTimeSeriesMetrics({ dateRange }),
            ]);

            setAccounts(accountsData);
            setCampaigns(campaignsData);
            setAlerts(alertsData);
            setTimeSeriesMetrics(metricsData);

            // Load previous period data for comparison
            const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
            const previousStart = new Date(dateRange.start.getTime() - periodLength);
            const previousEnd = new Date(dateRange.start.getTime() - 1);

            const previousMetrics = await dataService.getTimeSeriesMetrics({
                dateRange: { start: previousStart, end: previousEnd },
            });

            // Calculate previous period totals from time series
            const previousTotalSpend = previousMetrics.spend.reduce((sum, p) => sum + p.value, 0);
            const previousTotalImpressions = previousMetrics.impressions.reduce((sum, p) => sum + p.value, 0);
            const previousTotalClicks = previousMetrics.clicks.reduce((sum, p) => sum + p.value, 0);
            const previousTotalConversions = previousMetrics.conversions.reduce((sum, p) => sum + p.value, 0);

            // Store previous data for change calculations
            setPreviousCampaigns([{
                id: 'previous',
                accountId: 'previous',
                name: 'Previous Period',
                status: 'ENABLED',
                type: 'SEARCH',
                budget: { amount: 0, type: 'DAILY' },
                metrics: {
                    impressions: previousTotalImpressions,
                    clicks: previousTotalClicks,
                    cost: previousTotalSpend,
                    conversions: previousTotalConversions,
                    conversionValue: 0,
                    ctr: previousTotalClicks > 0 ? (previousTotalClicks / previousTotalImpressions) * 100 : 0,
                    cpc: previousTotalClicks > 0 ? previousTotalSpend / previousTotalClicks : 0,
                    cpa: previousTotalConversions > 0 ? previousTotalSpend / previousTotalConversions : 0,
                    roas: 0,
                },
                settings: { biddingStrategy: '', targetLocation: [], targetLanguages: [] },
                createdAt: new Date(),
                updatedAt: new Date(),
            }]);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate percentage change
    const calculateChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    // Calculate aggregated metrics with real changes
    const metricsData = (() => {
        const totalSpend = campaigns.reduce((sum, c) => sum + c.metrics.cost, 0);
        const totalImpressions = campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0);
        const totalClicks = campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0);
        const totalConversions = campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0);
        const avgCTR = campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / campaigns.length
            : 0;
        const avgCPC = campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.metrics.cpc, 0) / campaigns.length
            : 0;
        const avgCPA = campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.metrics.cpa, 0) / campaigns.length
            : 0;
        const avgROAS = campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.metrics.roas, 0) / campaigns.length
            : 0;

        // Get previous period metrics
        const prevMetrics = previousCampaigns[0]?.metrics || {
            cost: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            ctr: 0,
            cpc: 0,
            cpa: 0,
            roas: 0,
        };

        return {
            accountsConnected: accounts.length,
            activeCampaigns: campaigns.filter(c => c.status === 'ENABLED').length,
            totalSpend,
            totalImpressions,
            totalClicks,
            avgCTR,
            avgCPC,
            totalConversions,
            avgCPA,
            avgROAS,
            changes: {
                accountsConnected: 0, // Accounts don't change period to period
                activeCampaigns: 0, // Campaign count doesn't have historical comparison
                totalSpend: calculateChange(totalSpend, prevMetrics.cost),
                totalImpressions: calculateChange(totalImpressions, prevMetrics.impressions),
                totalClicks: calculateChange(totalClicks, prevMetrics.clicks),
                avgCTR: calculateChange(avgCTR, prevMetrics.ctr),
                avgCPC: calculateChange(avgCPC, prevMetrics.cpc),
                totalConversions: calculateChange(totalConversions, prevMetrics.conversions),
                avgCPA: calculateChange(avgCPA, prevMetrics.cpa),
                avgROAS: calculateChange(avgROAS, prevMetrics.roas),
            },
        };
    })();

    const handleDismissAlert = (alertId: string) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    };

    const handleAudit = (accountId: string) => {
        navigate(`/app/audit?account=${accountId}`);
    };

    const handleGenerateReport = (accountId: string) => {
        navigate(`/app/reports?account=${accountId}`);
    };

    // Show empty state if not connected and not in demo mode
    if (!shouldShowDashboard) {
        return <EmptyDashboardState />;
    }

    return (
        <div className="space-y-8 p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-500 mt-1">
                        {isDemoMode ? 'Mode Démo - ' : ''}Vue d'ensemble de vos campagnes Google Ads
                    </p>
                </div>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>

            {/* KPIs Grid */}
            <MetricsGrid data={metricsData} loading={loading} />

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpendingChart
                    data={timeSeriesMetrics?.spend || []}
                    loading={loading}
                />
                <BudgetDistributionChart
                    accounts={accounts}
                    loading={loading}
                />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CampaignPerformanceChart
                    campaigns={campaigns}
                    metric="cost"
                    loading={loading}
                />
                <ConversionTrendChart
                    data={timeSeriesMetrics?.conversions || []}
                    loading={loading}
                />
            </div>

            {/* Alerts */}
            <AlertsPanel
                alerts={alerts}
                onDismiss={handleDismissAlert}
                loading={loading}
            />

            {/* Accounts List */}
            <AccountsList
                accounts={accounts}
                onAudit={handleAudit}
                onGenerateReport={handleGenerateReport}
                loading={loading}
            />
        </div>
    );
};

export default DashboardNew;

