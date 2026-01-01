import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    increment,
    limit,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ScheduledReport, ScheduleConfig, ScheduleStatus } from '../types/scheduledReportTypes';
import { calculateNextRun, validateScheduleConfig } from '../types/scheduledReportTypes';

const SCHEDULED_REPORTS_COLLECTION = 'scheduledReports';
const MAX_SCHEDULES_PER_USER = 10;

/**
 * Create a new scheduled report
 */
export async function createScheduledReport(
    userId: string,
    config: {
        name: string;
        description?: string;
        templateId: string;
        accountId: string;
        scheduleConfig: ScheduleConfig;
    }
): Promise<string> {
    // Validate schedule configuration
    const validation = validateScheduleConfig(config.scheduleConfig);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Check if user has reached the maximum number of schedules
    const userSchedules = await listUserScheduledReports(userId);
    if (userSchedules.length >= MAX_SCHEDULES_PER_USER) {
        throw new Error(`Vous avez atteint le maximum de ${MAX_SCHEDULES_PER_USER} rapports programmés`);
    }

    // Calculate next run time
    const nextRun = calculateNextRun(config.scheduleConfig);

    const scheduleData = {
        userId,
        name: config.name,
        description: config.description || '',
        templateId: config.templateId,
        accountId: config.accountId,
        scheduleConfig: config.scheduleConfig,
        status: 'active' as ScheduleStatus,
        isActive: true,
        nextRun: Timestamp.fromDate(nextRun),
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, SCHEDULED_REPORTS_COLLECTION), scheduleData);
    return docRef.id;
}

/**
 * Get a scheduled report by ID
 */
export async function getScheduledReport(scheduleId: string): Promise<ScheduledReport | null> {
    const docRef = doc(db, SCHEDULED_REPORTS_COLLECTION, scheduleId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        nextRun: data.nextRun?.toDate(),
        lastRun: data.lastRun?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
    } as ScheduledReport;
}

/**
 * List all scheduled reports for a user
 */
export async function listUserScheduledReports(userId: string): Promise<ScheduledReport[]> {
    const q = query(
        collection(db, SCHEDULED_REPORTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(100)
    );

    const querySnapshot = await getDocs(q);
    const schedules: ScheduledReport[] = [];

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        schedules.push({
            id: doc.id,
            ...data,
            nextRun: data.nextRun?.toDate(),
            lastRun: data.lastRun?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
        } as ScheduledReport);
    });

    return schedules;
}

/**
 * Update a scheduled report
 */
export async function updateScheduledReport(
    scheduleId: string,
    updates: Partial<Omit<ScheduledReport, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
    // If schedule config is being updated, validate it
    if (updates.scheduleConfig) {
        const validation = validateScheduleConfig(updates.scheduleConfig);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Recalculate next run time
        updates.nextRun = calculateNextRun(updates.scheduleConfig);
    }

    const docRef = doc(db, SCHEDULED_REPORTS_COLLECTION, scheduleId);

    const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp()
    };

    // Convert Date objects to Timestamps
    if (updates.nextRun) {
        updateData.nextRun = Timestamp.fromDate(updates.nextRun);
    }
    if (updates.lastRun) {
        updateData.lastRun = Timestamp.fromDate(updates.lastRun);
    }

    await updateDoc(docRef, updateData);
}

/**
 * Delete a scheduled report
 */
export async function deleteScheduledReport(scheduleId: string): Promise<void> {
    const docRef = doc(db, SCHEDULED_REPORTS_COLLECTION, scheduleId);
    await deleteDoc(docRef);
}

/**
 * Toggle schedule active status
 */
export async function toggleScheduleStatus(scheduleId: string, isActive: boolean): Promise<void> {
    const docRef = doc(db, SCHEDULED_REPORTS_COLLECTION, scheduleId);

    const updateData: any = {
        isActive,
        status: isActive ? 'active' : 'paused',
        updatedAt: serverTimestamp()
    };

    // If reactivating, recalculate next run
    if (isActive) {
        const schedule = await getScheduledReport(scheduleId);
        if (schedule) {
            const nextRun = calculateNextRun(schedule.scheduleConfig);
            updateData.nextRun = Timestamp.fromDate(nextRun);
        }
    }

    await updateDoc(docRef, updateData);
}

/**
 * Update schedule execution statistics
 */
export async function updateScheduleStats(
    scheduleId: string,
    success: boolean,
    error?: string,
    generatedReportId?: string
): Promise<void> {
    const schedule = await getScheduledReport(scheduleId);
    if (!schedule) {
        throw new Error('Schedule not found');
    }

    const nextRun = calculateNextRun(schedule.scheduleConfig);

    const updateData: any = {
        lastRun: serverTimestamp(),
        lastRunStatus: success ? 'success' : 'error',
        nextRun: Timestamp.fromDate(nextRun),
        totalRuns: increment(1),
        updatedAt: serverTimestamp()
    };

    if (success) {
        updateData.successfulRuns = increment(1);
        updateData.status = 'active';
        if (generatedReportId) {
            updateData.lastGeneratedReportId = generatedReportId;
        }
    } else {
        updateData.failedRuns = increment(1);
        updateData.status = 'error';
        if (error) {
            updateData.lastRunError = error;
        }
    }

    const docRef = doc(db, SCHEDULED_REPORTS_COLLECTION, scheduleId);
    await updateDoc(docRef, updateData);
}

/**
 * Get schedules that are due for execution
 */
export async function getDueSchedules(): Promise<ScheduledReport[]> {
    const now = Timestamp.now();

    const q = query(
        collection(db, SCHEDULED_REPORTS_COLLECTION),
        where('isActive', '==', true),
        where('nextRun', '<=', now)
    );

    const querySnapshot = await getDocs(q);
    const schedules: ScheduledReport[] = [];

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        schedules.push({
            id: doc.id,
            ...data,
            nextRun: data.nextRun?.toDate(),
            lastRun: data.lastRun?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
        } as ScheduledReport);
    });

    return schedules;
}
