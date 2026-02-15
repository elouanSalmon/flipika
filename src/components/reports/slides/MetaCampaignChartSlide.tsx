import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getSlideData } from '../../../services/slideService';
import Spinner from '../../common/Spinner';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import './ChartBlocksShared.css';

interface MetaCampaignChartSlideProps {
    config: SlideConfig;
    design: ReportDesign;
    accountId: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    reportId?: string;
}

interface ChartData {
    chartData: Array<{ date: string;[key: string]: any }>;
    campaigns: Array<{ id: string; name: string }>;
    isMockData: boolean;
}

const CHART_COLORS = [
    '#0064E0', '#00C853', '#FF6D00', '#AA00FF', '#FF1744',
    '#00B8D4', '#FFD600', '#304FFE', '#C51162', '#00BFA5',
];

const MetaCampaignChartSlide: React.FC<MetaCampaignChartSlideProps> = ({
    config,
    design,
    accountId,
    campaignIds,
    startDate,
    endDate,
    reportId,
}) => {
    const [data, setData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const effectiveAccountId = config.scope?.accountId || accountId || '';
    const effectiveCampaignIds = config.scope?.campaignIds || campaignIds || [];

    useEffect(() => {
        loadData();
    }, [config, effectiveAccountId, effectiveCampaignIds, startDate, endDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await getSlideData(config, effectiveAccountId, effectiveCampaignIds, startDate, endDate, reportId);
            setData(result);
        } catch (err) {
            console.error('Error loading Meta campaign chart data:', err);
            setError('Impossible de charger les donnees Meta Ads');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="chart-block-loading">
                <Spinner size={32} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="chart-block-empty">
                {error || 'Aucune donnee disponible'}
            </div>
        );
    }

    const chartType = config.settings?.chartType || 'line';
    const textColor = design?.colorScheme?.text || '#050505';

    const renderChart = () => {
        const commonProps = {
            data: data.chartData,
            margin: { top: 5, right: 30, left: 20, bottom: 5 },
        };

        const xAxisProps = {
            dataKey: 'date',
            stroke: textColor,
            fontSize: 12,
            tickFormatter: (val: string) => {
                const d = new Date(val);
                return `${d.getDate()}/${d.getMonth() + 1}`;
            },
        };

        const yAxisProps = {
            stroke: textColor,
            fontSize: 12,
        };

        const gridProps = {
            strokeDasharray: '3 3',
            stroke: design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        };

        switch (chartType) {
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid {...gridProps} />
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip contentStyle={{ backgroundColor: design?.colorScheme?.background, border: `1px solid ${design?.colorScheme?.primary}`, color: textColor }} />
                        <Legend />
                        {data.campaigns.map((campaign, i) => (
                            <Bar key={campaign.id} dataKey={campaign.id} name={campaign.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                    </BarChart>
                );
            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid {...gridProps} />
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip contentStyle={{ backgroundColor: design?.colorScheme?.background, border: `1px solid ${design?.colorScheme?.primary}`, color: textColor }} />
                        <Legend />
                        {data.campaigns.map((campaign, i) => (
                            <Area key={campaign.id} type="monotone" dataKey={campaign.id} name={campaign.name} stroke={CHART_COLORS[i % CHART_COLORS.length]} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.3} />
                        ))}
                    </AreaChart>
                );
            default: // 'line'
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid {...gridProps} />
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip contentStyle={{ backgroundColor: design?.colorScheme?.background, border: `1px solid ${design?.colorScheme?.primary}`, color: textColor }} />
                        <Legend />
                        {data.campaigns.map((campaign, i) => (
                            <Line key={campaign.id} type="monotone" dataKey={campaign.id} name={campaign.name} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />
                        ))}
                    </LineChart>
                );
        }
    };

    return (
        <div className="chart-block-card" style={{
            '--widget-primary': design?.colorScheme?.primary || 'var(--color-primary)',
            backgroundColor: design?.colorScheme?.background || '#ffffff',
            borderColor: design?.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            color: textColor,
        } as React.CSSProperties}>
            <div className="chart-block-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/meta-ads.svg" alt="Meta" style={{ width: '20px', height: '20px' }} />
                    <h3 className="chart-block-title">Meta Ads - Campagnes</h3>
                </div>
                {data.isMockData && (
                    <span className="chart-mock-badge" title="Donnees de demonstration">
                        <AlertTriangle size={12} />
                        Demo
                    </span>
                )}
            </div>
            <div className="chart-block-content" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MetaCampaignChartSlide;
