import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Settings, Trash2 } from 'lucide-react';
import { useReportEditor } from '../../../contexts/ReportEditorContext';

/**
 * Slide Component (Epic 13 - Gamma-style Slide Editor)
 *
 * React NodeView for rendering individual slides with fixed 16:9 dimensions.
 * Applies theme (dark/light mode) and color scheme from ReportDesign context.
 */
export const SlideComponent = ({ node, updateAttributes, deleteNode, selected }: NodeViewProps) => {
    const { layout, backgroundColor } = node.attrs;
    const { design } = useReportEditor();

    // Slides follow the REPORT's theme (design.mode), not the app's UI theme
    const isDarkMode = design?.mode === 'dark';
    const themeBg = isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(249, 250, 251, 0.9)';
    const themeTextColor = design?.colorScheme?.text || (isDarkMode ? '#f1f5f9' : '#0f172a');

    // Use theme background (no custom colors)
    const finalBackgroundColor = backgroundColor || themeBg;

    // Apply CSS variables for theme colors at slide level
    const slideStyle = {
        width: '960px',
        height: '540px',
        backgroundColor: finalBackgroundColor,
        color: themeTextColor,
        '--color-primary': design?.colorScheme?.primary || '#0066ff',
        '--color-secondary': design?.colorScheme?.secondary || '#3385ff',
        '--color-accent': design?.colorScheme?.accent || '#00d4ff',
        '--color-bg-primary': themeBg,
        '--color-text-primary': themeTextColor,
    } as React.CSSProperties;

    return (
        <NodeViewWrapper
            className={`slide-wrapper ${selected ? 'selected' : ''}`}
            data-layout={layout}
            data-theme={isDarkMode ? 'dark' : 'light'}
        >
            <div
                className="slide-container"
                style={slideStyle}
            >
                <div className={`slide-content slide-layout-${layout}`}>
                    <NodeViewContent className="slide-content-editable" />
                </div>

                {selected && (
                    <div className="slide-actions">
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
