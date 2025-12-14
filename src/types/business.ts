// Business domain types for Flipika SaaS

export type AccountStatus = 'active' | 'inactive' | 'paused';
export type CampaignStatus = 'ENABLED' | 'PAUSED' | 'REMOVED';
export type CampaignType = 'SEARCH' | 'DISPLAY' | 'VIDEO' | 'SHOPPING' | 'PERFORMANCE_MAX';
export type BudgetType = 'DAILY' | 'MONTHLY';
export type Currency = 'EUR' | 'USD' | 'GBP';

export interface Account {
    id: string;
    name: string;
    status: AccountStatus;
    currency: Currency;
    timezone: string;
    budgetMonthly?: number;
    budgetDaily?: number;
    currentSpend: number;
    campaignCount: number;
    performanceScore: number; // 0-100
    createdAt: Date;
    lastSync?: Date;
}

export interface CampaignBudget {
    amount: number;
    type: BudgetType;
}

export interface CampaignSettings {
    startDate?: Date;
    endDate?: Date;
    biddingStrategy: string;
    targetLocation: string[];
    targetLanguages: string[];
}

export interface CampaignMetrics {
    impressions: number;
    clicks: number;
    cost: number;
    conversions: number;
    conversionValue: number;
    ctr: number; // Click-through rate (%)
    cpc: number; // Cost per click
    cpa: number; // Cost per acquisition
    roas: number; // Return on ad spend
    qualityScore?: number;
}

export interface Campaign {
    id: string;
    accountId: string;
    name: string;
    status: CampaignStatus;
    type: CampaignType;
    budget: CampaignBudget;
    metrics: CampaignMetrics;
    settings: CampaignSettings;
    createdAt: Date;
    updatedAt: Date;
}

export interface CategoryScore {
    score: number; // 0-100
    recommendations: Recommendation[];
}

export interface AuditCategories {
    structure: CategoryScore;
    targeting: CategoryScore;
    keywords: CategoryScore;
    ads: CategoryScore;
    budget: CategoryScore;
    extensions: CategoryScore;
    landingPages: CategoryScore;
}

export interface AuditResult {
    id: string;
    accountId: string;
    campaignId?: string;
    timestamp: Date;
    overallScore: number; // 0-100
    categories: AuditCategories;
    recommendations: Recommendation[];
}

export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type Priority = 'URGENT' | 'IMPORTANT' | 'MINOR';
export type Difficulty = 'EASY' | 'MEDIUM' | 'COMPLEX';
export type RecommendationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';

export interface ImpactValue {
    amount: number;
    unit: 'EUR' | 'USD' | 'PERCENT';
}

export interface Recommendation {
    id: string;
    category: string;
    title: string;
    description: string;
    impact: ImpactLevel;
    impactValue?: ImpactValue;
    priority: Priority;
    difficulty: Difficulty;
    status: RecommendationStatus;
    actionItems: string[];
    createdAt: Date;
    updatedAt?: Date;
    notes?: string;
}

export interface TimeSeriesDataPoint {
    date: Date;
    value: number;
}

export interface TimeSeriesMetrics {
    spend: TimeSeriesDataPoint[];
    impressions: TimeSeriesDataPoint[];
    clicks: TimeSeriesDataPoint[];
    conversions: TimeSeriesDataPoint[];
}

export interface DateRange {
    start: Date;
    end: Date;
    preset?: 'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'custom';
}

export interface MetricsParams {
    accountId?: string;
    campaignId?: string;
    dateRange: DateRange;
}

export interface Alert {
    id: string;
    type: 'budget_exceeded' | 'underperforming' | 'recommendation' | 'action_required';
    severity: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    accountId?: string;
    campaignId?: string;
    timestamp: Date;
    actionUrl?: string;
    read: boolean;
}

export interface KPI {
    label: string;
    value: number | string;
    change?: number; // Percentage change
    trend?: 'up' | 'down' | 'neutral';
    format?: 'number' | 'currency' | 'percent';
}
