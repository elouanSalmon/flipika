import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Settings, Trash2, Palette } from 'lucide-react';

/**
 * Slide Component (Epic 13 - Gamma-style Slide Editor)
 * 
 * React NodeView for rendering individual slides with fixed 16:9 dimensions.
 */
export const SlideComponent = ({ node, updateAttributes, deleteNode, selected }: NodeViewProps) => {
    const { layout, backgroundColor } = node.attrs;

    return (
        <NodeViewWrapper
            className={`slide-wrapper ${selected ? 'selected' : ''}`}
            data-layout={layout}
        >
            <div
                className="slide-container"
                style={{
                    width: '960px',
                    height: '540px',
                    backgroundColor: backgroundColor || '#ffffff',
                }}
            >
                <div className={`slide-content slide-layout-${layout}`}>
                    <NodeViewContent className="slide-content-editable" />
                </div>

                {selected && (
                    <div className="slide-actions">
                        <button
                            onClick={() => {
                                const colors = ['#ffffff', '#f3f4f6', '#1e293b', '#3b82f6', '#10b981'];
                                const currentIndex = colors.indexOf(backgroundColor || '#ffffff');
                                const nextColor = colors[(currentIndex + 1) % colors.length];
                                updateAttributes({ backgroundColor: nextColor });
                            }}
                            className="slide-action-btn"
                            title="Background"
                        >
                            <Palette size={16} />
                        </button>
                        <button
                            onClick={() => {
                                const layouts = ['content', 'title', 'two-column', 'blank'];
                                const currentIndex = layouts.indexOf(layout || 'content');
                                const nextLayout = layouts[(currentIndex + 1) % layouts.length];
                                updateAttributes({ layout: nextLayout });
                            }}
                            className="slide-action-btn"
                            title="Layout"
                        >
                            <Settings size={16} />
                        </button>
                        <button
                            onClick={() => deleteNode()}
                            className="slide-action-btn danger"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className="slide-separator" />
        </NodeViewWrapper>
    );
};
