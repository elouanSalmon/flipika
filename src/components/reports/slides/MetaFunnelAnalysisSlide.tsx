import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getSlideData } from '../../../services/slideService';
import Spinner from '../../common/Spinner';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import './ChartBlocksShared.css';

interface MetaFunnelAnalysisSlideProps {
    config: SlideConfig;
    design: ReportDesign;
    accountId: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    reportId?: string;
}

interface FunnelStep {
    label: string;
    value: number;
    formatted: string;
    color: string;
}

const MetaFunnelAnalysisSlide: React.FC<MetaFunnelAnalysisSlideProps> = ({
    config,
    design,
    accountId,
    campaignIds,
    startDate,
    endDate,
    reportId,
}) => {
    const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([]);
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

            const metrics = data.metrics || [];
            const isMock = data.isMockData || false;

            // Build funnel: Reach → Impressions → Clicks → Conversions
            const findMetric = (name: string) => {
                const m = metrics.find((me: any) => me.name === name);
                return m ? m.value : 0;
            };

            const reach = findMetric('reach') || findMetric('impressions') * 0.7;
            const impressions = findMetric('impressions');
            const clicks = findMetric('clicks');
            const conversions = findMetric('conversions');

            const primary = design?.colorScheme?.primary || '#0064E0';

            const steps: FunnelStep[] = [
                {
                    label: 'Couverture',
                    value: reach,
                    formatted: formatNumber(reach),
                    color: adjustOpacity(primary, 1),
                },
                {
                    label: 'Impressions',
                    value: impressions,
                    formatted: formatNumber(impressions),
                    color: adjustOpacity(primary, 0.8),
                },
                {
                    label: 'Clics',
                    value: clicks,
                    formatted: formatNumber(clicks),
                    color: adjustOpacity(primary, 0.6),
                },
                {
                    label: 'Conversions',
                    value: conversions,
                    formatted: formatNumber(conversions),
                    color: adjustOpacity(primary, 0.4),
                },
            ];

            setFunnelSteps(steps);
            setIsMockData(isMock);
        } catch (err) {
            console.error('Error loading Meta funnel data:', err);
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

    const maxValue = Math.max(...funnelSteps.map(s => s.value), 1);

    return (
        <div className="chart-block-card" style={{
            '--widget-primary': design?.colorScheme?.primary || 'var(--color-primary)',
            backgroundColor: design?.colorScheme?.background || '#ffffff',
            borderColor: design?.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            color: design?.colorScheme?.text || '#050505',
        } as React.CSSProperties}>
            <div className="chart-block-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/meta-ads.svg" alt="Meta" style={{ width: '20px', height: '20px' }} />
                    <h3 className="chart-block-title">Meta Ads - Tunnel de conversion</h3>
                </div>
                {isMockData && (
                    <span className="chart-mock-badge" title="Donnees de demonstration">
                        <AlertTriangle size={12} />
                        Demo
                    </span>
                )}
            </div>

            <div className="chart-block-content">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0' }}>
                    {funnelSteps.map((step, index) => {
                        const widthPercent = maxValue > 0 ? Math.max((step.value / maxValue) * 100, 15) : 15;
                        const convRate = index > 0 && funnelSteps[index - 1].value > 0
                            ? ((step.value / funnelSteps[index - 1].value) * 100).toFixed(1)
                            : null;

                        return (
                            <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '100px', fontSize: '13px', fontWeight: 500, textAlign: 'right', flexShrink: 0 }}>
                                    {step.label}
                                </div>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <div style={{
                                        width: `${widthPercent}%`,
                                        height: '40px',
                                        backgroundColor: step.color,
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        transition: 'width 0.5s ease',
                                        minWidth: '80px',
                                    }}>
                                        {step.formatted}
                                    </div>
                                </div>
                                <div style={{ width: '60px', fontSize: '12px', color: design?.colorScheme?.text || '#666', opacity: 0.7, flexShrink: 0 }}>
                                    {convRate ? `${convRate}%` : ''}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

function formatNumber(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat('fr-FR').format(Math.round(value));
}

function adjustOpacity(hexColor: string, opacity: number): string {
    // Convert hex to rgba
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default MetaFunnelAnalysisSlide;
