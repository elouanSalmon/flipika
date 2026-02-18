export interface CompetitorFeature {
    name: string;
    hasCompetitor: boolean;
    hasFlipika: boolean;
}

export interface Competitor {
    id: string;
    name: string;
    slug: string;
    painPoint: {
        title: string;
        description: string;
    };
    features: CompetitorFeature[];
    pricing: string;
    ratingValue: string;
    reviewCount: string;
}

export const competitors: Competitor[] = [
    {
        id: 'looker-studio',
        name: 'Looker Studio',
        slug: 'looker-studio',
        painPoint: {
            title: 'Extreme Slowness',
            description: 'Looker Studio is notorious for its slow loading times, especially with large Google Ads datasets. Flipika is built for speed with instant report rendering.',
        },
        features: [
            { name: 'setupTime', hasCompetitor: false, hasFlipika: true },
            { name: 'whiteLabel', hasCompetitor: true, hasFlipika: true },
            { name: 'aiInsights', hasCompetitor: false, hasFlipika: true },
            { name: 'automatedScheduling', hasCompetitor: true, hasFlipika: true },
            { name: 'pptxExport', hasCompetitor: false, hasFlipika: true },
        ],
        pricing: '0',
        ratingValue: '4.2',
        reviewCount: '1250',
    },
    {
        id: 'agency-analytics',
        name: 'AgencyAnalytics',
        slug: 'agency-analytics',
        painPoint: {
            title: 'Restrictive Pricing',
            description: 'Paying per client makes it expensive to scale. Flipika offers flat-rate pricing that lets you grow without the heavy overhead.',
        },
        features: [
            { name: 'setupTime', hasCompetitor: true, hasFlipika: true },
            { name: 'whiteLabel', hasCompetitor: true, hasFlipika: true },
            { name: 'aiInsights', hasCompetitor: false, hasFlipika: true },
            { name: 'costPerClient', hasCompetitor: true, hasFlipika: false },
            { name: 'unlimitedReports', hasCompetitor: false, hasFlipika: true },
        ],
        pricing: '79',
        ratingValue: '4.7',
        reviewCount: '850',
    },
    {
        id: 'dashthis',
        name: 'DashThis',
        slug: 'dashthis',
        painPoint: {
            title: 'Clunky Interface',
            description: 'Static dashboards feel dated. Flipika provides a modern, presentation-ready experience that wows clients.',
        },
        features: [
            { name: 'setupTime', hasCompetitor: true, hasFlipika: true },
            { name: 'whiteLabel', hasCompetitor: true, hasFlipika: true },
            { name: 'aiInsights', hasCompetitor: false, hasFlipika: true },
            { name: 'slideBasedEditing', hasCompetitor: false, hasFlipika: true },
            { name: 'realTimeSync', hasCompetitor: true, hasFlipika: true },
        ],
        pricing: '39',
        ratingValue: '4.5',
        reviewCount: '420',
    },
    {
        id: 'excel-spreadsheets',
        name: 'Excel Spreadsheets',
        slug: 'excel-spreadsheets',
        painPoint: {
            title: 'Manual Errors',
            description: 'Copy-pasting data from Google Ads leads to mistakes and wasted hours. Automate your entire reporting workflow with Flipika.',
        },
        features: [
            { name: 'automatedDataSync', hasCompetitor: false, hasFlipika: true },
            { name: 'visualBranding', hasCompetitor: false, hasFlipika: true },
            { name: 'aiInsights', hasCompetitor: false, hasFlipika: true },
            { name: 'clientLogin', hasCompetitor: false, hasFlipika: true },
            { name: 'versionControl', hasCompetitor: false, hasFlipika: true },
        ],
        pricing: '0',
        ratingValue: '4.0',
        reviewCount: '5000',
    },
    {
        id: 'swydo',
        name: 'Swydo',
        slug: 'swydo',
        painPoint: {
            title: 'Outdated Design',
            description: 'Swydo reports feel like 2015. Flipika offers modern, glassmorphism-based dashboards that impress clients instantly.',
        },
        features: [
            { name: 'modernUiUx', hasCompetitor: false, hasFlipika: true },
            { name: 'setupTime', hasCompetitor: true, hasFlipika: true },
            { name: 'whiteLabel', hasCompetitor: true, hasFlipika: true },
            { name: 'interactiveCharts', hasCompetitor: false, hasFlipika: true },
            { name: 'unlimitedUsers', hasCompetitor: true, hasFlipika: true },
        ],
        pricing: '49',
        ratingValue: '4.6',
        reviewCount: '350',
    },
    {
        id: 'reportgarden',
        name: 'ReportGarden',
        slug: 'reportgarden',
        painPoint: {
            title: 'Slow Innovation',
            description: 'ReportGarden updates are rare. Flipika ships new features weekly, keeping you ahead of the curve.',
        },
        features: [
            { name: 'innovationSpeed', hasCompetitor: false, hasFlipika: true },
            { name: 'customerSupport', hasCompetitor: true, hasFlipika: true },
            { name: 'aiCapabilities', hasCompetitor: false, hasFlipika: true },
            { name: 'easeOfUse', hasCompetitor: false, hasFlipika: true },
            { name: 'setupTime', hasCompetitor: true, hasFlipika: true },
        ],
        pricing: '89',
        ratingValue: '4.4',
        reviewCount: '280',
    },
    {
        id: 'whatagraph',
        name: 'Whatagraph',
        slug: 'whatagraph',
        painPoint: {
            title: 'Expensive Scaling',
            description: 'Whatagraph gets very expensive as you add data sources. Flipika offers flat pricing for unlimited growth.',
        },
        features: [
            { name: 'affordableScaling', hasCompetitor: false, hasFlipika: true },
            { name: 'visualQuality', hasCompetitor: true, hasFlipika: true },
            { name: 'dataSourceLimit', hasCompetitor: true, hasFlipika: false },
            { name: 'clientPortal', hasCompetitor: true, hasFlipika: true },
            { name: 'automatedScheduling', hasCompetitor: true, hasFlipika: true },
        ],
        pricing: '229',
        ratingValue: '4.5',
        reviewCount: '600',
    },
];
