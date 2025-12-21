import type {
    Account,
    Campaign,
    TimeSeriesMetrics,
    MetricsParams,
    Alert,
    AuditResult,
    CampaignStatus,
    CampaignType,
    TimeSeriesDataPoint,
} from '../types/business';
import { fetchAccessibleCustomers, fetchCampaigns, getLinkedCustomerId } from './googleAds';

/**
 * Live Data Service - Handles real Google Ads API calls
 */
class LiveDataService {
    /**
     * Get real accounts from Google Ads API
     */
    async getAccounts(): Promise<Account[]> {
        try {
            const { currentUser } = await import('../firebase/config').then(m => ({ currentUser: m.auth.currentUser }));

            if (currentUser) {
                // 1. Try to get accounts from Firestore cache first
                const { getDocs, collection } = await import('firebase/firestore');
                const { db } = await import('../firebase/config');

                const accountsRef = collection(db, 'users', currentUser.uid, 'google_ads_accounts');
                const snapshot = await getDocs(accountsRef);

                if (!snapshot.empty) {
                    console.log('Found accounts in Firestore cache');
                    return snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: data.id,
                            name: data.name,
                            status: 'active',
                            currency: data.currency || 'EUR',
                            timezone: data.timezone || 'Europe/Paris',
                            currentSpend: 0,
                            campaignCount: 0,
                            performanceScore: 0,
                            createdAt: new Date(),
                            lastSync: data.lastSync?.toDate() || new Date(),
                        };
                    });
                }
            }

            // 2. If no cache, fetch from API (which will also cache for next time)
            const response = await fetchAccessibleCustomers();

            if (!response.success || !response.customers) {
                console.error('Failed to fetch customers:', response.error);
                return [];
            }

            // Transform Google Ads customers to Account type
            const accounts: Account[] = response.customers.map((customer: any) => ({
                id: customer.id,
                name: customer.name || customer.descriptiveName || customer.id,
                status: 'active' as const,
                currency: customer.currency || 'EUR',
                timezone: customer.timezone || 'Europe/Paris',
                currentSpend: 0, // Will be calculated from campaigns
                campaignCount: 0, // Will be calculated from campaigns
                performanceScore: 0, // Will be calculated
                createdAt: new Date(),
                lastSync: new Date(),
            }));

            // Fetch campaigns for each account to calculate metrics
            const linkedCustomerId = getLinkedCustomerId();
            if (linkedCustomerId) {
                const campaignsResponse = await fetchCampaigns();
                if (campaignsResponse.success && campaignsResponse.campaigns) {
                    const campaigns = campaignsResponse.campaigns;

                    accounts.forEach(account => {
                        const accountCampaigns = campaigns.filter((c: any) =>
                            c.customer === account.id || c.customerId === account.id
                        );
                        account.campaignCount = accountCampaigns.length;
                        account.currentSpend = accountCampaigns.reduce((sum: number, c: any) =>
                            sum + (c.metrics?.cost_micros ? c.metrics.cost_micros / 1_000_000 : 0), 0
                        );
                    });
                }
            }

            return accounts;
        } catch (error) {
            console.error('Error fetching accounts:', error);
            return [];
        }
    }

    /**
     * Get campaigns for a specific account
     */
    async getCampaigns(accountId: string): Promise<Campaign[]> {
        try {
            const response = await fetchCampaigns(accountId);

            if (!response.success || !response.campaigns) {
                console.error('Failed to fetch campaigns:', response.error);
                return [];
            }

            console.log(`Fetched ${response.campaigns.length} campaigns for account ${accountId}`);

            // Transform to Campaign type (Cloud function already filters by customerId)
            const campaigns: Campaign[] = response.campaigns
                .map((c: any) => this.transformCampaign(c, accountId));

            return campaigns;
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            return [];
        }
    }

    /**
     * Get all campaigns across all accounts
     */
    async getAllCampaigns(): Promise<Campaign[]> {
        try {
            const response = await fetchCampaigns();

            if (!response.success || !response.campaigns) {
                console.error('Failed to fetch campaigns:', response.error);
                return [];
            }

            // Transform all campaigns
            const campaigns: Campaign[] = response.campaigns.map((c: any) =>
                this.transformCampaign(c, c.customer || c.customerId || 'unknown')
            );

            return campaigns;
        } catch (error) {
            console.error('Error fetching all campaigns:', error);
            return [];
        }
    }

    /**
     * Transform Google Ads campaign to our Campaign type
     */
    private transformCampaign(apiCampaign: any, accountId: string): Campaign {
        const metrics = apiCampaign.metrics || {};

        // Convert micros to actual values
        const cost = (metrics.cost_micros || 0) / 1_000_000;
        const clicks = metrics.clicks || 0;
        const impressions = metrics.impressions || 0;
        const conversions = metrics.conversions || 0;
        const conversionValue = (metrics.conversions_value || 0);

        // Calculate derived metrics
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cpc = clicks > 0 ? cost / clicks : 0;
        const cpa = conversions > 0 ? cost / conversions : 0;
        const roas = cost > 0 ? conversionValue / cost : 0;

        return {
            id: apiCampaign.id || apiCampaign.resourceName || String(Date.now()),
            accountId,
            name: apiCampaign.name || 'Unnamed Campaign',
            status: this.mapCampaignStatus(apiCampaign.status),
            type: this.mapCampaignType(apiCampaign.advertisingChannelType),
            budget: {
                amount: (apiCampaign.campaignBudget?.amountMicros || 0) / 1_000_000,
                type: 'DAILY' as const,
            },
            metrics: {
                impressions,
                clicks,
                cost,
                conversions,
                conversionValue,
                ctr,
                cpc,
                cpa,
                roas,
            },
            settings: {
                biddingStrategy: apiCampaign.biddingStrategyType || 'UNKNOWN',
                targetLocation: [],
                targetLanguages: [],
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    /**
     * Map Google Ads campaign status to our type
     */
    private mapCampaignStatus(status: string): CampaignStatus {
        const statusMap: Record<string, CampaignStatus> = {
            'ENABLED': 'ENABLED',
            'PAUSED': 'PAUSED',
            'REMOVED': 'REMOVED',
        };
        return statusMap[status] || 'PAUSED';
    }

    /**
     * Map Google Ads campaign type to our type
     */
    private mapCampaignType(channelType: string): CampaignType {
        const typeMap: Record<string, CampaignType> = {
            'SEARCH': 'SEARCH',
            'DISPLAY': 'DISPLAY',
            'VIDEO': 'VIDEO',
            'SHOPPING': 'SHOPPING',
            'PERFORMANCE_MAX': 'PERFORMANCE_MAX',
        };
        return typeMap[channelType] || 'SEARCH';
    }

    /**
     * Get time series metrics for charts
     */
    async getTimeSeriesMetrics(params: MetricsParams): Promise<TimeSeriesMetrics> {
        try {
            // For now, we'll generate time series from current campaign data
            // In a full implementation, this would query historical data from the API
            const campaigns = params.accountId
                ? await this.getCampaigns(params.accountId)
                : await this.getAllCampaigns();

            const { start, end } = params.dateRange;
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            // Generate daily data points (simplified - in reality would come from API)
            const generateTimeSeries = (totalValue: number): TimeSeriesDataPoint[] => {
                const points: TimeSeriesDataPoint[] = [];
                for (let i = 0; i < days; i++) {
                    const date = new Date(start);
                    date.setDate(date.getDate() + i);
                    // Distribute value across days with some variation
                    const dailyValue = (totalValue / days) * (0.7 + Math.random() * 0.6);
                    points.push({ date, value: dailyValue });
                }
                return points;
            };

            const totalSpend = campaigns.reduce((sum, c) => sum + c.metrics.cost, 0);
            const totalImpressions = campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0);
            const totalClicks = campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0);
            const totalConversions = campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0);

            return {
                spend: generateTimeSeries(totalSpend),
                impressions: generateTimeSeries(totalImpressions),
                clicks: generateTimeSeries(totalClicks),
                conversions: generateTimeSeries(totalConversions),
            };
        } catch (error) {
            console.error('Error fetching time series metrics:', error);
            return {
                spend: [],
                impressions: [],
                clicks: [],
                conversions: [],
            };
        }
    }

    /**
     * Get alerts based on real data
     */
    async getAlerts(): Promise<Alert[]> {
        try {
            const campaigns = await this.getAllCampaigns();
            const alerts: Alert[] = [];

            campaigns.forEach(campaign => {
                // Budget exceeded alert
                if (campaign.metrics.cost > campaign.budget.amount * 0.9) {
                    alerts.push({
                        id: `budget-${campaign.id}`,
                        type: 'budget_exceeded',
                        severity: campaign.metrics.cost > campaign.budget.amount ? 'critical' : 'warning',
                        title: 'Budget Alert',
                        message: `Campaign "${campaign.name}" has used ${Math.round((campaign.metrics.cost / campaign.budget.amount) * 100)}% of its budget`,
                        accountId: campaign.accountId,
                        campaignId: campaign.id,
                        timestamp: new Date(),
                        read: false,
                    });
                }

                // Low CTR alert
                if (campaign.metrics.impressions > 1000 && campaign.metrics.ctr < 1) {
                    alerts.push({
                        id: `low-ctr-${campaign.id}`,
                        type: 'underperforming',
                        severity: 'warning',
                        title: 'Low Click-Through Rate',
                        message: `Campaign "${campaign.name}" has a CTR of ${campaign.metrics.ctr.toFixed(2)}%, below the 1% threshold`,
                        accountId: campaign.accountId,
                        campaignId: campaign.id,
                        timestamp: new Date(),
                        read: false,
                    });
                }

                // High CPA alert
                if (campaign.metrics.conversions > 0 && campaign.metrics.cpa > 50) {
                    alerts.push({
                        id: `high-cpa-${campaign.id}`,
                        type: 'recommendation',
                        severity: 'info',
                        title: 'High Cost Per Acquisition',
                        message: `Campaign "${campaign.name}" has a CPA of €${campaign.metrics.cpa.toFixed(2)}. Consider optimizing targeting or ad copy`,
                        accountId: campaign.accountId,
                        campaignId: campaign.id,
                        timestamp: new Date(),
                        read: false,
                    });
                }
            });

            return alerts;
        } catch (error) {
            console.error('Error generating alerts:', error);
            return [];
        }
    }

    /**
     * Generate audit result from real campaign data
     */
    async getAuditResult(accountId: string, campaignId?: string): Promise<AuditResult> {
        try {
            const campaigns = campaignId
                ? (await this.getCampaigns(accountId)).filter(c => c.id === campaignId)
                : await this.getCampaigns(accountId);

            // Calculate audit scores based on real metrics
            const avgCTR = campaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / campaigns.length;
            const avgQualityScore = 7; // Would come from API
            const hasConversions = campaigns.some(c => c.metrics.conversions > 0);

            const structureScore = Math.min(100, campaigns.length * 20); // More campaigns = better structure
            const targetingScore = avgCTR > 2 ? 80 : avgCTR > 1 ? 60 : 40;
            const keywordsScore = avgQualityScore * 10;
            const adsScore = avgCTR > 3 ? 90 : avgCTR > 2 ? 70 : 50;
            const budgetScore = campaigns.every(c => c.metrics.cost <= c.budget.amount) ? 90 : 60;
            const extensionsScore = 50; // Would need extension data from API
            const landingPagesScore = hasConversions ? 80 : 50;

            const overallScore = Math.round(
                (structureScore + targetingScore + keywordsScore + adsScore +
                    budgetScore + extensionsScore + landingPagesScore) / 7
            );

            return {
                id: `audit-${accountId}-${Date.now()}`,
                accountId,
                campaignId,
                timestamp: new Date(),
                overallScore,
                categories: {
                    structure: { score: structureScore, recommendations: [] },
                    targeting: { score: targetingScore, recommendations: [] },
                    keywords: { score: keywordsScore, recommendations: [] },
                    ads: { score: adsScore, recommendations: [] },
                    budget: { score: budgetScore, recommendations: [] },
                    extensions: { score: extensionsScore, recommendations: [] },
                    landingPages: { score: landingPagesScore, recommendations: [] },
                },
                recommendations: [],
            };
        } catch (error) {
            console.error('Error generating audit result:', error);
            throw error;
        }
    }
}

export default new LiveDataService();

