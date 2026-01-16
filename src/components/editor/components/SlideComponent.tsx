import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Settings, Trash2, Copy, Palette } from 'lucide-react';
import type { SlideAttributes } from '../extensions/SlideExtension';
import type { ReportDesign } from '../../../types/reportTypes';

interface SlideComponentProps {
    node: {
        attrs: SlideAttributes;
    };
    updateAttributes: (attrs: Partial<SlideAttributes>) => void;
    deleteNode: () => void;
    selected: boolean;
    extension: {
        storage: {
            design?: ReportDesign;
        };
    };
    editor: any;
}

/**
 * Slide Component (Epic 13 - Gamma-style Slide Editor)
 * 
 * React NodeView for rendering individual slides with fixed 16:9 dimensions.
 * Each slide is a container that can hold rich content.
 */
export const SlideComponent: React.FC<SlideComponentProps> = ({
    node,
    updateAttributes,
    deleteNode,
    selected,
    extension,
    editor,
}) => {
    const { id, layout, backgroundColor, backgroundImage } = node.attrs;
    const design = extension?.storage?.design;

    const handleDuplicate = () => {
        editor.commands.duplicateSlide();
    };

    const handleDelete = () => {
        editor.commands.deleteSlide();
    };

    const handleLayoutChange = (newLayout: SlideAttributes['layout']) => {
        updateAttributes({ layout: newLayout });
    };

    const handleBackgroundChange = (color: string) => {
        updateAttributes({ backgroundColor: color });
    };

    // Calculate slide dimensions (16:9 aspect ratio)
    // Base width: 960px (standard presentation width)
    const slideWidth = 960;
    const slideHeight = 540; // 960 / 16 * 9

    const slideStyle: React.CSSProperties = {
        width: `${slideWidth}px`,
        height: `${slideHeight}px`,
        backgroundColor: backgroundColor || '#ffffff',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <NodeViewWrapper
            className={`slide-wrapper ${selected ? 'selected' : ''}`}
            data-slide-id={id}
            data-layout={layout}
        >
            <div className="slide-container" style={slideStyle}>
                {/* Slide Number */}
                <div className="slide-number">
                    {/* TODO: Calculate actual slide number */}
                </div>

                {/* Slide Content */}
                <div className={`slide-content slide-layout-${layout}`}>
                    <NodeViewContent className="slide-content-editable" />
                </div>

                {/* Slide Actions (visible when selected) */}
                {selected && (
                    <div className="slide-actions">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Open layout selector
                                console.log('Change layout');
                            }}
                            className="slide-action-btn"
                            title="Change Layout"
                        >
                            <Settings size={16} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Open color picker
                                console.log('Change background');
                            }}
                            className="slide-action-btn"
                            title="Background"
                        >
                            <Palette size={16} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicate();
                            }}
                            className="slide-action-btn"
                            title="Duplicate"
                        >
                            <Copy size={16} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="slide-action-btn danger"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Slide Separator */}
            <div className="slide-separator" />
        </NodeViewWrapper>
    );
};
