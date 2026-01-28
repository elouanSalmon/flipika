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
            { name: 'Setup Time', hasCompetitor: false, hasFlipika: true },
            { name: 'White Label', hasCompetitor: true, hasFlipika: true },
            { name: 'AI Insights', hasCompetitor: false, hasFlipika: true },
            { name: 'Automated Scheduling', hasCompetitor: true, hasFlipika: true },
            { name: 'PPTX Export', hasCompetitor: false, hasFlipika: true },
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
            { name: 'Setup Time', hasCompetitor: true, hasFlipika: true },
            { name: 'White Label', hasCompetitor: true, hasFlipika: true },
            { name: 'AI Insights', hasCompetitor: false, hasFlipika: true },
            { name: 'Cost per Client', hasCompetitor: true, hasFlipika: false },
            { name: 'Unlimited Reports', hasCompetitor: false, hasFlipika: true },
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
            { name: 'Setup Time', hasCompetitor: true, hasFlipika: true },
            { name: 'White Label', hasCompetitor: true, hasFlipika: true },
            { name: 'AI Insights', hasCompetitor: false, hasFlipika: true },
            { name: 'Slide-based Editing', hasCompetitor: false, hasFlipika: true },
            { name: 'Real-time Sync', hasCompetitor: true, hasFlipika: true },
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
            { name: 'Automated Data Sync', hasCompetitor: false, hasFlipika: true },
            { name: 'Visual Branding', hasCompetitor: false, hasFlipika: true },
            { name: 'AI Insights', hasCompetitor: false, hasFlipika: true },
            { name: 'Client Login', hasCompetitor: false, hasFlipika: true },
            { name: 'Version Control', hasCompetitor: false, hasFlipika: true },
        ],
        pricing: '0',
        ratingValue: '4.0',
        reviewCount: '5000',
    },
];
