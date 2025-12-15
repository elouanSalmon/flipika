import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronUp, Trash2, Edit3 } from 'lucide-react';
import type { ReportSection } from '../../types/reportTypes';
import ReportEditor from './ReportEditor';
import './SectionItem.css';

interface SectionItemProps {
    section: ReportSection;
    isActive: boolean;
    onUpdate: (id: string, content: any) => void;
    onDelete: (id: string) => void;
    onActivate: (id: string) => void;
}

const SectionItem: React.FC<SectionItemProps> = ({
    section,
    isActive,
    onUpdate,
    onDelete,
    onActivate,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(section.isCollapsed || false);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: section.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleContentChange = (content: any) => {
        onUpdate(section.id, content);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`section-item ${isActive ? 'section-item-active' : ''} ${isDragging ? 'section-item-dragging' : ''}`}
        >
            <div className="section-item-header">
                <button
                    className="section-item-drag-handle"
                    {...attributes}
                    {...listeners}
                    aria-label="Drag to reorder"
                >
                    <GripVertical size={18} />
                </button>

                <div className="section-item-title" onClick={() => onActivate(section.id)}>
                    {section.title}
                </div>

                <div className="section-item-actions">
                    <button
                        className="section-item-action-button"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                    <button
                        className="section-item-action-button"
                        onClick={() => onActivate(section.id)}
                        aria-label="Edit"
                    >
                        <Edit3 size={18} />
                    </button>
                    <button
                        className="section-item-action-button section-item-delete-button"
                        onClick={() => onDelete(section.id)}
                        aria-label="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {!isCollapsed && (
                <div className="section-item-content">
                    <ReportEditor
                        content={section.content}
                        onChange={handleContentChange}
                        editable={isActive}
                        placeholder={`Éditez ${section.title.toLowerCase()}...`}
                    />
                </div>
            )}
        </div>
    );
};

export default SectionItem;
