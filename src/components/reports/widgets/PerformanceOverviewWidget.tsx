import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Eye, MousePointer, Target, DollarSign, Percent, BarChart3 } from 'lucide-react';
import { getWidgetData } from '../../../services/widgetService';
import Spinner from '../../common/Spinner';
import type { WidgetConfig } from '../../../types/reportTypes';
import './PerformanceOverviewWidget.css';

interface PerformanceOverviewWidgetProps {
    config: WidgetConfig;
    accountId: string;
    campaignIds?: string[];
    editable?: boolean;
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

const PerformanceOverviewWidget: React.FC<PerformanceOverviewWidgetProps> = ({
    config,
    accountId,
    campaignIds,
    editable = false,
}) => {
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [config, accountId, campaignIds]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getWidgetData(config, accountId, campaignIds);
            setMetrics(data.metrics || []);
        } catch (err) {
            console.error('Error loading widget data:', err);
            setError('Impossible de charger les données');
        } finally {
            setLoading(false);
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
        <div className="performance-overview-widget">
            <div className="widget-header">
                <h3>Vue d'ensemble des performances</h3>
                {editable && (
                    <button className="widget-settings-btn" onClick={() => {/* TODO: Open settings */ }}>
                        ⚙️
                    </button>
                )}
            </div>

            <div className="widget-content">
                <div className="metrics-grid">
                    {metrics.map((metric) => (
                        <div key={metric.name} className="metric-card">
                            <div className="metric-icon">
                                {METRIC_ICONS[metric.name] || <BarChart3 size={20} />}
                            </div>
                            <div className="metric-info">
                                <div className="metric-label">
                                    {METRIC_LABELS[metric.name] || metric.name}
                                </div>
                                <div className="metric-value">{metric.formatted}</div>
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

export default PerformanceOverviewWidget;
