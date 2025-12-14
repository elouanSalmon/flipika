// Mock data generator for demo mode

export interface MockCampaign {
    id: string;
    name: string;
    status: 'ENABLED' | 'PAUSED' | 'REMOVED';
    type: string;
    cost: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    averageCpc: number;
    conversionRate: number;
    roas: number;
}

export interface MockMetrics {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    averageCtr: number;
    averageCpc: number;
    averageRoas: number;
}

export const generateMockCampaigns = (): MockCampaign[] => {
    return [
        {
            id: 'demo-1',
            name: 'Search - Paris - Produits Premium',
            status: 'ENABLED',
            type: 'SEARCH',
            cost: 2450.50,
            impressions: 45230,
            clicks: 1820,
            conversions: 87,
            ctr: 4.02,
            averageCpc: 1.35,
            conversionRate: 4.78,
            roas: 4.2
        },
        {
            id: 'demo-2',
            name: 'Display - France - Awareness',
            status: 'ENABLED',
            type: 'DISPLAY',
            cost: 1200.00,
            impressions: 125000,
            clicks: 875,
            conversions: 23,
            ctr: 0.70,
            averageCpc: 1.37,
            conversionRate: 2.63,
            roas: 2.8
        },
        {
            id: 'demo-3',
            name: 'Shopping - Catalogue Complet',
            status: 'ENABLED',
            type: 'SHOPPING',
            cost: 3200.75,
            impressions: 78900,
            clicks: 2340,
            conversions: 156,
            ctr: 2.97,
            averageCpc: 1.37,
            conversionRate: 6.67,
            roas: 5.6
        },
        {
            id: 'demo-4',
            name: 'Search - Lyon - Services',
            status: 'PAUSED',
            type: 'SEARCH',
            cost: 890.25,
            impressions: 23400,
            clicks: 670,
            conversions: 34,
            ctr: 2.86,
            averageCpc: 1.33,
            conversionRate: 5.07,
            roas: 3.9
        },
        {
            id: 'demo-5',
            name: 'Video - YouTube - Brand',
            status: 'ENABLED',
            type: 'VIDEO',
            cost: 1500.00,
            impressions: 234000,
            clicks: 3200,
            conversions: 45,
            ctr: 1.37,
            averageCpc: 0.47,
            conversionRate: 1.41,
            roas: 1.9
        },
        {
            id: 'demo-6',
            name: 'Performance Max - Tous Produits',
            status: 'ENABLED',
            type: 'PERFORMANCE_MAX',
            cost: 4100.00,
            impressions: 156000,
            clicks: 4200,
            conversions: 245,
            ctr: 2.69,
            averageCpc: 0.98,
            conversionRate: 5.83,
            roas: 6.8
        }
    ];
};

export const calculateMockMetrics = (campaigns: MockCampaign[]): MockMetrics => {
    const totalSpend = campaigns.reduce((sum, c) => sum + c.cost, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

    return {
        totalSpend,
        totalImpressions,
        totalClicks,
        totalConversions,
        averageCtr: (totalClicks / totalImpressions) * 100,
        averageCpc: totalSpend / totalClicks,
        averageRoas: campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length
    };
};

export const generateMockAuditIssues = () => {
    return [
        {
            id: 'audit-1',
            severity: 'high' as const,
            category: 'Budget',
            title: 'Budget limité détecté',
            description: 'La campagne "Search - Paris" est limitée par le budget 78% du temps. Vous perdez des impressions potentielles.',
            impact: 'Perte estimée de 450 conversions/mois',
            recommendation: 'Augmenter le budget de 30% (+735€/mois) pour capturer tout le trafic disponible.',
            estimatedGain: '+18% de conversions'
        },
        {
            id: 'audit-2',
            severity: 'high' as const,
            category: 'Qualité',
            title: 'Scores de qualité faibles',
            description: '12 mots-clés ont un Quality Score inférieur à 5/10, augmentant vos coûts de 40%.',
            impact: 'Surcoût de ~520€/mois',
            recommendation: 'Optimiser les annonces et landing pages pour ces mots-clés ou les mettre en pause.',
            estimatedGain: '-25% de CPC'
        },
        {
            id: 'audit-3',
            severity: 'medium' as const,
            category: 'Structure',
            title: 'Mots-clés en doublon',
            description: '8 mots-clés sont présents dans plusieurs groupes d\'annonces, créant une compétition interne.',
            impact: 'Baisse de CTR et augmentation du CPC',
            recommendation: 'Consolider les mots-clés dans un seul groupe d\'annonces par thématique.',
            estimatedGain: '+12% de CTR'
        },
        {
            id: 'audit-4',
            severity: 'medium' as const,
            category: 'Performance',
            title: 'Annonces sous-performantes',
            description: '5 annonces ont un CTR inférieur à 2% depuis plus de 30 jours.',
            impact: 'Perte d\'opportunités de clics',
            recommendation: 'Tester de nouvelles variantes d\'annonces avec des CTA plus impactants.',
            estimatedGain: '+8% de clics'
        },
        {
            id: 'audit-5',
            severity: 'low' as const,
            category: 'Optimisation',
            title: 'Extensions d\'annonces manquantes',
            description: '3 campagnes n\'utilisent pas toutes les extensions disponibles (sitelinks, callouts).',
            impact: 'Visibilité réduite dans les résultats',
            recommendation: 'Ajouter les extensions manquantes pour améliorer le CTR.',
            estimatedGain: '+5% de CTR'
        },
        {
            id: 'audit-6',
            severity: 'low' as const,
            category: 'Ciblage',
            title: 'Audiences non optimisées',
            description: 'Certaines audiences ont un ROAS inférieur à 2.0 depuis 60 jours.',
            impact: 'Budget gaspillé sur audiences peu performantes',
            recommendation: 'Exclure ou réduire les enchères sur les audiences sous-performantes.',
            estimatedGain: '+15% de ROAS'
        }
    ];
};

export const generateMockPerformanceHistory = () => {
    const days = 30;
    const history = [];
    const baseSpend = 300;
    const baseClicks = 250;
    const baseConversions = 12;

    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Add some variance
        const variance = Math.random() * 0.3 - 0.15; // -15% to +15%

        history.push({
            date: date.toISOString().split('T')[0],
            spend: baseSpend * (1 + variance),
            clicks: Math.floor(baseClicks * (1 + variance)),
            conversions: Math.floor(baseConversions * (1 + variance)),
            impressions: Math.floor(baseClicks * 40 * (1 + variance)),
            ctr: 2.5 + variance * 2,
            cpc: 1.2 + variance * 0.3,
            roas: 4.5 + variance * 1.5
        });
    }

    return history;
};

// Legacy mock data for backward compatibility
export const MOCK_CUSTOMERS = [
    "customers/1234567890",
    "customers/9876543210"
];

export const MOCK_CAMPAIGNS = generateMockCampaigns().map(c => ({
    id: c.id,
    name: c.name,
    status: c.status,
    cost: c.cost,
    impressions: c.impressions,
    clicks: c.clicks
}));
