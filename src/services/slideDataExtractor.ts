import type { SlideConfig } from '../types/reportTypes';
import type { FlipikaSlideData, PerformanceMetric } from '../types/googleSlides';
import { getSlideData } from './slideService';

/**
 * Extract real data from SlideConfig for Google Slides export
 * 
 * This function fetches the actual data from the slide (metrics, values, etc.)
 * and formats it for Google Slides API
 */
export async function extractSlideDataForExport(
    slide: SlideConfig,
    accountId: string,
    campaignIds: string[],
    startDate?: Date,
    endDate?: Date,
    reportId?: string
): Promise<FlipikaSlideData> {
    const baseData: FlipikaSlideData = {
        type: slide.type as FlipikaSlideData['type'],
        title: slide.title || slide.type.replace(/_/g, ' ').toUpperCase(),
        data: {},
    };

    try {
        // Fetch real data from slideService
        const slideData = await getSlideData(
            slide,
            accountId,
            campaignIds,
            startDate,
            endDate,
            reportId
        );

        // Map data based on slide type
        switch (slide.type) {
            case 'performance_overview': {
                const metrics = slideData.metrics || [];
                baseData.data = {
                    metrics: metrics.map((m: any) => ({
                        name: m.name,
                        label: m.label || m.name,
                        value: m.value,
                        formatted: m.formatted,
                        change: m.change,
                    })),
                };
                break;
            }

            case 'key_metrics': {
                const metrics = slideData.metrics || [];

                // Extract the 4 key metrics
                const findMetric = (name: string): PerformanceMetric => {
                    const metric = metrics.find((m: any) => m.name === name);
                    return metric ? {
                        name: metric.name,
                        label: metric.label || name,
                        value: metric.value,
                        formatted: metric.formatted,
                        change: metric.change,
                    } : {
                        name,
                        label: name,
                        value: 0,
                        formatted: 'N/A',
                    };
                };

                baseData.data = {
                    cost: findMetric('cost'),
                    revenue: findMetric('conversion_value'),
                    roas: findMetric('roas'),
                    cpa: findMetric('cpa'),
                };
                break;
            }

            case 'section_title': {
                baseData.data = {
                    title: slide.title || 'Section',
                    subtitle: slide.subtitle || '',
                };
                break;
            }

            case 'rich_text': {
                baseData.data = {
                    content: slide.body || '',
                };
                break;
            }

            default:
                // For other types, just pass settings
                baseData.data = slide.settings || {};
                break;
        }

        return baseData;
    } catch (error) {
        console.error(`Error extracting data for slide ${slide.type}:`, error);
        // Return base data with empty values on error
        return baseData;
    }
}

/**
 * Extract data for multiple slides in parallel
 */
export async function extractSlidesDataForExport(
    slides: SlideConfig[],
    accountId: string,
    campaignIds: string[],
    startDate?: Date,
    endDate?: Date,
    reportId?: string
): Promise<FlipikaSlideData[]> {
    const promises = slides.map(slide =>
        extractSlideDataForExport(slide, accountId, campaignIds, startDate, endDate, reportId)
    );

    return Promise.all(promises);
}
