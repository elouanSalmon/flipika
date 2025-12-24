import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Layout, Plus } from 'lucide-react';
import WidgetItem from './WidgetItem';
import type { WidgetConfig, ReportDesign } from '../../types/reportTypes';
import './ReportCanvas.css';

interface ReportCanvasProps {
    widgets: WidgetConfig[];
    design: ReportDesign;
    startDate?: Date;
    endDate?: Date;
    onReorder: (widgets: WidgetConfig[]) => void;
    onWidgetUpdate: (widgetId: string, config: Partial<WidgetConfig>) => void;
    onWidgetDelete: (widgetId: string) => void;
    onWidgetDrop: (widgetType: string) => void;
    selectedWidgetId: string | null;
    onWidgetSelect: (widgetId: string | null) => void;
}

const ReportCanvas: React.FC<ReportCanvasProps> = ({
    widgets,
    design,
    startDate,
    endDate,
    onReorder,
    onWidgetUpdate,
    onWidgetDelete,
    onWidgetDrop,
    selectedWidgetId,
    onWidgetSelect,
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = widgets.findIndex((w) => w.id === active.id);
            const newIndex = widgets.findIndex((w) => w.id === over.id);

            const newWidgets = [...widgets];
            const [movedWidget] = newWidgets.splice(oldIndex, 1);
            newWidgets.splice(newIndex, 0, movedWidget);

            // Update order property
            const reorderedWidgets = newWidgets.map((w, index) => ({
                ...w,
                order: index,
            }));

            onReorder(reorderedWidgets);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const widgetType = e.dataTransfer.getData('widgetType');
        if (widgetType) {
            onWidgetDrop(widgetType);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    if (widgets.length === 0) {
        return (
            <div
                className="report-canvas empty"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <div className="empty-state">
                    <div className="empty-icon">
                        <Layout size={64} strokeWidth={1.5} />
                    </div>
                    <h3>Commencez votre rapport</h3>
                    <p>Glissez des widgets depuis la bibliothèque ou cliquez pour les ajouter</p>
                    <div className="empty-hint">
                        <Plus size={20} />
                        <span>Drag & Drop depuis la gauche</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="report-canvas"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={widgets.map(w => w.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="widgets-container">
                        {widgets.map((widget) => (
                            <WidgetItem
                                key={widget.id}
                                widget={widget}
                                design={design}
                                isSelected={selectedWidgetId === widget.id}
                                startDate={startDate}
                                endDate={endDate}
                                onSelect={() => onWidgetSelect(widget.id)}
                                onUpdate={(config) => onWidgetUpdate(widget.id, config)}
                                onDelete={() => onWidgetDelete(widget.id)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default ReportCanvas;
