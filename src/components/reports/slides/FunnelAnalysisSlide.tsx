import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AlertTriangle, ArrowDown, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';
import { getSlideData } from '../../../services/slideService';
import { generateBlockAnalysis } from '../../../services/aiService';
import { generateConfigHash } from '../../../hooks/useGenerateAnalysis';
import ReportBlock from '../../editor/blocks/ReportBlock';
import type { SlideConfig, ReportDesign } from '../../../types/reportTypes';
import './FunnelAnalysisSlide.css';

export interface FunnelAnalysisConfig {
    description?: string;
    aiAnalysisHash?: string;
}

interface FunnelAnalysisSlideProps {
    config: SlideConfig;
    design: ReportDesign;
    accountId: string;
    campaignIds?: string[];
    startDate?: Date;
    endDate?: Date;
    editable?: boolean;
    reportId?: string;
    isTemplateMode?: boolean;
    onDelete?: () => void;
    onUpdateConfig?: (newConfig: Partial<FunnelAnalysisConfig> & { title?: string }) => void;
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
    onDelete,
    onUpdateConfig,
}) => {
    const { t } = useTranslation('reports');
    const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMockData, setIsMockData] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // AI Analysis generation state
    const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

    // Ref to store captured data for AI generation
    const capturedDataRef = useRef<{
        impressions: number;
        clicks: number;
        conversions: number;
    }>({ impressions: 0, clicks: 0, conversions: 0 });

    // Get description from config settings
    const description = config.settings?.description as string | undefined;
    const aiAnalysisHash = config.settings?.aiAnalysisHash as string | undefined;
    const blockTitle = config.settings?.title || t('Funnel Analysis', 'Analyse de conversion');

    // Check if description is stale
    const descriptionIsStale = Boolean(description && aiAnalysisHash && (() => {
        const currentHash = generateConfigHash({
            title: 'Funnel Analysis',
            metrics: ['metrics.impressions', 'metrics.clicks', 'metrics.conversions'],
            visualization: 'table',
        }, startDate, endDate);
        return currentHash !== aiAnalysisHash;
    })());

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
                        color: design?.colorScheme?.accent || '#93c5fd',
                        percentage: (conversions / maxVal) * 100, // Relative to Impressions visually might be too small, key off previous? 
                        // Visualizing funnel usually keeps first bar 100%, but if dropoff is huge, bars become invisible.
                        // Better visualization: Scaled relative to previous? Or Log scale? 
                        // Let's stick to % of Impressions for visual truth, but maybe min-width ensures visibility.
                        conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
                    },
                ];

                setFunnelData(steps);
                setIsMockData(data.isMockData || false);

                // Capture data for AI generation
                capturedDataRef.current = { impressions, clicks, conversions };
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

    // Handle AI analysis generation (for bulk generation)
    const handleBulkGenerateAnalysis = useCallback(async () => {
        // Skip if already has description or no dates or not editable
        if (description || !startDate || !endDate || !editable || !onUpdateConfig) {
            return;
        }

        // Skip if no data captured yet
        if (capturedDataRef.current.impressions === 0 && capturedDataRef.current.clicks === 0) {
            return;
        }

        setIsGeneratingAnalysis(true);
        window.dispatchEvent(new CustomEvent('flipika:ai-generation-start'));

        try {
            const formatDate = (d: Date | string) => {
                const date = new Date(d);
                return date.toISOString().split('T')[0];
            };

            const { impressions, clicks, conversions } = capturedDataRef.current;
            const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
            const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

            const result = await generateBlockAnalysis({
                blockTitle: 'Analyse de conversion (Funnel)',
                visualization: 'funnel',
                metrics: ['metrics.impressions', 'metrics.clicks', 'metrics.conversions'],
                dimension: undefined,
                period: {
                    start: formatDate(startDate),
                    end: formatDate(endDate)
                },
                currentData: [{
                    'metrics.impressions': impressions,
                    'metrics.clicks': clicks,
                    'metrics.conversions': conversions,
                    'metrics.ctr': ctr,
                    'conversion_rate': conversionRate
                }],
                comparisonData: undefined,
                showComparison: false
            });

            // Generate hash for staleness detection
            const hash = generateConfigHash({
                title: 'Funnel Analysis',
                metrics: ['metrics.impressions', 'metrics.clicks', 'metrics.conversions'],
                visualization: 'table',
            }, startDate, endDate);

            // Update config directly
            onUpdateConfig({
                description: result.analysis,
                aiAnalysisHash: hash
            });

        } catch (error) {
            console.error('Error generating analysis (bulk) for funnel:', error);
        } finally {
            setIsGeneratingAnalysis(false);
            window.dispatchEvent(new CustomEvent('flipika:ai-generation-end'));
        }
    }, [description, startDate, endDate, editable, onUpdateConfig]);

    // Listen for "Generate All" event
    useEffect(() => {
        const handleRequestAllAnalyses = () => {
            handleBulkGenerateAnalysis();
        };

        window.addEventListener('flipika:request-all-analyses', handleRequestAllAnalyses);
        return () => {
            window.removeEventListener('flipika:request-all-analyses', handleRequestAllAnalyses);
        };
    }, [handleBulkGenerateAnalysis]);

    const handleSave = (title: string) => {
        onUpdateConfig?.({ title });
        setIsConfigOpen(false);
    };

    const ConfigModal = (
        <AnimatePresence>
            {isConfigOpen && (
                <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsConfigOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-[var(--color-bg-primary)] rounded-3xl shadow-2xl flex flex-col w-[500px] max-w-full overflow-hidden border border-[var(--color-border)]"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                            <h4 className="text-xl font-bold">{t('flexibleBlock.modalTitle', 'Paramètres')}</h4>
                            <button onClick={() => setIsConfigOpen(false)} className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <section>
                                <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2">{t('flexibleBlock.fields.title', 'Titre')}</label>
                                <input
                                    type="text"
                                    defaultValue={blockTitle}
                                    onBlur={(e) => handleSave(e.target.value)}
                                    className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
                                />
                            </section>
                        </div>
                        <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-3">
                            <button onClick={() => setIsConfigOpen(false)} className="btn btn-primary px-6">{t('flexibleBlock.actions.update', 'Enregistrer')}</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    const hasData = funnelData.some(step => step.value > 0);

    const headerContent = isMockData ? (
        <span
            className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-full"
            style={{
                backgroundColor: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fcd34d'
            }}
            title="Données de démonstration - Connectez un compte Google Ads pour voir vos données réelles"
        >
            <AlertTriangle size={10} />
            Mode Démo
        </span>
    ) : null;

    if (!hasData && !loading && !error) {
        return (
            <ReportBlock
                title={blockTitle}
                design={design}
                className={`funnel-analysis-widget ${design.mode === 'dark' ? 'dark-mode' : ''}`}
                onEdit={() => setIsConfigOpen(true)}
                onDelete={onDelete}
                editable={editable}
            >
                <div className="empty-state flex flex-col items-center justify-center h-full text-center p-6">
                    <p>Aucune donnée disponible pour le tunnel</p>
                    <p className="empty-hint text-sm opacity-70 mt-2">Sélectionnez des campagnes pour afficher le graphique</p>
                </div>
                {typeof document !== 'undefined' && createPortal(ConfigModal, document.body)}
            </ReportBlock>
        );
    }

    return (
        <div className="h-full">
            <ReportBlock
                title={blockTitle}
                design={design}
                loading={loading}
                error={error}
                editable={editable}
                headerContent={headerContent}
                description={description}
                descriptionIsStale={descriptionIsStale}
                onRegenerateAnalysis={handleBulkGenerateAnalysis}
                isGeneratingAnalysis={isGeneratingAnalysis}
                onEdit={() => setIsConfigOpen(true)}
                onDelete={onDelete}
                className={`funnel-analysis-widget ${design.mode === 'dark' ? 'dark-mode' : ''}`}
            >
                <div className="widget-content flex-1 flex flex-col justify-center overflow-hidden min-h-0 h-full">
                    <div className="funnel-container flex flex-col gap-3 justify-center h-full">
                        {funnelData.map((step) => (
                            <div key={step.id} className="funnel-step relative flex flex-col justify-center flex-1">
                                <div className="flex items-center justify-between mb-1 px-1">
                                    <div className="funnel-label font-medium" style={{ color: design?.colorScheme?.text || '#111827', fontSize: '12px' }}>
                                        {step.label}
                                    </div>
                                    <div className="funnel-value font-bold" style={{ color: design?.colorScheme?.text || '#111827', fontSize: '12px' }}>
                                        {formatNumber(step.value)}
                                    </div>
                                </div>

                                <div
                                    className="funnel-bar-container relative h-full max-h-8 w-full rounded-md overflow-hidden"
                                    style={{ backgroundColor: design.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                                >
                                    <div
                                        className="funnel-bar h-full rounded-r-md transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${Math.max(step.percentage, 2)}%`,
                                            backgroundColor: step.color
                                        }}
                                    />
                                </div>

                                {/* Conversion Rate Bubble */}
                                {step.conversionRate !== undefined && (
                                    <div
                                        className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-2/3 flex flex-col items-center z-20"
                                    >
                                        <div
                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5"
                                            style={{
                                                backgroundColor: design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'white',
                                                color: design?.colorScheme?.text || '#111827',
                                                border: `1px solid ${design.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                                backdropFilter: 'blur(4px)'
                                            }}
                                        >
                                            <ArrowDown size={8} />
                                            {formatPercent(step.conversionRate)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </ReportBlock>
            {typeof document !== 'undefined' && require('react-dom').createPortal(ConfigModal, document.body)}
        </div>
    );
};

export default FunnelAnalysisSlide;
