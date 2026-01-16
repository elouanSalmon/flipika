import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import { SlashCommandMenu } from '../components/SlashCommandMenu';
import tippy from 'tippy.js';
import type { Instance as TippyInstance } from 'tippy.js';

/**
 * Slash Command Extension (Epic 13 - Story 13.2)
 * 
 * Enables slash commands for inserting data blocks:
 * - /performance - Insert performance metrics block
 * - /chart - Insert chart block
 * - /metrics - Insert key metrics block
 */

export interface SlashCommandItem {
    title: string;
    description: string;
    icon: string;
    command: ({ editor, range }: any) => void;
}

export const SlashCommandExtension = Extension.create({
    name: 'slashCommand',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                startOfLine: false,
                command: ({ editor, range, props }: any) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
                items: ({ query }: { query: string }): SlashCommandItem[] => {
                    const items: SlashCommandItem[] = [
                        {
                            title: 'Performance Overview',
                            description: 'Insert a performance metrics grid',
                            icon: '📊',
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .insertDataBlock({
                                        blockType: 'performance',
                                        config: {},
                                    })
                                    .run();
                            },
                        },
                        {
                            title: 'Chart',
                            description: 'Insert a line, bar, or area chart',
                            icon: '📈',
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .insertDataBlock({
                                        blockType: 'chart',
                                        config: { chartType: 'line' },
                                    })
                                    .run();
                            },
                        },
                        {
                            title: 'Key Metrics',
                            description: 'Insert a 2x2 grid of key KPIs',
                            icon: '🎯',
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .insertDataBlock({
                                        blockType: 'keyMetrics',
                                        config: {},
                                    })
                                    .run();
                            },
                        },
                    ];

                    // Filter by query
                    return items.filter(item =>
                        item.title.toLowerCase().includes(query.toLowerCase())
                    );
                },
                render: () => {
                    let component: ReactRenderer;
                    let popup: TippyInstance[];

                    return {
                        onStart: (props: any) => {
                            component = new ReactRenderer(SlashCommandMenu, {
                                props,
                                editor: props.editor,
                            });

                            if (!props.clientRect) {
                                return;
                            }

                            popup = tippy('body', {
                                getReferenceClientRect: props.clientRect,
                                appendTo: () => document.body,
                                content: component.element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: 'manual',
                                placement: 'bottom-start',
                            });
                        },

                        onUpdate(props: any) {
                            component.updateProps(props);

                            if (!props.clientRect) {
                                return;
                            }

                            popup[0].setProps({
                                getReferenceClientRect: props.clientRect,
                            });
                        },

                        onKeyDown(props: any) {
                            if (props.event.key === 'Escape') {
                                popup[0].hide();
                                return true;
                            }

                            return (component.ref as any)?.onKeyDown(props);
                        },

                        onExit() {
                            popup[0].destroy();
                            component.destroy();
                        },
                    };
                },
            }),
        ];
    },
});
