import { SectionType } from '../types/reportTypes';
import type { SectionTemplate } from '../types/reportTypes';

/**
 * Available section templates for the report builder
 */
export const sectionTemplates: SectionTemplate[] = [
    {
        type: SectionType.COVER,
        title: 'Page de couverture',
        description: 'Page de titre avec logo et informations du rapport',
        icon: 'FileText',
        defaultContent: {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 1, textAlign: 'center' },
                    content: [{ type: 'text', text: 'Rapport de Performance Google Ads' }],
                },
                {
                    type: 'paragraph',
                    attrs: { textAlign: 'center' },
                    content: [{ type: 'text', text: 'Période: [Dates]' }],
                },
            ],
        },
    },
    {
        type: SectionType.EXECUTIVE_SUMMARY,
        title: 'Résumé exécutif',
        description: 'Vue d\'ensemble des performances et points clés',
        icon: 'FileBarChart',
        defaultContent: {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: 'Résumé Exécutif' }],
                },
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'Ce rapport présente les performances de vos campagnes Google Ads pour la période sélectionnée.',
                        },
                    ],
                },
            ],
        },
        requiresData: true,
    },
    {
        type: SectionType.METRICS,
        title: 'Métriques globales',
        description: 'Tableau des métriques principales',
        icon: 'BarChart3',
        defaultContent: {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: 'Métriques Globales' }],
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Performances globales de vos campagnes:' }],
                },
            ],
        },
        requiresData: true,
    },
    {
        type: SectionType.CAMPAIGN_ANALYSIS,
        title: 'Analyse des campagnes',
        description: 'Détails et comparaison des campagnes',
        icon: 'TrendingUp',
        defaultContent: {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: 'Analyse des Campagnes' }],
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Analyse détaillée de chaque campagne:' }],
                },
            ],
        },
        requiresData: true,
    },
    {
        type: SectionType.CHART,
        title: 'Graphique',
        description: 'Graphique personnalisé',
        icon: 'PieChart',
        defaultContent: {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: 'Graphique' }],
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Insérez un graphique ici.' }],
                },
            ],
        },
    },
    {
        type: SectionType.RECOMMENDATIONS,
        title: 'Recommandations',
        description: 'Suggestions d\'optimisation',
        icon: 'Lightbulb',
        defaultContent: {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: 'Recommandations' }],
                },
                {
                    type: 'bulletList',
                    content: [
                        {
                            type: 'listItem',
                            content: [
                                {
                                    type: 'paragraph',
                                    content: [{ type: 'text', text: 'Optimiser les mots-clés à faible performance' }],
                                },
                            ],
                        },
                        {
                            type: 'listItem',
                            content: [
                                {
                                    type: 'paragraph',
                                    content: [{ type: 'text', text: 'Augmenter le budget des campagnes performantes' }],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    },
    {
        type: SectionType.CUSTOM_TEXT,
        title: 'Section personnalisée',
        description: 'Texte libre et contenu personnalisé',
        icon: 'Type',
        defaultContent: {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: 'Nouvelle Section' }],
                },
                {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Commencez à écrire...' }],
                },
            ],
        },
    },
    {
        type: SectionType.TABLE,
        title: 'Tableau',
        description: 'Tableau de données personnalisé',
        icon: 'Table',
        defaultContent: {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ type: 'text', text: 'Tableau' }],
                },
                {
                    type: 'table',
                    content: [
                        {
                            type: 'tableRow',
                            content: [
                                {
                                    type: 'tableHeader',
                                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'En-tête 1' }] }],
                                },
                                {
                                    type: 'tableHeader',
                                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'En-tête 2' }] }],
                                },
                            ],
                        },
                        {
                            type: 'tableRow',
                            content: [
                                {
                                    type: 'tableCell',
                                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Cellule 1' }] }],
                                },
                                {
                                    type: 'tableCell',
                                    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Cellule 2' }] }],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    },
];

/**
 * Get a section template by type
 */
export const getSectionTemplate = (type: SectionType): SectionTemplate | undefined => {
    return sectionTemplates.find((template) => template.type === type);
};

/**
 * Get all available section templates
 */
export const getAllSectionTemplates = (): SectionTemplate[] => {
    return sectionTemplates;
};
