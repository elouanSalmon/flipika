import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Campaign } from '../../types/business';
import Spinner from '../common/Spinner';
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
        grid: isDark ? '#1a1a1a' : '#dcdde0',
        axis: isDark ? '#8e9199' : '#6b6e77',
        tooltipBg: isDark ? '#0a0a0a' : '#ffffff',
        tooltipBorder: isDark ? '#1a1a1a' : '#dcdde0',
        tooltipText: isDark ? '#f0f1f2' : '#050505',
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
            <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6 h-96 flex items-center justify-center">
                <Spinner size={32} />
            </div>
        );
    }

    return (
        <div className="card bg-white dark:bg-black border-neutral-100 dark:border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Performance des campagnes (Top 5)</h3>
                <select
                    className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-white/10 bg-white dark:bg-black"
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
                    <Bar dataKey="value" fill="#1963d5" radius={[0, 8, 8, 0]} isAnimationActive={false} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CampaignPerformanceChart;
