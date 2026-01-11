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

const SlideItem: React.FC<SlideItemProps> = ({
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
}) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [showScopePanel, setShowScopePanel] = React.useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: slide.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

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
            ref={setNodeRef}
            style={style}
            className={`slide-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isPublicView ? 'public-view' : ''}`}
            onClick={onSelect}
        >
            {/* Drag Handle - Hidden in public view */}
            {!isPublicView && (
                <div className="slide-handle" {...attributes} {...listeners}>
                    <GripVertical size={20} />
                </div>
            )}

            {/* Slide Content */}
            <div className="slide-content">
                {renderSlide()}
            </div>

            {/* Slide Actions - Hidden in public view */}
            {!isPublicView && isSelected && onDelete && (
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
            {!isPublicView && isSelected && showScopePanel && onUpdate && slide.type !== SlideType.SECTION_TITLE && slide.type !== SlideType.RICH_TEXT && (
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
            {!isPublicView && isSelected && showScopePanel && onUpdate && (
                (slide.type === SlideType.SECTION_TITLE || slide.type === SlideType.RICH_TEXT) && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 mb-4">
                            <Settings size={18} className="text-blue-600 dark:text-blue-400" />
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                Configuration du contenu
                            </h4>
                        </div>
                        {slide.type === SlideType.SECTION_TITLE && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
                                    <input
                                        type="text"
                                        value={slide.title || ''}
                                        onChange={(e) => onUpdate({ title: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
                                        placeholder="Titre de la section"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sous-titre</label>
                                    <input
                                        type="text"
                                        value={slide.subtitle || ''}
                                        onChange={(e) => onUpdate({ subtitle: e.target.value })}
                                        className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
                                        placeholder="Sous-titre optionnel"
                                    />
                                </div>
                            </div>
                        )}
                        {slide.type === SlideType.RICH_TEXT && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contenu</label>
                                <textarea
                                    value={slide.body || ''}
                                    onChange={(e) => onUpdate({ body: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100"
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

export default SlideItem;
