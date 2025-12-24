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
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { EditableReport, WidgetConfig } from '../types/reportTypes';
import { defaultReportDesign } from '../types/reportTypes';

const REPORTS_COLLECTION = 'reports';
const WIDGETS_SUBCOLLECTION = 'widgets';

export interface ReportFilters {
    status?: 'draft' | 'published' | 'archived';
    accountId?: string;
    startDate?: Date;
    endDate?: Date;
}

/**
 * Create a new report
 */
export async function createReport(
    userId: string,
    accountId: string,
    title: string,
    campaignIds: string[] = [],
    dateRange?: { start: string; end: string; preset?: string }
): Promise<string> {
    try {
        const newReport = {
            userId,
            accountId,
            campaignIds,
            title,
            content: { type: 'doc', content: [] },
            sections: [],
            widgetIds: [], // References to widgets in sub-collection
            comments: [],
            design: defaultReportDesign,
            status: 'draft' as const,
            publishedAt: null,
            lastAutoSave: serverTimestamp(),
            shareUrl: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            version: 1,
            // Store date range if provided
            ...(dateRange && { dateRange }),
        };

        const docRef = await addDoc(collection(db, REPORTS_COLLECTION), newReport);
        return docRef.id;
    } catch (error) {
        console.error('Error creating report:', error);
        throw new Error('Failed to create report');
    }
}

/**
 * Get a report by ID with its widgets
 */
export async function getReportWithWidgets(
    reportId: string
): Promise<{ report: EditableReport; widgets: WidgetConfig[] } | null> {
    try {
        // Get report document
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        const reportSnap = await getDoc(reportRef);

        if (!reportSnap.exists()) {
            return null;
        }

        const reportData = reportSnap.data();

        // Get widgets from sub-collection
        const widgetsRef = collection(db, REPORTS_COLLECTION, reportId, WIDGETS_SUBCOLLECTION);
        const widgetsQuery = query(widgetsRef, orderBy('order', 'asc'));
        const widgetsSnap = await getDocs(widgetsQuery);

        const widgets: WidgetConfig[] = widgetsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as WidgetConfig));

        const report: EditableReport = {
            id: reportSnap.id,
            ...reportData,
            createdAt: reportData.createdAt?.toDate() || new Date(),
            updatedAt: reportData.updatedAt?.toDate() || new Date(),
            publishedAt: reportData.publishedAt?.toDate() || undefined,
            lastAutoSave: reportData.lastAutoSave?.toDate() || undefined,
            widgets,
        } as EditableReport;

        return { report, widgets };
    } catch (error) {
        console.error('Error getting report with widgets:', error);
        throw new Error('Failed to get report');
    }
}

/**
 * Get a report by ID (legacy - without widgets)
 */
export async function getReport(reportId: string): Promise<EditableReport | null> {
    const result = await getReportWithWidgets(reportId);
    return result?.report || null;
}

/**
 * Save report with widgets using batch write (atomic operation)
 */
export async function saveReportWithWidgets(
    reportId: string,
    updates: Partial<EditableReport>,
    widgets: WidgetConfig[]
): Promise<void> {
    try {
        const batch = writeBatch(db);

        // Update report document
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        const reportUpdates: any = {
            ...updates,
            widgetIds: widgets.map(w => w.id),
            updatedAt: serverTimestamp(),
            version: increment(1),
        };

        // Remove fields that shouldn't be in Firestore
        delete reportUpdates.id;
        delete reportUpdates.widgets;
        delete reportUpdates.createdAt;

        batch.update(reportRef, reportUpdates);

        // Update widgets in sub-collection
        widgets.forEach((widget, index) => {
            const widgetRef = doc(db, REPORTS_COLLECTION, reportId, WIDGETS_SUBCOLLECTION, widget.id);
            batch.set(widgetRef, {
                ...widget,
                order: index,
                updatedAt: serverTimestamp(),
            }, { merge: true });
        });

        // Commit all changes atomically
        await batch.commit();
    } catch (error) {
        console.error('Error saving report with widgets:', error);
        throw new Error('Failed to save report');
    }
}

/**
 * Update a report
 */
export async function updateReport(
    reportId: string,
    updates: Partial<EditableReport>
): Promise<void> {
    try {
        const docRef = doc(db, REPORTS_COLLECTION, reportId);

        // Convert Date objects to Timestamps for Firestore
        const firestoreUpdates: any = {
            ...updates,
            updatedAt: serverTimestamp(),
            version: increment(1),
        };

        // Remove id and widgets from updates if present
        delete firestoreUpdates.id;
        delete firestoreUpdates.widgets;

        await updateDoc(docRef, firestoreUpdates);
    } catch (error) {
        console.error('Error updating report:', error);
        throw new Error('Failed to update report');
    }
}

/**
 * Add a widget to a report
 */
export async function addWidget(
    reportId: string,
    widget: Omit<WidgetConfig, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    try {
        const widgetsRef = collection(db, REPORTS_COLLECTION, reportId, WIDGETS_SUBCOLLECTION);
        const widgetData = {
            ...widget,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(widgetsRef, widgetData);

        // Update report's widgetIds array
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        await updateDoc(reportRef, {
            widgetIds: increment(1) as any, // Just increment count
            updatedAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (error) {
        console.error('Error adding widget:', error);
        throw new Error('Failed to add widget');
    }
}

/**
 * Delete a widget from a report
 */
export async function deleteWidget(
    reportId: string,
    widgetId: string
): Promise<void> {
    try {
        const widgetRef = doc(db, REPORTS_COLLECTION, reportId, WIDGETS_SUBCOLLECTION, widgetId);
        await deleteDoc(widgetRef);

        // Update report's updatedAt
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        await updateDoc(reportRef, {
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error deleting widget:', error);
        throw new Error('Failed to delete widget');
    }
}

/**
 * Delete a report and all its widgets
 */
export async function deleteReport(reportId: string): Promise<void> {
    try {
        const batch = writeBatch(db);

        // Delete all widgets
        const widgetsRef = collection(db, REPORTS_COLLECTION, reportId, WIDGETS_SUBCOLLECTION);
        const widgetsSnap = await getDocs(widgetsRef);
        widgetsSnap.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Delete report
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        batch.delete(reportRef);

        await batch.commit();
    } catch (error) {
        console.error('Error deleting report:', error);
        throw new Error('Failed to delete report');
    }
}

/**
 * List user reports with optional filters
 */
export async function listUserReports(
    userId: string,
    filters?: ReportFilters
): Promise<EditableReport[]> {
    try {
        let q = query(
            collection(db, REPORTS_COLLECTION),
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc')
        );

        // Apply filters
        if (filters?.status) {
            q = query(q, where('status', '==', filters.status));
        }
        if (filters?.accountId) {
            q = query(q, where('accountId', '==', filters.accountId));
        }

        const querySnapshot = await getDocs(q);
        const reports: EditableReport[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            reports.push({
                id: doc.id,
                userId: data.userId,
                accountId: data.accountId,
                campaignIds: data.campaignIds || [],
                title: data.title,
                content: data.content,
                sections: data.sections || [],
                widgetIds: data.widgetIds || [],
                comments: data.comments || [],
                design: data.design || defaultReportDesign,
                status: data.status,
                publishedAt: data.publishedAt?.toDate() || undefined,
                lastAutoSave: data.lastAutoSave?.toDate() || undefined,
                shareUrl: data.shareUrl || undefined,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                version: data.version || 1,
                widgets: [], // Don't load widgets for list view (performance)
            } as EditableReport);
        });

        return reports;
    } catch (error) {
        console.error('Error listing reports:', error);
        throw new Error('Failed to list reports');
    }
}

/**
 * Publish a report
 */
export async function publishReport(reportId: string, username: string): Promise<string> {
    try {
        const shareUrl = `/${username}/reports/${reportId}`;

        await updateReport(reportId, {
            status: 'published',
            publishedAt: new Date(),
            shareUrl,
        });

        return shareUrl;
    } catch (error) {
        console.error('Error publishing report:', error);
        throw new Error('Failed to publish report');
    }
}

/**
 * Archive a report
 */
export async function archiveReport(reportId: string): Promise<void> {
    try {
        await updateReport(reportId, {
            status: 'archived',
        });
    } catch (error) {
        console.error('Error archiving report:', error);
        throw new Error('Failed to archive report');
    }
}

/**
 * Auto-save report content (optimistic)
 */
export async function autoSaveReport(
    reportId: string,
    content: any,
    sections?: any[],
    widgets?: WidgetConfig[]
): Promise<void> {
    try {
        const updates: any = {
            lastAutoSave: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        if (content !== undefined) {
            updates.content = content;
        }
        if (sections !== undefined) {
            updates.sections = sections;
        }

        // If widgets provided, use batch write
        if (widgets && widgets.length > 0) {
            await saveReportWithWidgets(reportId, updates, widgets);
        } else {
            const docRef = doc(db, REPORTS_COLLECTION, reportId);
            await updateDoc(docRef, updates);
        }
    } catch (error) {
        console.error('Error auto-saving report:', error);
        // Don't throw error for auto-save failures, just log
    }
}

/**
 * Duplicate a report with all its widgets
 */
export async function duplicateReport(
    reportId: string,
    userId: string
): Promise<string> {
    try {
        const result = await getReportWithWidgets(reportId);

        if (!result || result.report.userId !== userId) {
            throw new Error('Report not found or unauthorized');
        }

        const { report: originalReport, widgets: originalWidgets } = result;
        const newTitle = `${originalReport.title} (Copy)`;

        // Create new report
        const newReportId = await createReport(userId, originalReport.accountId, newTitle);

        // Copy widgets using batch
        const batch = writeBatch(db);

        originalWidgets.forEach((widget, index) => {
            const widgetRef = doc(collection(db, REPORTS_COLLECTION, newReportId, WIDGETS_SUBCOLLECTION));
            batch.set(widgetRef, {
                ...widget,
                order: index,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        });

        // Update report with metadata
        const reportRef = doc(db, REPORTS_COLLECTION, newReportId);
        batch.update(reportRef, {
            campaignIds: originalReport.campaignIds,
            content: originalReport.content,
            sections: originalReport.sections,
            design: originalReport.design,
            widgetIds: originalWidgets.map(w => w.id),
        });

        await batch.commit();

        return newReportId;
    } catch (error) {
        console.error('Error duplicating report:', error);
        throw new Error('Failed to duplicate report');
    }
}

/**
 * Get report count by status
 */
export async function getReportCountByStatus(
    userId: string
): Promise<{ draft: number; published: number; archived: number }> {
    try {
        const allReports = await listUserReports(userId);

        return {
            draft: allReports.filter(r => r.status === 'draft').length,
            published: allReports.filter(r => r.status === 'published').length,
            archived: allReports.filter(r => r.status === 'archived').length,
        };
    } catch (error) {
        console.error('Error getting report count:', error);
        return { draft: 0, published: 0, archived: 0 };
    }
}
