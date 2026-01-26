import { genkit } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';
import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from 'firebase-functions/params';
import { InsightRequestSchema, InsightResponseSchema } from './schemas';

// Define secrets
const googleGenAiApiKey = defineSecret("GOOGLE_GENAI_API_KEY");

// Configure Genkit lazily to allow secret access at runtime
let ai: any = null;

const getAi = () => {
    if (!ai) {
        ai = genkit({
            plugins: [
                googleAI({ apiKey: googleGenAiApiKey.value() })
            ]
        });
    }
    return ai;
};

export const analyzeCampaignPerformanceFlow = onCall({
    memory: "512MiB",
    secrets: [googleGenAiApiKey],
    cors: true, // Auto-handles OPTIONS
    region: "us-central1",
    // timeoutSeconds: 60, // Increase timeout for AI
}, async (request) => {
    console.log("Function analyzeCampaignPerformanceFlow called.");

    if (!request.auth) {
        console.warn("Unauthenticated call rejected.");
        throw new (await import("firebase-functions/v2/https")).HttpsError(
            "unauthenticated",
            "The function must be called while authenticated."
        );
    }

    // Validate Input
    console.log("Analyzing input data...");
    const parseResult = InsightRequestSchema.safeParse(request.data);
    if (!parseResult.success) {
        console.error("Schema Validation Failed:", JSON.stringify(parseResult.error.format(), null, 2));
        throw new (await import("firebase-functions/v2/https")).HttpsError(
            "invalid-argument",
            "Invalid input data: " + parseResult.error.message
        );
    }
    const { period, globalMetrics, campaigns } = parseResult.data;
    console.log(`Input valid. Period: ${period.start} to ${period.end}. Campaigns: ${campaigns.length}`);

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
        console.log("Initializing Genkit (Gemini)...");
        const aiInstance = getAi();

        console.log("Generating insights with Gemini 1.5 Flash...");
        const response = await aiInstance.generate({
            model: gemini15Flash,
            prompt: [
                { text: systemPrompt },
                { text: `Analyze this data:\n${userPrompt}` }
            ],
            output: { schema: InsightResponseSchema }
        });

        if (!response.output) {
            console.error("AI returned no output.");
            throw new Error("No output generated from AI");
        }

        console.log("Insights generated successfully. Count:", response.output.insights?.length);
        return response.output;

    } catch (error: any) {
        console.error("Genkit/AI Error Details:", JSON.stringify(error, null, 2));
        // Fallback or rethrow
        throw new (await import("firebase-functions/v2/https")).HttpsError(
            "internal",
            "AI Generation failed: " + (error.message || "Unknown error"),
            error.message
        );
    }
});
