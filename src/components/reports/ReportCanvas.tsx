import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Layout, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SortableSlideItem, { SlideItem } from './SlideItem';
import type { SlideConfig, ReportDesign } from '../../types/reportTypes';
import './ReportCanvas.css';

interface ReportCanvasProps {
    slides: SlideConfig[];
    design: ReportDesign;
    startDate?: Date;
    endDate?: Date;
    onReorder?: (slides: SlideConfig[]) => void;
    onSlideUpdate?: (slideId: string, config: Partial<SlideConfig>) => void;
    onSlideDelete?: (slideId: string) => void;
    onSlideDrop?: (slideType: string) => void;
    selectedSlideId?: string | null;
    onSlideSelect?: (slideId: string | null) => void;
    isPublicView?: boolean; // Read-only mode for public viewing
    reportId?: string;
    reportAccountId?: string;  // For scope selector
    reportCampaignIds?: string[];  // For scope selector
}

const ReportCanvas: React.FC<ReportCanvasProps> = ({
    slides,
    design,
    startDate,
    endDate,
    onReorder,
    onSlideUpdate,
    onSlideDelete,
    onSlideDrop,
    selectedSlideId,
    onSlideSelect,
    isPublicView = false,
    reportId,
    reportAccountId = '',
    reportCampaignIds = [],
}) => {
    const { t } = useTranslation('reports');
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [activeId, setActiveId] = React.useState<string | null>(null);

    const handleDragStart = (event: DragStartEvent) => {
        if (isPublicView) return;
        setActiveId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        if (isPublicView || !onReorder) return;

        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = slides.findIndex((w) => w.id === active.id);
            const newIndex = slides.findIndex((w) => w.id === over.id);

            const newWidgets = [...slides];
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

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        if (isPublicView || !onSlideDrop) return;

        e.preventDefault();
        const slideType = e.dataTransfer.getData('slideType');
        if (slideType) {
            onSlideDrop(slideType);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (isPublicView) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const activeSlide = activeId ? slides.find(s => s.id === activeId) : null;

    if (slides.length === 0) {
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
                    <h3>{t('canvas.empty.title')}</h3>
                    <p>{t('canvas.empty.description')}</p>
                    <div className="empty-hint">
                        <Plus size={20} />
                        <span>{t('canvas.empty.hint')}</span>
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
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <SortableContext
                    items={slides.map(w => w.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="slides-container">
                        {slides.map((slide) => (
                            <SortableSlideItem
                                key={slide.id}
                                slide={slide}
                                design={design}
                                isSelected={selectedSlideId === slide.id}
                                startDate={startDate}
                                endDate={endDate}
                                onSelect={onSlideSelect ? () => onSlideSelect(slide.id) : undefined}
                                onUpdate={onSlideUpdate ? (config) => onSlideUpdate(slide.id, config) : undefined}
                                onDelete={onSlideDelete ? () => onSlideDelete(slide.id) : undefined}
                                isPublicView={isPublicView}
                                reportId={reportId}
                                reportAccountId={reportAccountId}
                                reportCampaignIds={reportCampaignIds}
                            />
                        ))}
                    </div>
                </SortableContext>
                <DragOverlay>
                    {activeSlide ? (
                        <SlideItem
                            slide={activeSlide}
                            design={design}
                            isSelected={true}
                            startDate={startDate}
                            endDate={endDate}
                            isPublicView={isPublicView}
                            reportId={reportId}
                            reportAccountId={reportAccountId}
                            reportCampaignIds={reportCampaignIds}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default ReportCanvas;
