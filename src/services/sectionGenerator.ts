import type { CampaignMetrics, Campaign } from '../types/business';
import type { JSONContent } from '@tiptap/react';

/**
 * Generate executive summary content from metrics
 */
export const generateExecutiveSummary = (
    metrics: CampaignMetrics,
    accountName: string,
    periodStart: Date,
    periodEnd: Date
): JSONContent => {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('fr-FR').format(Math.round(value));
    };

    return {
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
                        text: `Ce rapport présente les performances des campagnes Google Ads pour ${accountName} durant la période du ${formatDate(periodStart)} au ${formatDate(periodEnd)}.`,
                    },
                ],
            },
            {
                type: 'heading',
                attrs: { level: 3 },
                content: [{ type: 'text', text: 'Points Clés' }],
            },
            {
                type: 'bulletList',
                content: [
                    {
                        type: 'listItem',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        marks: [{ type: 'bold' }],
                                        text: 'Dépenses totales: ',
                                    },
                                    { type: 'text', text: formatCurrency(metrics.cost) },
                                ],
                            },
                        ],
                    },
                    {
                        type: 'listItem',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        marks: [{ type: 'bold' }],
                                        text: 'Impressions: ',
                                    },
                                    { type: 'text', text: formatNumber(metrics.impressions) },
                                ],
                            },
                        ],
                    },
                    {
                        type: 'listItem',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        marks: [{ type: 'bold' }],
                                        text: 'Clics: ',
                                    },
                                    { type: 'text', text: formatNumber(metrics.clicks) },
                                ],
                            },
                        ],
                    },
                    {
                        type: 'listItem',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        marks: [{ type: 'bold' }],
                                        text: 'Conversions: ',
                                    },
                                    { type: 'text', text: formatNumber(metrics.conversions) },
                                ],
                            },
                        ],
                    },
                    {
                        type: 'listItem',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        marks: [{ type: 'bold' }],
                                        text: 'ROAS: ',
                                    },
                                    { type: 'text', text: `${metrics.roas.toFixed(2)}x` },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };
};

/**
 * Generate metrics section content
 */
export const generateMetricsSection = (metrics: CampaignMetrics): JSONContent => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('fr-FR').format(Math.round(value));
    };

    return {
        type: 'doc',
        content: [
            {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Métriques Globales' }],
            },
            {
                type: 'table',
                content: [
                    {
                        type: 'tableRow',
                        content: [
                            {
                                type: 'tableHeader',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Métrique' }] }],
                            },
                            {
                                type: 'tableHeader',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Valeur' }] }],
                            },
                        ],
                    },
                    {
                        type: 'tableRow',
                        content: [
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Impressions' }] }],
                            },
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: formatNumber(metrics.impressions) }] }],
                            },
                        ],
                    },
                    {
                        type: 'tableRow',
                        content: [
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Clics' }] }],
                            },
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: formatNumber(metrics.clicks) }] }],
                            },
                        ],
                    },
                    {
                        type: 'tableRow',
                        content: [
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'CTR' }] }],
                            },
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: `${metrics.ctr.toFixed(2)}%` }] }],
                            },
                        ],
                    },
                    {
                        type: 'tableRow',
                        content: [
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Coût Total' }] }],
                            },
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: formatCurrency(metrics.cost) }] }],
                            },
                        ],
                    },
                    {
                        type: 'tableRow',
                        content: [
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'CPC Moyen' }] }],
                            },
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: formatCurrency(metrics.cpc) }] }],
                            },
                        ],
                    },
                    {
                        type: 'tableRow',
                        content: [
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Conversions' }] }],
                            },
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: formatNumber(metrics.conversions) }] }],
                            },
                        ],
                    },
                    {
                        type: 'tableRow',
                        content: [
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'CPA' }] }],
                            },
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: formatCurrency(metrics.cpa) }] }],
                            },
                        ],
                    },
                    {
                        type: 'tableRow',
                        content: [
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ROAS' }] }],
                            },
                            {
                                type: 'tableCell',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: `${metrics.roas.toFixed(2)}x` }] }],
                            },
                        ],
                    },
                ],
            },
        ],
    };
};

/**
 * Generate campaign analysis section
 */
export const generateCampaignAnalysis = (campaigns: Campaign[]): JSONContent => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('fr-FR').format(Math.round(value));
    };

    const tableRows = campaigns.map((campaign) => ({
        type: 'tableRow',
        content: [
            {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: campaign.name }] }],
            },
            {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: formatNumber(campaign.metrics.impressions) }] }],
            },
            {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: formatNumber(campaign.metrics.clicks) }] }],
            },
            {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: formatCurrency(campaign.metrics.cost) }] }],
            },
            {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: `${campaign.metrics.roas.toFixed(2)}x` }] }],
            },
        ],
    }));

    return {
        type: 'doc',
        content: [
            {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Analyse des Campagnes' }],
            },
            {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Performance détaillée de chaque campagne:' }],
            },
            {
                type: 'table',
                content: [
                    {
                        type: 'tableRow',
                        content: [
                            {
                                type: 'tableHeader',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Campagne' }] }],
                            },
                            {
                                type: 'tableHeader',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Impressions' }] }],
                            },
                            {
                                type: 'tableHeader',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Clics' }] }],
                            },
                            {
                                type: 'tableHeader',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Coût' }] }],
                            },
                            {
                                type: 'tableHeader',
                                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'ROAS' }] }],
                            },
                        ],
                    },
                    ...tableRows,
                ],
            },
        ],
    };
};

/**
 * Generate recommendations based on metrics
 */
export const generateRecommendations = (campaigns: Campaign[], metrics: CampaignMetrics): JSONContent => {
    const recommendations: string[] = [];

    // Generate smart recommendations
    if (metrics.ctr < 2) {
        recommendations.push('Améliorer le CTR en optimisant les annonces et les mots-clés');
    }
    if (metrics.roas < 2) {
        recommendations.push('Augmenter le ROAS en ciblant des audiences plus qualifiées');
    }
    if ((metrics.qualityScore || 0) < 7) {
        recommendations.push('Améliorer le Score de Qualité pour réduire les coûts');
    }
    if (metrics.conversions < 50) {
        recommendations.push('Optimiser les pages de destination pour augmenter les conversions');
    }

    const pausedCampaigns = campaigns.filter((c) => c.status === 'PAUSED');
    if (pausedCampaigns.length > 0) {
        recommendations.push(`Réactiver ou supprimer ${pausedCampaigns.length} campagne(s) en pause`);
    }

    if (recommendations.length === 0) {
        recommendations.push('Continuer à surveiller les performances et ajuster selon les tendances');
        recommendations.push('Tester de nouvelles variantes d\'annonces pour améliorer les résultats');
    }

    const listItems = recommendations.map((rec) => ({
        type: 'listItem',
        content: [
            {
                type: 'paragraph',
                content: [{ type: 'text', text: rec }],
            },
        ],
    }));

    return {
        type: 'doc',
        content: [
            {
                type: 'heading',
                attrs: { level: 2 },
                content: [{ type: 'text', text: 'Recommandations' }],
            },
            {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Suggestions pour optimiser vos campagnes:' }],
            },
            {
                type: 'bulletList',
                content: listItems,
            },
        ],
    };
};
