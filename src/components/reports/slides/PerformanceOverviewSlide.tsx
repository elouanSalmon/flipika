import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Eye, MousePointer, Target, DollarSign, Percent, BarChart3, AlertTriangle } from 'lucide-react';
import { getSlideData } from '../../../services/slideService';
import Spinner from '../../common/Spinner';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import './ChartBlocksShared.css';

interface PerformanceOverviewSlideProps {
    config: SlideConfig;
    design: ReportDesign;
    accountId: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    editable?: boolean;
    reportId?: string;
    isTemplateMode?: boolean;
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
    // editable prop removed as unused
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


    if (loading) {
        return (
            <div className="chart-block-loading">
                <Spinner size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="chart-block-empty">
                {error}
            </div>
        );
    }

    return (
        <div className="chart-block-card" style={{
            '--widget-primary': design?.colorScheme?.primary || 'var(--color-primary)',
            '--widget-secondary': design?.colorScheme?.secondary || 'var(--color-text-secondary)',
            backgroundColor: design?.colorScheme?.background || '#ffffff',
            // Border color based on report theme mode, NOT app theme
            borderColor: design?.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            color: design?.colorScheme?.text || '#050505',
        } as React.CSSProperties}>
            <div className="chart-block-header">
                <h3 className="chart-block-title">Vue d'ensemble des performances</h3>
                {isMockData && (
                    <span className="chart-mock-badge" title="Données de démonstration - Connectez votre compte Google Ads pour voir vos vraies données">
                        <AlertTriangle size={12} />
                        Démo
                    </span>
                )}
            </div>

            <div className="chart-block-content">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {metrics.map((metric) => (
                        <div key={metric.name} className="chart-metric-card" style={{
                            // Background based on report theme mode
                            backgroundColor: design?.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                            // Border purely for dark mode separation if needed, otherwise clean
                            borderColor: design?.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div className="chart-icon-container" style={{ background: 'var(--widget-primary)' }}>
                                    {METRIC_ICONS[metric.name] || <BarChart3 size={20} />}
                                </div>
                                <div className="chart-metric-info">
                                    <div className="chart-metric-label">
                                        {METRIC_LABELS[metric.name] || metric.name}
                                    </div>
                                    <div className="chart-metric-value">
                                        {metric.formatted}
                                    </div>
                                    {metric.change !== undefined && (
                                        <div className={`chart-metric-change ${metric.change >= 0 ? 'positive' : 'negative'}`}>
                                            {metric.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            <span>{Math.abs(metric.change).toFixed(1)}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PerformanceOverviewSlide;
