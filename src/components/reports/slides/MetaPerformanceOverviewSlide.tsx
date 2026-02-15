import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Eye, MousePointer, Target, DollarSign, Percent, BarChart3, AlertTriangle, Users } from 'lucide-react';
import { getSlideData } from '../../../services/slideService';
import Spinner from '../../common/Spinner';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import './ChartBlocksShared.css';

interface MetaPerformanceOverviewSlideProps {
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

const META_METRIC_ICONS: Record<string, React.ReactNode> = {
    impressions: <Eye size={20} />,
    clicks: <MousePointer size={20} />,
    conversions: <Target size={20} />,
    spend: <DollarSign size={20} />,
    ctr: <Percent size={20} />,
    cpc: <DollarSign size={20} />,
    cpm: <DollarSign size={20} />,
    reach: <Users size={20} />,
    frequency: <BarChart3 size={20} />,
    roas: <BarChart3 size={20} />,
};

const META_METRIC_LABELS: Record<string, string> = {
    impressions: 'Impressions',
    clicks: 'Clics',
    conversions: 'Conversions',
    spend: 'Budget',
    ctr: 'CTR',
    cpc: 'CPC',
    cpm: 'CPM',
    reach: 'Couverture',
    frequency: 'Frequence',
    roas: 'ROAS',
};

const MetaPerformanceOverviewSlide: React.FC<MetaPerformanceOverviewSlideProps> = ({
    config,
    design,
    accountId,
    campaignIds,
    startDate,
    endDate,
    reportId,
}) => {
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMockData, setIsMockData] = useState(false);

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

            const rawMetrics = data.metrics || [];
            const uniqueMetrics = Array.from(
                new Map(rawMetrics.map((m: MetricData) => [m.name, m])).values()
            ).slice(0, 6);

            setMetrics(uniqueMetrics as MetricData[]);
            setIsMockData(data.isMockData || false);
        } catch (err) {
            console.error('Error loading Meta widget data:', err);
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
            borderColor: design?.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            color: design?.colorScheme?.text || '#050505',
        } as React.CSSProperties}>
            <div className="chart-block-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/meta-ads.svg" alt="Meta" style={{ width: '20px', height: '20px' }} />
                    <h3 className="chart-block-title">Meta Ads - Vue d'ensemble</h3>
                </div>
                {isMockData && (
                    <span className="chart-mock-badge" title="Donnees de demonstration - Connectez votre compte Meta Ads pour voir vos vraies donnees">
                        <AlertTriangle size={12} />
                        Demo
                    </span>
                )}
            </div>

            <div className="chart-block-content">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {metrics.map((metric) => (
                        <div key={metric.name} className="chart-metric-card" style={{
                            backgroundColor: design?.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                            borderColor: design?.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div className="chart-icon-container" style={{ background: 'var(--widget-primary)' }}>
                                    {META_METRIC_ICONS[metric.name] || <BarChart3 size={20} />}
                                </div>
                                <div className="chart-metric-info">
                                    <div className="chart-metric-label">
                                        {META_METRIC_LABELS[metric.name] || metric.name}
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

export default MetaPerformanceOverviewSlide;
