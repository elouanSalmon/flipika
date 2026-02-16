import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import { SlashCommandMenu } from '../components/SlashCommandMenu';
import tippy from 'tippy.js';
import type { Instance as TippyInstance } from 'tippy.js';
import {
    BarChart3, Target, TrendingUp, Filter, Image, Columns2, Layout,
    PieChart, Trophy, Building2, Table as TableIcon, Presentation,
    PartyPopper, Settings
} from 'lucide-react';
import i18n from '../../../i18n';

/**
 * Slash Command Extension (Epic 13 - Story 13.2)
 *
 * Enables slash commands for inserting data blocks.
 * Items are grouped by category: Google Ads, Meta Ads, Content, Layout, Slides.
 */

export type SlashCommandCategory = 'google' | 'meta' | 'content' | 'layout' | 'slides';

export interface SlashCommandItem {
    title: string;
    titleKey?: string;
    description: string;
    descriptionKey?: string;
    icon: any;
    category?: SlashCommandCategory;
    command: ({ editor, range }: any) => void;
}

const CATEGORY_LABELS: Record<SlashCommandCategory, string> = {
    google: 'Google Ads',
    meta: 'Meta Ads',
    content: 'Contenu',
    layout: 'Mise en page',
    slides: 'Slides',
};

const CATEGORY_ORDER: SlashCommandCategory[] = ['google', 'meta', 'content', 'layout', 'slides'];

export { CATEGORY_LABELS, CATEGORY_ORDER };

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
                        // ── Google Ads ──
                        {
                            title: i18n.t('reports:slashCommand.flexibleData.title'),
                            titleKey: 'reports:slashCommand.flexibleData.title',
                            description: i18n.t('reports:slashCommand.flexibleData.description'),
                            descriptionKey: 'reports:slashCommand.flexibleData.description',
                            icon: Settings,
                            category: 'google',
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
                            title: i18n.t('reports:slashCommand.performanceOverview.title'),
                            titleKey: 'reports:slashCommand.performanceOverview.title',
                            description: i18n.t('reports:slashCommand.performanceOverview.description'),
                            descriptionKey: 'reports:slashCommand.performanceOverview.description',
                            icon: TrendingUp,
                            category: 'google',
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
                            title: i18n.t('reports:slashCommand.chart.title'),
                            titleKey: 'reports:slashCommand.chart.title',
                            description: i18n.t('reports:slashCommand.chart.description'),
                            descriptionKey: 'reports:slashCommand.chart.description',
                            icon: BarChart3,
                            category: 'google',
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
                            category: 'google',
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
                            title: i18n.t('reports:slashCommand.topPerformers.title'),
                            titleKey: 'reports:slashCommand.topPerformers.title',
                            description: i18n.t('reports:slashCommand.topPerformers.description'),
                            descriptionKey: 'reports:slashCommand.topPerformers.description',
                            icon: Trophy,
                            category: 'google',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertDataBlock({ blockType: 'top_performers', config: {} })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.funnelAnalysis.title'),
                            titleKey: 'reports:slashCommand.funnelAnalysis.title',
                            description: i18n.t('reports:slashCommand.funnelAnalysis.description'),
                            descriptionKey: 'reports:slashCommand.funnelAnalysis.description',
                            icon: Filter,
                            category: 'google',
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
                            category: 'google',
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
                            category: 'google',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertDataBlock({ blockType: 'device_platform_split', config: {} })
                                    .run();
                            },
                        },

                        // ── Meta Ads ──
                        {
                            title: i18n.t('reports:slashCommand.flexibleMetaData.title', 'Donnees Meta Flexibles'),
                            titleKey: 'reports:slashCommand.flexibleMetaData.title',
                            description: i18n.t('reports:slashCommand.flexibleMetaData.description', 'Tableau/Graphique Meta Ads personnalise'),
                            descriptionKey: 'reports:slashCommand.flexibleMetaData.description',
                            icon: Settings,
                            category: 'meta',
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .insertDataBlock({
                                        blockType: 'flexible_meta_data',
                                        config: {
                                            title: 'Nouveau Bloc Meta',
                                            visualization: 'table',
                                            metrics: ['metrics.impressions', 'metrics.clicks', 'metrics.spend'],
                                            dimension: 'segments.date',
                                            isNew: true
                                        },
                                    })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.metaOverview.title', "Vue d'ensemble Meta"),
                            titleKey: 'reports:slashCommand.metaOverview.title',
                            description: i18n.t('reports:slashCommand.metaOverview.description', 'Performances et KPIs Meta Ads'),
                            descriptionKey: 'reports:slashCommand.metaOverview.description',
                            icon: TrendingUp,
                            category: 'meta',
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .insertDataBlock({
                                        blockType: 'meta_performance_overview',
                                        config: {},
                                    })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.metaChart.title', 'Graphique Meta'),
                            titleKey: 'reports:slashCommand.metaChart.title',
                            description: i18n.t('reports:slashCommand.metaChart.description', 'Evolution des campagnes Meta Ads'),
                            descriptionKey: 'reports:slashCommand.metaChart.description',
                            icon: BarChart3,
                            category: 'meta',
                            command: ({ editor, range }) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange(range)
                                    .insertDataBlock({
                                        blockType: 'meta_campaign_chart',
                                        config: { chartType: 'line' },
                                    })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.metaKeyMetrics.title', 'Metriques Cles Meta'),
                            titleKey: 'reports:slashCommand.metaKeyMetrics.title',
                            description: i18n.t('reports:slashCommand.metaKeyMetrics.description', 'Depenses, achats, cout par achat, leads'),
                            descriptionKey: 'reports:slashCommand.metaKeyMetrics.description',
                            icon: Target,
                            category: 'meta',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertDataBlock({ blockType: 'meta_key_metrics', config: {} })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.metaTopPerformers.title', 'Top Campagnes Meta'),
                            titleKey: 'reports:slashCommand.metaTopPerformers.title',
                            description: i18n.t('reports:slashCommand.metaTopPerformers.description', 'Meilleures campagnes Meta Ads'),
                            descriptionKey: 'reports:slashCommand.metaTopPerformers.description',
                            icon: Trophy,
                            category: 'meta',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertDataBlock({ blockType: 'meta_top_performers', config: {} })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.metaDeviceSplit.title', 'Repartition Meta'),
                            titleKey: 'reports:slashCommand.metaDeviceSplit.title',
                            description: i18n.t('reports:slashCommand.metaDeviceSplit.description', 'Par appareil (Meta Ads)'),
                            descriptionKey: 'reports:slashCommand.metaDeviceSplit.description',
                            icon: PieChart,
                            category: 'meta',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertDataBlock({ blockType: 'meta_device_split', config: {} })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.metaFunnel.title', 'Entonnoir Meta'),
                            titleKey: 'reports:slashCommand.metaFunnel.title',
                            description: i18n.t('reports:slashCommand.metaFunnel.description', 'Impressions > Clics > Leads > Achats'),
                            descriptionKey: 'reports:slashCommand.metaFunnel.description',
                            icon: Filter,
                            category: 'meta',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertDataBlock({ blockType: 'meta_funnel_analysis', config: {} })
                                    .run();
                            },
                        },

                        // ── Contenu ──
                        {
                            title: 'Image',
                            description: 'Insérer une image depuis votre galerie',
                            icon: Image,
                            category: 'content',
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
                            category: 'content',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertDataBlock({ blockType: 'ad_creative', config: {} })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.clientLogo.title'),
                            titleKey: 'reports:slashCommand.clientLogo.title',
                            description: i18n.t('reports:slashCommand.clientLogo.description'),
                            descriptionKey: 'reports:slashCommand.clientLogo.description',
                            icon: Building2,
                            category: 'content',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertContent({
                                        type: 'dynamicVariable',
                                        attrs: { id: 'clientLogo', label: 'Logo Client' },
                                    })
                                    .run();
                            },
                        },

                        // ── Mise en page ──
                        {
                            title: i18n.t('reports:slashCommand.table.title'),
                            titleKey: 'reports:slashCommand.table.title',
                            description: i18n.t('reports:slashCommand.table.description'),
                            descriptionKey: 'reports:slashCommand.table.description',
                            icon: TableIcon,
                            category: 'layout',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range)
                                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                                    .run();
                            },
                        },
                        {
                            title: i18n.t('reports:slashCommand.columns.title'),
                            titleKey: 'reports:slashCommand.columns.title',
                            description: i18n.t('reports:slashCommand.columns.description'),
                            descriptionKey: 'reports:slashCommand.columns.description',
                            icon: Columns2,
                            category: 'layout',
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

                        // ── Slides ──
                        {
                            title: i18n.t('reports:slashCommand.coverPage.title'),
                            titleKey: 'reports:slashCommand.coverPage.title',
                            description: i18n.t('reports:slashCommand.coverPage.description'),
                            descriptionKey: 'reports:slashCommand.coverPage.description',
                            icon: Presentation,
                            category: 'slides',
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
                            category: 'slides',
                            command: ({ editor, range }) => {
                                editor.chain().focus().deleteRange(range).run();
                                window.dispatchEvent(new CustomEvent('flipika:insert-conclusion-page'));
                            },
                        },
                    ];

                    // Filter by query (search in title, description, and category label)
                    return items.filter(item => {
                        const title = item.titleKey ? i18n.t(item.titleKey) : item.title;
                        const description = item.descriptionKey ? i18n.t(item.descriptionKey) : item.description;
                        const categoryLabel = item.category ? CATEGORY_LABELS[item.category] : '';
                        const q = query.toLowerCase();
                        return title.toLowerCase().includes(q) ||
                            description.toLowerCase().includes(q) ||
                            categoryLabel.toLowerCase().includes(q);
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
                                theme: 'slash-command',
                                maxWidth: 'none',
                                offset: [0, 8],
                                popperOptions: {
                                    strategy: 'fixed',
                                    modifiers: [
                                        {
                                            name: 'flip',
                                            enabled: false,
                                        },
                                        {
                                            name: 'preventOverflow',
                                            options: {
                                                boundary: 'viewport',
                                            },
                                        },
                                    ],
                                },
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
