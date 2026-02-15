import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, Trash2 } from 'lucide-react';
import ConfirmationModal from '../common/ConfirmationModal';
import ScopeSelector from './ScopeSelector';
import PerformanceOverviewSlide from './slides/PerformanceOverviewSlide';
import CampaignChartSlide from './slides/CampaignChartSlide';
import KeyMetricsSlide from './slides/KeyMetricsSlide';
import AdCreativeSlide from './slides/AdCreativeSlide';
import FunnelAnalysisSlide from './slides/FunnelAnalysisSlide';
import HeatmapSlide from './slides/HeatmapSlide';
import DevicePlatformSplitSlide from './slides/DevicePlatformSplitSlide';
import TopPerformersSlide from './slides/TopPerformersSlide';
import SectionTitleSlide from './slides/SectionTitleSlide';
import RichTextSlide from './slides/RichTextSlide';
import MetaPerformanceOverviewSlide from './slides/MetaPerformanceOverviewSlide';
import MetaCampaignChartSlide from './slides/MetaCampaignChartSlide';
import MetaFunnelAnalysisSlide from './slides/MetaFunnelAnalysisSlide';
import type { SlideConfig, ReportDesign, SlideScope } from '../../types/reportTypes';
import { SlideType } from '../../types/reportTypes';
import './SlideItem.css';

interface SlideItemProps {
    slide: SlideConfig;
    design: ReportDesign;
    isSelected?: boolean;
    startDate?: Date;
    endDate?: Date;
    onSelect?: () => void;
    onUpdate?: (config: Partial<SlideConfig>) => void;
    onDelete?: () => void;
    isPublicView?: boolean;
    reportId?: string;
    reportAccountId?: string;  // For scope selector
    reportCampaignIds?: string[];  // For scope selector
}

export const SlideItem: React.FC<SlideItemProps & {
    dragHandleProps?: any;
    style?: React.CSSProperties;
    isDragging?: boolean;
    isOverlay?: boolean;
}> = ({
    slide,
    design,
    isSelected = false,
    startDate,
    endDate,
    onSelect,
    onUpdate,
    onDelete,
    isPublicView = false,
    reportId,
    reportAccountId = '',
    reportCampaignIds = [],
    dragHandleProps,
    style,
    isDragging,
    isOverlay,
}) => {
        const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
        const [showScopePanel, setShowScopePanel] = React.useState(false);

        const renderSlide = () => {
            switch (slide.type) {
                case SlideType.PERFORMANCE_OVERVIEW:
                    return (
                        <PerformanceOverviewSlide
                            accountId={slide.accountId || reportAccountId}
                            campaignIds={slide.campaignIds || reportCampaignIds}
                            config={slide}
                            design={design}
                            startDate={startDate}
                            endDate={endDate}
                            reportId={reportId}
                        />
                    );
                case SlideType.CAMPAIGN_CHART:
                    return (
                        <CampaignChartSlide
                            accountId={slide.accountId || reportAccountId}
                            campaignIds={slide.campaignIds || reportCampaignIds}
                            config={slide}
                            design={design}
                            startDate={startDate}
                            endDate={endDate}
                            reportId={reportId}
                        />
                    );
                case SlideType.KEY_METRICS:
                    return (
                        <KeyMetricsSlide
                            accountId={slide.accountId || reportAccountId}
                            campaignIds={slide.campaignIds || reportCampaignIds}
                            config={slide}
                            design={design}
                            startDate={startDate}
                            endDate={endDate}
                            reportId={reportId}
                        />
                    );
                case SlideType.AD_CREATIVE:
                    return (
                        <AdCreativeSlide
                            accountId={slide.accountId || reportAccountId}
                            campaignIds={slide.campaignIds || reportCampaignIds}
                            config={slide}
                            design={design}
                            startDate={startDate}
                            endDate={endDate}
                            reportId={reportId}
                        />
                    );
                case SlideType.FUNNEL_ANALYSIS:
                    return (
                        <FunnelAnalysisSlide
                            accountId={slide.accountId || reportAccountId}
                            campaignIds={slide.campaignIds || reportCampaignIds}
                            config={slide}
                            design={design}
                            startDate={startDate}
                            endDate={endDate}
                            reportId={reportId}
                        />
                    );
                case SlideType.HEATMAP:
                    return (
                        <HeatmapSlide
                            accountId={slide.accountId || reportAccountId}
                            campaignIds={slide.campaignIds || reportCampaignIds}
                            config={slide}
                            design={design}
                            startDate={startDate}
                            endDate={endDate}
                            reportId={reportId}
                        />
                    );
                case SlideType.DEVICE_PLATFORM_SPLIT:
                    return (
                        <DevicePlatformSplitSlide
                            accountId={slide.accountId || reportAccountId}
                            campaignIds={slide.campaignIds || reportCampaignIds}
                            config={slide}
                            design={design}
                            startDate={startDate}
                            endDate={endDate}
                            reportId={reportId}
                        />
                    );
                case SlideType.TOP_PERFORMERS:
                    return (
                        <TopPerformersSlide
                            accountId={slide.accountId || reportAccountId}
                            campaignIds={slide.campaignIds || reportCampaignIds}
                            config={slide}
                            design={design}
                            startDate={startDate}
                            endDate={endDate}
                            reportId={reportId}
                        />
                    );
                case SlideType.META_PERFORMANCE_OVERVIEW:
                    return (
                        <MetaPerformanceOverviewSlide
                            accountId={slide.accountId || reportAccountId}
                            campaignIds={slide.campaignIds || reportCampaignIds}
                            config={slide}
                            design={design}
                            startDate={startDate}
                            endDate={endDate}
                            reportId={reportId}
                        />
                    );
                case SlideType.META_CAMPAIGN_CHART:
                    return (
                        <MetaCampaignChartSlide
                            accountId={slide.accountId || reportAccountId}
                            campaignIds={slide.campaignIds || reportCampaignIds}
                            config={slide}
                            design={design}
                            startDate={startDate}
                            endDate={endDate}
                            reportId={reportId}
                        />
                    );
                case SlideType.META_FUNNEL_ANALYSIS:
                    return (
                        <MetaFunnelAnalysisSlide
                            accountId={slide.accountId || reportAccountId}
                            campaignIds={slide.campaignIds || reportCampaignIds}
                            config={slide}
                            design={design}
                            startDate={startDate}
                            endDate={endDate}
                            reportId={reportId}
                        />
                    );
                case SlideType.SECTION_TITLE:
                    return (
                        <SectionTitleSlide
                            config={slide}
                            design={design}
                            editable={!isPublicView}
                        />
                    );
                case SlideType.RICH_TEXT:
                    return (
                        <RichTextSlide
                            config={slide}
                            design={design}
                            editable={!isPublicView}
                        />
                    );
                case SlideType.TEXT_BLOCK:
                    return (
                        <div className="text-block-slide">
                            <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                    if (onUpdate) {
                                        onUpdate({
                                            settings: {
                                                ...slide.settings,
                                                content: e.currentTarget.innerHTML,
                                            },
                                        });
                                    }
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: slide.settings?.content || '<p>Cliquez pour éditer...</p>',
                                }}
                            />
                        </div>
                    );
                case SlideType.CUSTOM:
                    return (
                        <div className="custom-slide">
                            <p>Slide personnalisé - Configuration requise</p>
                        </div>
                    );
                default:
                    return <div>Slide inconnu</div>;
            }
        };

        return (
            <div
                style={style}
                className={`slide-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isOverlay ? 'overlay' : ''} ${isPublicView ? 'public-view' : ''}`}
                onClick={onSelect}
            >
                {/* Drag Handle - Hidden in public view */}
                {!isPublicView && !isOverlay && (
                    <div className="slide-handle" {...dragHandleProps}>
                        <GripVertical size={20} />
                    </div>
                )}
                {/* Show handle in overlay but without props if needed, or just hide it. 
                Usually in overlay we want it to look like the real thing, so maybe keep it visible but inert or just visual.
                For now, let's keep it consistent.
            */}
                {!isPublicView && isOverlay && (
                    <div className="slide-handle" style={{ opacity: 1, cursor: 'grabbing' }}>
                        <GripVertical size={20} />
                    </div>
                )}

                {/* Slide Content */}
                <div className="slide-content">
                    {renderSlide()}
                </div>

                {/* Slide Actions - Hidden in public view */}
                {!isPublicView && isSelected && onDelete && !isDragging && (
                    <div className="slide-actions">
                        <button
                            className="slide-action-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowScopePanel(!showScopePanel);
                            }}
                            title="Configurer"
                        >
                            <Settings size={16} />
                        </button>
                        <button
                            className="slide-action-btn danger"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDeleteModalOpen(true);
                            }}
                            title="Supprimer"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}

                {/* Scope Configuration Panel for Data Slides */}
                {!isPublicView && isSelected && showScopePanel && onUpdate && slide.type !== SlideType.SECTION_TITLE && slide.type !== SlideType.RICH_TEXT && !isDragging && (
                    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                        <ScopeSelector
                            value={slide.scope}
                            onChange={(scope: SlideScope | undefined) => {
                                onUpdate({ scope });
                            }}
                            reportAccountId={reportAccountId}
                            reportCampaignIds={reportCampaignIds}
                            slideType={slide.type}
                        />
                    </div>
                )}

                {/* Content Configuration Panel for Structural Slides */}
                {!isPublicView && isSelected && showScopePanel && onUpdate && !isDragging && (
                    (slide.type === SlideType.SECTION_TITLE || slide.type === SlideType.RICH_TEXT) && (
                        <div className="mt-4 p-4 bg-neutral-50 dark:bg-black/50 rounded-xl border border-neutral-200 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2 mb-4">
                                <Settings size={18} className="text-primary dark:text-primary-light" />
                                <h4 className="font-semibold text-neutral-900 dark:text-neutral-200">
                                    Configuration du contenu
                                </h4>
                            </div>
                            {slide.type === SlideType.SECTION_TITLE && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Titre</label>
                                        <input
                                            type="text"
                                            value={slide.title || ''}
                                            onChange={(e) => onUpdate({ title: e.target.value })}
                                            className="w-full px-4 py-2 bg-white dark:bg-black border border-neutral-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-neutral-900 dark:text-neutral-200"
                                            placeholder="Titre de la section"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Sous-titre</label>
                                        <input
                                            type="text"
                                            value={slide.subtitle || ''}
                                            onChange={(e) => onUpdate({ subtitle: e.target.value })}
                                            className="w-full px-4 py-2 bg-white dark:bg-black border border-neutral-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-neutral-900 dark:text-neutral-200"
                                            placeholder="Sous-titre optionnel"
                                        />
                                    </div>
                                </div>
                            )}
                            {slide.type === SlideType.RICH_TEXT && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Contenu</label>
                                    <textarea
                                        value={slide.body || ''}
                                        onChange={(e) => onUpdate({ body: e.target.value })}
                                        rows={6}
                                        className="w-full px-4 py-2 bg-white dark:bg-black border border-neutral-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-neutral-900 dark:text-neutral-200"
                                        placeholder="Saisissez votre texte ici..."
                                    />
                                </div>
                            )}
                        </div>
                    )
                )}

                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={() => {
                        if (onDelete) onDelete();
                    }}
                    title="Supprimer le slide"
                    message="Êtes-vous sûr de vouloir supprimer ce slide ?"
                    confirmLabel="Supprimer"
                    isDestructive={true}
                />
            </div>
        );
    };

const SortableSlideItem: React.FC<SlideItemProps> = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.slide.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <SlideItem
                {...props}
                dragHandleProps={{ ...attributes, ...listeners }}
                isDragging={isDragging}
            />
        </div>
    );
};

export default SortableSlideItem;
