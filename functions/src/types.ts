export interface GlobalMetricsSummary {
    cost: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    cpa: number;
    roas: number;
    variations?: {
        cost: number;
        conversions: number;
        cpa: number;
        roas: number;
    };
}

export interface CampaignSummary {
    id: string;
    name: string;
    metrics: {
        cost: number;
        conversions: number;
        cpa: number;
        roas: number;
    };
    variations?: {
        cost: number;
        conversions: number;
        cpa: number;
        roas: number;
    };
}

export interface InsightRequest {
    period: { start: string; end: string };
    globalMetrics: GlobalMetricsSummary;
    campaigns: CampaignSummary[];
}

export interface Insight {
    id: string;
    title: string;
    analysis: string;
    type: 'performance' | 'opportunity' | 'alert';
    relevanceScore: number;
    chartConfig: {
        type: 'bar' | 'line' | 'pie' | 'kpi';
        metrics: string[];
        dimension?: string;
        title?: string;
    };
}

export interface InsightResponse {
    insights: Insight[];
}
