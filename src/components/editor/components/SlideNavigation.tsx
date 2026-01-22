import React, { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Plus, Trash2 } from 'lucide-react';
import { useReportEditor } from '../../../contexts/ReportEditorContext';
import { DataBlockExtension } from '../extensions/DataBlockExtension';

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
}

// Component to render a single thumbnail with its own mini editor
const SlideThumbnail: React.FC<{ slide: SlideInfo; design: any }> = ({ slide, design }) => {
    const isDarkMode = design?.mode === 'dark';
    const themeBg = isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(249, 250, 251, 0.9)';
    const themeTextColor = design?.colorScheme?.text || (isDarkMode ? '#f1f5f9' : '#0f172a');

    const finalBackgroundColor = slide.backgroundColor || themeBg;

    // Create a read-only mini editor for this thumbnail
    // Wrap the slide content in a proper doc structure
    const editorContent = {
        type: 'doc',
        content: slide.content || [{ type: 'paragraph' }],
    };

    const thumbnailEditor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            DataBlockExtension,
        ],
        content: editorContent,
        editable: false,
        editorProps: {
            attributes: {
                class: 'slide-thumbnail-editor',
            },
        },
    });

    // Style for the scaled slide
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
        <div className="slide-thumbnail-scaler">
            <div
                className={`slide-thumbnail-content-wrapper slide-layout-${slide.layout}`}
                style={slideStyle}
                data-theme={isDarkMode ? 'dark' : 'light'}
            >
                {thumbnailEditor && <EditorContent editor={thumbnailEditor} />}
            </div>
        </div>
    );
};

export const SlideNavigation: React.FC<SlideNavigationProps> = ({ editor }) => {
    const [slides, setSlides] = useState<SlideInfo[]>([]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const { design } = useReportEditor();

    // Slides follow the REPORT's theme (design.mode), not the app's UI theme
    const isDarkMode = design?.mode === 'dark';
    const themeBg = isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(249, 250, 251, 0.9)';

    // Extract slides from editor content
    useEffect(() => {
        const updateSlides = () => {
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
                        content: node.toJSON().content || [], // Get the slide's content as JSON
                    });
                    index++;
                }
            });

            setSlides(slideList);
        };

        updateSlides();

        // Listen for content changes
        editor.on('update', updateSlides);

        return () => {
            editor.off('update', updateSlides);
        };
    }, [editor, themeBg]);

    // Track active slide based on cursor position
    useEffect(() => {
        const updateActiveSlide = () => {
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

        return () => {
            editor.off('selectionUpdate', updateActiveSlide);
        };
    }, [editor]);

    const scrollToSlide = (pos: number) => {
        // Focus the editor at the slide position
        editor.chain().focus().setTextSelection(pos + 1).run();

        // Scroll the slide into view
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
    };

    const deleteSlide = (pos: number, nodeSize: number) => {
        if (slides.length <= 1) {
            return; // Don't delete the last slide
        }

        editor.chain()
            .focus()
            .deleteRange({ from: pos, to: pos + nodeSize })
            .run();
    };

    return (
        <div className="slide-navigation">
            <div className="slide-nav-header">
                <span className="slide-nav-title">Slides</span>
                <span className="slide-nav-count">{slides.length}</span>
            </div>

            <div className="slide-nav-list">
                {slides.map((slide, idx) => (
                    <div
                        key={slide.id}
                        className={`slide-nav-item ${idx === activeSlideIndex ? 'active' : ''}`}
                        onClick={() => scrollToSlide(slide.pos)}
                    >
                        <div className="slide-nav-number">{idx + 1}</div>
                        <div
                            className="slide-nav-thumbnail"
                            style={{ backgroundColor: slide.backgroundColor }}
                        >
                            <SlideThumbnail slide={slide} design={design} />
                        </div>
                        {slides.length > 1 && (
                            <button
                                className="slide-nav-delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Find the slide node to get its size
                                    let nodeSize = 0;
                                    editor.state.doc.forEach((node, pos) => {
                                        if (pos === slide.pos) {
                                            nodeSize = node.nodeSize;
                                        }
                                    });
                                    deleteSlide(slide.pos, nodeSize);
                                }}
                                title="Supprimer"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button className="slide-nav-add" onClick={addNewSlide}>
                <Plus size={16} />
                <span>Nouvelle slide</span>
            </button>
        </div>
    );
};
