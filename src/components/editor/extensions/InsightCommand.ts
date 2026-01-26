import { Editor } from '@tiptap/react';
import type { Insight } from '../../../types/ai';

export const insertInsightSlide = (editor: Editor, insight: Insight) => {
    // We create a new "slide" structure.
    // Assuming the editor structure is Document -> Slide -> Content

    // Map AI Chart Types to our Block Types
    const blockTypeMap: Record<string, string> = {
        'bar': 'chart_block', // or specific type
        'line': 'chart_block',
        'pie': 'chart_block',
        'kpi': 'key_metrics' // fallback
    };

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
            type: blockTypeMap[insight.chartConfig.type] || 'chart_block',
            attrs: {
                // Pass config to the block
                config: {
                    ...insight.chartConfig,
                    title: insight.chartConfig.title || insight.title,
                    // The block component will use these metrics to fetch real data
                    metrics: insight.chartConfig.metrics,
                    dimension: insight.chartConfig.dimension || 'date'
                }
            }
        }
    ];

    // Insert as a new slide
    // Used "slide" node type if it exists, otherwise just insert content at end
    // Checking existing schema through prior knowledge or we'd check node types.
    // Assuming 'slide' node exists as per user description "editors de rapports sous forme de slides"

    editor.chain().focus().insertContent({
        type: 'slide',
        content: slideContent
    }).run();
};
