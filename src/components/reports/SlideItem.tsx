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

            {/* Scope Configuration Panel */}
            {!isPublicView && isSelected && showScopePanel && onUpdate && (
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
