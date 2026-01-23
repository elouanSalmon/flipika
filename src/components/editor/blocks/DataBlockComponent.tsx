import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
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

/**
 * Data Block Component (Epic 13 - Story 13.2)
 * 
 * Renders the appropriate slide component based on the block type.
 * Uses ReportEditorContext to provide design and data context.
 */
export const DataBlockComponent = ({ node, deleteNode, selected }: NodeViewProps) => {
    const { blockType, config } = node.attrs;
    const { design, accountId, campaignIds, reportId } = useReportEditor();

    if (!design) {
        return <div className="p-4 text-red-500">Error: Missing design context</div>;
    }

    // Synthesize a SlideConfig-like object for the component
    // We use a stable ID from the node or generate one if needed (though node ID is best if available)
    // Tiptap nodes don't inherently have IDs unless configured. We'll use a dummy ID or a generated property if saved.
    const slideConfig: SlideConfig = {
        id: node.attrs.id || `block-${Date.now()}`,
        type: blockType as SlideType,
        accountId,
        campaignIds,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: config || {},
        ...config // Spread config directly as well in case component uses top-level props (mocking full SlideConfig properties)
    };

    const renderBlock = () => {
        switch (blockType) {
            case SlideType.PERFORMANCE_OVERVIEW:
            case 'performance': // Legacy/Alias
                return (
                    <PerformanceOverviewSlide
                        accountId={accountId}
                        campaignIds={campaignIds}
                        config={slideConfig}
                        design={design}
                        reportId={reportId}
                        editable={false} // Block view is usually "preview" mode, editing happens via settings
                    />
                );
            case SlideType.CAMPAIGN_CHART:
            case 'chart': // Legacy/Alias
                return (
                    <CampaignChartSlide
                        accountId={accountId}
                        campaignIds={campaignIds}
                        config={slideConfig}
                        design={design}
                        reportId={reportId}
                    />
                );
            case SlideType.KEY_METRICS:
            case 'keyMetrics': // Legacy/Alias
                return (
                    <KeyMetricsSlide
                        accountId={accountId}
                        campaignIds={campaignIds}
                        config={slideConfig}
                        design={design}
                        reportId={reportId}
                    />
                );
            case SlideType.AD_CREATIVE:
                return (
                    <AdCreativeSlide
                        accountId={accountId}
                        campaignIds={campaignIds}
                        config={slideConfig}
                        design={design}
                        reportId={reportId}
                    />
                );
            case SlideType.FUNNEL_ANALYSIS:
                return (
                    <FunnelAnalysisSlide
                        accountId={accountId}
                        campaignIds={campaignIds}
                        config={slideConfig}
                        design={design}
                        reportId={reportId}
                    />
                );
            case SlideType.HEATMAP:
                return (
                    <HeatmapSlide
                        accountId={accountId}
                        campaignIds={campaignIds}
                        config={slideConfig}
                        design={design}
                        reportId={reportId}
                    />
                );
            case SlideType.DEVICE_PLATFORM_SPLIT:
                return (
                    <DevicePlatformSplitSlide
                        accountId={accountId}
                        campaignIds={campaignIds}
                        config={slideConfig}
                        design={design}
                        reportId={reportId}
                    />
                );
            case SlideType.TOP_PERFORMERS:
                return (
                    <TopPerformersSlide
                        accountId={accountId}
                        campaignIds={campaignIds}
                        config={slideConfig}
                        design={design}
                        reportId={reportId}
                    />
                );
            case 'clientLogo':
                return <ClientLogoBlock />;
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

                {selected && (
                    <div className="data-block-actions">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('Configure block:', blockType);
                                // Open settings modal/panel here
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
