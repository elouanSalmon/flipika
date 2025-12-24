import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, Trash2 } from 'lucide-react';
import PerformanceOverviewWidget from './widgets/PerformanceOverviewWidget';
import CampaignChartWidget from './widgets/CampaignChartWidget';
import type { WidgetConfig } from '../../types/reportTypes';
import { WidgetType } from '../../types/reportTypes';
import './WidgetItem.css';

interface WidgetItemProps {
    widget: WidgetConfig;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (config: Partial<WidgetConfig>) => void;
    onDelete: () => void;
}

const WidgetItem: React.FC<WidgetItemProps> = ({
    widget,
    isSelected,
    onSelect,
    onUpdate,
    onDelete,
}) => {
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
                    />
                );
            case WidgetType.CAMPAIGN_CHART:
                return (
                    <CampaignChartWidget
                        accountId={widget.accountId}
                        campaignIds={widget.campaignIds}
                        config={widget}
                    />
                );
            case WidgetType.TEXT_BLOCK:
                return (
                    <div className="text-block-widget">
                        <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                                onUpdate({
                                    settings: {
                                        ...widget.settings,
                                        content: e.currentTarget.innerHTML,
                                    },
                                });
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
            className={`widget-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
            onClick={onSelect}
        >
            {/* Drag Handle */}
            <div className="widget-handle" {...attributes} {...listeners}>
                <GripVertical size={20} />
            </div>

            {/* Widget Content */}
            <div className="widget-content">
                {renderWidget()}
            </div>

            {/* Widget Actions */}
            {isSelected && (
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
                            if (confirm('Supprimer ce widget ?')) {
                                onDelete();
                            }
                        }}
                        title="Supprimer"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default WidgetItem;
