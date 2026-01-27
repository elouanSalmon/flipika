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
    writeBatch,
    arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { EditableReport, SlideConfig } from '../types/reportTypes';
import { defaultReportDesign } from '../types/reportTypes';
import { hashPassword } from '../utils/passwordUtils';

const REPORTS_COLLECTION = 'reports';
const WIDGETS_SUBCOLLECTION = 'slides';

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
    dateRange?: { start: string; end: string; preset?: string },
    accountName?: string,
    campaignNames?: string[],
    clientId?: string // New Parameter
): Promise<string> {
    try {
        const newReport: any = {
            userId,
            clientId: clientId || null, // Store it
            accountId,
            accountName: accountName || null,
            campaignIds,
            campaignNames: campaignNames || [],
            title,
            content: { type: 'doc', content: [] },
            sections: [],
            slideIds: [], // References to slides in sub-collection
            comments: [],
            design: defaultReportDesign,
            status: 'draft' as const,
            publishedAt: null,
            lastAutoSave: serverTimestamp(),
            shareUrl: null,
            isPasswordProtected: false,
            passwordHash: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            version: 1,
        };

        // Store date range if provided
        if (dateRange) {
            newReport.startDate = new Date(dateRange.start);
            newReport.endDate = new Date(dateRange.end);
            newReport.dateRangePreset = dateRange.preset;
        }

        const docRef = await addDoc(collection(db, REPORTS_COLLECTION), newReport);
        return docRef.id;
    } catch (error) {
        console.error('Error creating report:', error);
        throw new Error('Failed to create report');
    }
}

/**
 * Get a report by ID with its slides
 */
export async function getReportWithSlides(
    reportId: string
): Promise<{ report: EditableReport; slides: SlideConfig[] } | null> {
    try {
        // Get report document
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        const reportSnap = await getDoc(reportRef);

        if (!reportSnap.exists()) {
            return null;
        }

        const reportData = reportSnap.data();

        // Get slides from sub-collection
        const slidesRef = collection(db, REPORTS_COLLECTION, reportId, WIDGETS_SUBCOLLECTION);
        const slidesQuery = query(slidesRef, orderBy('order', 'asc'));
        const slidesSnap = await getDocs(slidesQuery);

        const slides: SlideConfig[] = slidesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as SlideConfig));

        const report: EditableReport = {
            id: reportSnap.id,
            ...reportData,
            createdAt: reportData.createdAt?.toDate() || new Date(),
            updatedAt: reportData.updatedAt?.toDate() || new Date(),
            publishedAt: reportData.publishedAt?.toDate() || undefined,
            lastAutoSave: reportData.lastAutoSave?.toDate() || undefined,
            startDate: reportData.startDate?.toDate ? reportData.startDate.toDate() : (reportData.startDate ? new Date(reportData.startDate) : undefined),
            endDate: reportData.endDate?.toDate ? reportData.endDate.toDate() : (reportData.endDate ? new Date(reportData.endDate) : undefined),
            slides,
        } as EditableReport;

        return { report, slides };
    } catch (error) {
        console.error('Error getting report with slides:', error);
        throw new Error('Failed to get report');
    }
}

/**
 * Get a report by ID (legacy - without slides)
 */
export async function getReport(reportId: string): Promise<EditableReport | null> {
    const result = await getReportWithSlides(reportId);
    return result?.report || null;
}

/**
 * Save report with slides using batch write (atomic operation)
 */
export async function saveReportWithSlides(
    reportId: string,
    updates: Partial<EditableReport>,
    slides: SlideConfig[]
): Promise<void> {
    try {
        const batch = writeBatch(db);

        // Update report document
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        const reportUpdates: any = {
            ...updates,
            slideIds: slides.map(w => w.id),
            updatedAt: serverTimestamp(),
            version: increment(1),
        };

        // Remove fields that shouldn't be in Firestore
        delete reportUpdates.id;
        delete reportUpdates.slides;
        delete reportUpdates.createdAt;

        batch.update(reportRef, reportUpdates);

        // Get existing slides to identify which ones need to be deleted
        const slidesRef = collection(db, REPORTS_COLLECTION, reportId, WIDGETS_SUBCOLLECTION);
        const existingSlidesSnap = await getDocs(slidesRef);
        const existingSlideIds = new Set(existingSlidesSnap.docs.map(doc => doc.id));
        const currentSlideIds = new Set(slides.map(w => w.id));

        // Delete slides that are no longer in the current slides array
        existingSlideIds.forEach(existingId => {
            if (!currentSlideIds.has(existingId)) {
                const widgetRef = doc(db, REPORTS_COLLECTION, reportId, WIDGETS_SUBCOLLECTION, existingId);
                batch.delete(widgetRef);
            }
        });

        // Update or create slides in sub-collection
        slides.forEach((widget, index) => {
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
        console.error('Error saving report with slides:', error);
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

        // Remove id and slides from updates if present
        delete firestoreUpdates.id;
        delete firestoreUpdates.slides;

        // Deep sanitize to remove undefined values (Firestore doesn't accept undefined)
        const deepSanitize = (obj: any): any => {
            if (obj === null || obj === undefined) return null;
            if (Array.isArray(obj)) {
                return obj.map(item => deepSanitize(item));
            }
            if (typeof obj === 'object' && !(obj instanceof Date) && !('_methodName' in obj)) {
                // Skip Firestore FieldValue objects (like serverTimestamp, increment)
                const sanitized: any = {};
                for (const [key, value] of Object.entries(obj)) {
                    if (value !== undefined) {
                        sanitized[key] = deepSanitize(value);
                    }
                }
                return sanitized;
            }
            return obj;
        };

        const sanitizedUpdates = deepSanitize(firestoreUpdates);

        await updateDoc(docRef, sanitizedUpdates);
    } catch (error) {
        console.error('Error updating report:', error);
        throw new Error('Failed to update report');
    }
}

/**
 * Add a widget to a report
 */
export async function addSlide(
    reportId: string,
    widget: Omit<SlideConfig, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
    try {
        const slidesRef = collection(db, REPORTS_COLLECTION, reportId, WIDGETS_SUBCOLLECTION);
        const widgetData = {
            ...widget,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(slidesRef, widgetData);

        // Update report's slideIds array
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        await updateDoc(reportRef, {
            slideIds: arrayUnion(docRef.id),
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
export async function deleteSlide(
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
 * Delete a report and all its slides
 */
export async function deleteReport(reportId: string): Promise<void> {
    try {
        const batch = writeBatch(db);

        // Delete all slides
        const slidesRef = collection(db, REPORTS_COLLECTION, reportId, WIDGETS_SUBCOLLECTION);
        const slidesSnap = await getDocs(slidesRef);
        slidesSnap.docs.forEach(doc => {
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
                accountName: data.accountName,
                campaignIds: data.campaignIds || [],
                campaignNames: data.campaignNames || [],
                title: data.title,
                content: data.content,
                sections: data.sections || [],
                slideIds: data.slideIds || [],
                comments: data.comments || [],
                design: data.design || defaultReportDesign,
                status: data.status,
                publishedAt: data.publishedAt?.toDate() || undefined,
                lastAutoSave: data.lastAutoSave?.toDate() || undefined,
                shareUrl: data.shareUrl || undefined,
                isPasswordProtected: data.isPasswordProtected || false,
                passwordHash: data.passwordHash || undefined,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                version: data.version || 1,
                slides: [], // Don't load slides for list view (performance)
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
export async function publishReport(
    reportId: string,
    username: string,
    password?: string
): Promise<string> {
    try {
        const shareUrl = `/${username}/reports/${reportId}`;
        const updates: any = {
            status: 'published',
            publishedAt: new Date(),
            shareUrl,
        };

        // Add password protection if provided
        if (password) {
            updates.passwordHash = await hashPassword(password);
            updates.isPasswordProtected = true;
        }

        await updateReport(reportId, updates);

        return shareUrl;
    } catch (error) {
        console.error('Error publishing report:', error);
        throw new Error('Failed to publish report');
    }
}

/**
 * Get a public report (no authentication required)
 * Only returns reports with status 'published'
 */
export async function getPublicReport(
    reportId: string
): Promise<{ report: EditableReport; slides: SlideConfig[] } | null> {
    try {
        // Get report document
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        const reportSnap = await getDoc(reportRef);

        if (!reportSnap.exists()) {
            return null;
        }

        const reportData = reportSnap.data();

        // Only return published reports
        if (reportData.status !== 'published') {
            return null;
        }

        // Get slides from sub-collection
        const slidesRef = collection(db, REPORTS_COLLECTION, reportId, WIDGETS_SUBCOLLECTION);
        const slidesQuery = query(slidesRef, orderBy('order', 'asc'));
        const slidesSnap = await getDocs(slidesQuery);

        const slides: SlideConfig[] = slidesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        } as SlideConfig));

        const report: EditableReport = {
            id: reportSnap.id,
            ...reportData,
            createdAt: reportData.createdAt?.toDate() || new Date(),
            updatedAt: reportData.updatedAt?.toDate() || new Date(),
            publishedAt: reportData.publishedAt?.toDate() || undefined,
            lastAutoSave: reportData.lastAutoSave?.toDate() || undefined,
            startDate: reportData.startDate?.toDate ? reportData.startDate.toDate() : (reportData.startDate ? new Date(reportData.startDate) : undefined),
            endDate: reportData.endDate?.toDate ? reportData.endDate.toDate() : (reportData.endDate ? new Date(reportData.endDate) : undefined),
            slides,
        } as EditableReport;

        return { report, slides };
    } catch (error) {
        console.error('Error getting public report:', error);
        return null;
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
    slides?: SlideConfig[]
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

        // If slides provided, use batch write
        if (slides && slides.length > 0) {
            await saveReportWithSlides(reportId, updates, slides);
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
 * Duplicate a report with all its slides
 */
export async function duplicateReport(
    reportId: string,
    userId: string
): Promise<string> {
    try {
        const result = await getReportWithSlides(reportId);

        if (!result || result.report.userId !== userId) {
            throw new Error('Report not found or unauthorized');
        }

        const { report: originalReport, slides: originalWidgets } = result;
        const newTitle = `${originalReport.title} (Copy)`;

        // Create new report
        const newReportId = await createReport(userId, originalReport.accountId, newTitle);

        // Copy slides using batch
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
            slideIds: originalWidgets.map(w => w.id),
        });

        await batch.commit();

        return newReportId;
    } catch (error) {
        console.error('Error duplicating report:', error);
        throw new Error('Failed to duplicate report');
    }
}

/**
 * Update report settings (accountId, campaignIds, date range)
 * Also updates all associated slides with the new parameters
 */
export async function updateReportSettings(
    reportId: string,
    settings: {
        clientId?: string;
        accountId?: string;
        campaignIds?: string[];
        startDate?: Date;
        endDate?: Date;
        dateRangePreset?: string;
        accountName?: string;
        campaignNames?: string[];
    }
): Promise<void> {
    try {
        const batch = writeBatch(db);

        // Update report document
        const reportRef = doc(db, REPORTS_COLLECTION, reportId);
        const reportUpdates: any = {
            updatedAt: serverTimestamp(),
            version: increment(1),
        };

        if (settings.clientId !== undefined) {
            reportUpdates.clientId = settings.clientId;
        }
        if (settings.accountId !== undefined) {
            reportUpdates.accountId = settings.accountId;
        }
        if (settings.campaignIds !== undefined) {
            reportUpdates.campaignIds = settings.campaignIds;
        }
        if (settings.accountName !== undefined) {
            reportUpdates.accountName = settings.accountName;
        }
        if (settings.campaignNames !== undefined) {
            reportUpdates.campaignNames = settings.campaignNames;
        }
        if (settings.startDate !== undefined) {
            reportUpdates.startDate = settings.startDate;
        }
        if (settings.endDate !== undefined) {
            reportUpdates.endDate = settings.endDate;
        }
        if (settings.dateRangePreset !== undefined) {
            reportUpdates.dateRangePreset = settings.dateRangePreset;
        }

        batch.update(reportRef, reportUpdates);

        // Update all slides with new accountId and campaignIds
        if (settings.accountId !== undefined || settings.campaignIds !== undefined) {
            const slidesRef = collection(db, REPORTS_COLLECTION, reportId, WIDGETS_SUBCOLLECTION);
            const slidesSnap = await getDocs(slidesRef);

            slidesSnap.docs.forEach(widgetDoc => {
                const widgetRef = doc(db, REPORTS_COLLECTION, reportId, WIDGETS_SUBCOLLECTION, widgetDoc.id);
                const widgetUpdates: any = {
                    updatedAt: serverTimestamp(),
                };

                if (settings.accountId !== undefined) {
                    widgetUpdates.accountId = settings.accountId;
                }
                if (settings.campaignIds !== undefined) {
                    widgetUpdates.campaignIds = settings.campaignIds;
                }

                batch.update(widgetRef, widgetUpdates);
            });
        }

        // Commit all changes atomically
        await batch.commit();
    } catch (error) {
        console.error('Error updating report settings:', error);
        throw new Error('Failed to update report settings');
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

/**
 * Update report password
 * Pass null to remove password protection
 */
export async function updateReportPassword(
    reportId: string,
    password: string | null
): Promise<void> {
    try {
        const updates: any = {
            updatedAt: serverTimestamp(),
        };

        if (password) {
            // Set or update password
            updates.passwordHash = await hashPassword(password);
            updates.isPasswordProtected = true;
        } else {
            // Remove password protection
            updates.passwordHash = null;
            updates.isPasswordProtected = false;
        }

        await updateReport(reportId, updates);
    } catch (error) {
        console.error('Error updating report password:', error);
        throw new Error('Failed to update report password');
    }
}

/**
 * Verify report password
 * Returns true if password is correct
 */
export async function verifyReportPassword(
    reportId: string,
    password: string
): Promise<boolean> {
    try {
        const report = await getReport(reportId);

        if (!report || !report.isPasswordProtected || !report.passwordHash) {
            return false;
        }

        const passwordHash = await hashPassword(password);
        return passwordHash === report.passwordHash;
    } catch (error) {
        console.error('Error verifying report password:', error);
        return false;
    }
}
