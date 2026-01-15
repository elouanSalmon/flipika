import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SlideComponent } from './SlideComponent';

/**
 * Custom TipTap Extension: Slide
 * 
 * Représente une "slide" Flipika dans l'éditeur TipTap
 * Chaque slide peut avoir un type (performance, chart, metrics) et des données
 */

export interface SlideAttributes {
    slideType: 'performance' | 'chart' | 'metrics' | 'creative';
    slideData: {
        title?: string;
        [key: string]: any;
    };
}

export const SlideExtension = Node.create({
    name: 'slide',

    group: 'block',

    content: 'block+',

    draggable: true,

    addAttributes() {
        return {
            slideType: {
                default: 'performance',
                parseHTML: element => element.getAttribute('data-slide-type') || 'performance',
                renderHTML: attributes => ({
                    'data-slide-type': attributes.slideType,
                }),
            },
            slideData: {
                default: {},
                parseHTML: element => {
                    const dataAttr = element.getAttribute('data-slide-data');
                    try {
                        return dataAttr ? JSON.parse(dataAttr) : {};
                    } catch {
                        return {};
                    }
                },
                renderHTML: attributes => ({
                    'data-slide-data': JSON.stringify(attributes.slideData),
                }),
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
        return ReactNodeViewRenderer(SlideComponent);
    },

    addCommands() {
        return {
            insertSlide: (attributes?: Partial<SlideAttributes>) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: attributes,
                    content: [
                        {
                            type: 'heading',
                            attrs: { level: 2 },
                            content: [{ type: 'text', text: attributes?.slideData?.title || 'Nouvelle Slide' }],
                        },
                        {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'Contenu de la slide...' }],
                        },
                    ],
                });
            },
        };
    },
});
