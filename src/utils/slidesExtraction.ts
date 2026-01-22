import type { SlideConfig, SlideType } from '../types/reportTypes';
import type { JSONContent } from '@tiptap/react';

/**
 * Extract slides from Tiptap editor content
 * Converts Tiptap JSON structure to SlideConfig array for Google Slides export
 */
export const extractSlidesFromTiptapContent = (
    content: unknown,
    accountId: string,
    campaignIds: string[]
): SlideConfig[] => {
    if (!content || typeof content !== 'object') {
        return [];
    }

    const jsonContent = content as JSONContent;

    // Tiptap content has a "doc" type with "content" array containing slides
    if (jsonContent.type !== 'doc' || !Array.isArray(jsonContent.content)) {
        return [];
    }

    const slides: SlideConfig[] = [];

    jsonContent.content.forEach((node, index) => {
        // Each slide node
        if (node.type === 'slide') {
            // Check if slide contains a dataBlock
            const dataBlock = node.content?.find((n: JSONContent) => n.type === 'dataBlock');

            let slideType: SlideType;
            let slideConfig: Partial<SlideConfig> = {};

            if (dataBlock) {
                // Slide contains a data block - use its block type
                const blockType = dataBlock.attrs?.blockType;
                const blockConfig = dataBlock.attrs?.config || {};

                // Map blockType to SlideType
                slideType = mapBlockTypeToSlideType(blockType);
                slideConfig = {
                    settings: blockConfig,
                    ...blockConfig // Include config properties at top level too
                };
            } else {
                // Regular content slide - check for specific patterns
                const hasHeading = node.content?.some((n: JSONContent) => n.type === 'heading');
                const textContent = extractTextFromNode(node);

                if (hasHeading && textContent.length < 100) {
                    // Likely a section title
                    slideType = 'section_title';
                    slideConfig = {
                        title: extractTextFromNode(node),
                        subtitle: '',
                    };
                } else {
                    // Rich text slide
                    slideType = 'rich_text';
                    slideConfig = {
                        title: extractTitleFromNode(node),
                        body: textContent,
                    };
                }
            }

            const slide: SlideConfig = {
                id: (node.attrs?.id as string) || `slide-${index + 1}`,
                type: slideType,
                accountId,
                campaignIds,
                order: index,
                title: slideConfig.title || extractTitleFromNode(node) || `Slide ${index + 1}`,
                subtitle: slideConfig.subtitle,
                body: slideConfig.body,
                settings: slideConfig.settings || {},
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            slides.push(slide);
        }
    });

    return slides;
};

/**
 * Map DataBlock blockType to SlideType
 */
const mapBlockTypeToSlideType = (blockType: string): SlideType => {
    switch (blockType) {
        case 'performance':
            return 'performance_overview';
        case 'chart':
            return 'campaign_chart';
        case 'keyMetrics':
            return 'key_metrics';
        case 'performance_overview':
        case 'campaign_chart':
        case 'key_metrics':
        case 'ad_creative':
        case 'funnel_analysis':
        case 'heatmap':
        case 'device_platform_split':
        case 'top_performers':
        case 'section_title':
        case 'rich_text':
            return blockType as SlideType;
        default:
            return 'rich_text'; // Default fallback
    }
};

/**
 * Extract plain text from a Tiptap node
 */
const extractTextFromNode = (node: JSONContent): string => {
    if (node.text) {
        return node.text;
    }

    if (Array.isArray(node.content)) {
        return node.content.map(child => extractTextFromNode(child)).join('\n');
    }

    return '';
};

/**
 * Extract title from a slide node (first heading or first paragraph)
 */
const extractTitleFromNode = (node: JSONContent): string => {
    if (!Array.isArray(node.content)) {
        return '';
    }

    // Look for first heading
    const headingNode = node.content.find(n => n.type === 'heading');
    if (headingNode) {
        return extractTextFromNode(headingNode).trim();
    }

    // Otherwise use first paragraph
    const paragraphNode = node.content.find(n => n.type === 'paragraph');
    if (paragraphNode) {
        const text = extractTextFromNode(paragraphNode).trim();
        // Limit title length
        return text.substring(0, 100);
    }

    return '';
};
