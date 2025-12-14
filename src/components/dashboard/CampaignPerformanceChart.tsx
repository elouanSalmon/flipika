import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Campaign } from '../../types/business';

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

    const getMetricLabel = (): string => {
        switch (metric) {
            case 'cost':
                return 'Dépenses (€)';
            case 'conversions':
                return 'Conversions';
            case 'roas':
                return 'ROAS';
            default:
                return '';
        }
    };

    // Sort campaigns by metric and take top 5 and bottom 5
    const sortedCampaigns = [...campaigns].sort((a, b) => getMetricValue(b) - getMetricValue(a));
    const top5 = sortedCampaigns.slice(0, 5);
    const bottom5 = sortedCampaigns.slice(-5).reverse();

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
                <BarChart data={chartData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis type="category" dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} width={150} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                        }}
                    />
                    <Legend />
                    <Bar dataKey="value" name={getMetricLabel()} fill="#3b82f6" radius={[0, 8, 8, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CampaignPerformanceChart;
