import type {
    Account,
    Campaign,
    TimeSeriesMetrics,
    MetricsParams,
    Alert,
    AuditResult,
    DateRange,
} from '../types/business';
import type { DemoDataConfig } from '../types/demo';
import DemoDataGenerator from './demoDataGenerator';

/**
 * Demo Data Service - Provides realistic mock data for demo mode
 */
class DemoDataService {
    private generator: DemoDataGenerator;
    private cachedAccounts: Account[] | null = null;
    private cachedCampaigns: Map<string, Campaign[]> = new Map();

    constructor() {
        this.generator = new DemoDataGenerator();
    }

    /**
     * Get demo accounts based on current settings
     */
    getAccounts(config: DemoDataConfig): Account[] {
        // Cache accounts to maintain consistency
        if (!this.cachedAccounts) {
            this.cachedAccounts = this.generator.generateAccounts(config);
        }
        return this.cachedAccounts;
    }

    /**
     * Get campaigns for a specific account
     */
    getCampaigns(accountId: string, config: DemoDataConfig): Campaign[] {
        if (!this.cachedCampaigns.has(accountId)) {
            const account = this.cachedAccounts?.find(a => a.id === accountId);
            if (!account) return [];

            const campaigns = this.generator.generateCampaigns(
                accountId,
                account.campaignCount,
                config.complexity
            );
            this.cachedCampaigns.set(accountId, campaigns);
        }

        return this.cachedCampaigns.get(accountId) || [];
    }

    /**
     * Get all campaigns across all accounts
     */
    getAllCampaigns(config: DemoDataConfig): Campaign[] {
        const accounts = this.getAccounts(config);
        const allCampaigns: Campaign[] = [];

        accounts.forEach(account => {
            const campaigns = this.getCampaigns(account.id, config);
            allCampaigns.push(...campaigns);
        });

        return allCampaigns;
    }

    /**
     * Get time series metrics for charts
     */
    getTimeSeriesMetrics(params: MetricsParams): TimeSeriesMetrics {
        return this.generator.generateTimeSeriesMetrics(params.dateRange);
    }

    /**
     * Get alerts for accounts
     */
    getAlerts(config: DemoDataConfig): Alert[] {
        const accounts = this.getAccounts(config);
        return this.generator.generateAlerts(accounts);
    }

    /**
     * Get audit result for account/campaign
     */
    getAuditResult(accountId: string, campaignId?: string): AuditResult {
        return this.generator.generateAuditResult(accountId, campaignId);
    }

    /**
     * Reset cached data (when demo settings change)
     */
    resetCache(): void {
        this.cachedAccounts = null;
        this.cachedCampaigns.clear();
    }
}

export default new DemoDataService();
