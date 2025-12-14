// Demo mode specific types

export type DemoComplexity = 'simple' | 'medium' | 'advanced';
export type DemoIndustry = 'ecommerce' | 'services' | 'saas' | 'local' | 'b2b';

export interface DemoSettings {
    enabled: boolean;
    accountCount: number; // 1-10
    complexity: DemoComplexity;
    industry: DemoIndustry;
}

export interface DemoDataConfig {
    accountCount: number;
    complexity: DemoComplexity;
    industry: DemoIndustry;
    seed?: number; // For reproducible random data
}
