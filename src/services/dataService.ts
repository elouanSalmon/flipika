import type {
    Account,
    Campaign,
    TimeSeriesMetrics,
    MetricsParams,
    Alert,
    AuditResult,
} from '../types/business';
import type { DemoDataConfig } from '../types/demo';
import demoDataService from './demoDataService';
import liveDataService from './liveDataService';

/**
 * Unified Data Service - Abstracts data source (demo vs live)
 * Automatically switches between demo and live data based on mode
 */
class DataService {
    private demoMode: boolean = false;
    private demoConfig: DemoDataConfig = {
        accountCount: 3,
        complexity: 'medium',
        industry: 'ecommerce',
    };

    /**
     * Set demo mode state
     */
    setDemoMode(enabled: boolean): void {
        this.demoMode = enabled;
    }

    /**
     * Update demo configuration
     */
    setDemoConfig(config: Partial<DemoDataConfig>): void {
        this.demoConfig = { ...this.demoConfig, ...config };
        if (this.demoMode) {
            demoDataService.resetCache();
        }
    }

    /**
     * Get current demo configuration
     */
    getDemoConfig(): DemoDataConfig {
        return this.demoConfig;
    }

    /**
     * Check if in demo mode
     */
    isDemoMode(): boolean {
        return this.demoMode;
    }

    /**
     * Get accounts (demo or live)
     */
    async getAccounts(): Promise<Account[]> {
        if (this.demoMode) {
            return Promise.resolve(demoDataService.getAccounts(this.demoConfig));
        }
        return liveDataService.getAccounts();
    }

    /**
     * Get campaigns for a specific account
     */
    async getCampaigns(accountId: string): Promise<Campaign[]> {
        if (this.demoMode) {
            return Promise.resolve(demoDataService.getCampaigns(accountId, this.demoConfig));
        }
        return liveDataService.getCampaigns(accountId);
    }

    /**
     * Get all campaigns across all accounts
     */
    async getAllCampaigns(): Promise<Campaign[]> {
        if (this.demoMode) {
            return Promise.resolve(demoDataService.getAllCampaigns(this.demoConfig));
        }
        return liveDataService.getAllCampaigns();
    }

    /**
     * Get time series metrics for charts
     */
    async getTimeSeriesMetrics(params: MetricsParams): Promise<TimeSeriesMetrics> {
        if (this.demoMode) {
            return Promise.resolve(demoDataService.getTimeSeriesMetrics(params));
        }
        return liveDataService.getTimeSeriesMetrics(params);
    }

    /**
     * Get alerts
     */
    async getAlerts(): Promise<Alert[]> {
        if (this.demoMode) {
            return Promise.resolve(demoDataService.getAlerts(this.demoConfig));
        }
        return liveDataService.getAlerts();
    }

    /**
     * Get audit result
     */
    async getAuditResult(accountId: string, campaignId?: string): Promise<AuditResult> {
        if (this.demoMode) {
            return Promise.resolve(demoDataService.getAuditResult(accountId, campaignId));
        }
        return liveDataService.getAuditResult(accountId, campaignId);
    }
}

export default new DataService();
