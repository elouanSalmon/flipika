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
            console.warn('⚠️ API call failed, using mock data:', result.error);
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
        console.error('❌ Error fetching performance data:', error);

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

    const selectedMetrics = settings?.metrics || [
        'impressions',
        'clicks',
        'ctr',
        'cpc',
        'conversions',
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
            console.warn('⚠️ API call failed, using mock data:', result.error);
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
        console.error('❌ Error fetching chart data:', error);

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
