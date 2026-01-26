import { Editor } from '@tiptap/react';
import type { Insight } from '../../../types/ai';

export const insertInsightSlide = (editor: Editor, insight: Insight) => {
    // We create a new "slide" structure.
    // Assuming the editor structure is Document -> Slide -> Content

    // Map AI Chart Types to our Block Types


    // const blockType = blockTypeMap[insight.chartConfig.type] || 'chart_block';

    // Construct the slide content
    const slideContent = [
        {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: insight.title }]
        },
        {
            type: 'paragraph',
            content: [{ type: 'text', text: insight.analysis }]
        },
        {
            type: 'flexible_data', // Use the generic flexible block
            attrs: {
                blockType: 'flexible_data',
                config: {
                    ...insight.chartConfig,
                    title: insight.chartConfig.title || insight.title,
                    // Map AI 'type' to Block 'visualization'
                    visualization: insight.chartConfig.type === 'kpi' ? 'scorecard' : insight.chartConfig.type,
                    // Map AI 'metric' keys if needed (assuming they match for now)
                    metrics: insight.chartConfig.metrics,
                    // Map dimension aliases to real field names
                    dimension: mapDimension(insight.chartConfig.dimension)
                }
            }
        }
    ];

    editor.chain().focus().insertContent({
        type: 'slide',
        content: slideContent
    }).run();
};

// Helper to map friendly AI dimensions to GAQL fields
const mapDimension = (dim?: string): string => {
    switch (dim) {
        case 'date': return 'segments.date';
        case 'campaign': return 'campaign.name';
        case 'ad_group': return 'ad_group.name';
        case 'device': return 'segments.device';
        default: return 'segments.date';
    }
};

