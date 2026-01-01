import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, Trash2 } from 'lucide-react';
import ConfirmationModal from '../common/ConfirmationModal';
import PerformanceOverviewWidget from './widgets/PerformanceOverviewWidget';
import CampaignChartWidget from './widgets/CampaignChartWidget';
import KeyMetricsWidget from './widgets/KeyMetricsWidget';
import AdCreativeWidget from './widgets/AdCreativeWidget';
import type { WidgetConfig, ReportDesign } from '../../types/reportTypes';
import { WidgetType } from '../../types/reportTypes';
import './WidgetItem.css';

interface WidgetItemProps {
    widget: WidgetConfig;
    design: ReportDesign;
    isSelected?: boolean;
    startDate?: Date;
    endDate?: Date;
    onSelect?: () => void;
    onUpdate?: (config: Partial<WidgetConfig>) => void;
    onDelete?: () => void;
    isPublicView?: boolean;
    reportId?: string;
}

const WidgetItem: React.FC<WidgetItemProps> = ({
    widget,
    design,
    isSelected = false,
    startDate,
    endDate,
    onSelect,
    onUpdate,
    onDelete,
    isPublicView = false,
    reportId,
}) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: widget.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const renderWidget = () => {
        switch (widget.type) {
            case WidgetType.PERFORMANCE_OVERVIEW:
                return (
                    <PerformanceOverviewWidget
                        accountId={widget.accountId}
                        campaignIds={widget.campaignIds}
                        config={widget}
                        design={design}
                        startDate={startDate}
                        endDate={endDate}
                        reportId={reportId}
                    />
                );
            case WidgetType.CAMPAIGN_CHART:
                return (
                    <CampaignChartWidget
                        accountId={widget.accountId}
                        campaignIds={widget.campaignIds}
                        config={widget}
                        design={design}
                        startDate={startDate}
                        endDate={endDate}
                        reportId={reportId}
                    />
                );
            case WidgetType.KEY_METRICS:
                return (
                    <KeyMetricsWidget
                        accountId={widget.accountId}
                        campaignIds={widget.campaignIds}
                        config={widget}
                        design={design}
                        startDate={startDate}
                        endDate={endDate}
                        reportId={reportId}
                    />
                );
            case WidgetType.AD_CREATIVE:
                return (
                    <AdCreativeWidget
                        accountId={widget.accountId}
                        campaignIds={widget.campaignIds}
                        config={widget}
                        design={design}
                        startDate={startDate}
                        endDate={endDate}
                        reportId={reportId}
                    />
                );
            case WidgetType.TEXT_BLOCK:
                return (
                    <div className="text-block-widget">
                        <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                                if (onUpdate) {
                                    onUpdate({
                                        settings: {
                                            ...widget.settings,
                                            content: e.currentTarget.innerHTML,
                                        },
                                    });
                                }
                            }}
                            dangerouslySetInnerHTML={{
                                __html: widget.settings?.content || '<p>Cliquez pour éditer...</p>',
                            }}
                        />
                    </div>
                );
            case WidgetType.CUSTOM:
                return (
                    <div className="custom-widget">
                        <p>Widget personnalisé - Configuration requise</p>
                    </div>
                );
            default:
                return <div>Widget inconnu</div>;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`widget-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isPublicView ? 'public-view' : ''}`}
            onClick={onSelect}
        >
            {/* Drag Handle - Hidden in public view */}
            {!isPublicView && (
                <div className="widget-handle" {...attributes} {...listeners}>
                    <GripVertical size={20} />
                </div>
            )}

            {/* Widget Content */}
            <div className="widget-content">
                {renderWidget()}
            </div>

            {/* Widget Actions - Hidden in public view */}
            {!isPublicView && isSelected && onDelete && (
                <div className="widget-actions">
                    <button
                        className="widget-action-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Open config panel
                        }}
                        title="Configurer"
                    >
                        <Settings size={16} />
                    </button>
                    <button
                        className="widget-action-btn danger"
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

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => {
                    if (onDelete) onDelete();
                }}
                title="Supprimer le widget"
                message="Êtes-vous sûr de vouloir supprimer ce widget ?"
                confirmLabel="Supprimer"
                isDestructive={true}
            />
        </div>
    );
};

export default WidgetItem;
