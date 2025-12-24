import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getWidgetData } from '../../../services/widgetService';
import Spinner from '../../common/Spinner';
import type { WidgetConfig, ReportDesign } from '../../../types/reportTypes';
import './CampaignChartWidget.css';

interface CampaignChartWidgetProps {
    config: WidgetConfig;
    design: ReportDesign;
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

const CampaignChartWidget: React.FC<CampaignChartWidgetProps> = ({
    config,
    design,
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

    // Generate chart colors based on theme
    const chartColors = [
        design.colorScheme.primary,
        design.colorScheme.secondary,
        design.colorScheme.accent,
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6',
        '#ec4899',
    ];

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
                            tick={{ fontSize: 12, fill: design.colorScheme.text }}
                            stroke={design.colorScheme.text}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: design.colorScheme.text }}
                            stroke={design.colorScheme.text}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: design.colorScheme.background,
                                border: `1px solid ${design.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                color: design.colorScheme.text,
                            }}
                        />
                        <Legend />
                        {campaigns.map((campaign, index) => (
                            <Bar
                                key={campaign.id}
                                dataKey={campaign.id}
                                name={campaign.name}
                                fill={chartColors[index % chartColors.length]}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}
                    </BarChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: design.colorScheme.text }}
                            stroke={design.colorScheme.text}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: design.colorScheme.text }}
                            stroke={design.colorScheme.text}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: design.colorScheme.background,
                                border: `1px solid ${design.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                color: design.colorScheme.text,
                            }}
                        />
                        <Legend />
                        {campaigns.map((campaign, index) => (
                            <Area
                                key={campaign.id}
                                type="monotone"
                                dataKey={campaign.id}
                                name={campaign.name}
                                stroke={chartColors[index % chartColors.length]}
                                fill={chartColors[index % chartColors.length]}
                                fillOpacity={0.2}
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
                            tick={{ fontSize: 12, fill: design.colorScheme.text }}
                            stroke={design.colorScheme.text}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: design.colorScheme.text }}
                            stroke={design.colorScheme.text}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: design.colorScheme.background,
                                border: `1px solid ${design.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                color: design.colorScheme.text,
                            }}
                        />
                        <Legend />
                        {campaigns.map((campaign, index) => (
                            <Line
                                key={campaign.id}
                                type="monotone"
                                dataKey={campaign.id}
                                name={campaign.name}
                                stroke={chartColors[index % chartColors.length]}
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

    // Check if we have data to display
    const hasData = chartData.length > 0 && campaigns.length > 0;

    if (!hasData) {
        return (
            <div className="campaign-chart-widget empty">
                <div className="widget-header">
                    <h3>Graphique de campagne</h3>
                    {editable && (
                        <button className="widget-settings-btn" onClick={() => {/* TODO: Open settings */ }}>
                            ⚙️
                        </button>
                    )}
                </div>
                <div className="widget-content">
                    <div className="empty-state">
                        <p>Aucune donnée de campagne disponible</p>
                        <p className="empty-hint">Sélectionnez des campagnes pour afficher le graphique</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="campaign-chart-widget"
            style={{
                '--widget-primary': design.colorScheme.primary,
                '--widget-text': design.colorScheme.text,
                '--widget-background': design.colorScheme.background,
                background: design.colorScheme.background,
                color: design.colorScheme.text,
            } as React.CSSProperties}
        >
            <div className="widget-header">
                <h3 style={{ color: design.colorScheme.secondary }}>Graphique de campagne</h3>
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
