import { z } from "zod";

export const GlobalMetricsSummarySchema = z.object({
    cost: z.number(),
    impressions: z.number(),
    clicks: z.number(),
    conversions: z.number(),
    ctr: z.number(),
    cpc: z.number(),
    cpa: z.number(),
    roas: z.number(),
    variations: z.object({
        cost: z.number().optional(),
        conversions: z.number().optional(),
        cpa: z.number().optional(),
        roas: z.number().optional(),
    }).optional(),
});

export const CampaignSummarySchema = z.object({
    id: z.string(),
    name: z.string(),
    metrics: z.object({
        cost: z.number(),
        conversions: z.number(),
        cpa: z.number(),
        roas: z.number(),
    }),
    variations: z.object({
        cost: z.number().optional(),
        conversions: z.number().optional(),
        cpa: z.number().optional(),
        roas: z.number().optional(),
    }).optional(),
});

export const InsightRequestSchema = z.object({
    period: z.object({
        start: z.string(),
        end: z.string(),
    }),
    globalMetrics: GlobalMetricsSummarySchema,
    campaigns: z.array(CampaignSummarySchema),
});

export const InsightSchema = z.object({
    id: z.string(),
    title: z.string(),
    analysis: z.string(),
    type: z.enum(['performance', 'opportunity', 'alert']),
    relevanceScore: z.number(),
    chartConfig: z.object({
        type: z.enum(['bar', 'line', 'pie', 'kpi']),
        metrics: z.array(z.string()),
        dimension: z.string().optional(),
        title: z.string().optional(),
    }),
});

export const InsightResponseSchema = z.object({
    insights: z.array(InsightSchema),
});
