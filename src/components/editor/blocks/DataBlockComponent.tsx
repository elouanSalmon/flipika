import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useMemo } from 'react';
import { Settings, Trash2 } from 'lucide-react';
import { useReportEditor } from '../../../contexts/ReportEditorContext';
import { SlideType } from '../../../types/reportTypes';
import type { SlideConfig } from '../../../types/reportTypes';
import { ChartBlockErrorBoundary } from './ChartBlockErrorBoundary';

// Import real slide components
import CampaignChartSlide from '../../reports/slides/CampaignChartSlide';
import AdCreativeSlide from '../../reports/slides/AdCreativeSlide';
import FunnelAnalysisSlide from '../../reports/slides/FunnelAnalysisSlide';
import HeatmapSlide from '../../reports/slides/HeatmapSlide';
import DevicePlatformSplitSlide from '../../reports/slides/DevicePlatformSplitSlide';
import TopPerformersSlide from '../../reports/slides/TopPerformersSlide';
import ClientLogoBlock from './ClientLogoBlock';
import FlexibleDataBlock from './FlexibleDataBlock';
import type { FlexibleDataConfig } from './FlexibleDataBlock';

// Default configurations for standard blocks
const PERF_OVERVIEW_DEFAULT_CONFIG: FlexibleDataConfig = {
    title: "Vue d'ensemble des performances",
    visualization: 'scorecard',
    metrics: ['metrics.impressions', 'metrics.clicks', 'metrics.cost_micros', 'metrics.conversions', 'metrics.ctr', 'metrics.average_cpc'],
    dimension: 'segments.date',
    showComparison: true,
    comparisonType: 'previous_period'
};

const KEY_METRICS_DEFAULT_CONFIG: FlexibleDataConfig = {
    title: "Métriques Clés",
    visualization: 'scorecard',
    metrics: ['metrics.cost_micros', 'metrics.conversions_value', 'metrics.conversions_value_per_cost', 'metrics.cost_per_conversion'],
    dimension: 'segments.date',
    showComparison: true,
    comparisonType: 'previous_period'
};

const CAMPAIGN_CHART_DEFAULT_CONFIG: FlexibleDataConfig = {
    title: "Graphique de Campagne",
    visualization: 'line',
    metrics: ['metrics.clicks'],
    dimension: 'segments.date',
    showComparison: true,
    comparisonType: 'previous_period'
};

const DEVICE_SPLIT_DEFAULT_CONFIG: FlexibleDataConfig = {
    title: "Répartition par Appareil",
    visualization: 'pie',
    metrics: ['metrics.clicks'],
    dimension: 'segments.device',
    limit: 10
};

const TOP_PERFORMERS_DEFAULT_CONFIG: FlexibleDataConfig = {
    title: "Meilleurs Éléments",
    visualization: 'table',
    metrics: ['metrics.impressions', 'metrics.clicks', 'metrics.cost_micros', 'metrics.conversions', 'metrics.ctr'],
    dimension: 'campaign.name',
    limit: 10,
    sortBy: 'metrics.conversions',
    sortOrder: 'DESC'
};

/**
 * Data Block Component (Epic 13 - Story 13.2)
 *
 * Renders the appropriate slide component based on the block type.
 * Uses ReportEditorContext to provide design and data context.
 * In template mode, blocks always show demo data.
 */
export const DataBlockComponent = (props: NodeViewProps) => {
    const { node, deleteNode, selected, editor, updateAttributes } = props;
    const { blockType, config } = node.attrs;
    const { design, accountId, campaignIds, reportId, isTemplateMode, startDate, endDate } = useReportEditor();

    if (!design) {
        return (
            <NodeViewWrapper className="data-block-wrapper error">
                <div className="p-4 text-red-500">Error: Missing design context</div>
            </NodeViewWrapper>
        );
    }

    // In template mode, use empty values to force demo data
    const effectiveAccountId = isTemplateMode ? '' : accountId;
    const effectiveCampaignIds = isTemplateMode ? [] : campaignIds;

    // Synthesize a SlideConfig-like object for the component
    const slideConfig: SlideConfig = useMemo(() => ({
        id: node.attrs.id || `block-${Date.now()}`,
        type: blockType as SlideType,
        accountId: effectiveAccountId,
        campaignIds: effectiveCampaignIds,
        startDate: startDate,
        endDate: endDate,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: config || {},
        ...config
    }), [node.attrs.id, blockType, config, effectiveAccountId, effectiveCampaignIds, startDate, endDate]);

    const renderBlock = () => {
        switch (blockType) {
            case SlideType.PERFORMANCE_OVERVIEW:
            case 'performance':
                return (
                    <FlexibleDataBlock
                        config={{ ...PERF_OVERVIEW_DEFAULT_CONFIG, ...(config as any) }}
                        onUpdateConfig={(newConfig: Partial<FlexibleDataConfig>) => {
                            updateAttributes({
                                config: { ...config, ...newConfig }
                            });
                        }}
                        editable={editor.isEditable}
                        accountId={effectiveAccountId}
                        campaignIds={effectiveCampaignIds}
                        startDate={startDate}
                        endDate={endDate}
                        design={design}
                    />
                );
            case SlideType.CAMPAIGN_CHART:
            case 'chart':
                return (
                    <FlexibleDataBlock
                        config={{ ...CAMPAIGN_CHART_DEFAULT_CONFIG, ...(config as any) }}
                        onUpdateConfig={(newConfig: Partial<FlexibleDataConfig>) => {
                            updateAttributes({
                                config: { ...config, ...newConfig }
                            });
                        }}
                        editable={editor.isEditable}
                        accountId={effectiveAccountId}
                        campaignIds={effectiveCampaignIds}
                        startDate={startDate}
                        endDate={endDate}
                        design={design}
                    />
                );
            case SlideType.KEY_METRICS:
            case 'keyMetrics':
                return (
                    <FlexibleDataBlock
                        config={{ ...KEY_METRICS_DEFAULT_CONFIG, ...(config as any) }}
                        onUpdateConfig={(newConfig: Partial<FlexibleDataConfig>) => {
                            updateAttributes({
                                config: { ...config, ...newConfig }
                            });
                        }}
                        editable={editor.isEditable}
                        accountId={effectiveAccountId}
                        campaignIds={effectiveCampaignIds}
                        startDate={startDate}
                        endDate={endDate}
                        design={design}
                    />
                );
            case SlideType.AD_CREATIVE:
                return (
                    <AdCreativeSlide
                        accountId={effectiveAccountId}
                        campaignIds={effectiveCampaignIds}
                        startDate={startDate}
                        endDate={endDate}
                        config={slideConfig}
                        design={design}
                        reportId={reportId}
                        isTemplateMode={isTemplateMode}
                    />
                );
            case SlideType.FUNNEL_ANALYSIS:
                return (
                    <FunnelAnalysisSlide
                        accountId={effectiveAccountId}
                        campaignIds={effectiveCampaignIds}
                        startDate={startDate}
                        endDate={endDate}
                        config={slideConfig}
                        design={design}
                        reportId={reportId}
                        isTemplateMode={isTemplateMode}
                    />
                );
            case SlideType.HEATMAP:
                return (
                    <HeatmapSlide
                        accountId={effectiveAccountId}
                        campaignIds={effectiveCampaignIds}
                        startDate={startDate}
                        endDate={endDate}
                        config={slideConfig}
                        design={design}
                        reportId={reportId}
                        isTemplateMode={isTemplateMode}
                    />
                );
            case SlideType.DEVICE_PLATFORM_SPLIT:
                return (
                    <FlexibleDataBlock
                        config={{ ...DEVICE_SPLIT_DEFAULT_CONFIG, ...(config as any) }}
                        onUpdateConfig={(newConfig: Partial<FlexibleDataConfig>) => {
                            updateAttributes({
                                config: { ...config, ...newConfig }
                            });
                        }}
                        editable={editor.isEditable}
                        accountId={effectiveAccountId}
                        campaignIds={effectiveCampaignIds}
                        startDate={startDate}
                        endDate={endDate}
                        design={design}
                    />
                );
            case SlideType.TOP_PERFORMERS:
                return (
                    <FlexibleDataBlock
                        config={{ ...TOP_PERFORMERS_DEFAULT_CONFIG, ...(config as any) }}
                        onUpdateConfig={(newConfig: Partial<FlexibleDataConfig>) => {
                            updateAttributes({
                                config: { ...config, ...newConfig }
                            });
                        }}
                        editable={editor.isEditable}
                        accountId={effectiveAccountId}
                        campaignIds={effectiveCampaignIds}
                        startDate={startDate}
                        endDate={endDate}
                        design={design}
                    />
                );
            case 'clientLogo':
                return <ClientLogoBlock />;
            case SlideType.FLEXIBLE_DATA:
                return (
                    <FlexibleDataBlock
                        config={config as FlexibleDataConfig}
                        onUpdateConfig={(newConfig: Partial<FlexibleDataConfig>) => {
                            updateAttributes({
                                config: { ...config, ...newConfig }
                            });
                        }}
                        editable={editor.isEditable}
                        accountId={effectiveAccountId}
                        campaignIds={effectiveCampaignIds}
                        startDate={startDate}
                        endDate={endDate}
                        design={design}
                    />
                );
            default:
                return (
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-600 dark:text-gray-400">
                            Unsupported block type: {blockType}
                        </p>
                    </div>
                );
        }
    };

    return (
        <NodeViewWrapper
            className={`data-block-wrapper ${selected ? 'selected' : ''}`}
            data-block-type={blockType}
        >
            <div className="relative group">
                <ChartBlockErrorBoundary blockType={blockType}>
                    {renderBlock()}
                </ChartBlockErrorBoundary>

                {selected && editor.isEditable && (
                    <div className="data-block-actions">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (blockType === SlideType.FLEXIBLE_DATA) {
                                    updateAttributes({
                                        config: { ...config, isConfigActive: true }
                                    });
                                } else {
                                    console.log('Configure block:', blockType);
                                    // Also allow configuring these new flexible blocks
                                    if (['performance', 'keyMetrics', SlideType.PERFORMANCE_OVERVIEW, SlideType.KEY_METRICS, SlideType.CAMPAIGN_CHART, SlideType.DEVICE_PLATFORM_SPLIT, SlideType.TOP_PERFORMERS].includes(blockType)) {
                                        updateAttributes({
                                            config: { ...config, isConfigActive: true }
                                        });
                                    }
                                }
                            }}
                            className="data-block-action-btn"
                            title="Configure"
                        >
                            <Settings size={16} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteNode();
                            }}
                            className="data-block-action-btn danger"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};
