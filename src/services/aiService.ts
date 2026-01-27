import { getApp } from 'firebase/app';
import { getAI, getGenerativeModel, SchemaType, GoogleAIBackend } from 'firebase/ai';
import type { InsightResponse } from '../types/ai';
import type { Campaign, CampaignMetrics } from '../types/business';

// ============================================================================
// NARRATIVE LAYER - Block Analysis Generation
// ============================================================================

/**
 * System prompt for data-to-text narrative generation
 * Optimized for concise, analytical insights rather than data listing
 */
const ANALYSIS_SYSTEM_PROMPT = `Tu es un Data Analyst Senior spécialisé en Google Ads.
Ta mission : Rédiger une analyse narrative CONCISE (2-3 phrases max) des données fournies.

RÈGLES STRICTES :
1. NE PAS lister les chiffres bruts - INTERPRÉTER les tendances et performances
2. Mentionner uniquement les variations significatives (>10%)
3. Utiliser un ton professionnel et factuel
4. Commencer par l'insight principal, puis contexte si nécessaire
5. Si comparaison disponible : toujours mentionner l'évolution vs période précédente
6. Adapter le vocabulaire au type de visualisation (graphique, tableau, scorecard)

FORMAT DE SORTIE :
- 2-3 phrases maximum
- Pas de bullet points ni de listes
- Pas d'introduction type "Les données montrent que..."
- Pas d'emoji

EXEMPLES DE BON FORMAT :
"Le CTR a progressé de +23% vs N-1, porté par une meilleure qualité des annonces Search. Le coût par conversion reste stable à 12€."
"Les performances sont dominées par les appareils mobiles (68% du trafic), avec un CPC 15% inférieur au desktop."
"Tendance haussière continue sur les conversions (+18%), malgré une hausse du CPA de 8%. Le ROAS se maintient à 4.2x."

EXEMPLE DE MAUVAIS FORMAT (À ÉVITER) :
"Les impressions sont de 50 000, les clics de 2 500, le CTR est de 5%, le coût total est de 1 500€..."`;

/**
 * Input interface for block analysis generation
 */
export interface BlockAnalysisInput {
    blockTitle: string;
    visualization: string;
    metrics: string[];
    dimension?: string;
    period: { start: string; end: string };
    currentData: Array<Record<string, number | string>>;
    comparisonData?: Array<Record<string, number | string>>;
    showComparison?: boolean;
}

/**
 * Output interface for block analysis
 */
export interface BlockAnalysisResult {
    analysis: string;
}

/**
 * Helper function to calculate aggregated totals from data rows
 */
function calculateAggregates(
    data: Array<Record<string, number | string>>,
    metrics: string[]
): Record<string, number> {
    const totals: Record<string, number> = {};

    // Sum all numeric values for each metric
    metrics.forEach(metric => {
        totals[metric] = data.reduce((sum, row) => {
            const value = row[metric];
            return sum + (typeof value === 'number' ? value : 0);
        }, 0);
    });

    // Calculate derived metrics
    if (totals['metrics.impressions'] && totals['metrics.clicks']) {
        totals['metrics.ctr'] = (totals['metrics.clicks'] / totals['metrics.impressions']) * 100;
    }
    if (totals['metrics.cost_micros'] && totals['metrics.clicks']) {
        totals['metrics.average_cpc'] = totals['metrics.cost_micros'] / totals['metrics.clicks'];
    }
    if (totals['metrics.cost_micros'] && totals['metrics.conversions']) {
        totals['metrics.cost_per_conversion'] = totals['metrics.cost_micros'] / totals['metrics.conversions'];
    }
    if (totals['metrics.conversions_value'] && totals['metrics.cost_micros']) {
        totals['metrics.roas'] = totals['metrics.conversions_value'] / (totals['metrics.cost_micros'] / 1000000);
    }

    return totals;
}

/**
 * Format metric value for display in prompt
 */
function formatMetricForPrompt(value: number, metricKey: string): string {
    const metric = metricKey.split('.')[1] || metricKey;

    if (metric.includes('micros') || metric === 'cost' || metric === 'average_cpc' || metric === 'cost_per_conversion') {
        // Convert micros to euros
        const euros = metric.includes('micros') ? value / 1000000 : value;
        return `${euros.toFixed(2)}€`;
    }
    if (metric === 'ctr') {
        return `${value.toFixed(2)}%`;
    }
    if (metric === 'roas' || metric === 'conversions_value_per_cost') {
        return `${value.toFixed(2)}x`;
    }
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
}

/**
 * Generate AI analysis for a single data block
 *
 * @param input - Block configuration and data
 * @returns Promise with the generated analysis text
 */
export const generateBlockAnalysis = async (
    input: BlockAnalysisInput
): Promise<BlockAnalysisResult> => {
    const {
        blockTitle,
        visualization,
        metrics,
        dimension,
        period,
        currentData,
        comparisonData,
        showComparison
    } = input;

    // Calculate aggregated totals
    const currentTotals = calculateAggregates(currentData, metrics);
    const previousTotals = comparisonData && showComparison
        ? calculateAggregates(comparisonData, metrics)
        : null;

    // Calculate deltas if comparison data exists
    const deltas: Record<string, number> = {};
    if (previousTotals) {
        metrics.forEach(metric => {
            const current = currentTotals[metric] || 0;
            const previous = previousTotals[metric] || 0;
            if (previous !== 0) {
                deltas[metric] = ((current - previous) / previous) * 100;
            }
        });
    }

    // Build context for the LLM
    const contextData = {
        blockTitle,
        visualizationType: visualization,
        analysisPeriod: `${period.start} to ${period.end}`,
        dimension: dimension || 'aggregate',
        dataPointsCount: currentData.length,
        metrics: metrics.map(m => {
            const metricName = m.split('.')[1] || m;
            const currentValue = currentTotals[m] || 0;
            const formattedCurrent = formatMetricForPrompt(currentValue, m);

            const result: Record<string, string | number> = {
                name: metricName,
                currentValue: formattedCurrent,
                rawValue: currentValue
            };

            if (previousTotals && previousTotals[m] !== undefined) {
                result.previousValue = formatMetricForPrompt(previousTotals[m], m);
                result.changePercent = deltas[m]?.toFixed(1) + '%' || 'N/A';
            }

            return result;
        }),
        hasComparison: !!previousTotals,
        comparisonPeriod: previousTotals ? 'previous period' : null,
    };

    // Response schema for structured output
    const responseSchema = {
        type: SchemaType.OBJECT,
        properties: {
            analysis: {
                type: SchemaType.STRING,
                description: 'Concise narrative analysis (2-3 sentences)'
            }
        },
        required: ['analysis']
    };

    try {
        // Initialize Firebase AI with GoogleAIBackend
        const app = getApp();
        const ai = getAI(app, { backend: new GoogleAIBackend() });

        const model = getGenerativeModel(ai, {
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        const prompt = `${ANALYSIS_SYSTEM_PROMPT}

DONNÉES À ANALYSER :
${JSON.stringify(contextData, null, 2)}

Génère une analyse narrative concise (2-3 phrases) de ces données.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        return {
            analysis: parsed.analysis
        };

    } catch (error) {
        console.error("Error generating block analysis:", error);
        throw error;
    }
};

// ============================================================================
// EXISTING CODE - Insights Generation
// ============================================================================

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
