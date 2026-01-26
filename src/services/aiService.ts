import { getApp } from 'firebase/app';
import { getAI, getGenerativeModel, SchemaType, GoogleAIBackend } from 'firebase/ai';
import type { InsightResponse } from '../types/ai';
import type { Campaign, CampaignMetrics } from '../types/business';

export const fetchInsights = async (
    period: { start: Date; end: Date },
    campaigns: Campaign[],
    globalMetrics: CampaignMetrics
): Promise<InsightResponse> => {

    // 1. Prepare Data Schema for output
    // The Gemini API via Firebase supports structured output validation
    const responseSchema = {
        type: SchemaType.OBJECT,
        properties: {
            insights: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        id: { type: SchemaType.STRING },
                        title: { type: SchemaType.STRING },
                        analysis: { type: SchemaType.STRING },
                        type: { type: SchemaType.STRING, enum: ['performance', 'opportunity', 'alert'] },
                        relevanceScore: { type: SchemaType.NUMBER },
                        chartConfig: {
                            type: SchemaType.OBJECT,
                            properties: {
                                type: { type: SchemaType.STRING, enum: ['bar', 'line', 'pie', 'kpi'] },
                                metrics: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                                dimension: { type: SchemaType.STRING },
                                title: { type: SchemaType.STRING }
                            },
                            required: ['type', 'metrics']
                        }
                    },
                    required: ['id', 'title', 'analysis', 'type', 'chartConfig']
                }
            }
        },
        required: ['insights']
    };

    // 2. Prepare Context (Prompt)
    const systemPrompt = `
You are a Senior Data Analyst for Google Ads.
Rules: 
1. Strict math, significant insights only (>10% var), professional tone.
2. Identify the 3-5 most significant insights.
3. For chartConfig.metrics, use exact keys like 'metrics.cost_micros', 'metrics.conversions', 'metrics.cpa', 'metrics.roas'.
4. For chartConfig.dimension, use 'segments.date', 'campaign.name', or 'segments.device'.
`;

    const inputData = JSON.stringify({
        period: {
            start: period.start.toISOString().split('T')[0],
            end: period.end.toISOString().split('T')[0]
        },
        global_performance: globalMetrics,
        top_campaigns: campaigns
            .filter(c => c.status !== 'REMOVED')
            .sort((a, b) => b.metrics.cost - a.metrics.cost)
            .slice(0, 10)
            .map(c => ({ name: c.name, metrics: c.metrics }))
    }, null, 2);

    try {
        // 3. Initialize Firebase AI with GoogleAIBackend (Gemini Developer API)
        const app = getApp();
        const ai = getAI(app, { backend: new GoogleAIBackend() });

        // Use Gemini 2.5 Flash as requested (newer model)
        const model = getGenerativeModel(ai, {
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        // 4. Generate
        const prompt = `${systemPrompt}\n\nAnalyze this data:\n${inputData}`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 5. Parse
        const parsed = JSON.parse(responseText);
        return parsed as InsightResponse;

    } catch (error) {
        console.error("Error fetching AI insights (Firebase Client SDK):", error);
        throw error;
    }
};
