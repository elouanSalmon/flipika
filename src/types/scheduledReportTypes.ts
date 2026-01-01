// Schedule frequency types
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

// Day of week for weekly schedules
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Schedule configuration based on frequency type
export interface ScheduleConfig {
    frequency: ScheduleFrequency;

    // For daily: hour (0-23)
    hour?: number;

    // For weekly: day of week + hour
    dayOfWeek?: DayOfWeek;

    // For monthly: day of month (1-31) + hour
    dayOfMonth?: number;

    // For custom: cron expression
    cronExpression?: string;

    // Timezone for execution (default: user's timezone)
    timezone?: string;
}

// Scheduled report status
export type ScheduleStatus = 'active' | 'paused' | 'error';

// Scheduled report interface
export interface ScheduledReport {
    id: string;
    userId: string;
    name: string;
    description?: string;

    // Template and account configuration
    templateId: string;
    accountId: string;

    // Schedule configuration
    scheduleConfig: ScheduleConfig;

    // Status and execution tracking
    status: ScheduleStatus;
    isActive: boolean;

    // Execution times
    nextRun: Date;
    lastRun?: Date;
    lastRunStatus?: 'success' | 'error';
    lastRunError?: string;
    lastGeneratedReportId?: string;

    // Statistics
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

// Helper function to calculate next run time based on schedule config
export function calculateNextRun(config: ScheduleConfig, fromDate: Date = new Date()): Date {
    const next = new Date(fromDate);

    switch (config.frequency) {
        case 'daily':
            // Set to next occurrence of the specified hour
            next.setHours(config.hour || 0, 0, 0, 0);

            // If the time has passed today, move to tomorrow
            if (next <= fromDate) {
                next.setDate(next.getDate() + 1);
            }
            break;

        case 'weekly':
            // Map day of week to number (0 = Sunday, 1 = Monday, etc.)
            const dayMap: Record<DayOfWeek, number> = {
                sunday: 0,
                monday: 1,
                tuesday: 2,
                wednesday: 3,
                thursday: 4,
                friday: 5,
                saturday: 6
            };

            const targetDay = dayMap[config.dayOfWeek || 'monday'];
            const currentDay = next.getDay();

            // Calculate days until target day
            let daysUntilTarget = targetDay - currentDay;
            if (daysUntilTarget < 0) {
                daysUntilTarget += 7;
            }

            next.setDate(next.getDate() + daysUntilTarget);
            next.setHours(config.hour || 0, 0, 0, 0);

            // If we're on the target day but the time has passed, move to next week
            if (daysUntilTarget === 0 && next <= fromDate) {
                next.setDate(next.getDate() + 7);
            }
            break;

        case 'monthly':
            // Set to the specified day of month
            const targetDayOfMonth = Math.min(config.dayOfMonth || 1, 31);
            next.setDate(targetDayOfMonth);
            next.setHours(config.hour || 0, 0, 0, 0);

            // If the date has passed this month, move to next month
            if (next <= fromDate) {
                next.setMonth(next.getMonth() + 1);
                next.setDate(targetDayOfMonth);
            }

            // Handle months with fewer days (e.g., Feb 31 -> Feb 28/29)
            while (next.getDate() !== targetDayOfMonth) {
                next.setDate(0); // Go to last day of previous month
            }
            break;

        case 'custom':
            // For custom cron expressions, we'll handle this in the Cloud Function
            // For now, default to 1 hour from now
            next.setHours(next.getHours() + 1, 0, 0, 0);
            break;
    }

    return next;
}

// Format schedule config for display
export function formatScheduleConfig(config: ScheduleConfig): string {
    switch (config.frequency) {
        case 'daily':
            return `Tous les jours à ${config.hour || 0}h00`;

        case 'weekly':
            const dayNames: Record<DayOfWeek, string> = {
                monday: 'lundi',
                tuesday: 'mardi',
                wednesday: 'mercredi',
                thursday: 'jeudi',
                friday: 'vendredi',
                saturday: 'samedi',
                sunday: 'dimanche'
            };
            return `Chaque ${dayNames[config.dayOfWeek || 'monday']} à ${config.hour || 0}h00`;

        case 'monthly':
            return `Le ${config.dayOfMonth || 1} de chaque mois à ${config.hour || 0}h00`;

        case 'custom':
            return `Expression cron : ${config.cronExpression || 'Non définie'}`;

        default:
            return 'Configuration inconnue';
    }
}

// Validate schedule configuration
export function validateScheduleConfig(config: ScheduleConfig): { valid: boolean; error?: string } {
    if (!config.frequency) {
        return { valid: false, error: 'La fréquence est requise' };
    }

    switch (config.frequency) {
        case 'daily':
            if (config.hour === undefined || config.hour < 0 || config.hour > 23) {
                return { valid: false, error: 'L\'heure doit être entre 0 et 23' };
            }
            break;

        case 'weekly':
            if (!config.dayOfWeek) {
                return { valid: false, error: 'Le jour de la semaine est requis' };
            }
            if (config.hour === undefined || config.hour < 0 || config.hour > 23) {
                return { valid: false, error: 'L\'heure doit être entre 0 et 23' };
            }
            break;

        case 'monthly':
            if (!config.dayOfMonth || config.dayOfMonth < 1 || config.dayOfMonth > 31) {
                return { valid: false, error: 'Le jour du mois doit être entre 1 et 31' };
            }
            if (config.hour === undefined || config.hour < 0 || config.hour > 23) {
                return { valid: false, error: 'L\'heure doit être entre 0 et 23' };
            }
            break;

        case 'custom':
            if (!config.cronExpression) {
                return { valid: false, error: 'L\'expression cron est requise' };
            }
            // Basic cron validation (5 or 6 fields)
            const parts = config.cronExpression.trim().split(/\s+/);
            if (parts.length < 5 || parts.length > 6) {
                return { valid: false, error: 'Expression cron invalide (5 ou 6 champs requis)' };
            }
            break;
    }

    return { valid: true };
}

// Calculate time until next run
export function getTimeUntilNextRun(nextRun: Date): string {
    const now = new Date();
    const diff = nextRun.getTime() - now.getTime();

    if (diff < 0) {
        return 'En retard';
    }

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `Dans ${days} jour${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `Dans ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
        return `Dans ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
        return 'Imminent';
    }
}
