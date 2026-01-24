import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useMemo } from 'react';
import { Settings, Trash2 } from 'lucide-react';
import { useReportEditor } from '../../../contexts/ReportEditorContext';
import { SlideType } from '../../../types/reportTypes';
import type { SlideConfig } from '../../../types/reportTypes';
import { ChartBlockErrorBoundary } from './ChartBlockErrorBoundary';

// Import real slide components
import PerformanceOverviewSlide from '../../reports/slides/PerformanceOverviewSlide';
import CampaignChartSlide from '../../reports/slides/CampaignChartSlide';
import KeyMetricsSlide from '../../reports/slides/KeyMetricsSlide';
import AdCreativeSlide from '../../reports/slides/AdCreativeSlide';
import FunnelAnalysisSlide from '../../reports/slides/FunnelAnalysisSlide';
import HeatmapSlide from '../../reports/slides/HeatmapSlide';
import DevicePlatformSplitSlide from '../../reports/slides/DevicePlatformSplitSlide';
import TopPerformersSlide from '../../reports/slides/TopPerformersSlide';
import ClientLogoBlock from './ClientLogoBlock';
import FlexibleDataBlock from './FlexibleDataBlock';
import type { FlexibleDataConfig } from './FlexibleDataBlock';

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
                    <PerformanceOverviewSlide
                        accountId={effectiveAccountId}
                        campaignIds={effectiveCampaignIds}
                        startDate={startDate}
                        endDate={endDate}
                        config={slideConfig}
                        design={design}
                        reportId={reportId}
                        editable={false}
                        isTemplateMode={isTemplateMode}
                    />
                );
            case SlideType.CAMPAIGN_CHART:
            case 'chart':
                return (
                    <CampaignChartSlide
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
            case SlideType.KEY_METRICS:
            case 'keyMetrics':
                return (
                    <KeyMetricsSlide
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
                    <DevicePlatformSplitSlide
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
            case SlideType.TOP_PERFORMERS:
                return (
                    <TopPerformersSlide
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
