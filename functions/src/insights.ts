import { genkit } from 'genkit';
// import { firebase } from '@genkit-ai/firebase'; // This seems to be problematic or empty in new versions
import { openAI } from 'genkitx-openai';
import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from 'firebase-functions/params';
import { InsightRequestSchema, InsightResponseSchema } from './schemas';

// Define secrets
const openaiApiKey = defineSecret("OPENAI_API_KEY");

// Configure Genkit lazily to allow secret access at runtime
let ai: any = null;

const getAi = () => {
    if (!ai) {
        ai = genkit({
            plugins: [
                // firebase(), // Temporarily commenting out if import fails
                openAI({ apiKey: openaiApiKey.value() })
            ]
        });
    }
    return ai;
};

export const analyzeCampaignPerformanceFlow = onCall({
    memory: "512MiB",
    secrets: [openaiApiKey],
    cors: true,
    region: "us-central1"
}, async (request) => {
    if (!request.auth) {
        throw new (await import("firebase-functions/v2/https")).HttpsError(
            "unauthenticated",
            "The function must be called while authenticated."
        );
    }

    // Validate Input
    const parseResult = InsightRequestSchema.safeParse(request.data);
    if (!parseResult.success) {
        throw new (await import("firebase-functions/v2/https")).HttpsError(
            "invalid-argument",
            "Invalid input data: " + parseResult.error.message
        );
    }
    const { period, globalMetrics, campaigns } = parseResult.data;

    const systemPrompt = `
You are a Senior Data Analyst for Google Ads.
Rules: Strict math, significant insights only (>10% var), professional tone.
Output JSON matching schema.
`;

    const userPrompt = JSON.stringify({
        period,
        global_performance: globalMetrics,
        top_campaigns: campaigns
    }, null, 2);

    try {
        const response = await getAi().generate({
            model: 'openai/gpt-4o',
            prompt: [
                { text: systemPrompt },
                { text: `Analyze this data:\n${userPrompt}` }
            ],
            output: { schema: InsightResponseSchema }
        });

        if (!response.output) {
            throw new Error("No output generated from AI");
        }

        return response.output;
    } catch (error: any) {
        console.error("Genkit Error:", error);
        throw new (await import("firebase-functions/v2/https")).HttpsError(
            "internal",
            "AI Generation failed",
            error.message
        );
    }
});
