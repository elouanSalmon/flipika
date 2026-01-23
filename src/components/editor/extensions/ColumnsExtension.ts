import { Node, mergeAttributes } from '@tiptap/core';

export const ColumnGroup = Node.create({
    name: 'columnGroup',
    group: 'block',
    content: 'column+',
    parseHTML() {
        return [
            {
                tag: 'div[data-type="column-group"]',
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column-group', class: 'column-group' }), 0];
    },
});

export const Column = Node.create({
    name: 'column',
    content: '(paragraph | heading | bulletList | orderedList | blockquote | codeBlock | horizontalRule | dataBlock | table)+',
    parseHTML() {
        return [
            {
                tag: 'div[data-type="column"]',
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column', class: 'column' }), 0];
    },
});
