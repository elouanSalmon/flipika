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
    {
        id: 'swydo',
        name: 'Swydo',
        slug: 'swydo',
        painPoint: {
            title: 'Outdated Design',
            description: 'Swydo reports feel like 2015. Flipika offers modern, glassmorphism-based dashboards that impress clients instantly.',
        },
        features: [
            { name: 'Modern UI/UX', hasCompetitor: false, hasFlipika: true },
            { name: 'Setup Time', hasCompetitor: true, hasFlipika: true },
            { name: 'White Label', hasCompetitor: true, hasFlipika: true },
            { name: 'Interactive Charts', hasCompetitor: false, hasFlipika: true },
            { name: 'Unlimited Users', hasCompetitor: true, hasFlipika: true },
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
            { name: 'Innovation Speed', hasCompetitor: false, hasFlipika: true },
            { name: 'Customer Support', hasCompetitor: true, hasFlipika: true },
            { name: 'AI Capabilities', hasCompetitor: false, hasFlipika: true },
            { name: 'Ease of Use', hasCompetitor: false, hasFlipika: true },
            { name: 'Setup Time', hasCompetitor: true, hasFlipika: true },
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
            { name: 'Affordable Scaling', hasCompetitor: false, hasFlipika: true },
            { name: 'Visual Quality', hasCompetitor: true, hasFlipika: true },
            { name: 'Data Source Limit', hasCompetitor: true, hasFlipika: false },
            { name: 'Client Portal', hasCompetitor: true, hasFlipika: true },
            { name: 'Custom Domain', hasCompetitor: true, hasFlipika: true },
        ],
        pricing: '229',
        ratingValue: '4.5',
        reviewCount: '600',
    },
];
