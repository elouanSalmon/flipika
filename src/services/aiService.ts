import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import type { InsightRequest, InsightResponse } from '../types/ai';
import type { Campaign, CampaignMetrics } from '../types/business';

export const fetchInsights = async (
    period: { start: Date; end: Date },
    campaigns: Campaign[],
    globalMetrics: CampaignMetrics
): Promise<InsightResponse> => {

    // 1. Prepare Data
    const aiRequest: InsightRequest = {
        period: {
            start: period.start.toISOString().split('T')[0],
            end: period.end.toISOString().split('T')[0]
        },
        globalMetrics: {
            ...globalMetrics,
            variations: {
                cost: 0,
                conversions: 0,
                cpa: 0,
                roas: 0
            }
        },
        campaigns: campaigns
            .filter(c => c.status !== 'REMOVED')
            .sort((a, b) => b.metrics.cost - a.metrics.cost)
            .slice(0, 10)
            .map(c => ({
                id: c.id,
                name: c.name,
                metrics: {
                    cost: c.metrics.cost,
                    conversions: c.metrics.conversions,
                    cpa: c.metrics.cpa,
                    roas: c.metrics.roas
                },
                variations: {
                    cost: 0,
                    conversions: 0,
                    cpa: 0,
                    roas: 0
                }
            }))
    };

    // 2. Call Genkit Flow
    // Note: Genkit flows exposed via onFlow are callable functions, 
    // but they expect the input wrapped in a "data" object property if calling via RAW HTTP.
    // However, the Firebase SDK `httpsCallable` AUTOMATICALLY wraps the argument in `data`.
    // SO, for `onFlow`, we actually just pass the payload directly, similar to `onCall`.

    // THE CATCH: Genkit Output Structure
    // Genkit flows return the result directly as the data of the response.

    const analyzeFlow = httpsCallable<InsightRequest, InsightResponse>(
        functions,
        'analyzeCampaignPerformanceFlow'
    );

    try {
        const result = await analyzeFlow(aiRequest);
        return result.data;
    } catch (error) {
        console.error("Error fetching AI insights (Genkit):", error);
        throw error;
    }
};
