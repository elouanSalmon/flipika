import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Eye, MousePointer, Target, DollarSign, Percent, BarChart3, AlertTriangle } from 'lucide-react';
import { getSlideData } from '../../../services/slideService';
import Spinner from '../../common/Spinner';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import './PerformanceOverviewSlide.css';

interface PerformanceOverviewSlideProps {
    config: SlideConfig;
    design: ReportDesign;
    accountId: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    editable?: boolean;
    reportId?: string;
}

interface MetricData {
    name: string;
    value: number;
    formatted: string;
    change?: number;
}

const METRIC_ICONS: Record<string, React.ReactNode> = {
    impressions: <Eye size={20} />,
    clicks: <MousePointer size={20} />,
    conversions: <Target size={20} />,
    cost: <DollarSign size={20} />,
    ctr: <Percent size={20} />,
    cpc: <DollarSign size={20} />,
    cpa: <DollarSign size={20} />,
    roas: <BarChart3 size={20} />,
};

const METRIC_LABELS: Record<string, string> = {
    impressions: 'Impressions',
    clicks: 'Clics',
    conversions: 'Conversions',
    cost: 'Coût',
    ctr: 'CTR',
    cpc: 'CPC',
    cpa: 'CPA',
    roas: 'ROAS',
};

const PerformanceOverviewSlide: React.FC<PerformanceOverviewSlideProps> = ({
    config,
    design,
    accountId,
    campaignIds,
    startDate,
    endDate,
    editable = false,
    reportId,
}) => {
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMockData, setIsMockData] = useState(false);

    // Compute effective scope: slide scope overrides report scope
    // CRITICAL: Ensure values are never undefined to avoid CORS errors
    const effectiveAccountId = config.scope?.accountId || accountId || '';
    const effectiveCampaignIds = config.scope?.campaignIds || campaignIds || [];

    useEffect(() => {
        loadData();
    }, [config, effectiveAccountId, effectiveCampaignIds, startDate, endDate]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getSlideData(config, effectiveAccountId, effectiveCampaignIds, startDate, endDate, reportId);

            // Remove duplicates and limit to 6 metrics max
            const rawMetrics = data.metrics || [];
            const uniqueMetrics = Array.from(
                new Map(rawMetrics.map((m: MetricData) => [m.name, m])).values()
            ).slice(0, 6); // Limit to 6 for better layout

            setMetrics(uniqueMetrics as MetricData[]);
            setIsMockData(data.isMockData || false);
        } catch (err) {
            console.error('Error loading widget data:', err);
            setError('Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get card background color based on mode
    const getCardBackground = () => {
        if (design.mode === 'dark') {
            // Dark mode: slightly lighter than background
            return 'rgba(30, 41, 59, 0.6)';
        } else {
            // Light mode: slightly darker than white
            return 'rgba(249, 250, 251, 0.9)';
        }
    };

    const getCardBorder = () => {
        if (design.mode === 'dark') {
            return 'rgba(255, 255, 255, 0.1)';
        } else {
            return 'rgba(0, 0, 0, 0.06)';
        }
    };

    if (loading) {
        return (
            <div className="performance-overview-widget loading">
                <div className="widget-header">
                    <h3>Vue d'ensemble des performances</h3>
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
            <div className="performance-overview-widget error">
                <div className="widget-header">
                    <h3>Vue d'ensemble des performances</h3>
                </div>
                <div className="widget-content">
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="performance-widget"
            style={{
                '--widget-primary': design?.colorScheme?.primary || '#3b82f6',
                '--widget-secondary': design?.colorScheme?.secondary || '#6b7280',
                '--widget-text': design?.colorScheme?.text || '#111827',
                '--widget-background': design?.colorScheme?.background || '#ffffff',
                background: design?.colorScheme?.background || '#ffffff',
                color: design?.colorScheme?.text || '#111827',
            } as React.CSSProperties}
        >
            <div className="widget-header">
                <h3 style={{ color: design?.colorScheme?.secondary || '#6b7280' }}>Vue d'ensemble des performances</h3>
                {isMockData && (
                    <span className="mock-data-badge" title="Données de démonstration - Connectez votre compte Google Ads pour voir vos vraies données">
                        <AlertTriangle size={14} />
                        Démo
                    </span>
                )}
                {editable && (
                    <button className="widget-settings-btn" onClick={() => {/* TODO: Open settings */ }}>
                        ⚙️
                    </button>
                )}
            </div>

            <div className="widget-content">
                <div className="metrics-grid">
                    {metrics.map((metric) => (
                        <div
                            key={metric.name}
                            className="metric-card"
                            style={{
                                background: getCardBackground(),
                                borderColor: getCardBorder(),
                                backgroundImage: 'none',
                            }}
                        >
                            <div
                                className="metric-icon"
                                style={{
                                    background: design?.colorScheme?.primary || '#3b82f6',
                                }}
                            >
                                {METRIC_ICONS[metric.name] || <BarChart3 size={20} />}
                            </div>
                            <div className="metric-info">
                                <div className="widget-metric-label" style={{ color: design?.colorScheme?.secondary || '#6b7280' }}>
                                    {METRIC_LABELS[metric.name] || metric.name}
                                </div>
                                <div className="widget-metric-value" style={{ color: design?.colorScheme?.text || '#111827' }}>
                                    {metric.formatted}
                                </div>
                                {metric.change !== undefined && (
                                    <div className={`metric-change ${metric.change >= 0 ? 'positive' : 'negative'}`}>
                                        {metric.change >= 0 ? (
                                            <TrendingUp size={14} />
                                        ) : (
                                            <TrendingDown size={14} />
                                        )}
                                        <span>{Math.abs(metric.change).toFixed(1)}%</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PerformanceOverviewSlide;
