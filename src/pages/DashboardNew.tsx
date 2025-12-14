import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricsGrid from '../components/dashboard/MetricsGrid';
import DateRangePicker from '../components/common/DateRangePicker';
import SpendingChart from '../components/dashboard/SpendingChart';
import BudgetDistributionChart from '../components/dashboard/BudgetDistributionChart';
import CampaignPerformanceChart from '../components/dashboard/CampaignPerformanceChart';
import ConversionTrendChart from '../components/dashboard/ConversionTrendChart';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import AccountsList from '../components/dashboard/AccountsList';
import dataService from '../services/dataService';
import type { Account, Campaign, DateRange, Alert, TimeSeriesMetrics } from '../types/business';

const DashboardNew = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [timeSeriesMetrics, setTimeSeriesMetrics] = useState<TimeSeriesMetrics | null>(null);

    const [dateRange, setDateRange] = useState<DateRange>(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return { start, end, preset: '30d' };
    });

    useEffect(() => {
        loadDashboardData();
    }, [dateRange]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
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
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate aggregated metrics
    const metricsData = {
        accountsConnected: accounts.length,
        activeCampaigns: campaigns.filter(c => c.status === 'ENABLED').length,
        totalSpend: campaigns.reduce((sum, c) => sum + c.metrics.cost, 0),
        totalImpressions: campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0),
        totalClicks: campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0),
        avgCTR: campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / campaigns.length
            : 0,
        avgCPC: campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.metrics.cpc, 0) / campaigns.length
            : 0,
        totalConversions: campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0),
        avgCPA: campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.metrics.cpa, 0) / campaigns.length
            : 0,
        avgROAS: campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + c.metrics.roas, 0) / campaigns.length
            : 0,
        changes: {
            accountsConnected: 5.2,
            activeCampaigns: 12.5,
            totalSpend: 8.3,
            totalImpressions: 15.7,
            totalClicks: 11.2,
            avgCTR: 3.4,
            avgCPC: -2.1,
            totalConversions: 18.9,
            avgCPA: -5.3,
            avgROAS: 12.6,
        },
    };

    const handleDismissAlert = (alertId: string) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    };

    const handleAudit = (accountId: string) => {
        navigate(`/app/audit?account=${accountId}`);
    };

    const handleGenerateReport = (accountId: string) => {
        navigate(`/app/reports?account=${accountId}`);
    };

    return (
        <div className="space-y-8 p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Vue d'ensemble de vos campagnes Google Ads</p>
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
                onViewDetails={handleViewDetails}
                onAudit={handleAudit}
                onGenerateReport={handleGenerateReport}
                loading={loading}
            />
        </div>
    );
};

export default DashboardNew;
