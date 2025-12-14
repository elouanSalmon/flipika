import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Campaign } from '../../types/business';
import { useTheme } from '../../contexts/ThemeContext';

interface CampaignPerformanceChartProps {
    campaigns: Campaign[];
    metric: 'cost' | 'conversions' | 'roas';
    loading?: boolean;
}

const CampaignPerformanceChart: React.FC<CampaignPerformanceChartProps> = ({
    campaigns,
    metric = 'cost',
    loading = false,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const colors = {
        grid: isDark ? '#374151' : '#e5e7eb',
        axis: isDark ? '#9ca3af' : '#6b7280',
        tooltipBg: isDark ? '#1f2937' : '#ffffff',
        tooltipBorder: isDark ? '#374151' : '#e5e7eb',
        tooltipText: isDark ? '#f3f4f6' : '#111827',
    };
    const getMetricValue = (campaign: Campaign): number => {
        switch (metric) {
            case 'cost':
                return campaign.metrics.cost;
            case 'conversions':
                return campaign.metrics.conversions;
            case 'roas':
                return campaign.metrics.roas;
            default:
                return 0;
        }
    };

    // Sort campaigns by metric and take top 5
    const sortedCampaigns = [...campaigns].sort((a, b) => getMetricValue(b) - getMetricValue(a));
    const top5 = sortedCampaigns.slice(0, 5);

    const chartData = [
        ...top5.map(c => ({
            name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
            value: getMetricValue(c),
            type: 'top',
        })),
    ];

    if (loading) {
        return (
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6 h-96 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Performance des campagnes (Top 5)</h3>
                <select
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                    defaultValue={metric}
                >
                    <option value="cost">Dépenses</option>
                    <option value="conversions">Conversions</option>
                    <option value="roas">ROAS</option>
                </select>
            </div>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} layout="horizontal" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis type="number" stroke={colors.axis} tick={{ fill: colors.axis }} style={{ fontSize: '12px' }} />
                    <YAxis type="category" dataKey="name" stroke={colors.axis} tick={{ fill: colors.axis }} style={{ fontSize: '12px' }} width={150} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: colors.tooltipBg,
                            border: `1px solid ${colors.tooltipBorder}`,
                            borderRadius: '8px',
                            color: colors.tooltipText,
                        }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} isAnimationActive={false} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CampaignPerformanceChart;
