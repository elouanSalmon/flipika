import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { fetchSlideMetrics } from './googleAds';
import { fetchMetaInsights } from './metaAds';
import type { SlideConfig, SlideTemplate, SlideInstance } from '../types/reportTypes';
import { SlideType } from '../types/reportTypes';

const WIDGETS_COLLECTION = 'slides'; // Top-level collection (if used)
const SLIDE_TEMPLATES_COLLECTION = 'slideTemplates';

/**
 * Create a widget in a report
 */
export async function createWidget(
    reportId: string,
    widgetConfig: Omit<SlideConfig, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    try {
        const newWidget = {
            ...widgetConfig,
            reportId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, WIDGETS_COLLECTION), newWidget);
        return docRef.id;
    } catch (error) {
        console.error('Error creating widget:', error);
        throw new Error('Failed to create widget');
    }
}

/**
 * Update widget configuration
 */
export async function updateWidget(
    widgetId: string,
    config: Partial<SlideConfig>
): Promise<void> {
    try {
        const docRef = doc(db, WIDGETS_COLLECTION, widgetId);

        const updates = {
            ...config,
            updatedAt: serverTimestamp(),
        };

        delete (updates as any).id;
        delete (updates as any).createdAt;

        await updateDoc(docRef, updates);
    } catch (error) {
        console.error('Error updating widget:', error);
        throw new Error('Failed to update widget');
    }
}

/**
 * Delete a widget
 */
export async function deleteWidget(widgetId: string): Promise<void> {
    try {
        const docRef = doc(db, WIDGETS_COLLECTION, widgetId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting widget:', error);
        throw new Error('Failed to delete widget');
    }
}

/**
 * Load cached widget data from Firestore
 */
export async function loadCachedWidgetData(
    widgetId: string,
    reportId: string
): Promise<any | null> {
    try {
        const q = query(
            collection(db, 'slideInstances'), // Updated from widgetInstances
            where('slideConfigId', '==', widgetId),
            where('reportId', '==', reportId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log('📦 No cached data found for widget:', widgetId);
            return null;
        }

        const cachedData = querySnapshot.docs[0].data();
        console.log('✅ Loaded cached widget data:', {
            widgetId,
            lastUpdated: cachedData.lastUpdated?.toDate()
        });

        return cachedData.data;
    } catch (error) {
        console.error('❌ Error loading cached widget data:', error);
        return null;
    }
}

/**
 * Get widget data from Google Ads or cache
 */
export async function getSlideData(
    widgetConfig: SlideConfig,
    accountId: string,
    campaignIds?: string[],
    startDate?: Date,
    endDate?: Date,
    reportId?: string
): Promise<any> {
    try {
        const { type, settings } = widgetConfig;
        const isAuthenticated = !!auth.currentUser;

        // Try to load from cache first if widget ID and report ID are available
        if (widgetConfig.id && reportId) {
            const cachedData = await loadCachedWidgetData(widgetConfig.id, reportId);

            // If user is not authenticated, ONLY use cached data
            if (!isAuthenticated) {
                if (cachedData) {
                    console.log('🔓 Public access: using cached data for widget:', widgetConfig.id);
                    return cachedData;
                } else {
                    console.warn('⚠️ No cached data available for public access');
                    // Fall through to generate mock data
                }
            }

            // If user is authenticated, try to fetch fresh data from API
            // but use cache as fallback if API fails
        }

        // Fetch fresh data from API (only if authenticated)
        let freshData;
        switch (type) {
            case SlideType.PERFORMANCE_OVERVIEW:
            case SlideType.KEY_METRICS:
            case SlideType.FUNNEL_ANALYSIS:
                freshData = await getPerformanceOverviewData(
                    accountId,
                    campaignIds,
                    settings,
                    startDate,
                    endDate,
                    widgetConfig.id,
                    reportId
                );
                break;

            case SlideType.CAMPAIGN_CHART:
                freshData = await getCampaignChartData(
                    accountId,
                    campaignIds,
                    settings,
                    startDate,
                    endDate,
                    widgetConfig.id,
                    reportId
                );
                break;

            case SlideType.DEVICE_PLATFORM_SPLIT:
                freshData = await getDevicePlatformSplitData(
                    accountId,
                    campaignIds,
                    settings,
                    startDate,
                    endDate,
                    widgetConfig.id,
                    reportId
                );
                break;

            case SlideType.HEATMAP:
                freshData = await getHeatmapData(
                    accountId,
                    campaignIds,
                    settings,
                    startDate,
                    endDate,
                    widgetConfig.id,
                    reportId
                );
                break;

            case SlideType.TOP_PERFORMERS:
                freshData = await getTopPerformersData(
                    accountId,
                    campaignIds,
                    settings,
                    startDate,
                    endDate,
                    widgetConfig.id,
                    reportId
                );
                break;

            // Meta Ads slide types
            case SlideType.META_PERFORMANCE_OVERVIEW:
            case SlideType.META_FUNNEL_ANALYSIS:
                freshData = await getMetaPerformanceData(
                    accountId,
                    campaignIds,
                    settings,
                    startDate,
                    endDate,
                    widgetConfig.id,
                    reportId
                );
                break;

            case SlideType.META_CAMPAIGN_CHART:
                freshData = await getMetaCampaignChartData(
                    accountId,
                    campaignIds,
                    settings,
                    startDate,
                    endDate,
                    widgetConfig.id,
                    reportId
                );
                break;

            default:
                throw new Error(`Unknown widget type: ${type}`);
        }

        return freshData;
    } catch (error) {
        console.error('Error getting widget data:', error);
        throw new Error('Failed to get widget data');
    }
}

/**
 * Get Performance Overview widget data
 */
async function getPerformanceOverviewData(
    accountId: string,
    campaignIds?: string[],
    settings?: SlideConfig['settings'],
    startDate?: Date,
    endDate?: Date,
    widgetId?: string,
    reportId?: string
): Promise<{
    metrics: Array<{
        name: string;
        value: number;
        formatted: string;
        change?: number;
    }>;
    isMockData: boolean;
}> {
    try {
        // Vérifier que nous avons les paramètres nécessaires
        if (!accountId || !campaignIds || campaignIds.length === 0) {
            console.warn('📊 Missing accountId or campaignIds, using mock data');
            return generateMockPerformanceData(settings, startDate, endDate);
        }

        console.log('📊 Fetching real performance data:', {
            accountId,
            campaignIds,
            startDate: startDate?.toISOString().split('T')[0],
            endDate: endDate?.toISOString().split('T')[0]
        });

        // Appeler la vraie API Google Ads
        const result = await fetchSlideMetrics(
            accountId,
            campaignIds,
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate || new Date(),
            'performance_overview'
        );

        if (!result.success || !result.metrics) {
            console.warn('⚠️ [PerformanceOverview] API call failed, using mock data. Reason:', result.error || 'No metrics returned');
            console.debug('Request details:', { accountId, campaignIds, startDate, endDate });
            return generateMockPerformanceData(settings, startDate, endDate);
        }

        console.log('✅ Real Google Ads data loaded successfully:', {
            metricsCount: result.metrics.length
        });

        const responseData = {
            metrics: result.metrics,
            isMockData: false
        };

        // Cache the data if widget ID and report ID are available
        if (widgetId && reportId) {
            await cacheWidgetData(widgetId, reportId, responseData);
        }

        return responseData;
    } catch (error) {
        console.error('❌ [PerformanceOverview] Unexpected error fetching data:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message, error.stack);
        }

        // Try to load from cache as fallback
        if (widgetId && reportId) {
            const cachedData = await loadCachedWidgetData(widgetId, reportId);
            if (cachedData) {
                console.log('📦 Using cached data as fallback');
                return cachedData;
            }
        }

        // Last resort: use mock data
        return generateMockPerformanceData(settings, startDate, endDate);
    }
}

/**
 * Generate mock performance data as fallback
 */
function generateMockPerformanceData(
    settings?: SlideConfig['settings'],
    startDate?: Date,
    endDate?: Date
): {
    metrics: Array<{
        name: string;
        value: number;
        formatted: string;
        change?: number;
    }>;
    isMockData: boolean;
} {
    console.log('🔄 Generating mock performance data');

    // Réduire à 6 métriques maximum pour qu'elles rentrent dans une slide (2x3 grid)
    const selectedMetrics = settings?.metrics || [
        'impressions',
        'clicks',
        'ctr',
        'conversions',
        'cost',
        'roas'
    ];

    // Calculate days in range for more realistic mock data
    const days = startDate && endDate
        ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        : 30;

    const metricsData = selectedMetrics.map(metricName => {
        // Mock data scaled by date range
        const baseValue = Math.random() * 1000;
        const metricValue = baseValue * (days / 30); // Scale by date range

        return {
            name: metricName,
            value: metricValue,
            formatted: formatMetric(metricName, metricValue),
            change: settings?.showComparison ? Math.random() * 20 - 10 : undefined,
        };
    });

    return { metrics: metricsData, isMockData: true };
}

/**
 * Get Campaign Chart widget data
 */
async function getCampaignChartData(
    accountId: string,
    campaignIds?: string[],
    _settings?: SlideConfig['settings'],
    startDate?: Date,
    endDate?: Date,
    widgetId?: string,
    reportId?: string
): Promise<{
    chartData: Array<{
        date: string;
        [key: string]: any;
    }>;
    campaigns: Array<{ id: string; name: string }>;
    isMockData: boolean;
}> {
    try {
        // Vérifier que nous avons les paramètres nécessaires
        if (!accountId || !campaignIds || campaignIds.length === 0) {
            console.warn('📈 Missing accountId or campaignIds, using mock data');
            return generateMockChartData(campaignIds, startDate, endDate);
        }

        console.log('📈 Fetching real campaign chart data:', {
            accountId,
            campaignIds,
            startDate: startDate?.toISOString().split('T')[0],
            endDate: endDate?.toISOString().split('T')[0]
        });

        // Appeler la vraie API Google Ads
        const result = await fetchSlideMetrics(
            accountId,
            campaignIds,
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate || new Date(),
            'campaign_chart'
        );

        if (!result.success || !result.chartData || !result.campaigns) {
            console.warn('⚠️ [CampaignChart] API call failed, using mock data. Reason:', result.error || 'Missing chart data or campaigns');
            return generateMockChartData(campaignIds, startDate, endDate);
        }

        console.log('✅ Real campaign chart data loaded successfully:', {
            dataPoints: result.chartData.length,
            campaigns: result.campaigns.length
        });

        const responseData = {
            chartData: result.chartData,
            campaigns: result.campaigns,
            isMockData: false
        };

        // Cache the data if widget ID and report ID are available
        if (widgetId && reportId) {
            await cacheWidgetData(widgetId, reportId, responseData);
        }

        return responseData;
    } catch (error) {
        console.error('❌ [CampaignChart] Unexpected error fetching data:', error);

        // Try to load from cache as fallback
        if (widgetId && reportId) {
            const cachedData = await loadCachedWidgetData(widgetId, reportId);
            if (cachedData) {
                console.log('📦 Using cached data as fallback');
                return cachedData;
            }
        }

        // Last resort: use mock data
        return generateMockChartData(campaignIds, startDate, endDate);
    }
}

/**
 * Generate mock chart data as fallback
 */
function generateMockChartData(
    campaignIds?: string[],
    startDate?: Date,
    endDate?: Date
): {
    chartData: Array<{
        date: string;
        [key: string]: any;
    }>;
    campaigns: Array<{ id: string; name: string }>;
    isMockData: boolean;
} {
    console.log('🔄 Generating mock chart data');

    const campaigns = campaignIds?.map(id => ({
        id,
        name: `Campaign ${id.slice(0, 8)}`,
    })) || [];

    // Use actual date range or default to last 30 days
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Generate mock time series data for the actual date range
    const chartData = Array.from({ length: days }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);

        const dataPoint: any = {
            date: date.toISOString().split('T')[0],
        };

        // Add metrics for each campaign
        campaigns.forEach(campaign => {
            dataPoint[campaign.id] = Math.random() * 1000 + 500;
        });

        return dataPoint;
    });

    return { chartData, campaigns, isMockData: true };
}

/**
 * Format metric value for display
 */
function formatMetric(metricName: string, value: number): string {
    switch (metricName) {
        case 'impressions':
        case 'clicks':
        case 'conversions':
            return new Intl.NumberFormat('fr-FR').format(Math.round(value));

        case 'ctr':
            return `${value.toFixed(2)}%`;

        case 'cpc':
        case 'cpa':
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
            }).format(value);

        case 'roas':
            return `${value.toFixed(2)}x`;

        case 'cost':
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
            }).format(value);

        default:
            return value.toString();
    }
}

/**
 * Save widget as template
 */
export async function saveSlideTemplate(
    userId: string,
    widgetConfig: SlideConfig,
    name: string,
    description: string
): Promise<string> {
    try {
        const template: Omit<SlideTemplate, 'id'> = {
            userId,
            name,
            description,
            type: widgetConfig.type,
            defaultSettings: widgetConfig.settings,
            thumbnail: undefined,
            isDefault: false,
            createdAt: new Date(),
        };

        const docRef = await addDoc(collection(db, SLIDE_TEMPLATES_COLLECTION), {
            ...template,
            createdAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error saving widget template:', error);
        throw new Error('Failed to save widget template');
    }
}

/**
 * Get user's widget templates
 */
export async function getUserSlideTemplates(userId: string): Promise<SlideTemplate[]> {
    try {
        const q = query(
            collection(db, SLIDE_TEMPLATES_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const templates: SlideTemplate[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            templates.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
            } as SlideTemplate);
        });

        return templates;
    } catch (error) {
        console.error('Error getting widget templates:', error);
        throw new Error('Failed to get widget templates');
    }
}

/**
 * Get default widget templates
 */
export async function getDefaultSlideTemplates(): Promise<SlideTemplate[]> {
    try {
        const q = query(
            collection(db, SLIDE_TEMPLATES_COLLECTION),
            where('isDefault', '==', true)
        );

        const querySnapshot = await getDocs(q);
        const templates: SlideTemplate[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            templates.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
            } as SlideTemplate);
        });

        return templates;
    } catch (error) {
        console.error('Error getting default widget templates:', error);
        return [];
    }
}

/**
 * Delete widget template
 */
export async function deleteSlideTemplate(templateId: string): Promise<void> {
    try {
        const docRef = doc(db, SLIDE_TEMPLATES_COLLECTION, templateId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting widget template:', error);
        throw new Error('Failed to delete widget template');
    }
}

/**
 * Cache widget data
 */
export async function cacheWidgetData(
    widgetId: string,
    reportId: string,
    data: any
): Promise<void> {
    try {
        const widgetInstance: Omit<SlideInstance, 'id'> = {
            slideConfigId: widgetId,
            reportId,
            data,
            lastUpdated: new Date(),
        };

        // Check if instance exists
        const q = query(
            collection(db, 'slideInstances'),
            where('slideConfigId', '==', widgetId),
            where('reportId', '==', reportId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Create new instance
            await addDoc(collection(db, 'slideInstances'), {
                ...widgetInstance,
                lastUpdated: serverTimestamp(),
            });
        } else {
            // Update existing instance
            const docRef = doc(db, 'slideInstances', querySnapshot.docs[0].id);
            await updateDoc(docRef, {
                data,
                lastUpdated: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error('Error caching widget data:', error);
        // Don't throw - caching is optional
    }
}
/**
 * Get Device & Platform Split widget data
 */
async function getDevicePlatformSplitData(
    accountId: string,
    campaignIds?: string[],
    _settings?: SlideConfig['settings'],
    startDate?: Date,
    endDate?: Date,
    widgetId?: string,
    reportId?: string
): Promise<{
    deviceData: Array<any>;
    platformData: Array<any>;
    isMockData: boolean;
}> {
    try {
        if (!accountId || !campaignIds || campaignIds.length === 0) {
            console.warn('📱 Missing accountId or campaignIds, using mock data');
            return generateMockDevicePlatformSplitData();
        }

        console.log('📱 Fetching real device/platform data:', {
            accountId,
            campaignIds: JSON.stringify(campaignIds)
        });

        const result = await fetchSlideMetrics(
            accountId,
            campaignIds,
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate || new Date(),
            'device_platform_split' as any // We need to update the type in googleAds.ts too ideally, but casting for now
        );

        if (!result.success || !result.deviceData || !result.platformData) {
            console.warn('⚠️ [DevicePlatform] API call failed, using mock data. Reason:', result.error || 'Missing device or platform data');
            return generateMockDevicePlatformSplitData();
        }

        const responseData = {
            deviceData: result.deviceData,
            platformData: result.platformData,
            isMockData: false
        };

        if (widgetId && reportId) {
            await cacheWidgetData(widgetId, reportId, responseData);
        }

        return responseData;
    } catch (error) {
        console.error('❌ [DevicePlatform] Unexpected error fetching data:', error);

        if (widgetId && reportId) {
            const cachedData = await loadCachedWidgetData(widgetId, reportId);
            if (cachedData) return cachedData;
        }

        return generateMockDevicePlatformSplitData();
    }
}

function generateMockDevicePlatformSplitData() {
    return {
        deviceData: [
            { name: 'MOBILE', impressions: 5000, clicks: 150, cost: 450, conversions: 12, ctr: 3.0, cpc: 3.0, cpa: 37.5, roas: 4.5 },
            { name: 'DESKTOP', impressions: 3000, clicks: 120, cost: 500, conversions: 15, ctr: 4.0, cpc: 4.16, cpa: 33.3, roas: 5.2 },
            { name: 'TABLET', impressions: 500, clicks: 10, cost: 30, conversions: 1, ctr: 2.0, cpc: 3.0, cpa: 30.0, roas: 3.0 },
        ],
        platformData: [
            { name: 'SEARCH', impressions: 4000, clicks: 200, cost: 700, conversions: 20, ctr: 5.0, cpc: 3.5, cpa: 35.0, roas: 6.0 },
            { name: 'DISPLAY', impressions: 4000, clicks: 60, cost: 200, conversions: 5, ctr: 1.5, cpc: 3.33, cpa: 40.0, roas: 3.0 },
            { name: 'YOUTUBE', impressions: 500, clicks: 20, cost: 80, conversions: 3, ctr: 4.0, cpc: 4.0, cpa: 26.6, roas: 4.0 },
        ],
        isMockData: true
    };
}

/**
 * Get Heatmap widget data
 */
async function getHeatmapData(
    accountId: string,
    campaignIds?: string[],
    _settings?: SlideConfig['settings'],
    startDate?: Date,
    endDate?: Date,
    widgetId?: string,
    reportId?: string
): Promise<{
    heatmapData: Array<{
        day: number;
        hour: number;
        metrics: {
            impressions: number;
            clicks: number;
            conversions: number;
            cost: number;
            ctr: number;
            avgCpc: number;
        };
    }>;
    isMockData: boolean;
}> {
    try {
        // Validation
        if (!accountId || !campaignIds || campaignIds.length === 0) {
            console.warn('🔥 Missing accountId for heatmap, using mock data');
            return generateMockHeatmapData(); // Fixed arguments
        }

        console.log('🔥 Fetching real heatmap data:', { accountId, campaignIds: JSON.stringify(campaignIds) });

        // Call Google Ads API (simulated via fetchSlideMetrics for now until a specific heatmap endpoint exists)
        // Since we likely don't have the granular day/hour segmentation in the generic 'fetchSlideMetrics',
        // we might check if 'heatmap' is supported or fallback to mock if the API wrapper isn't ready.
        // Assuming fetchSlideMetrics handles 'heatmap' type by returning segment data.
        const result = await fetchSlideMetrics(
            accountId,
            campaignIds,
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate || new Date(),
            'heatmap'
        );

        if (!result.success || !result.heatmapData) {
            console.warn('⚠️ [Heatmap] API call failed, using mock data. Reason:', result.error || 'No heatmap data returned');
            return generateMockHeatmapData();
        }

        const responseData = {
            heatmapData: result.heatmapData,
            isMockData: false
        };

        if (widgetId && reportId) {
            await cacheWidgetData(widgetId, reportId, responseData);
        }

        return responseData;

    } catch (error) {
        console.error('❌ [Heatmap] Unexpected error fetching data:', error);
        if (widgetId && reportId) {
            // Note: loadCachedWidgetData isn't strictly available in this scope unless hoisted or passed, assuming it's available in module scope
            const cachedData = await loadCachedWidgetData(widgetId, reportId);
            if (cachedData) return cachedData;
        }
        return generateMockHeatmapData();
    }
}

/**
 * Generate mock heatmap data
 */
function generateMockHeatmapData(_startDate?: Date, _endDate?: Date): {
    heatmapData: Array<{
        day: number;
        hour: number;
        metrics: {
            impressions: number;
            clicks: number;
            conversions: number;
            cost: number;
            ctr: number;
            avgCpc: number;
        };
    }>;
    isMockData: boolean;
} {
    console.log('🔄 Generating mock heatmap data');
    const heatmapData = [];

    // Generate 7 days x 24 hours = 168 cells
    for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
            // Create realistic-looking patterns
            // More activity during work hours (9-17) and weekdays (0-4 assuming Mon-Fri)
            const isWorkHour = hour >= 9 && hour <= 17;
            const isWeekend = day >= 5; // Assuming 0=Mon, 5=Sat, 6=Sun

            let multiplier = 1;
            if (isWorkHour) multiplier *= 2;
            if (isWeekend) multiplier *= 0.5;

            // Random variation
            multiplier *= (0.5 + Math.random());

            const impressions = Math.round(100 * multiplier);
            const clicks = Math.round(impressions * 0.05 * (0.8 + Math.random() * 0.4));
            const cost = clicks * (0.5 + Math.random() * 1.5);
            const conversions = Math.round(clicks * 0.1 * Math.random());

            heatmapData.push({
                day,
                hour,
                metrics: {
                    impressions,
                    clicks,
                    conversions,
                    cost,
                    ctr: impressions > 0 ? clicks / impressions : 0,
                    avgCpc: clicks > 0 ? cost / clicks : 0,
                }
            });
        }
    }

    return { heatmapData, isMockData: true };
}

/**
 * Get Top Performers widget data
 */
async function getTopPerformersData(
    accountId: string,
    campaignIds?: string[],
    settings?: SlideConfig['settings'],
    startDate?: Date,
    endDate?: Date,
    widgetId?: string,
    reportId?: string
): Promise<{
    data: Array<any>;
    isMockData: boolean;
}> {
    try {
        if (!accountId || !campaignIds || campaignIds.length === 0) {
            console.warn('🏆 Missing accountId or campaignIds, using mock data');
            return generateMockTopPerformersData(settings);
        }

        console.log('🏆 Fetching real top performers data:', { accountId, campaignIds: JSON.stringify(campaignIds), settings });

        const result = await fetchSlideMetrics(
            accountId,
            campaignIds,
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate || new Date(),
            'top_performers',
            {
                dimension: settings?.dimension || 'KEYWORDS',
                metric: settings?.metric || 'COST',
                limit: settings?.limit || 10
            }
        );

        if (!result.success || !result.data) {
            console.warn('⚠️ [TopPerformers] API call failed, using mock data. Reason:', result.error || 'No data returned');
            return generateMockTopPerformersData(settings);
        }

        const responseData = {
            data: result.data,
            isMockData: false
        };

        if (widgetId && reportId) {
            await cacheWidgetData(widgetId, reportId, responseData);
        }

        return responseData;
    } catch (error) {
        console.error('❌ [TopPerformers] Unexpected error fetching data:', error);
        if (widgetId && reportId) {
            const cachedData = await loadCachedWidgetData(widgetId, reportId);
            if (cachedData) return cachedData;
        }
        return generateMockTopPerformersData(settings);
    }
}

function generateMockTopPerformersData(settings?: SlideConfig['settings']) {
    console.log('🔄 Generating mock top performers data');
    const dimension = settings?.dimension || 'KEYWORDS';
    const limit = settings?.limit || 10;

    const mockItems = Array.from({ length: limit }, (_, i) => {
        const baseValue = 1000 - (i * 50);
        return {
            name: `${dimension === 'KEYWORDS' ? 'Keyword' : dimension === 'SEARCH_TERMS' ? 'Search Term' : dimension === 'ADS' ? 'Ad' : 'Location'} ${i + 1}`,
            campaignName: `Campaign ${String.fromCharCode(65 + (i % 3))}`,
            adGroupName: `Ad Group ${i + 1}`,
            impressions: baseValue * 10,
            clicks: baseValue,
            cost: baseValue * 2,
            conversions: Math.round(baseValue / 20),
            conversions_value: baseValue * 5,
            ctr: 10,
            cpc: 2,
            roas: 2.5
        };
    });

    return { data: mockItems, isMockData: true };
}

// ===========================
// Meta Ads Data Functions
// ===========================

/**
 * Get Meta Ads performance overview data
 */
async function getMetaPerformanceData(
    accountId: string,
    _campaignIds?: string[],
    settings?: SlideConfig['settings'],
    startDate?: Date,
    endDate?: Date,
    widgetId?: string,
    reportId?: string
): Promise<{
    metrics: Array<{
        name: string;
        value: number;
        formatted: string;
        change?: number;
    }>;
    isMockData: boolean;
}> {
    try {
        if (!accountId) {
            console.warn('📊 [Meta] Missing accountId, using mock data');
            return generateMockMetaPerformanceData(settings, startDate, endDate);
        }

        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();

        const result = await fetchMetaInsights(
            accountId,
            start.toISOString().split('T')[0],
            end.toISOString().split('T')[0],
            { level: 'campaign' }
        );

        if (!result.success || !result.data) {
            console.warn('⚠️ [Meta PerformanceOverview] API call failed, using mock data:', result.error);
            return generateMockMetaPerformanceData(settings, startDate, endDate);
        }

        // Aggregate insights across all campaigns
        const aggregated: Record<string, number> = {
            impressions: 0,
            clicks: 0,
            spend: 0,
            reach: 0,
            conversions: 0,
        };

        for (const row of result.data) {
            aggregated.impressions += Number(row.impressions || 0);
            aggregated.clicks += Number(row.clicks || 0);
            aggregated.spend += Number(row.spend || 0);
            aggregated.reach += Number(row.reach || 0);
            if (row.actions) {
                for (const action of row.actions) {
                    if (['offsite_conversion.fb_pixel_purchase', 'lead', 'purchase'].includes(action.action_type)) {
                        aggregated.conversions += Number(action.value || 0);
                    }
                }
            }
        }

        const ctr = aggregated.impressions > 0 ? (aggregated.clicks / aggregated.impressions) * 100 : 0;
        const cpc = aggregated.clicks > 0 ? aggregated.spend / aggregated.clicks : 0;
        const roas = aggregated.spend > 0 && aggregated.conversions > 0 ? (aggregated.conversions * 50) / aggregated.spend : 0; // Approximation

        const selectedMetrics = settings?.metrics || ['impressions', 'clicks', 'spend', 'ctr', 'reach', 'conversions'];
        const metricsMap: Record<string, { value: number; formatted: string }> = {
            impressions: { value: aggregated.impressions, formatted: formatMetaMetric('impressions', aggregated.impressions) },
            clicks: { value: aggregated.clicks, formatted: formatMetaMetric('clicks', aggregated.clicks) },
            spend: { value: aggregated.spend, formatted: formatMetaMetric('spend', aggregated.spend) },
            ctr: { value: ctr, formatted: formatMetaMetric('ctr', ctr) },
            cpc: { value: cpc, formatted: formatMetaMetric('cpc', cpc) },
            reach: { value: aggregated.reach, formatted: formatMetaMetric('reach', aggregated.reach) },
            conversions: { value: aggregated.conversions, formatted: formatMetaMetric('conversions', aggregated.conversions) },
            roas: { value: roas, formatted: formatMetaMetric('roas', roas) },
        };

        const metrics = selectedMetrics.map(name => ({
            name,
            value: metricsMap[name]?.value || 0,
            formatted: metricsMap[name]?.formatted || '0',
            change: settings?.showComparison ? Math.random() * 20 - 10 : undefined,
        }));

        const responseData = { metrics, isMockData: false };

        if (widgetId && reportId) {
            await cacheWidgetData(widgetId, reportId, responseData);
        }

        return responseData;
    } catch (error) {
        console.error('❌ [Meta PerformanceOverview] Unexpected error:', error);

        if (widgetId && reportId) {
            const cachedData = await loadCachedWidgetData(widgetId, reportId);
            if (cachedData) return cachedData;
        }

        return generateMockMetaPerformanceData(settings, startDate, endDate);
    }
}

function generateMockMetaPerformanceData(
    settings?: SlideConfig['settings'],
    startDate?: Date,
    endDate?: Date
) {
    const selectedMetrics = settings?.metrics || ['impressions', 'clicks', 'spend', 'ctr', 'reach', 'conversions'];
    const days = startDate && endDate
        ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        : 30;

    const metricsData = selectedMetrics.map(metricName => {
        const baseValue = Math.random() * 1000;
        const metricValue = baseValue * (days / 30);
        return {
            name: metricName,
            value: metricValue,
            formatted: formatMetaMetric(metricName, metricValue),
            change: settings?.showComparison ? Math.random() * 20 - 10 : undefined,
        };
    });

    return { metrics: metricsData, isMockData: true };
}

/**
 * Get Meta Ads campaign chart data
 */
async function getMetaCampaignChartData(
    accountId: string,
    campaignIds?: string[],
    _settings?: SlideConfig['settings'],
    startDate?: Date,
    endDate?: Date,
    widgetId?: string,
    reportId?: string
): Promise<{
    chartData: Array<{ date: string;[key: string]: any }>;
    campaigns: Array<{ id: string; name: string }>;
    isMockData: boolean;
}> {
    try {
        if (!accountId) {
            console.warn('📈 [Meta] Missing accountId, using mock data');
            return generateMockMetaChartData(campaignIds, startDate, endDate);
        }

        const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate || new Date();

        const result = await fetchMetaInsights(
            accountId,
            start.toISOString().split('T')[0],
            end.toISOString().split('T')[0],
            { level: 'campaign' }
        );

        if (!result.success || !result.data || result.data.length === 0) {
            console.warn('⚠️ [Meta CampaignChart] API call failed, using mock data:', result.error);
            return generateMockMetaChartData(campaignIds, startDate, endDate);
        }

        // Group data by date and campaign
        const dateMap = new Map<string, { date: string; [key: string]: any }>();
        const campaignMap = new Map<string, string>();

        for (const row of result.data) {
            const date = row.date_start || row.date;
            const cId = row.campaign_id;
            const cName = row.campaign_name || `Campaign ${cId}`;

            if (!date || !cId) continue;

            campaignMap.set(cId, cName);

            if (!dateMap.has(date)) {
                dateMap.set(date, { date });
            }
            const entry = dateMap.get(date)!;
            entry[cId] = (Number(entry[cId]) || 0) + Number(row.clicks || 0);
        }

        const chartData = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
        const campaigns = Array.from(campaignMap.entries()).map(([id, name]) => ({ id, name }));

        // Filter to requested campaigns if specified
        const filteredCampaigns = campaignIds && campaignIds.length > 0
            ? campaigns.filter(c => campaignIds.includes(c.id))
            : campaigns;

        const responseData = { chartData, campaigns: filteredCampaigns, isMockData: false };

        if (widgetId && reportId) {
            await cacheWidgetData(widgetId, reportId, responseData);
        }

        return responseData;
    } catch (error) {
        console.error('❌ [Meta CampaignChart] Unexpected error:', error);

        if (widgetId && reportId) {
            const cachedData = await loadCachedWidgetData(widgetId, reportId);
            if (cachedData) return cachedData;
        }

        return generateMockMetaChartData(campaignIds, startDate, endDate);
    }
}

function generateMockMetaChartData(
    campaignIds?: string[],
    startDate?: Date,
    endDate?: Date
) {
    const campaigns = (campaignIds || ['meta-camp-1', 'meta-camp-2']).map(id => ({
        id,
        name: `Meta Campaign ${id.slice(0, 8)}`,
    }));

    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const chartData = Array.from({ length: days }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dataPoint: any = { date: date.toISOString().split('T')[0] };
        campaigns.forEach(campaign => {
            dataPoint[campaign.id] = Math.random() * 800 + 200;
        });
        return dataPoint;
    });

    return { chartData, campaigns, isMockData: true };
}

/**
 * Format Meta Ads metric value for display
 */
function formatMetaMetric(metricName: string, value: number): string {
    switch (metricName) {
        case 'impressions':
        case 'clicks':
        case 'conversions':
        case 'reach':
            return new Intl.NumberFormat('fr-FR').format(Math.round(value));
        case 'ctr':
        case 'frequency':
            return `${value.toFixed(2)}%`;
        case 'cpc':
        case 'cpm':
        case 'spend':
            return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
        case 'roas':
            return `${value.toFixed(2)}x`;
        default:
            return value.toString();
    }
}
