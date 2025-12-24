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
import { db } from '../firebase/config';
import type { WidgetConfig, WidgetTemplate, WidgetInstance } from '../types/reportTypes';
import { WidgetType } from '../types/reportTypes';

const WIDGETS_COLLECTION = 'widgets';
const WIDGET_TEMPLATES_COLLECTION = 'widgetTemplates';

/**
 * Create a widget in a report
 */
export async function createWidget(
    reportId: string,
    widgetConfig: Omit<WidgetConfig, 'id' | 'createdAt' | 'updatedAt'>
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
    config: Partial<WidgetConfig>
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
 * Get widget data from Google Ads
 */
export async function getWidgetData(
    widgetConfig: WidgetConfig,
    accountId: string,
    campaignIds?: string[],
    startDate?: Date,
    endDate?: Date
): Promise<any> {
    try {
        const { type, settings } = widgetConfig;

        switch (type) {
            case WidgetType.PERFORMANCE_OVERVIEW:
                return await getPerformanceOverviewData(accountId, campaignIds, settings, startDate, endDate);

            case WidgetType.CAMPAIGN_CHART:
                return await getCampaignChartData(accountId, campaignIds, settings, startDate, endDate);

            default:
                throw new Error(`Unknown widget type: ${type}`);
        }
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
    settings?: WidgetConfig['settings'],
    startDate?: Date,
    endDate?: Date
): Promise<{
    metrics: Array<{
        name: string;
        value: number;
        formatted: string;
        change?: number;
    }>;
}> {
    try {
        // TODO: Implement real Google Ads API call with date filtering
        // For now, return mock data with date awareness
        console.log('Fetching performance data:', { accountId, campaignIds, startDate, endDate });

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
            // Mock data scaled by date range - replace with real API call
            const baseValue = Math.random() * 1000;
            const metricValue = baseValue * (days / 30); // Scale by date range

            return {
                name: metricName,
                value: metricValue,
                formatted: formatMetric(metricName, metricValue),
                change: settings?.showComparison ? Math.random() * 20 - 10 : undefined,
            };
        });

        return { metrics: metricsData };
    } catch (error) {
        console.error('Error getting performance overview data:', error);
        throw error;
    }
}

/**
 * Get Campaign Chart widget data
 */
async function getCampaignChartData(
    accountId: string,
    campaignIds?: string[],
    _settings?: WidgetConfig['settings'],
    startDate?: Date,
    endDate?: Date
): Promise<{
    chartData: Array<{
        date: string;
        [key: string]: any;
    }>;
    campaigns: Array<{ id: string; name: string }>;
}> {
    try {
        // Use real Google Ads API if we have all required parameters
        if (accountId && campaignIds && campaignIds.length > 0 && startDate && endDate) {
            const { fetchWidgetMetrics } = await import('./googleAds');
            const response = await fetchWidgetMetrics(
                accountId,
                campaignIds,
                startDate,
                endDate,
                'campaign_chart'
            );

            if (response.success && response.chartData && response.campaigns) {
                return {
                    chartData: response.chartData,
                    campaigns: response.campaigns
                };
            }
        }

        // Fallback to mock data if API call fails or parameters are missing
        console.log('Using mock data for campaign chart:', { accountId, campaignIds, startDate, endDate });

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

        return { chartData, campaigns };
    } catch (error) {
        console.error('Error getting campaign chart data:', error);
        throw error;
    }
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
export async function saveWidgetTemplate(
    userId: string,
    widgetConfig: WidgetConfig,
    name: string,
    description: string
): Promise<string> {
    try {
        const template: Omit<WidgetTemplate, 'id'> = {
            userId,
            name,
            description,
            type: widgetConfig.type,
            defaultSettings: widgetConfig.settings,
            thumbnail: undefined,
            isDefault: false,
            createdAt: new Date(),
        };

        const docRef = await addDoc(collection(db, WIDGET_TEMPLATES_COLLECTION), {
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
export async function getUserWidgetTemplates(userId: string): Promise<WidgetTemplate[]> {
    try {
        const q = query(
            collection(db, WIDGET_TEMPLATES_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const templates: WidgetTemplate[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            templates.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
            } as WidgetTemplate);
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
export async function getDefaultWidgetTemplates(): Promise<WidgetTemplate[]> {
    try {
        const q = query(
            collection(db, WIDGET_TEMPLATES_COLLECTION),
            where('isDefault', '==', true)
        );

        const querySnapshot = await getDocs(q);
        const templates: WidgetTemplate[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            templates.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
            } as WidgetTemplate);
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
export async function deleteWidgetTemplate(templateId: string): Promise<void> {
    try {
        const docRef = doc(db, WIDGET_TEMPLATES_COLLECTION, templateId);
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
        const widgetInstance: Omit<WidgetInstance, 'id'> = {
            widgetConfigId: widgetId,
            reportId,
            data,
            lastUpdated: new Date(),
        };

        // Check if instance exists
        const q = query(
            collection(db, 'widgetInstances'),
            where('widgetConfigId', '==', widgetId),
            where('reportId', '==', reportId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // Create new instance
            await addDoc(collection(db, 'widgetInstances'), {
                ...widgetInstance,
                lastUpdated: serverTimestamp(),
            });
        } else {
            // Update existing instance
            const docRef = doc(db, 'widgetInstances', querySnapshot.docs[0].id);
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
