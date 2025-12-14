import React from 'react';
import KPICard from './KPICard';
import {
    Users,
    Target,
    TrendingUp,
    Eye,
    MousePointer,
    Percent,
    Euro,
    ShoppingCart,
    DollarSign,
} from 'lucide-react';

interface MetricsData {
    accountsConnected: number;
    activeCampaigns: number;
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    avgCTR: number;
    avgCPC: number;
    totalConversions: number;
    avgCPA: number;
    avgROAS: number;
    changes?: {
        accountsConnected?: number;
        activeCampaigns?: number;
        totalSpend?: number;
        totalImpressions?: number;
        totalClicks?: number;
        avgCTR?: number;
        avgCPC?: number;
        totalConversions?: number;
        avgCPA?: number;
        avgROAS?: number;
    };
}

interface MetricsGridProps {
    data: MetricsData;
    loading?: boolean;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ data, loading = false }) => {
    const getTrend = (change?: number): 'up' | 'down' | 'neutral' => {
        if (!change) return 'neutral';
        if (change > 0) return 'up';
        if (change < 0) return 'down';
        return 'neutral';
    };

    const metrics = [
        {
            title: 'Comptes connectés',
            value: data.accountsConnected,
            change: data.changes?.accountsConnected,
            icon: <Users size={24} className="text-blue-600 dark:text-blue-400" />,
            trend: getTrend(data.changes?.accountsConnected),
        },
        {
            title: 'Campagnes actives',
            value: data.activeCampaigns,
            change: data.changes?.activeCampaigns,
            icon: <Target size={24} className="text-purple-600 dark:text-purple-400" />,
            trend: getTrend(data.changes?.activeCampaigns),
        },
        {
            title: 'Budget dépensé',
            value: data.totalSpend,
            change: data.changes?.totalSpend,
            icon: <Euro size={24} className="text-green-600 dark:text-green-400" />,
            trend: getTrend(data.changes?.totalSpend),
            format: 'currency' as const,
        },
        {
            title: 'Impressions totales',
            value: data.totalImpressions,
            change: data.changes?.totalImpressions,
            icon: <Eye size={24} className="text-indigo-600 dark:text-indigo-400" />,
            trend: getTrend(data.changes?.totalImpressions),
        },
        {
            title: 'Clics totaux',
            value: data.totalClicks,
            change: data.changes?.totalClicks,
            icon: <MousePointer size={24} className="text-cyan-600 dark:text-cyan-400" />,
            trend: getTrend(data.changes?.totalClicks),
        },
        {
            title: 'CTR moyen',
            value: data.avgCTR,
            change: data.changes?.avgCTR,
            icon: <Percent size={24} className="text-orange-600 dark:text-orange-400" />,
            trend: getTrend(data.changes?.avgCTR),
            format: 'percent' as const,
        },
        {
            title: 'CPC moyen',
            value: data.avgCPC,
            change: data.changes?.avgCPC,
            icon: <DollarSign size={24} className="text-yellow-600 dark:text-yellow-400" />,
            trend: getTrend(data.changes?.avgCPC),
            format: 'currency' as const,
        },
        {
            title: 'Conversions',
            value: data.totalConversions,
            change: data.changes?.totalConversions,
            icon: <ShoppingCart size={24} className="text-emerald-600 dark:text-emerald-400" />,
            trend: getTrend(data.changes?.totalConversions),
        },
        {
            title: 'CPA moyen',
            value: data.avgCPA,
            change: data.changes?.avgCPA,
            icon: <TrendingUp size={24} className="text-rose-600 dark:text-rose-400" />,
            trend: getTrend(data.changes?.avgCPA),
            format: 'currency' as const,
        },
        {
            title: 'ROAS moyen',
            value: data.avgROAS,
            change: data.changes?.avgROAS,
            icon: <TrendingUp size={24} className="text-teal-600 dark:text-teal-400" />,
            trend: getTrend(data.changes?.avgROAS),
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {metrics.map((metric, index) => (
                <KPICard
                    key={index}
                    title={metric.title}
                    value={metric.value}
                    change={metric.change}
                    icon={metric.icon}
                    trend={metric.trend}
                    loading={loading}
                    format={metric.format}
                />
            ))}
        </div>
    );
};

export default MetricsGrid;
