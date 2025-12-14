import { faker } from '@faker-js/faker';
import type {
    Account,
    Campaign,
    CampaignMetrics,
    TimeSeriesDataPoint,
    TimeSeriesMetrics,
    DateRange,
    Alert,
    AuditResult,
    Recommendation,
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
                `${faker.word.adjective()}${faker.hacker.noun()} `,
                `${faker.company.buzzVerb()}${faker.company.buzzNoun()} `,
                `${faker.hacker.verb()} Platform`,
            ],
            local: [
                `${faker.person.lastName()} 's ${faker.commerce.department()}`,
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
     * Generate realistic campaign metrics with better variance
     */
    private generateCampaignMetrics(budget: number): CampaignMetrics {
        const cost = faker.number.float({ min: budget * 0.4, max: budget * 1.1, fractionDigits: 2 });

        // More realistic impression ranges based on campaign type
        const impressions = faker.number.int({ min: 15000, max: 800000 });

        // CTR between 1% and 8% (realistic range)
        const targetCTR = faker.number.float({ min: 0.01, max: 0.08, fractionDigits: 4 });
        const clicks = Math.round(impressions * targetCTR);

        // Conversion rate between 2% and 15% of clicks
        const targetCR = faker.number.float({ min: 0.02, max: 0.15, fractionDigits: 4 });
        const conversions = Math.max(1, Math.round(clicks * targetCR));

        // Conversion value based on realistic AOV (Average Order Value)
        const avgOrderValue = faker.number.float({ min: 30, max: 800, fractionDigits: 2 });
        const conversionValue = conversions * avgOrderValue;

        const ctr = (clicks / impressions) * 100;
        const cpc = clicks > 0 ? cost / clicks : 0;
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
            qualityScore: faker.number.int({ min: 4, max: 10 }),
        };
    }

    /**
     * Generate campaigns for an account with realistic names
     */
    generateCampaigns(accountId: string, count: number, complexity: DemoComplexity): Campaign[] {
        const campaignTypes = ['SEARCH', 'DISPLAY', 'VIDEO', 'SHOPPING', 'PERFORMANCE_MAX'] as const;

        const campaignNameTemplates = {
            SEARCH: ['Recherche - ', 'Search - ', 'Mots-clés - '],
            DISPLAY: ['Display - ', 'Bannières - ', 'GDN - '],
            VIDEO: ['Vidéo - ', 'YouTube - ', 'Video Ads - '],
            SHOPPING: ['Shopping - ', 'Produits - ', 'E-commerce - '],
            PERFORMANCE_MAX: ['Performance Max - ', 'PMax - ', 'Automatique - '],
        };

        return Array.from({ length: count }, (_, i) => {
            const budget = this.generateBudget(complexity);
            const type = faker.helpers.arrayElement(campaignTypes);
            const namePrefix = faker.helpers.arrayElement(campaignNameTemplates[type]);
            const nameSuffix = faker.helpers.arrayElement([
                'Général',
                'Marque',
                'Conversion',
                'Notoriété',
                'Remarketing',
                'Prospection',
                'Q4 2024',
                'Promo',
            ]);

            return {
                id: `demo-campaign-${accountId}-${i + 1}`,
                accountId,
                name: `${namePrefix}${nameSuffix}`,
                status: faker.helpers.arrayElement(['ENABLED', 'ENABLED', 'ENABLED', 'PAUSED'] as const),
                type,
                budget: {
                    amount: budget.daily,
                    type: 'DAILY',
                },
                metrics: this.generateCampaignMetrics(budget.daily * 30),
                settings: {
                    startDate: faker.date.past({ years: 1 }),
                    biddingStrategy: faker.helpers.arrayElement(['TARGET_CPA', 'MAXIMIZE_CONVERSIONS', 'TARGET_ROAS', 'MAXIMIZE_CLICKS']),
                    targetLocation: ['FR'],
                    targetLanguages: ['fr'],
                },
                createdAt: faker.date.past({ years: 1 }),
                updatedAt: faker.date.recent({ days: 7 }),
            };
        });
    }

    /**
     * Generate time series metrics for charts with realistic trends
     */
    generateTimeSeriesMetrics(dateRange: DateRange): TimeSeriesMetrics {
        const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));

        // Base values with some randomness
        const baseSpend = faker.number.float({ min: 200, max: 800, fractionDigits: 2 });
        const baseImpressions = faker.number.int({ min: 5000, max: 25000 });
        const baseClicks = faker.number.int({ min: 200, max: 1200 });
        const baseConversions = faker.number.int({ min: 10, max: 80 });

        // Growth/decline trends (between -0.5% and +1.5% per day)
        const spendTrend = faker.number.float({ min: -0.005, max: 0.015, fractionDigits: 4 });
        const impressionsTrend = faker.number.float({ min: -0.003, max: 0.02, fractionDigits: 4 });
        const clicksTrend = faker.number.float({ min: -0.005, max: 0.018, fractionDigits: 4 });
        const conversionsTrend = faker.number.float({ min: -0.008, max: 0.012, fractionDigits: 4 });

        const spend: TimeSeriesDataPoint[] = [];
        const impressions: TimeSeriesDataPoint[] = [];
        const clicks: TimeSeriesDataPoint[] = [];
        const conversions: TimeSeriesDataPoint[] = [];

        for (let i = 0; i <= days; i++) {
            const date = new Date(dateRange.start);
            date.setDate(date.getDate() + i);

            // Apply trend with daily variance
            const dayVariance = faker.number.float({ min: 0.85, max: 1.15, fractionDigits: 3 });
            const trendMultiplier = 1 + (spendTrend * i);

            // Weekend effect (lower on weekends)
            const dayOfWeek = date.getDay();
            const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;

            spend.push({
                date,
                value: parseFloat((baseSpend * trendMultiplier * dayVariance * weekendFactor).toFixed(2)),
            });

            impressions.push({
                date,
                value: Math.round(baseImpressions * (1 + impressionsTrend * i) * dayVariance * weekendFactor),
            });

            clicks.push({
                date,
                value: Math.round(baseClicks * (1 + clicksTrend * i) * dayVariance * weekendFactor),
            });

            conversions.push({
                date,
                value: Math.round(baseConversions * (1 + conversionsTrend * i) * dayVariance * weekendFactor),
            });
        }

        return {
            spend,
            impressions,
            clicks,
            conversions,
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
