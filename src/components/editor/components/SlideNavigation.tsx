import React, { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Plus, Trash2 } from 'lucide-react';

interface SlideInfo {
    id: string;
    index: number;
    pos: number;
    backgroundColor: string;
    layout: string;
}

interface SlideNavigationProps {
    editor: Editor;
}

const renderThumbnailContent = (slide: SlideInfo, editor: Editor) => {
    // Find the slide node
    let slideNode: any = null;
    editor.state.doc.forEach((node, pos) => {
        if (pos === slide.pos) {
            slideNode = node;
        }
    });

    if (!slideNode) return null;

    // Helper to extract text from a node
    const getTexts = (node: any, limit = 5): string[] => {
        const texts: string[] = [];
        const traverse = (n: any) => {
            if (texts.length >= limit) return;
            if (n.text) {
                texts.push(n.text);
            } else if (n.content && n.content.forEach) {
                n.content.forEach(traverse);
            } else if (Array.isArray(n.content)) {
                n.content.forEach(traverse);
            }
        };
        traverse(node);
        return texts;
    };

    const texts = getTexts(slideNode);
    const title = texts[0] || '';
    const body = texts.slice(1);

    return (
        <div style={{ padding: '4px', height: '100%', overflow: 'hidden', fontSize: '2px', lineHeight: '1.2' }}>
            {title && (
                <div style={{ fontWeight: 700, marginBottom: '2px', fontSize: '3px', color: '#111827' }}>
                    {title.substring(0, 30)}
                </div>
            )}
            {body.map((text, i) => (
                <div key={i} style={{ color: '#6b7280', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {text.substring(0, 40)}
                </div>
            ))}
            {texts.length === 0 && <div style={{ width: '100%', height: '2px', background: '#e5e7eb', marginTop: '2px' }} />}
        </div>
    );
};

export const SlideNavigation: React.FC<SlideNavigationProps> = ({ editor }) => {
    const [slides, setSlides] = useState<SlideInfo[]>([]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

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
                        backgroundColor: node.attrs.backgroundColor || '#ffffff',
                        layout: node.attrs.layout || 'content',
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
    }, [editor]);

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
                            <div className="slide-nav-thumbnail-content">
                                {renderThumbnailContent(slide, editor)}
                            </div>
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
