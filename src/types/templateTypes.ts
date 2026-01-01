import type { WidgetType } from './reportTypes';
import type { ReportDesign } from './reportTypes';

// Period presets for templates (relative dates)
export type PeriodPreset =
    | 'last_7_days'
    | 'last_30_days'
    | 'last_90_days'
    | 'this_month'
    | 'last_month'
    | 'this_quarter'
    | 'last_quarter'
    | 'this_year'
    | 'last_year';

export const PERIOD_PRESETS: Array<{ value: PeriodPreset; label: string; description: string }> = [
    { value: 'last_7_days', label: 'Derniers 7 jours', description: 'Les 7 derniers jours' },
    { value: 'last_30_days', label: 'Derniers 30 jours', description: 'Les 30 derniers jours' },
    { value: 'last_90_days', label: 'Derniers 90 jours', description: 'Les 90 derniers jours' },
    { value: 'this_month', label: 'Ce mois', description: 'Du 1er au dernier jour du mois en cours' },
    { value: 'last_month', label: 'Mois dernier', description: 'Du 1er au dernier jour du mois précédent' },
    { value: 'this_quarter', label: 'Ce trimestre', description: 'Du 1er jour du trimestre en cours à aujourd\'hui' },
    { value: 'last_quarter', label: 'Trimestre dernier', description: 'Le trimestre précédent complet' },
    { value: 'this_year', label: 'Cette année', description: 'Du 1er janvier à aujourd\'hui' },
    { value: 'last_year', label: 'Année dernière', description: 'L\'année précédente complète' },
];

// Widget configuration in a template
export interface TemplateWidgetConfig {
    type: WidgetType;
    order: number;
    settings?: {
        // Performance Overview
        metrics?: string[];
        showComparison?: boolean;

        // Campaign Chart
        chartType?: 'line' | 'bar' | 'area';

        // Text Block
        content?: string;

        // Custom settings
        [key: string]: any;
    };
}

// Report Template
export interface ReportTemplate {
    id: string;
    userId: string;
    name: string;
    description?: string;

    // Configuration - optional fields can be set when using the template
    accountId?: string; // Optional - can be set when using template
    campaignIds: string[]; // Can be empty - set when using template

    // Period preset (no fixed dates)
    periodPreset: PeriodPreset;

    // Widgets to include
    widgetConfigs: TemplateWidgetConfig[];

    // Design (optional)
    design?: Partial<ReportDesign>;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    usageCount: number;
    lastUsedAt?: Date;
}

/**
 * Calculate date range from a period preset
 */
export function getDateRangeFromPreset(preset: PeriodPreset): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (preset) {
        case 'last_7_days':
            start.setDate(end.getDate() - 7);
            break;

        case 'last_30_days':
            start.setDate(end.getDate() - 30);
            break;

        case 'last_90_days':
            start.setDate(end.getDate() - 90);
            break;

        case 'this_month':
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            break;

        case 'last_month':
            start.setMonth(end.getMonth() - 1);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setDate(0); // Last day of previous month
            end.setHours(23, 59, 59, 999);
            break;

        case 'this_quarter':
            const currentQuarter = Math.floor(end.getMonth() / 3);
            start.setMonth(currentQuarter * 3);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            break;

        case 'last_quarter':
            const lastQuarter = Math.floor(end.getMonth() / 3) - 1;
            const lastQuarterYear = lastQuarter < 0 ? end.getFullYear() - 1 : end.getFullYear();
            const lastQuarterMonth = lastQuarter < 0 ? 9 : lastQuarter * 3;

            start.setFullYear(lastQuarterYear);
            start.setMonth(lastQuarterMonth);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);

            end.setFullYear(lastQuarterYear);
            end.setMonth(lastQuarterMonth + 3);
            end.setDate(0); // Last day of quarter
            end.setHours(23, 59, 59, 999);
            break;

        case 'this_year':
            start.setMonth(0);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            break;

        case 'last_year':
            start.setFullYear(end.getFullYear() - 1);
            start.setMonth(0);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);

            end.setFullYear(end.getFullYear() - 1);
            end.setMonth(11);
            end.setDate(31);
            end.setHours(23, 59, 59, 999);
            break;

        default:
            start.setDate(end.getDate() - 30);
    }

    return { start, end };
}

/**
 * Format date range for display
 */
export function formatDateRange(preset: PeriodPreset): string {
    const { start, end } = getDateRangeFromPreset(preset);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };

    return `${start.toLocaleDateString('fr-FR', options)} - ${end.toLocaleDateString('fr-FR', options)}`;
}
