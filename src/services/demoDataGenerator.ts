import { faker } from '@faker-js/faker';
import type {
    Account,
    Campaign,
    CampaignMetrics,
    TimeSeriesMetrics,
    TimeSeriesDataPoint,
    DateRange,
    Alert,
    AuditResult,
    Recommendation,
    CategoryScore,
} from '../types/business';
import type { DemoDataConfig, DemoComplexity, DemoIndustry } from '../types/demo';

/**
 * Advanced demo data generator with realistic, coherent data
 * based on industry type and complexity level
 */
class DemoDataGenerator {
    private seed: number;

    constructor(seed?: number) {
        this.seed = seed || Date.now();
        faker.seed(this.seed);
    }

    /**
     * Generate realistic account names based on industry
     */
    private generateAccountName(industry: DemoIndustry): string {
        const templates = {
            ecommerce: [
                `${faker.commerce.department()} Store`,
                `${faker.company.name()} Shop`,
                `${faker.word.adjective()} ${faker.commerce.product()} Market`,
            ],
            services: [
                `${faker.company.name()} Services`,
                `${faker.word.adjective()} ${faker.company.buzzNoun()} Agency`,
                `${faker.person.lastName()} & Associates`,
            ],
            saas: [
                `${faker.word.adjective()}${faker.hacker.noun()}`,
                `${faker.company.buzzVerb()}${faker.company.buzzNoun()}`,
                `${faker.hacker.verb()} Platform`,
            ],
            local: [
                `${faker.person.lastName()}'s ${faker.commerce.department()}`,
                `${faker.location.city()} ${faker.commerce.product()} Shop`,
                `Local ${faker.commerce.department()}`,
            ],
            b2b: [
                `${faker.company.name()} Solutions`,
                `${faker.word.adjective()} ${faker.company.buzzNoun()} Corp`,
                `${faker.company.name()} Enterprise`,
            ],
        };

        const options = templates[industry];
        return faker.helpers.arrayElement(options);
    }

    /**
     * Generate budget based on complexity
     */
    private generateBudget(complexity: DemoComplexity): { monthly: number; daily: number } {
        const ranges = {
            simple: { min: 500, max: 2000 },
            medium: { min: 2000, max: 10000 },
            advanced: { min: 10000, max: 50000 },
        };

        const range = ranges[complexity];
        const monthly = faker.number.int({ min: range.min, max: range.max });
        const daily = Math.round(monthly / 30);

        return { monthly, daily };
    }

    /**
     * Generate campaign count based on complexity
     */
    private getCampaignCount(complexity: DemoComplexity): number {
        const ranges = {
            simple: { min: 1, max: 3 },
            medium: { min: 3, max: 8 },
            advanced: { min: 8, max: 20 },
        };

        const range = ranges[complexity];
        return faker.number.int({ min: range.min, max: range.max });
    }

    /**
     * Generate performance score with some variance
     */
    private generatePerformanceScore(): number {
        return faker.number.int({ min: 45, max: 95 });
    }

    /**
     * Generate realistic accounts
     */
    generateAccounts(config: DemoDataConfig): Account[] {
        return Array.from({ length: config.accountCount }, (_, i) => {
            const budget = this.generateBudget(config.complexity);
            const campaignCount = this.getCampaignCount(config.complexity);
            const currentSpend = faker.number.float({
                min: budget.monthly * 0.3,
                max: budget.monthly * 0.95,
                fractionDigits: 2,
            });

            return {
                id: `demo-account-${i + 1}`,
                name: this.generateAccountName(config.industry),
                status: faker.helpers.arrayElement(['active', 'active', 'active', 'paused'] as const),
                currency: 'EUR',
                timezone: 'Europe/Paris',
                budgetMonthly: budget.monthly,
                budgetDaily: budget.daily,
                currentSpend,
                campaignCount,
                performanceScore: this.generatePerformanceScore(),
                createdAt: faker.date.past({ years: 2 }),
            };
        });
    }

    /**
     * Generate realistic campaign metrics
     */
    private generateCampaignMetrics(budget: number): CampaignMetrics {
        const cost = faker.number.float({ min: budget * 0.5, max: budget * 1.2, fractionDigits: 2 });
        const impressions = faker.number.int({ min: 10000, max: 500000 });
        const clicks = faker.number.int({ min: Math.floor(impressions * 0.01), max: Math.floor(impressions * 0.05) });
        const conversions = faker.number.int({ min: Math.floor(clicks * 0.02), max: Math.floor(clicks * 0.1) });
        const conversionValue = conversions * faker.number.float({ min: 50, max: 500, fractionDigits: 2 });

        const ctr = (clicks / impressions) * 100;
        const cpc = cost / clicks;
        const cpa = conversions > 0 ? cost / conversions : 0;
        const roas = cost > 0 ? conversionValue / cost : 0;

        return {
            impressions,
            clicks,
            cost,
            conversions,
            conversionValue,
            ctr: parseFloat(ctr.toFixed(2)),
            cpc: parseFloat(cpc.toFixed(2)),
            cpa: parseFloat(cpa.toFixed(2)),
            roas: parseFloat(roas.toFixed(2)),
            qualityScore: faker.number.int({ min: 3, max: 10 }),
        };
    }

    /**
     * Generate campaigns for an account
     */
    generateCampaigns(accountId: string, count: number, complexity: DemoComplexity): Campaign[] {
        const campaignTypes = ['SEARCH', 'DISPLAY', 'VIDEO', 'SHOPPING', 'PERFORMANCE_MAX'] as const;

        return Array.from({ length: count }, (_, i) => {
            const budget = this.generateBudget(complexity);
            const type = faker.helpers.arrayElement(campaignTypes);

            return {
                id: `demo-campaign-${accountId}-${i + 1}`,
                accountId,
                name: `${type} Campaign ${i + 1}`,
                status: faker.helpers.arrayElement(['ENABLED', 'ENABLED', 'ENABLED', 'PAUSED'] as const),
                type,
                budget: {
                    amount: budget.daily,
                    type: 'DAILY',
                },
                metrics: this.generateCampaignMetrics(budget.daily * 30),
                settings: {
                    startDate: faker.date.past({ years: 1 }),
                    biddingStrategy: faker.helpers.arrayElement(['TARGET_CPA', 'MAXIMIZE_CONVERSIONS', 'TARGET_ROAS']),
                    targetLocation: ['FR'],
                    targetLanguages: ['fr'],
                },
                createdAt: faker.date.past({ years: 1 }),
                updatedAt: faker.date.recent({ days: 7 }),
            };
        });
    }

    /**
     * Generate time series metrics for charts
     */
    generateTimeSeriesMetrics(dateRange: DateRange): TimeSeriesMetrics {
        const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
        const dataPoints: TimeSeriesDataPoint[] = [];

        for (let i = 0; i <= days; i++) {
            const date = new Date(dateRange.start);
            date.setDate(date.getDate() + i);
            dataPoints.push({ date, value: 0 });
        }

        return {
            spend: dataPoints.map(dp => ({
                date: dp.date,
                value: faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
            })),
            impressions: dataPoints.map(dp => ({
                date: dp.date,
                value: faker.number.int({ min: 1000, max: 20000 }),
            })),
            clicks: dataPoints.map(dp => ({
                date: dp.date,
                value: faker.number.int({ min: 50, max: 1000 }),
            })),
            conversions: dataPoints.map(dp => ({
                date: dp.date,
                value: faker.number.int({ min: 2, max: 50 }),
            })),
        };
    }

    /**
     * Generate realistic alerts
     */
    generateAlerts(accounts: Account[]): Alert[] {
        const alerts: Alert[] = [];

        accounts.forEach(account => {
            // Budget exceeded alert
            if (account.budgetMonthly && account.currentSpend > account.budgetMonthly * 0.9) {
                alerts.push({
                    id: `alert-budget-${account.id}`,
                    type: 'budget_exceeded',
                    severity: account.currentSpend > account.budgetMonthly ? 'critical' : 'warning',
                    title: 'Budget Alert',
                    message: `${account.name} has spent ${((account.currentSpend / account.budgetMonthly) * 100).toFixed(0)}% of monthly budget`,
                    accountId: account.id,
                    timestamp: new Date(),
                    read: false,
                });
            }

            // Performance alert
            if (account.performanceScore < 60) {
                alerts.push({
                    id: `alert-performance-${account.id}`,
                    type: 'underperforming',
                    severity: account.performanceScore < 50 ? 'critical' : 'warning',
                    title: 'Low Performance Score',
                    message: `${account.name} performance score is ${account.performanceScore}/100`,
                    accountId: account.id,
                    timestamp: new Date(),
                    actionUrl: `/app/audit?account=${account.id}`,
                    read: false,
                });
            }
        });

        return alerts;
    }

    /**
     * Generate audit recommendations
     */
    private generateRecommendations(category: string): Recommendation[] {
        const templates = {
            keywords: [
                {
                    title: 'Low Quality Score keywords detected',
                    description: '7 keywords have Quality Score below 5, impacting ad performance and costs',
                    impact: 'HIGH' as const,
                    impactValue: { amount: 250, unit: 'EUR' as const },
                    actionItems: [
                        'Review and improve ad relevance for low QS keywords',
                        'Consider pausing keywords with QS < 3',
                        'Add negative keywords to improve relevance',
                    ],
                },
                {
                    title: 'Missing negative keywords',
                    description: 'No negative keyword lists found, leading to irrelevant traffic',
                    impact: 'MEDIUM' as const,
                    impactValue: { amount: 15, unit: 'PERCENT' as const },
                    actionItems: [
                        'Create negative keyword lists',
                        'Review search terms report',
                        'Add irrelevant terms as negatives',
                    ],
                },
            ],
            ads: [
                {
                    title: 'No Responsive Search Ads',
                    description: '3 ad groups are using only Expanded Text Ads without RSA variants',
                    impact: 'HIGH' as const,
                    impactValue: { amount: 20, unit: 'PERCENT' as const },
                    actionItems: [
                        'Create Responsive Search Ads for each ad group',
                        'Test multiple headlines and descriptions',
                        'Monitor performance and optimize',
                    ],
                },
            ],
            extensions: [
                {
                    title: 'Missing ad extensions',
                    description: 'No sitelink or callout extensions configured',
                    impact: 'MEDIUM' as const,
                    impactValue: { amount: 15, unit: 'PERCENT' as const },
                    actionItems: [
                        'Add sitelink extensions',
                        'Configure callout extensions',
                        'Add structured snippets',
                    ],
                },
            ],
            budget: [
                {
                    title: 'Budget exhausted early',
                    description: 'Daily budget is depleted by 2 PM on average, missing evening traffic',
                    impact: 'HIGH' as const,
                    impactValue: { amount: 30, unit: 'PERCENT' as const },
                    actionItems: [
                        'Increase daily budget',
                        'Adjust bid strategy',
                        'Use ad scheduling to control spend',
                    ],
                },
            ],
        };

        const categoryTemplates = templates[category as keyof typeof templates] || [];

        return categoryTemplates.map((template, i) => ({
            id: `rec-${category}-${i}`,
            category,
            ...template,
            priority: template.impact === 'HIGH' ? 'URGENT' as const : 'IMPORTANT' as const,
            difficulty: faker.helpers.arrayElement(['EASY', 'MEDIUM', 'COMPLEX'] as const),
            status: 'PENDING' as const,
            createdAt: new Date(),
        }));
    }

    /**
     * Generate audit result
     */
    generateAuditResult(accountId: string, campaignId?: string): AuditResult {
        const categories = ['structure', 'targeting', 'keywords', 'ads', 'budget', 'extensions', 'landingPages'];
        const categoryScores: any = {};
        const allRecommendations: Recommendation[] = [];

        categories.forEach(category => {
            const score = faker.number.int({ min: 50, max: 95 });
            const recommendations = score < 80 ? this.generateRecommendations(category) : [];

            categoryScores[category] = {
                score,
                recommendations,
            };

            allRecommendations.push(...recommendations);
        });

        const overallScore = Math.round(
            Object.values(categoryScores).reduce((sum: number, cat: any) => sum + cat.score, 0) / categories.length
        );

        return {
            id: `audit-${accountId}-${Date.now()}`,
            accountId,
            campaignId,
            timestamp: new Date(),
            overallScore,
            categories: categoryScores,
            recommendations: allRecommendations,
        };
    }
}

export default DemoDataGenerator;
