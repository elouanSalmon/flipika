import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Settings, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useReportEditor } from '../../../contexts/ReportEditorContext';

/**
 * Slide Component (Epic 13 - Gamma-style Slide Editor)
 *
 * React NodeView for rendering individual slides with fixed 16:9 dimensions.
 * Applies theme (dark/light mode) and color scheme from ReportDesign context.
 */
export const SlideComponent = ({ node, updateAttributes, deleteNode, selected, getPos, editor }: NodeViewProps) => {
    const { layout, backgroundColor } = node.attrs;
    const { design } = useReportEditor();

    // Slides follow the REPORT's theme (design.mode), not the app's UI theme
    const isDarkMode = design?.mode === 'dark';

    // Use OPAQUE background from report theme, not app theme
    const themeBg = design?.colorScheme?.background || (isDarkMode ? '#1e293b' : '#f9fafb');
    const themeTextColor = design?.colorScheme?.text || (isDarkMode ? '#f1f5f9' : '#0f172a');

    // Use theme background (opaque, not transparent)
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

    // Move slide up
    const moveSlideUp = () => {
        const pos = getPos();
        if (typeof pos !== 'number') return;

        // Get all slides
        const slides: { node: any; pos: number }[] = [];
        editor.state.doc.forEach((node, position) => {
            if (node.type.name === 'slide') {
                slides.push({ node, pos: position });
            }
        });

        const currentIndex = slides.findIndex(s => s.pos === pos);
        if (currentIndex <= 0) return; // Already at top

        const currentSlide = slides[currentIndex];
        const previousSlide = slides[currentIndex - 1];

        // Swap positions
        const { tr } = editor.state;

        // Delete current slide
        tr.delete(currentSlide.pos, currentSlide.pos + currentSlide.node.nodeSize);

        // Insert current slide before the previous one
        tr.insert(previousSlide.pos, currentSlide.node);

        editor.view.dispatch(tr);
    };

    // Move slide down
    const moveSlideDown = () => {
        const pos = getPos();
        if (typeof pos !== 'number') return;

        // Get all slides
        const slides: { node: any; pos: number }[] = [];
        editor.state.doc.forEach((node, position) => {
            if (node.type.name === 'slide') {
                slides.push({ node, pos: position });
            }
        });

        const currentIndex = slides.findIndex(s => s.pos === pos);
        if (currentIndex === -1 || currentIndex >= slides.length - 1) return; // Already at bottom

        const currentSlide = slides[currentIndex];
        const nextSlide = slides[currentIndex + 1];

        // Swap positions
        const { tr } = editor.state;

        // Delete current slide
        tr.delete(currentSlide.pos, currentSlide.pos + currentSlide.node.nodeSize);

        // Insert current slide after the next one
        const newPos = nextSlide.pos + nextSlide.node.nodeSize - currentSlide.node.nodeSize;
        tr.insert(newPos, currentSlide.node);

        editor.view.dispatch(tr);
    };

    // Check if slide can move up or down
    const canMoveUp = () => {
        const pos = getPos();
        if (typeof pos !== 'number') return false;

        const slides: { pos: number }[] = [];
        editor.state.doc.forEach((node, position) => {
            if (node.type.name === 'slide') {
                slides.push({ pos: position });
            }
        });

        const currentIndex = slides.findIndex(s => s.pos === pos);
        return currentIndex > 0;
    };

    const canMoveDown = () => {
        const pos = getPos();
        if (typeof pos !== 'number') return false;

        const slides: { pos: number }[] = [];
        editor.state.doc.forEach((node, position) => {
            if (node.type.name === 'slide') {
                slides.push({ pos: position });
            }
        });

        const currentIndex = slides.findIndex(s => s.pos === pos);
        return currentIndex !== -1 && currentIndex < slides.length - 1;
    };

    return (
        <NodeViewWrapper
            className={`slide-wrapper ${selected ? 'selected' : ''}`}
            data-layout={layout}
            data-theme={isDarkMode ? 'dark' : 'light'}
        >
            {/* Move arrows - visible on hover */}
            {editor.isEditable && (
                <div className="slide-move-arrows">
                    <button
                        onClick={moveSlideUp}
                        disabled={!canMoveUp()}
                        className="slide-move-btn"
                        title="Déplacer vers le haut"
                    >
                        <ArrowUp size={18} />
                    </button>
                    <button
                        onClick={moveSlideDown}
                        disabled={!canMoveDown()}
                        className="slide-move-btn"
                        title="Déplacer vers le bas"
                    >
                        <ArrowDown size={18} />
                    </button>
                </div>
            )}

            <div
                className="slide-container"
                style={slideStyle}
            >
                <div className={`slide-content slide-layout-${layout}`}>
                    <NodeViewContent className="slide-content-editable" />
                </div>

                {selected && (
                    <>
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
                        </div>


                    </>
                )}
            </div>

            {selected && (
                <button
                    onClick={() => deleteNode()}
                    className="slide-side-delete-btn"
                    title="Supprimer la slide"
                >
                    <Trash2 size={20} />
                </button>
            )}

            <div className="slide-separator" />
        </NodeViewWrapper>
    );
};
