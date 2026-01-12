import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { Timestamp } from "firebase-admin/firestore";


/**
 * Cloud Function that runs every hour to generate scheduled reports
 * Checks for schedules that are due and generates reports from templates
 */
export const generateScheduledReports = onSchedule({
    schedule: "every 1 hours",
    timeZone: "UTC",
    memory: "1GiB",
}, async () => {
    await processScheduledReports();
});

/**
 * Process scheduled reports
 * Checks for schedules that are due and generates reports from templates
 */
export async function processScheduledReports() {
    console.log("Starting scheduled report generation...");

    try {
        const now = Timestamp.now();

        // Query for active schedules that are due
        const schedulesSnapshot = await admin.firestore()
            .collection("scheduledReports")
            .where("isActive", "==", true)
            .where("nextRun", "<=", now)
            .get();

        console.log(`Found ${schedulesSnapshot.size} schedules due for execution`);

        if (schedulesSnapshot.empty) {
            console.log("No schedules due for execution");
            return;
        }

        // Process each schedule
        const promises = schedulesSnapshot.docs.map(async (scheduleDoc) => {
            const scheduleData = scheduleDoc.data();
            const scheduleId = scheduleDoc.id;

            console.log(`Processing schedule ${scheduleId}: ${scheduleData.name}`);

            try {
                // Generate report from template
                const reportId = await generateReportFromSchedule(
                    scheduleId,
                    scheduleData.userId,
                    scheduleData.templateId,
                    scheduleData.accountId,
                    scheduleData.name
                );

                console.log(`✓ Successfully generated report ${reportId} from schedule ${scheduleId}`);

                // Update schedule statistics
                await updateScheduleAfterExecution(
                    scheduleId,
                    scheduleData,
                    true,
                    reportId
                );
            } catch (error: any) {
                console.error(`✗ Failed to generate report from schedule ${scheduleId}:`, error);

                // Update schedule with error status
                await updateScheduleAfterExecution(
                    scheduleId,
                    scheduleData,
                    false,
                    undefined,
                    error.message
                );
            }
        });

        await Promise.all(promises);
        console.log("Scheduled report generation completed");
    } catch (error: any) {
        console.error("Error in scheduled report generation:", error);
        throw error;
    }
}

/**
 * Generate a report from a schedule using the template service
 */
async function generateReportFromSchedule(
    scheduleId: string,
    userId: string,
    templateId: string,
    accountId: string,
    scheduleName: string
): Promise<string> {
    // Get the template to verify it exists
    const templateDoc = await admin.firestore()
        .collection("reportTemplates")
        .doc(templateId)
        .get();

    if (!templateDoc.exists) {
        throw new Error(`Template ${templateId} not found`);
    }

    const templateData = templateDoc.data()!;

    console.log(`Template ${templateId} has ${templateData.slideConfigs?.length || 0} slide configs`);

    // Get account name from cached accounts
    let accountName = accountId;
    try {
        const accountDoc = await admin.firestore()
            .collection('users')
            .doc(userId)
            .collection('google_ads_accounts')
            .doc(accountId)
            .get();

        if (accountDoc.exists) {
            accountName = accountDoc.data()?.name || accountId;
        } else {
            // Try from integrations/google_ads document
            const integrationsDoc = await admin.firestore()
                .collection('users')
                .doc(userId)
                .collection('integrations')
                .doc('google_ads')
                .get();

            if (integrationsDoc.exists) {
                const accounts = integrationsDoc.data()?.accounts || [];
                const account = accounts.find((a: any) => a.id === accountId);
                if (account) {
                    accountName = account.name;
                }
            }
        }
    } catch (error) {
        console.warn(`Could not fetch account name for ${accountId}:`, error);
    }

    // Get campaign names (we'll need to implement this if we want real names)
    // For now, we'll use empty array since we don't have campaign names in the template
    const campaignNames: string[] = [];

    // Generate a title for the report
    const now = new Date();
    const dateStr = now.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const reportTitle = `${scheduleName} - ${dateStr}`;

    // Create the report using the template service
    const reportId = await createReportFromTemplateInFunction(
        userId,
        templateId,
        templateData,
        accountId,
        reportTitle,
        accountName,
        campaignNames
    );

    return reportId;
}

/**
 * Create a report from a template (Cloud Function version)
 * This is a simplified version that works in the Cloud Functions context
 */
async function createReportFromTemplateInFunction(
    userId: string,
    templateId: string,
    templateData: any,
    accountId: string,
    title: string,
    accountName?: string,
    campaignNames?: string[]
): Promise<string> {
    const db = admin.firestore();

    // Calculate date range from period preset
    const dateRange = calculateDateRangeFromPreset(templateData.periodPreset);

    // Create the report document
    const reportData = {
        userId,
        title,
        accountId,
        accountName: accountName || null,
        campaignIds: templateData.campaignIds || [],
        campaignNames: campaignNames || [],
        status: "draft",
        sections: [],
        slideIds: [],
        design: templateData.design || {},
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        dateRangePreset: templateData.periodPreset,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const reportRef = await db.collection("reports").add(reportData);
    const reportId = reportRef.id;

    // Create widgets from template widget configs
    const batch = db.batch();
    const slideIds: string[] = [];

    for (const widgetConfig of templateData.slideConfigs || []) {
        const widgetRef = db
            .collection("reports")
            .doc(reportId)
            .collection("slides")
            .doc();

        const widgetData = {
            reportId,
            type: widgetConfig.type,
            order: widgetConfig.order,
            settings: widgetConfig.settings || {},
            accountId,
            campaignIds: templateData.campaignIds || [],
            startDate: dateRange.start.toISOString(),
            endDate: dateRange.end.toISOString(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        batch.set(widgetRef, widgetData);
        slideIds.push(widgetRef.id);
    }

    // Update report with widget IDs
    batch.update(reportRef, { slideIds });

    await batch.commit();

    // Update template usage statistics
    await db.collection("reportTemplates").doc(templateId).update({
        usageCount: admin.firestore.FieldValue.increment(1),
        lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return reportId;
}

/**
 * Calculate date range from period preset
 */
function calculateDateRangeFromPreset(preset: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (preset) {
        case "last_7_days":
            start.setDate(end.getDate() - 7);
            break;

        case "last_30_days":
            start.setDate(end.getDate() - 30);
            break;

        case "last_90_days":
            start.setDate(end.getDate() - 90);
            break;

        case "this_month":
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            break;

        case "last_month":
            start.setMonth(end.getMonth() - 1);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setDate(0); // Last day of previous month
            end.setHours(23, 59, 59, 999);
            break;

        case "this_quarter":
            const currentQuarter = Math.floor(end.getMonth() / 3);
            start.setMonth(currentQuarter * 3);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            break;

        case "last_quarter":
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

        case "this_year":
            start.setMonth(0);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            break;

        case "last_year":
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
 * Update schedule after execution
 */
async function updateScheduleAfterExecution(
    scheduleId: string,
    scheduleData: any,
    success: boolean,
    reportId?: string,
    error?: string
): Promise<void> {
    const nextRun = calculateNextRunTime(scheduleData.scheduleConfig);

    const updateData: any = {
        lastRun: admin.firestore.FieldValue.serverTimestamp(),
        lastRunStatus: success ? "success" : "error",
        nextRun: Timestamp.fromDate(nextRun),
        totalRuns: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (success) {
        updateData.successfulRuns = admin.firestore.FieldValue.increment(1);
        updateData.status = "active";
        if (reportId) {
            updateData.lastGeneratedReportId = reportId;
        }
    } else {
        updateData.failedRuns = admin.firestore.FieldValue.increment(1);
        updateData.status = "error";
        if (error) {
            updateData.lastRunError = error;
        }
    }

    await admin.firestore()
        .collection("scheduledReports")
        .doc(scheduleId)
        .update(updateData);
}

/**
 * Calculate next run time based on schedule configuration
 */
function calculateNextRunTime(config: any): Date {
    const next = new Date();

    switch (config.frequency) {
        case "daily":
            next.setHours(config.hour || 0, 0, 0, 0);
            next.setDate(next.getDate() + 1);
            break;

        case "weekly":
            const dayMap: Record<string, number> = {
                sunday: 0,
                monday: 1,
                tuesday: 2,
                wednesday: 3,
                thursday: 4,
                friday: 5,
                saturday: 6,
            };

            const targetDay = dayMap[config.dayOfWeek || "monday"];
            const currentDay = next.getDay();

            let daysUntilTarget = targetDay - currentDay;
            if (daysUntilTarget <= 0) {
                daysUntilTarget += 7;
            }

            next.setDate(next.getDate() + daysUntilTarget);
            next.setHours(config.hour || 0, 0, 0, 0);
            break;

        case "monthly":
            const targetDayOfMonth = Math.min(config.dayOfMonth || 1, 31);
            next.setMonth(next.getMonth() + 1);
            next.setDate(targetDayOfMonth);
            next.setHours(config.hour || 0, 0, 0, 0);

            // Handle months with fewer days
            while (next.getDate() !== targetDayOfMonth && next.getDate() < targetDayOfMonth) {
                next.setDate(0);
            }
            break;

        case "custom":
            // For custom cron, default to 1 day from now
            next.setDate(next.getDate() + 1);
            break;

        default:
            next.setDate(next.getDate() + 1);
    }

    return next;
}
