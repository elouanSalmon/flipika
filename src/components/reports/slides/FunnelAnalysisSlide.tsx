import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowDown } from 'lucide-react';
import { getSlideData } from '../../../services/slideService';
import Spinner from '../../common/Spinner';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import './FunnelAnalysisSlide.css';

interface FunnelAnalysisSlideProps {
    config: SlideConfig;
    design: ReportDesign;
    accountId: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    editable?: boolean;
    reportId?: string;
}

interface FunnelStep {
    id: string;
    label: string;
    value: number;
    color: string;
    percentage: number; // Percentage of max value (for bar width)
    conversionRate?: number; // Conversion from previous step
}

const FunnelAnalysisSlide: React.FC<FunnelAnalysisSlideProps> = ({
    config,
    design,
    accountId,
    campaignIds,
    startDate,
    endDate,
    editable = false,
    reportId,
}) => {
    const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMockData, setIsMockData] = useState(false);

    // Compute effective scope
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

            if (data.metrics) {
                // Process metrics into funnel steps
                // Expected format from service: { metrics: [{ name: 'impressions', value: 1000 }, ...], isMockData: boolean }
                const impressions = data.metrics.find((m: any) => m.name === 'impressions')?.value || 0;
                const clicks = data.metrics.find((m: any) => m.name === 'clicks')?.value || 0;
                const conversions = data.metrics.find((m: any) => m.name === 'conversions')?.value || 0;

                const maxVal = Math.max(impressions, 1); // Avoid division by zero

                const steps: FunnelStep[] = [
                    {
                        id: 'impressions',
                        label: 'Impressions',
                        value: impressions,
                        color: design?.colorScheme?.primary || '#3b82f6',
                        percentage: 100, // Always full width
                        conversionRate: undefined, // First step
                    },
                    {
                        id: 'clicks',
                        label: 'Clics',
                        value: clicks,
                        color: design?.colorScheme?.secondary || '#6b7280',
                        percentage: (clicks / maxVal) * 100,
                        conversionRate: impressions > 0 ? (clicks / impressions) * 100 : 0,
                    },
                    {
                        id: 'conversions',
                        label: 'Conversions',
                        value: conversions,
                        color: design.colorScheme.accent,
                        percentage: (conversions / maxVal) * 100, // Relative to Impressions visually might be too small, key off previous? 
                        // Visualizing funnel usually keeps first bar 100%, but if dropoff is huge, bars become invisible.
                        // Better visualization: Scaled relative to previous? Or Log scale? 
                        // Let's stick to % of Impressions for visual truth, but maybe min-width ensures visibility.
                        conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
                    },
                ];

                setFunnelData(steps);
                setIsMockData(data.isMockData || false);
            }
        } catch (err) {
            console.error('Error loading funnel data:', err);
            setError('Impossible de charger les données du tunnel');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num);
    };

    const formatPercent = (num?: number) => {
        if (num === undefined) return '';
        return `${num.toFixed(2)}%`;
    };

    if (loading) {
        return (
            <div className="funnel-analysis-widget loading">
                <div className="widget-header">
                    <h3>Analyse de conversion</h3>
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
            <div className="funnel-analysis-widget error">
                <div className="widget-header">
                    <h3>Analyse de conversion</h3>
                </div>
                <div className="widget-content">
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    const hasData = funnelData.some(step => step.value > 0);

    if (!hasData) {
        return (
            <div className="funnel-analysis-widget empty">
                <div className="widget-header">
                    <h3>Analyse de conversion</h3>
                    {editable && (
                        <button className="widget-settings-btn" onClick={() => {/* TODO: Open settings */ }}>
                            ⚙️
                        </button>
                    )}
                </div>
                <div className="widget-content">
                    <div className="empty-state">
                        <p>Aucune donnée disponible pour le tunnel</p>
                        <p className="empty-hint">Sélectionnez des campagnes pour afficher le graphique</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`funnel-analysis-widget ${design.mode === 'dark' ? 'dark-mode' : ''}`}
            style={{
                backgroundColor: design?.colorScheme?.background || '#ffffff',
                color: design?.colorScheme?.text || '#111827',
                padding: '24px',
                height: '100%',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column'
            } as React.CSSProperties}
        >
            <div className="flex items-center justify-between mb-8">
                <h3 style={{
                    color: design?.colorScheme?.text || '#111827',
                    fontSize: '18px',
                    fontWeight: 600,
                    margin: 0
                }}>
                    Analyse de conversion
                </h3>
                {isMockData && (
                    <span
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full"
                        style={{
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fcd34d'
                        }}
                        title="Données de démonstration - Connectez un compte Google Ads pour voir vos données réelles"
                    >
                        <AlertTriangle size={12} />
                        Mode Démo
                    </span>
                )}
                {editable && (
                    <button className="widget-settings-btn" onClick={() => {/* TODO: Open settings */ }}>
                        ⚙️
                    </button>
                )}
            </div>

            <div className="widget-content flex-1 flex flex-col justify-center">
                <div className="funnel-container flex flex-col gap-4">
                    {funnelData.map((step) => (
                        <div key={step.id} className="funnel-step relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="funnel-label font-medium" style={{ color: design?.colorScheme?.text || '#111827', fontSize: '14px' }}>
                                    {step.label}
                                </div>
                                <div className="funnel-value font-bold" style={{ color: design?.colorScheme?.text || '#111827', fontSize: '14px' }}>
                                    {formatNumber(step.value)}
                                </div>
                            </div>

                            <div className="funnel-bar-container relative h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                <div
                                    className="funnel-bar h-full rounded-r-lg transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${Math.max(step.percentage, 2)}%`,
                                        backgroundColor: step.color
                                    }}
                                />
                            </div>

                            {/* Conversion Rate Bubble */}
                            {step.conversionRate !== undefined && (
                                <div
                                    className="absolute right-0 top-10 transform translate-y-2 flex flex-col items-center"
                                    style={{ zIndex: 10 }}
                                >
                                    <div
                                        className="text-xs font-medium px-2 py-1 rounded-full shadow-sm flex items-center gap-1"
                                        style={{
                                            backgroundColor: design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'white',
                                            color: design?.colorScheme?.text || '#111827',
                                            border: `1px solid ${design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                                        }}
                                    >
                                        <ArrowDown size={10} />
                                        {formatPercent(step.conversionRate)}
                                    </div>
                                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FunnelAnalysisSlide;
