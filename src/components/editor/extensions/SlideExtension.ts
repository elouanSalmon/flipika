import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SlideComponent } from '../components/SlideComponent';
import type { ReportDesign } from '../../../types/reportTypes';

/**
 * Slide Extension for Tiptap (Epic 13 - Gamma-style Slide Editor)
 * 
 * Each slide is a ProseMirror node with fixed dimensions (16:9 aspect ratio).
 * Slides are stacked vertically in the editor and can contain rich content.
 */

export interface SlideAttributes {
    id: string;
    layout: 'title' | 'content' | 'two-column' | 'blank';
    backgroundColor?: string;
    backgroundImage?: string;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        slide: {
            insertSlide: (attributes?: Partial<SlideAttributes>) => ReturnType;
            deleteSlide: () => ReturnType;
            duplicateSlide: () => ReturnType;
            setSlideLayout: (layout: SlideAttributes['layout']) => ReturnType;
            setSlideBackground: (color: string) => ReturnType;
        };
    }
}

export const SlideExtension = Node.create({
    name: 'slide',

    topLevel: true,

    content: 'block+', // Can contain multiple block nodes

    isolating: true, // Each slide is isolated from others

    addOptions() {
        return {
            design: undefined as ReportDesign | undefined,
        };
    },

    addStorage() {
        return {
            design: this.options.design,
        };
    },

    addAttributes() {
        return {
            id: {
                default: () => `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                parseHTML: element => element.getAttribute('data-slide-id'),
                renderHTML: attributes => ({
                    'data-slide-id': attributes.id,
                }),
            },
            layout: {
                default: 'content',
                parseHTML: element => element.getAttribute('data-layout') || 'content',
                renderHTML: attributes => ({
                    'data-layout': attributes.layout,
                }),
            },
            backgroundColor: {
                default: '#ffffff',
                parseHTML: element => element.getAttribute('data-bg-color') || '#ffffff',
                renderHTML: attributes => ({
                    'data-bg-color': attributes.backgroundColor,
                }),
            },
            backgroundImage: {
                default: null,
                parseHTML: element => element.getAttribute('data-bg-image'),
                renderHTML: attributes => {
                    if (attributes.backgroundImage) {
                        return { 'data-bg-image': attributes.backgroundImage };
                    }
                    return {};
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-slide]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-slide': 'true' }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(SlideComponent, {
            as: 'div',
            className: 'slide-node-view',
        });
    },

    addCommands() {
        return {
            insertSlide: (attributes?: Partial<SlideAttributes>) => ({ commands, state }) => {
                const { selection } = state;
                const slideAttrs: Partial<SlideAttributes> = {
                    layout: 'content',
                    backgroundColor: '#ffffff',
                    ...attributes,
                };

                return commands.insertContentAt(selection.to, {
                    type: this.name,
                    attrs: slideAttrs,
                    content: [
                        {
                            type: 'paragraph',
                        },
                    ],
                });
            },

            deleteSlide: () => ({ commands, state }) => {
                const { $from } = state.selection;
                const slideNode = $from.node($from.depth - 1);

                if (slideNode && slideNode.type.name === this.name) {
                    const pos = $from.before($from.depth - 1);
                    return commands.deleteRange({ from: pos, to: pos + slideNode.nodeSize });
                }

                return false;
            },

            duplicateSlide: () => ({ commands, state, tr }) => {
                const { $from } = state.selection;
                const slideNode = $from.node($from.depth - 1);

                if (slideNode && slideNode.type.name === this.name) {
                    const pos = $from.after($from.depth - 1);
                    const newSlide = slideNode.copy(slideNode.content);

                    // Generate new ID for duplicated slide
                    const newAttrs = {
                        ...newSlide.attrs,
                        id: `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    };

                    return commands.insertContentAt(pos, {
                        type: this.name,
                        attrs: newAttrs,
                        content: newSlide.content.toJSON(),
                    });
                }

                return false;
            },

            setSlideLayout: (layout: SlideAttributes['layout']) => ({ commands, state }) => {
                const { $from } = state.selection;
                const slideNode = $from.node($from.depth - 1);

                if (slideNode && slideNode.type.name === this.name) {
                    const pos = $from.before($from.depth - 1);
                    return commands.updateAttributes(this.name, { layout });
                }

                return false;
            },

            setSlideBackground: (color: string) => ({ commands, state }) => {
                const { $from } = state.selection;
                const slideNode = $from.node($from.depth - 1);

                if (slideNode && slideNode.type.name === this.name) {
                    return commands.updateAttributes(this.name, { backgroundColor: color });
                }

                return false;
            },
        };
    },

    addKeyboardShortcuts() {
        return {
            // Cmd/Ctrl + Enter: Insert new slide after current
            'Mod-Enter': () => {
                return this.editor.commands.insertSlide();
            },
            // Cmd/Ctrl + D: Duplicate current slide
            'Mod-d': () => {
                return this.editor.commands.duplicateSlide();
            },
            // Cmd/Ctrl + Shift + Backspace: Delete current slide
            'Mod-Shift-Backspace': () => {
                return this.editor.commands.deleteSlide();
            },
        };
    },
});
