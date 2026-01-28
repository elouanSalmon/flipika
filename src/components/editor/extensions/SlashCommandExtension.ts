import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import { SlashCommandMenu } from '../components/SlashCommandMenu';
import tippy from 'tippy.js';
import type { Instance as TippyInstance } from 'tippy.js';
import { BarChart3, Target, TrendingUp, Filter, Image, Columns2, Layout, PieChart, Trophy, Building2, Table as TableIcon, Presentation, PartyPopper } from 'lucide-react';
import i18n from '../../../i18n';


/**
 * Slash Command Extension (Epic 13 - Story 13.2)
 * 
 * Enables slash commands for inserting data blocks:
 * - /performance - Insert performance metrics block
 * - /chart - Insert chart block
 * - /chart - Insert chart block
 * - /metrics - Insert key metrics block
 * - /flexible - Insert flexible data block
 */

import { Settings } from 'lucide-react';

export interface SlashCommandItem {
    title: string;
    titleKey?: string;
    description: string;
    descriptionKey?: string;
    icon: any;
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
                            title: i18n.t('reports:slashCommand.performanceOverview.title'),
                            titleKey: 'reports:slashCommand.performanceOverview.title',
                            description: i18n.t('reports:slashCommand.performanceOverview.description'),
                            descriptionKey: 'reports:slashCommand.performanceOverview.description',
                            icon: TrendingUp,
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .insertDataBlock({
                                        blockType: 'performance_overview',
                                        config: {},
                                    })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.flexibleData.title'),
                            titleKey: 'reports:slashCommand.flexibleData.title',
                            description: i18n.t('reports:slashCommand.flexibleData.description'),
                            descriptionKey: 'reports:slashCommand.flexibleData.description',
                            icon: Settings,
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .insertDataBlock({
                                        blockType: 'flexible_data',
                                        config: {
                                            title: 'New Data Block',
                                            visualization: 'table',
                                            metrics: ['metrics.impressions', 'metrics.clicks'],
                                            dimension: 'segments.date',
                                            isNew: true
                                        },
                                    })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.chart.title'),
                            titleKey: 'reports:slashCommand.chart.title',
                            description: i18n.t('reports:slashCommand.chart.description'),
                            descriptionKey: 'reports:slashCommand.chart.description',
                            icon: BarChart3,
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .insertDataBlock({
                                        blockType: 'campaign_chart',
                                        config: { chartType: 'line' },
                                    })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.keyMetrics.title'),
                            titleKey: 'reports:slashCommand.keyMetrics.title',
                            description: i18n.t('reports:slashCommand.keyMetrics.description'),
                            descriptionKey: 'reports:slashCommand.keyMetrics.description',
                            icon: Target,
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .insertDataBlock({
                                        blockType: 'key_metrics',
                                        config: {},
                                    })
                                    .run();
                            },
                        },
                        {
                            title: 'Image (Médiathèque)',
                            description: 'Insérer une image depuis votre galerie',
                            icon: Image,
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).run();
                                window.dispatchEvent(new CustomEvent('flipika:open-media-library'));
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.adCreative.title'),
                            titleKey: 'reports:slashCommand.adCreative.title',
                            description: i18n.t('reports:slashCommand.adCreative.description'),
                            descriptionKey: 'reports:slashCommand.adCreative.description',
                            icon: Image,
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertDataBlock({ blockType: 'ad_creative', config: {} })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.funnelAnalysis.title'),
                            titleKey: 'reports:slashCommand.funnelAnalysis.title',
                            description: i18n.t('reports:slashCommand.funnelAnalysis.description'),
                            descriptionKey: 'reports:slashCommand.funnelAnalysis.description',
                            icon: Filter,
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertDataBlock({ blockType: 'funnel_analysis', config: {} })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.heatmap.title'),
                            titleKey: 'reports:slashCommand.heatmap.title',
                            description: i18n.t('reports:slashCommand.heatmap.description'),
                            descriptionKey: 'reports:slashCommand.heatmap.description',
                            icon: Layout,
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertDataBlock({ blockType: 'heatmap', config: {} })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.devicePlatformSplit.title'),
                            titleKey: 'reports:slashCommand.devicePlatformSplit.title',
                            description: i18n.t('reports:slashCommand.devicePlatformSplit.description'),
                            descriptionKey: 'reports:slashCommand.devicePlatformSplit.description',
                            icon: PieChart,
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertDataBlock({ blockType: 'device_platform_split', config: {} })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.table.title'),
                            titleKey: 'reports:slashCommand.table.title',
                            description: i18n.t('reports:slashCommand.table.description'),
                            descriptionKey: 'reports:slashCommand.table.description',
                            icon: TableIcon, // Need to import this first!
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.topPerformers.title'),
                            titleKey: 'reports:slashCommand.topPerformers.title',
                            description: i18n.t('reports:slashCommand.topPerformers.description'),
                            descriptionKey: 'reports:slashCommand.topPerformers.description',
                            icon: Trophy,
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertDataBlock({ blockType: 'top_performers', config: {} })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.clientLogo.title'),
                            titleKey: 'reports:slashCommand.clientLogo.title',
                            description: i18n.t('reports:slashCommand.clientLogo.description'),
                            descriptionKey: 'reports:slashCommand.clientLogo.description',
                            icon: Building2,
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertDataBlock({ blockType: 'clientLogo', config: {} })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.columns.title'),
                            titleKey: 'reports:slashCommand.columns.title',
                            description: i18n.t('reports:slashCommand.columns.description'),
                            descriptionKey: 'reports:slashCommand.columns.description',
                            icon: Columns2,
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertContent({
                                        type: 'columnGroup',
                                        content: [
                                            { type: 'column', content: [{ type: 'paragraph' }] },
                                            { type: 'column', content: [{ type: 'paragraph' }] },
                                        ],
                                    })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.coverPage.title'),
                            titleKey: 'reports:slashCommand.coverPage.title',
                            description: i18n.t('reports:slashCommand.coverPage.description'),
                            descriptionKey: 'reports:slashCommand.coverPage.description',
                            icon: Presentation,
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).run();
                                window.dispatchEvent(new CustomEvent('flipika:insert-cover-page'));
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.conclusionPage.title'),
                            titleKey: 'reports:slashCommand.conclusionPage.title',
                            description: i18n.t('reports:slashCommand.conclusionPage.description'),
                            descriptionKey: 'reports:slashCommand.conclusionPage.description',
                            icon: PartyPopper,
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).run();
                                window.dispatchEvent(new CustomEvent('flipika:insert-conclusion-page'));
                            },
                        },
                    ];


                    // Filter by query
                    return items.filter(item => {
                        const title = item.titleKey ? i18n.t(item.titleKey) : item.title;
                        return title.toLowerCase().includes(query.toLowerCase());
                    });
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
