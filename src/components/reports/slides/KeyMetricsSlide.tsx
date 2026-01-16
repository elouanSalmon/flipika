import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, AlertTriangle } from 'lucide-react';
import { getSlideData } from '../../../services/slideService';
import Spinner from '../../common/Spinner';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import './KeyMetricsSlide.css';

interface KeyMetricsSlideProps {
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
    label: string;
    value: number;
    formatted: string;
    change?: number;
    icon: React.ReactNode;
}

const KeyMetricsSlide: React.FC<KeyMetricsSlideProps> = ({
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

            // Extract the 4 key metrics from the data
            const rawMetrics = data.metrics || [];

            // Map to our 4 key metrics with icons
            const keyMetrics: MetricData[] = [
                {
                    name: 'cost',
                    label: 'Dépenses',
                    value: rawMetrics.find((m: any) => m.name === 'cost')?.value || 0,
                    formatted: rawMetrics.find((m: any) => m.name === 'cost')?.formatted || '0 €',
                    change: rawMetrics.find((m: any) => m.name === 'cost')?.change,
                    icon: <DollarSign size={24} />,
                },
                {
                    name: 'conversion_value',
                    label: 'Revenus',
                    value: rawMetrics.find((m: any) => m.name === 'conversion_value')?.value || 0,
                    formatted: rawMetrics.find((m: any) => m.name === 'conversion_value')?.formatted || '0 €',
                    change: rawMetrics.find((m: any) => m.name === 'conversion_value')?.change,
                    icon: <Target size={24} />,
                },
                {
                    name: 'roas',
                    label: 'ROAS',
                    value: rawMetrics.find((m: any) => m.name === 'roas')?.value || 0,
                    formatted: rawMetrics.find((m: any) => m.name === 'roas')?.formatted || '0.0',
                    change: rawMetrics.find((m: any) => m.name === 'roas')?.change,
                    icon: <BarChart3 size={24} />,
                },
                {
                    name: 'cpa',
                    label: 'CPA',
                    value: rawMetrics.find((m: any) => m.name === 'cpa')?.value || 0,
                    formatted: rawMetrics.find((m: any) => m.name === 'cpa')?.formatted || '0 €',
                    change: rawMetrics.find((m: any) => m.name === 'cpa')?.change,
                    icon: <DollarSign size={24} />,
                },
            ];

            setMetrics(keyMetrics);
            setIsMockData(data.isMockData || false);
        } catch (err) {
            console.error('Error loading widget data:', err);
            setError('Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const getCardBackground = () => {
        if (design.mode === 'dark') {
            return 'rgba(30, 41, 59, 0.6)';
        } else {
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
            <div className="key-metrics-widget loading">
                <div className="widget-header">
                    <h3>Métriques Clés</h3>
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
            <div className="key-metrics-widget error">
                <div className="widget-header">
                    <h3>Métriques Clés</h3>
                </div>
                <div className="widget-content">
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="key-metrics-widget"
            style={{
                '--widget-primary': design?.colorScheme?.primary || '#3b82f6',
                '--widget-text': design?.colorScheme?.text || '#111827',
                '--widget-background': design?.colorScheme?.background || '#ffffff',
                background: design?.colorScheme?.background || '#ffffff',
                color: design?.colorScheme?.text || '#111827',
            } as React.CSSProperties}
        >
            <div className="widget-header">
                <h3 style={{ color: design?.colorScheme?.secondary || '#6b7280' }}>Métriques Clés</h3>
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
                <div className="key-metrics-grid">
                    {metrics.map((metric) => (
                        <div
                            key={metric.name}
                            className="key-metric-card"
                            style={{
                                background: getCardBackground(),
                                borderColor: getCardBorder(),
                            }}
                        >
                            <div className="metric-header">
                                <div
                                    className="metric-icon"
                                    style={{
                                        background: design.colorScheme.primary,
                                        color: '#ffffff',
                                    }}
                                >
                                    {metric.icon}
                                </div>
                                <div className="metric-info">
                                    <div className="widget-metric-label" style={{ color: design.colorScheme.secondary }}>
                                        {metric.label}
                                    </div>
                                    <div className="widget-metric-value" style={{ color: design.colorScheme.text }}>
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KeyMetricsSlide;
