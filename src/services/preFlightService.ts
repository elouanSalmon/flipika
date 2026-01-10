import liveDataService from './liveDataService';

/**
 * KPI Data structure for Pre-Flight Check
 */
export interface PreFlightKPIData {
    cost: number;
    clicks: number;
    impressions: number;
    conversions: number;
    ctr: number;
    cpc: number;
    period: {
        start: Date;
        end: Date;
    };
    clientName: string;
    accountId: string;
    campaignCount: number;
}

/**
 * Pre-Flight Service - Fetches KPI data for report validation
 */
class PreFlightService {
    /**
     * Fetch KPI data for a specific account and period
     */
    async fetchKPIs(
        accountId: string,
        clientName: string,
        startDate: Date,
        endDate: Date
    ): Promise<PreFlightKPIData> {
        try {
            // Fetch campaigns for the account
            const campaigns = await liveDataService.getCampaigns(accountId);

            if (!campaigns || campaigns.length === 0) {
                throw new Error('No campaigns found for this account');
            }

            // Aggregate metrics from all campaigns
            const totalCost = campaigns.reduce((sum, c) => sum + c.metrics.cost, 0);
            const totalClicks = campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0);
            const totalImpressions = campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0);
            const totalConversions = campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0);

            // Calculate derived metrics
            const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
            const cpc = totalClicks > 0 ? totalCost / totalClicks : 0;

            return {
                cost: totalCost,
                clicks: totalClicks,
                impressions: totalImpressions,
                conversions: totalConversions,
                ctr,
                cpc,
                period: {
                    start: startDate,
                    end: endDate,
                },
                clientName,
                accountId,
                campaignCount: campaigns.length,
            };
        } catch (error) {
            console.error('Error fetching Pre-Flight KPIs:', error);
            throw error;
        }
    }

    /**
     * Validate KPI data
     */
    validateKPIs(data: PreFlightKPIData): { isValid: boolean; warnings: string[] } {
        const warnings: string[] = [];

        // Check for zero impressions
        if (data.impressions === 0) {
            warnings.push('Aucune impression enregistrée pour cette période');
        }

        // Check for low CTR
        if (data.impressions > 1000 && data.ctr < 1) {
            warnings.push(`CTR faible (${data.ctr.toFixed(2)}%)`);
        }

        // Check for no conversions
        if (data.clicks > 100 && data.conversions === 0) {
            warnings.push('Aucune conversion enregistrée');
        }

        // Data is valid if we have at least some impressions
        const isValid = data.impressions > 0;

        return { isValid, warnings };
    }
}

export default new PreFlightService();
