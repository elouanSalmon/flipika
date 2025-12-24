import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getWidgetData } from '../../../services/widgetService';
import Spinner from '../../common/Spinner';
import type { WidgetConfig } from '../../../types/reportTypes';
import './CampaignChartWidget.css';

interface CampaignChartWidgetProps {
    config: WidgetConfig;
    accountId: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    editable?: boolean;
}

interface ChartDataPoint {
    date: string;
    [key: string]: any;
}

const CHART_COLORS = [
    '#0066ff',
    '#00d4ff',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
];

const CampaignChartWidget: React.FC<CampaignChartWidgetProps> = ({
    config,
    accountId,
    campaignIds,
    startDate,
    endDate,
    editable = false,
}) => {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [config, accountId, campaignIds, startDate, endDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getWidgetData(config, accountId, campaignIds, startDate, endDate);
            setChartData(data.chartData || []);
            setCampaigns(data.campaigns || []);
        } catch (err) {
            console.error('Error loading chart data:', err);
            setError('Impossible de charger les données du graphique');
        } finally {
            setLoading(false);
        }
    };

    const renderChart = () => {
        const chartType = config.settings?.chartType || 'line';
        const commonProps = {
            data: chartData,
            margin: { top: 10, right: 30, left: 0, bottom: 0 },
        };

        switch (chartType) {
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            stroke="#64748b"
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            stroke="#64748b"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            }}
                        />
                        <Legend />
                        {campaigns.map((campaign, index) => (
                            <Bar
                                key={campaign.id}
                                dataKey={campaign.id}
                                name={campaign.name}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            {campaigns.map((campaign, index) => (
                                <linearGradient
                                    key={campaign.id}
                                    id={`gradient-${campaign.id}`}
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor={CHART_COLORS[index % CHART_COLORS.length]}
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor={CHART_COLORS[index % CHART_COLORS.length]}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            stroke="#64748b"
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            stroke="#64748b"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            }}
                        />
                        <Legend />
                        {campaigns.map((campaign, index) => (
                            <Area
                                key={campaign.id}
                                type="monotone"
                                dataKey={campaign.id}
                                name={campaign.name}
                                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                fill={`url(#gradient-${campaign.id})`}
                                strokeWidth={2}
                            />
                        ))}
                    </AreaChart>
                );

            case 'line':
            default:
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            stroke="#64748b"
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            stroke="#64748b"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            }}
                        />
                        <Legend />
                        {campaigns.map((campaign, index) => (
                            <Line
                                key={campaign.id}
                                type="monotone"
                                dataKey={campaign.id}
                                name={campaign.name}
                                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                );
        }
    };

    if (loading) {
        return (
            <div className="campaign-chart-widget loading">
                <div className="widget-header">
                    <h3>Graphique de campagne</h3>
                </div>
                <div className="widget-content">
                    <div className="flex justify-center py-8">
                        <Spinner size={32} />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="campaign-chart-widget error">
                <div className="widget-header">
                    <h3>Graphique de campagne</h3>
                </div>
                <div className="widget-content">
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="campaign-chart-widget">
            <div className="widget-header">
                <h3>Graphique de campagne</h3>
                {editable && (
                    <button className="widget-settings-btn" onClick={() => {/* TODO: Open settings */ }}>
                        ⚙️
                    </button>
                )}
            </div>

            <div className="widget-content">
                <ResponsiveContainer width="100%" height={400}>
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CampaignChartWidget;
