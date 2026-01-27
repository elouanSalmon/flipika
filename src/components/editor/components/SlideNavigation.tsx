import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Editor } from '@tiptap/react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Plus, Trash2, Calendar, Briefcase, Target, GripVertical } from 'lucide-react';
import { useReportEditor } from '../../../contexts/ReportEditorContext';
import { DataBlockExtension } from '../extensions/DataBlockExtension';
import { ColumnGroup, Column } from '../extensions/ColumnsExtension';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


interface SlideInfo {
    id: string;
    index: number;
    pos: number;
    backgroundColor: string;
    layout: string;
    content: any; // Store the slide's JSON content
}

interface SlideNavigationProps {
    editor: Editor;
    scope?: {
        period: { start: string; end: string };
        accountName: string;
        campaignNames: string[];
    };
}

interface SortableSlideItemProps {
    slide: SlideInfo;
    index: number;
    isActive: boolean;
    design: any;
    totalSlides: number;
    onScrollToSlide: (pos: number) => void;
    onDeleteSlide: (pos: number, nodeSize: number) => void;
    editor: Editor;
}

interface SlideNavItemProps extends SortableSlideItemProps {
    dragHandleProps?: any;
    isDragging?: boolean;
    isOverlay?: boolean;
}

const SlideNavItem: React.FC<SlideNavItemProps> = React.memo(({
    slide,
    index,
    isActive,
    design,
    totalSlides,
    onScrollToSlide,
    onDeleteSlide,
    editor,
    dragHandleProps,
    isDragging,
    isOverlay,
}) => {
    return (
        <motion.div
            layout
            initial={isOverlay ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`slide-nav-item ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isOverlay ? 'overlay' : ''}`}
            onClick={() => !isOverlay && onScrollToSlide(slide.pos)}
        >
            <div className="slide-nav-drag-handle" {...dragHandleProps}>
                <GripVertical size={14} />
            </div>
            <div className="slide-nav-number">{index + 1}</div>
            <div
                className="slide-nav-thumbnail"
                style={{ backgroundColor: slide.backgroundColor }}
            >
                <SlideThumbnail slide={slide} design={design} />
            </div>
            {totalSlides > 1 && !isOverlay && (
                <button
                    className="slide-nav-delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        let nodeSize = 0;
                        editor.state.doc.forEach((node, pos) => {
                            if (pos === slide.pos) {
                                nodeSize = node.nodeSize;
                            }
                        });
                        onDeleteSlide(slide.pos, nodeSize);
                    }}
                    title="Supprimer"
                >
                    <Trash2 size={12} />
                </button>
            )}
        </motion.div>
    );
});

const SortableSlideItem: React.FC<SortableSlideItemProps> = React.memo((props) => {
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
            <SlideNavItem
                {...props}
                dragHandleProps={{ ...attributes, ...listeners }}
                isDragging={isDragging}
            />
        </div>
    );
});

// Component to render a single thumbnail with its own mini editor
const SlideThumbnail: React.FC<{ slide: SlideInfo; design: any }> = React.memo(({ slide, design }) => {
    const isDarkMode = design?.mode === 'dark';

    // Use OPAQUE background from report theme, not app theme (matches SlideComponent.tsx)
    const themeBg = design?.colorScheme?.background || (isDarkMode ? '#1e293b' : '#f9fafb');
    const themeTextColor = design?.colorScheme?.text || (isDarkMode ? '#f1f5f9' : '#0f172a');

    const finalBackgroundColor = slide.backgroundColor || themeBg;

    // Create a read-only mini editor for this thumbnail
    // Wrap the slide content in a proper doc structure
    const editorContent = useMemo(() => ({
        type: 'doc',
        content: slide.content || [{ type: 'paragraph' }],
    }), [JSON.stringify(slide.content)]);

    const extensions = useMemo(() => [
        StarterKit.configure({
            heading: { levels: [1, 2, 3] },
        }),
        DataBlockExtension,
        ColumnGroup,
        Column,
        Table.configure({
            resizable: false,
        }),
        TableRow,
        TableHeader,
        TableCell,
        Image.configure({
            inline: true,
            allowBase64: true,
            HTMLAttributes: {
                class: 'tiptap-image',
            },
        }),
    ], []);

    const thumbnailEditor = useEditor({
        extensions,
        content: editorContent,
        editable: false,
        editorProps: {
            attributes: {
                class: 'slide-thumbnail-editor',
            },
        },
    }, [editorContent]); // Ensure editor updates when content changes but doesn't recreate every time

    // Get fonts from theme
    const fontFamily = design?.typography?.fontFamily || 'Inter, sans-serif';
    const headingFontFamily = design?.typography?.headingFontFamily || fontFamily;

    // Style for the scaled slide
    const slideStyle = useMemo(() => ({
        width: '960px',
        height: '540px',
        backgroundColor: finalBackgroundColor,
        color: themeTextColor,
        fontFamily: fontFamily,
        '--color-primary': design?.colorScheme?.primary || '#0066ff',
        '--color-secondary': design?.colorScheme?.secondary || '#3385ff',
        '--color-accent': design?.colorScheme?.accent || '#00d4ff',
        '--color-bg-primary': themeBg,
        '--color-text-primary': themeTextColor,
        '--font-family': fontFamily,
        '--heading-font-family': headingFontFamily,
    }), [finalBackgroundColor, themeTextColor, design?.colorScheme, themeBg, fontFamily, headingFontFamily]);

    return (
        <div className="slide-thumbnail-scaler">
            <div
                className={`slide-thumbnail-content-wrapper slide-layout-${slide.layout}`}
                style={slideStyle as React.CSSProperties}
                data-theme={isDarkMode ? 'dark' : 'light'}
            >
                {thumbnailEditor && <EditorContent editor={thumbnailEditor} />}
            </div>
        </div>
    );
});

export const SlideNavigation: React.FC<SlideNavigationProps> = ({ editor, scope }) => {
    const [slides, setSlides] = useState<SlideInfo[]>([]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const { design } = useReportEditor();

    // DnD Kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Slides follow the REPORT's theme (design.mode), not the app's UI theme
    const isDarkMode = design?.mode === 'dark';
    // Use OPAQUE background from report theme (matches SlideComponent.tsx)
    const themeBg = design?.colorScheme?.background || (isDarkMode ? '#1e293b' : '#f9fafb');

    /* ... skipping effects ... */
    // Extract slides from editor content
    useEffect(() => {
        const updateSlides = () => {
            // ... logic to update slides
            const slideList: SlideInfo[] = [];
            let index = 0;
            editor.state.doc.forEach((node, pos) => {
                if (node.type.name === 'slide') {
                    slideList.push({
                        id: node.attrs.id || `slide-${index}`,
                        index,
                        pos,
                        backgroundColor: node.attrs.backgroundColor || themeBg,
                        layout: node.attrs.layout || 'content',
                        content: node.toJSON().content || [],
                    });
                    index++;
                }
            });
            setSlides(slideList);
        };
        updateSlides();
        editor.on('update', updateSlides);
        return () => { editor.off('update', updateSlides); };
    }, [editor, themeBg]);

    // Track active slide based on cursor position
    useEffect(() => {
        const updateActiveSlide = () => {
            // ... logic to track active slide
            const { from } = editor.state.selection;
            let currentIndex = 0;
            editor.state.doc.forEach((node, pos) => {
                if (node.type.name === 'slide') {
                    if (from >= pos && from <= pos + node.nodeSize) {
                        setActiveSlideIndex(currentIndex);
                    }
                    currentIndex++;
                }
            });
        };
        updateActiveSlide();
        editor.on('selectionUpdate', updateActiveSlide);
        return () => { editor.off('selectionUpdate', updateActiveSlide); };
    }, [editor]);

    // ... skipping helper functions ...
    const scrollToSlide = (pos: number) => {
        editor.chain().focus().setTextSelection(pos + 1).run();
        setTimeout(() => {
            const slideElements = document.querySelectorAll('.slide-wrapper');
            const targetSlide = Array.from(slideElements).find((el) => {
                const slidePos = editor.view.posAtDOM(el, 0);
                return slidePos >= pos && slidePos <= pos + 100;
            });
            if (targetSlide) {
                targetSlide.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 50);
    };

    const addNewSlide = () => {
        editor.commands.insertSlide();

        // Autoscroll to the new slide after a short delay to allow ProseMirror to update the DOM
        setTimeout(() => {
            let lastPos = 0;
            editor.state.doc.forEach((node, pos) => {
                if (node.type.name === 'slide') {
                    lastPos = pos;
                }
            });
            scrollToSlide(lastPos);
        }, 100);
    };

    const deleteSlide = (pos: number, nodeSize: number) => {
        if (slides.length <= 1) return;
        editor.chain().focus().deleteRange({ from: pos, to: pos + nodeSize }).run();
    };

    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    // Handle drag end event to reorder slides
    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = slides.findIndex((slide) => slide.id === active.id);
        const newIndex = slides.findIndex((slide) => slide.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        // Get the slide nodes from the document
        const slideNodes: any[] = [];
        editor.state.doc.forEach((node) => {
            if (node.type.name === 'slide') {
                slideNodes.push(node);
            }
        });

        if (oldIndex >= slideNodes.length || newIndex >= slideNodes.length) {
            return;
        }

        // Reorder using ProseMirror transaction
        const { tr } = editor.state;
        const movedNode = slideNodes[oldIndex];

        // Calculate positions
        let oldPos = 0;
        for (let i = 0; i < oldIndex; i++) {
            oldPos += slideNodes[i].nodeSize;
        }

        let newPos = 0;
        for (let i = 0; i < newIndex; i++) {
            newPos += slideNodes[i].nodeSize;
        }

        // Adjust newPos if moving forward (because we'll delete the node first)
        if (newIndex > oldIndex) {
            newPos -= movedNode.nodeSize;
        }

        // Delete from old position and insert at new position
        tr.delete(oldPos, oldPos + movedNode.nodeSize);
        tr.insert(newPos, movedNode);

        // Apply the transaction
        editor.view.dispatch(tr);
    };


    return (
        <div className="slide-navigation">
            {scope && (
                <div className="slide-nav-scope-info">
                    <div className="scope-item" title={`${scope.period.start} - ${scope.period.end}`}>
                        <Calendar size={12} className="scope-icon" />
                        <span className="scope-text">{scope.period.start} - {scope.period.end}</span>
                    </div>
                    <div className="scope-item" title={scope.accountName}>
                        <Briefcase size={12} className="scope-icon" />
                        <span className="scope-text">{scope.accountName}</span>
                    </div>
                    <div className="scope-item" title={scope.campaignNames.join(', ')}>
                        <Target size={12} className="scope-icon" />
                        <span className="scope-text">
                            {scope.campaignNames.length === 0
                                ? 'Toutes les campagnes'
                                : scope.campaignNames.length <= 1
                                    ? scope.campaignNames[0]
                                    : `${scope.campaignNames.length} campagnes`}
                        </span>
                    </div>
                    <div className="scope-separator"></div>
                </div>
            )}

            <div className="slide-nav-header">
                <span className="slide-nav-title">Slides</span>
                <span className="slide-nav-count">{slides.length}</span>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <SortableContext
                    items={slides.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="slide-nav-list">
                        <AnimatePresence initial={false}>
                            {slides.map((slide, idx) => (
                                <SortableSlideItem
                                    key={slide.id}
                                    slide={slide}
                                    index={idx}
                                    isActive={idx === activeSlideIndex}
                                    design={design}
                                    totalSlides={slides.length}
                                    onScrollToSlide={scrollToSlide}
                                    onDeleteSlide={deleteSlide}
                                    editor={editor}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </SortableContext>
                <DragOverlay dropAnimation={null}>
                    {activeId ? (
                        (() => {
                            const draggedSlide = slides.find(s => s.id === activeId);
                            if (!draggedSlide) return null;
                            return (
                                <SlideNavItem
                                    slide={draggedSlide}
                                    index={slides.indexOf(draggedSlide)}
                                    isActive={slides.indexOf(draggedSlide) === activeSlideIndex}
                                    design={design}
                                    totalSlides={slides.length}
                                    onScrollToSlide={scrollToSlide}
                                    onDeleteSlide={deleteSlide}
                                    editor={editor}
                                    isOverlay={true}
                                />
                            );
                        })()
                    ) : null}
                </DragOverlay>
            </DndContext>

            <button className="slide-nav-add" onClick={addNewSlide}>
                <Plus size={16} />
                <span>Nouvelle slide</span>
            </button>
        </div>
    );
};
