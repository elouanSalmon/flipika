import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DataBlockComponent } from '../blocks/DataBlockComponent';

/**
 * Data Block Extension for Tiptap (Epic 13 - Story 13.2)
 * 
 * Base extension for inserting dynamic data blocks (metrics, charts, etc.)
 * into Tiptap documents. Each block can fetch and display Google Ads data.
 */

export interface DataBlockAttributes {
    blockType: 'performance' | 'chart' | 'keyMetrics';
    config: {
        accountId?: string;
        campaignIds?: string[];
        startDate?: string;
        endDate?: string;
        chartType?: 'line' | 'bar' | 'area';
        metrics?: string[];
        [key: string]: any;
    };
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        dataBlock: {
            insertDataBlock: (attributes?: Partial<DataBlockAttributes>) => ReturnType;
        };
    }
}

export const DataBlockExtension = Node.create({
    name: 'dataBlock',

    group: 'block',

    atom: true, // Cannot contain other nodes

    draggable: true,

    addAttributes() {
        return {
            blockType: {
                default: 'performance',
                parseHTML: element => element.getAttribute('data-block-type') || 'performance',
                renderHTML: attributes => ({
                    'data-block-type': attributes.blockType,
                }),
            },
            config: {
                default: {},
                parseHTML: element => {
                    const dataAttr = element.getAttribute('data-block-config');
                    try {
                        return dataAttr ? JSON.parse(dataAttr) : {};
                    } catch {
                        return {};
                    }
                },
                renderHTML: attributes => ({
                    'data-block-config': JSON.stringify(attributes.config),
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-block]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-block': 'true' }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(DataBlockComponent);
    },

    addCommands() {
        return {
            insertDataBlock: (attributes?: Partial<DataBlockAttributes>) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: attributes || {
                        blockType: 'performance',
                        config: {},
                    },
                });
            },
        };
    },
});
