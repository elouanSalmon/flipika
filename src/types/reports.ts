// Report generation types

export interface ReportConfig {
    accountId: string;
    campaignIds: string[];
    period: {
        start: Date;
        end: Date;
        preset?: 'last_month' | 'last_quarter' | 'this_year' | 'last_year' | 'custom';
    };
    modules: {
        executiveSummary: boolean;
        globalMetrics: boolean;
        campaignAnalysis: boolean;
        adGroupAnalysis: boolean;
        keywordPerformance: boolean;
        adPerformance: boolean;
        demographics: boolean;
        geography: boolean;
        devices: boolean;
        timeEvolution: boolean;
        recommendations: boolean;
        comparison: boolean;
        budgetVsSpend: boolean;
    };
    customization: {
        logo?: string;
        brandColors?: string[];
        reportName: string;
        notes?: string;
    };
}

export interface GeneratedReport {
    id: string;
    config: ReportConfig;
    generatedAt: Date;
    fileUrl?: string;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    format: 'pdf' | 'excel' | 'pptx' | 'csv';
}

export type ReportFormat = 'pdf' | 'excel' | 'pptx' | 'csv';
