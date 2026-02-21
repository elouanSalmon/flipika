import type { JSONContent } from '@tiptap/react';
import type { SlideConfig } from '../types/reportTypes';
import { buildFlexibleQuery } from './gaql';
import { executeQuery, fetchAdCreatives } from './googleAds';
import { fetchMetaInsights } from './metaAds';

/**
 * Service to handle data snapshotting for reports at publication time.
 */

interface SnapshotContext {
    accountId: string;
    metaAccountId?: string;
    campaignIds: string[];
    startDate: Date;
    endDate: Date;
}

/**
 * Fetches data for a single Google Ads data block
 */
async function fetchGoogleAdsSnapshot(config: any, context: SnapshotContext) {
    try {
        const formatDate = (d: Date) => d.toISOString().split('T')[0];

        const query = buildFlexibleQuery({
            ...config,
            metrics: config.metrics
        }, {
            startDate: formatDate(context.startDate),
            endDate: formatDate(context.endDate),
            campaignIds: context.campaignIds
        });

        const result = await executeQuery(context.accountId, query);

        if (!result.success) {
            console.error('Failed to fetch snapshot for Google Ads:', result.error);
            return null;
        }

        return result.results || [];
    } catch (error) {
        console.error('Error fetching Google Ads snapshot:', error);
        return null;
    }
}

/**
 * Fetches data for a single Meta Ads data block
 */
async function fetchMetaAdsSnapshot(config: any, context: SnapshotContext) {
    if (!context.metaAccountId) return null;

    try {
        const formatDate = (d: Date) => d.toISOString().split('T')[0];

        // Determine Meta level and breakdowns from config
        let level: 'campaign' | 'adset' | 'ad' | 'account' = 'campaign';
        let timeIncrement: string | number | undefined = undefined;
        let breakdowns: string[] | undefined = undefined;

        if (config.dimension === 'segments.date') {
            level = 'account';
            timeIncrement = 1;
        } else if (config.dimension === 'campaign.name') {
            level = 'campaign';
        } else if (config.dimension === 'adset.name') {
            level = 'adset';
        } else if (config.dimension === 'ad.name') {
            level = 'ad';
        } else if (config.dimension === 'segments.device') {
            level = 'account';
            breakdowns = ['impression_device'];
        } else if (config.dimension === 'segments.platform') {
            level = 'account';
            breakdowns = ['publisher_platform'];
        } else if (config.dimension === 'segments.placement') {
            level = 'account';
            breakdowns = ['platform_position'];
        }

        const response = await fetchMetaInsights(
            context.metaAccountId,
            formatDate(context.startDate),
            formatDate(context.endDate),
            { level, timeIncrement, breakdowns }
        );

        if (!response.success) {
            console.error('Failed to fetch snapshot for Meta Ads:', response.error);
            return null;
        }

        return response.insights || [];
    } catch (error) {
        console.error('Error fetching Meta Ads snapshot:', error);
        return null;
    }
}

/**
 * Snapshots Tiptap content by iterating through nodes and fetching data for dataBlocks
 */
export async function snapshotTiptapContent(content: JSONContent, context: SnapshotContext): Promise<JSONContent> {
    if (!content.content) return content;

    const newContent = { ...content };
    newContent.content = await Promise.all(content.content.map(async (node) => {
        if (node.type === 'dataBlock') {
            const blockType = node.attrs?.blockType;
            const config = node.attrs?.config || {};

            let snapshot = null;
            let snapshotComparison = null;

            if (blockType && (blockType.startsWith('meta_') || blockType === 'flexible_meta_data' || blockType === 'meta_performance_overview')) {
                snapshot = await fetchMetaAdsSnapshot(config, context);
                if (config.showComparison) {
                    const prevContext = getPreviousContext(context, config.comparisonType || 'previous_period');
                    snapshotComparison = await fetchMetaAdsSnapshot(config, prevContext);
                }
            } else {
                snapshot = await fetchGoogleAdsSnapshot(config, context);
                if (config.showComparison) {
                    const prevContext = getPreviousContext(context, config.comparisonType || 'previous_period');
                    snapshotComparison = await fetchGoogleAdsSnapshot(config, prevContext);
                }
            }

            return {
                ...node,
                attrs: {
                    ...node.attrs,
                    snapshot,
                    snapshotComparison
                }
            };
        }

        if (node.content) {
            return snapshotTiptapContent(node, context);
        }

        return node;
    }));

    return newContent;
}

/**
 * Snapshots slides by fetching data for each slide
 */
export async function snapshotSlides(slides: SlideConfig[], context: SnapshotContext): Promise<SlideConfig[]> {
    return Promise.all(slides.map(async (slide) => {
        const config = slide.settings || {};
        let snapshot = null;
        let snapshotComparison = null;

        // Handle different slide types
        if (slide.type.startsWith('meta_') || slide.type === 'flexible_meta_data') {
            snapshot = await fetchMetaAdsSnapshot(config, context);
            if (config.showComparison) {
                const prevContext = getPreviousContext(context, config.comparisonType || 'previous_period');
                snapshotComparison = await fetchMetaAdsSnapshot(config, prevContext);
            }
        } else if (['performance_overview', 'campaign_chart', 'key_metrics', 'device_platform_split', 'heatmap', 'top_performers', 'flexible_data'].includes(slide.type)) {
            snapshot = await fetchGoogleAdsSnapshot(config, context);
            if (config.showComparison) {
                const prevContext = getPreviousContext(context, config.comparisonType || 'previous_period');
                snapshotComparison = await fetchGoogleAdsSnapshot(config, prevContext);
            }
        } else if (slide.type === 'ad_creative') {
            const result = await fetchAdCreatives(context.accountId, context.campaignIds);
            if (result.success) {
                snapshot = result.ads;
            }
        }

        return {
            ...slide,
            settings: {
                ...slide.settings,
                snapshot,
                snapshotComparison
            }
        };
    }));
}

function getPreviousContext(context: SnapshotContext, type: 'previous_period' | 'previous_year'): SnapshotContext {
    const start = new Date(context.startDate);
    const end = new Date(context.endDate);

    let prevStart: Date;
    let prevEnd: Date;

    if (type === 'previous_year') {
        prevStart = new Date(start);
        prevStart.setFullYear(prevStart.getFullYear() - 1);
        prevEnd = new Date(end);
        prevEnd.setFullYear(prevEnd.getFullYear() - 1);
    } else {
        const diff = end.getTime() - start.getTime();
        prevStart = new Date(start.getTime() - diff - 86400000);
        prevEnd = new Date(start.getTime() - 86400000);
    }

    return {
        ...context,
        startDate: prevStart,
        endDate: prevEnd
    };
}
