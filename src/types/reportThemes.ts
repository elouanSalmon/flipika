import type { ReportDesign } from './reportTypes';

/**
 * Report Theme - Custom design template that can be linked to clients
 */
export interface ReportTheme {
    id: string;
    userId: string;
    name: string;
    description?: string;

    // Design settings (extends existing ReportDesign)
    design: ReportDesign;

    // Optional: Pre-configured sections/modules
    defaultModules?: {
        executiveSummary: boolean;
        metrics: boolean;
        campaignAnalysis: boolean;
        recommendations: boolean;
    };

    // Linked Clients
    linkedClientIds: string[];

    // Metadata
    isDefault: boolean;
    thumbnail?: string; // Preview image URL
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Theme Preset - System-provided default themes
 */
export interface ThemePreset {
    id: string;
    name: string;
    description: string;
    design: ReportDesign;
    thumbnail?: string;
    isSystemDefault: boolean;
    defaultModules?: {
        executiveSummary: boolean;
        metrics: boolean;
        campaignAnalysis: boolean;
        recommendations: boolean;
    };
}

/**
 * Create Theme DTO - Data required to create a new theme
 */
export type CreateThemeDTO = Omit<ReportTheme, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Update Theme DTO - Partial data for updating a theme
 */
export type UpdateThemeDTO = Partial<Omit<ReportTheme, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
