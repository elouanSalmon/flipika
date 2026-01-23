import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SlideComponent } from '../components/SlideComponent';

/**
 * Slide Extension for Tiptap (Epic 13 - Gamma-style Slide Editor)
 * 
 * Each slide is a ProseMirror node with fixed dimensions (16:9 aspect ratio).
 * Slides are stacked vertically in the editor and can contain rich content.
 * 
 * IMPORTANT: Slides can only contain inline content and specific block types,
 * NOT other slides.
 */

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        slide: {
            insertSlide: () => ReturnType;
        };
    }
}

export const SlideExtension = Node.create({
    name: 'slide',

    // Slides are NOT blocks - they're a special top-level group
    group: 'slide',

    // Slides can contain paragraphs, headings, lists, quotes, code blocks, and dataBlocks - but NOT other slides
    content: '(paragraph | heading | bulletList | orderedList | blockquote | codeBlock | horizontalRule | dataBlock)+',

    defining: true,

    isolating: true,

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: element => element.getAttribute('data-slide-id'),
                renderHTML: attributes => {
                    if (!attributes.id) return {};
                    return { 'data-slide-id': attributes.id };
                },
            },
            layout: {
                default: 'content',
                parseHTML: element => element.getAttribute('data-layout') || 'content',
                renderHTML: attributes => ({
                    'data-layout': attributes.layout,
                }),
            },
            backgroundColor: {
                default: null, // null = use theme color, explicit value = custom override
                parseHTML: element => element.getAttribute('data-bg-color') || null,
                renderHTML: attributes => {
                    // Only render style if explicitly set (not using theme default)
                    if (!attributes.backgroundColor) return {};
                    return {
                        'data-bg-color': attributes.backgroundColor,
                        style: `background-color: ${attributes.backgroundColor}`,
                    };
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
        return ['div', mergeAttributes(HTMLAttributes, {
            'data-slide': 'true',
            class: 'slide-container',
        }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(SlideComponent);
    },

    addCommands() {
        return {
            insertSlide: () => ({ chain, state }) => {
                // Find the end of the document to insert the new slide
                const endPos = state.doc.content.size;

                return chain()
                    .insertContentAt(endPos, {
                        type: this.name,
                        attrs: {
                            id: `slide-${Date.now()}`,
                            layout: 'content',
                            // backgroundColor is null by default = use theme color
                        },
                        content: [
                            { type: 'paragraph' },
                        ],
                    })
                    .focus()
                    .run();
            },
        };
    },

    addKeyboardShortcuts() {
        return {
            'Mod-Enter': () => this.editor.commands.insertSlide(),
        };
    },
});
