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
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ReportTemplate, TemplateWidgetConfig, PeriodPreset } from '../types/templateTypes';
import { getDateRangeFromPreset as calculateDateRange } from '../types/templateTypes';
import { createReport, addWidget } from './reportService';

const TEMPLATES_COLLECTION = 'reportTemplates';

/**
 * Create a new report template
 */
export async function createTemplate(
    userId: string,
    config: {
        name: string;
        description?: string;
        accountId?: string;
        campaignIds?: string[];
        periodPreset: PeriodPreset;
        widgetConfigs: TemplateWidgetConfig[];
        design?: any;
    }
): Promise<string> {
    try {
        const newTemplate: any = {
            userId,
            name: config.name,
            description: config.description || '',
            accountId: config.accountId || null,
            campaignIds: config.campaignIds || [],
            periodPreset: config.periodPreset,
            widgetConfigs: config.widgetConfigs,
            design: config.design || null,
            usageCount: 0,
            lastUsedAt: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), newTemplate);
        return docRef.id;
    } catch (error) {
        console.error('Error creating template:', error);
        throw new Error('Failed to create template');
    }
}

/**
 * Get a template by ID
 */
export async function getTemplate(templateId: string): Promise<ReportTemplate | null> {
    try {
        const docRef = doc(db, TEMPLATES_COLLECTION, templateId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            userId: data.userId,
            name: data.name,
            description: data.description,
            accountId: data.accountId,
            campaignIds: data.campaignIds || [],
            periodPreset: data.periodPreset,
            widgetConfigs: data.widgetConfigs || [],
            design: data.design,
            usageCount: data.usageCount || 0,
            lastUsedAt: data.lastUsedAt?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ReportTemplate;
    } catch (error) {
        console.error('Error getting template:', error);
        throw new Error('Failed to get template');
    }
}

/**
 * List user templates
 */
export async function listUserTemplates(userId: string): Promise<ReportTemplate[]> {
    try {
        const q = query(
            collection(db, TEMPLATES_COLLECTION),
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc'),
            limit(100)
        );

        const querySnapshot = await getDocs(q);
        const templates: ReportTemplate[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            templates.push({
                id: doc.id,
                userId: data.userId,
                name: data.name,
                description: data.description,
                accountId: data.accountId,
                campaignIds: data.campaignIds || [],
                periodPreset: data.periodPreset,
                widgetConfigs: data.widgetConfigs || [],
                design: data.design,
                usageCount: data.usageCount || 0,
                lastUsedAt: data.lastUsedAt?.toDate(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as ReportTemplate);
        });

        return templates;
    } catch (error) {
        console.error('Error listing templates:', error);
        throw new Error('Failed to list templates');
    }
}

/**
 * Update a template
 */
export async function updateTemplate(
    templateId: string,
    updates: Partial<Omit<ReportTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
    try {
        const docRef = doc(db, TEMPLATES_COLLECTION, templateId);
        const firestoreUpdates: any = {
            ...updates,
            updatedAt: serverTimestamp(),
        };

        await updateDoc(docRef, firestoreUpdates);
    } catch (error) {
        console.error('Error updating template:', error);
        throw new Error('Failed to update template');
    }
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string): Promise<void> {
    try {
        const docRef = doc(db, TEMPLATES_COLLECTION, templateId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting template:', error);
        throw new Error('Failed to delete template');
    }
}

/**
 * Duplicate a template
 */
export async function duplicateTemplate(
    templateId: string,
    userId: string
): Promise<string> {
    try {
        const template = await getTemplate(templateId);

        if (!template || template.userId !== userId) {
            throw new Error('Template not found or unauthorized');
        }

        const newName = `${template.name} (Copie)`;

        return await createTemplate(userId, {
            name: newName,
            description: template.description,
            accountId: template.accountId,
            campaignIds: template.campaignIds,
            periodPreset: template.periodPreset,
            widgetConfigs: template.widgetConfigs,
            design: template.design,
        });
    } catch (error) {
        console.error('Error duplicating template:', error);
        throw new Error('Failed to duplicate template');
    }
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(templateId: string): Promise<void> {
    try {
        const docRef = doc(db, TEMPLATES_COLLECTION, templateId);
        await updateDoc(docRef, {
            usageCount: increment(1),
            lastUsedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error incrementing template usage:', error);
        // Don't throw - this is not critical
    }
}

/**
 * Create a report from a template
 */
export async function createReportFromTemplate(
    templateId: string,
    userId: string,
    overrides?: {
        title?: string;
        accountId?: string;
        campaignIds?: string[];
    }
): Promise<string> {
    try {
        const template = await getTemplate(templateId);

        if (!template) {
            throw new Error('Template not found');
        }

        // Calculate date range from period preset
        const { start, end } = calculateDateRange(template.periodPreset);

        // Use overrides or template values
        const accountId = overrides?.accountId || template.accountId;
        const campaignIds = overrides?.campaignIds || template.campaignIds;
        const title = overrides?.title || `${template.name} - ${new Date().toLocaleDateString('fr-FR')}`;

        if (!accountId) {
            throw new Error('Account ID is required');
        }

        // Create the report
        const reportId = await createReport(
            userId,
            accountId,
            title,
            campaignIds,
            {
                start: start.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0],
                preset: template.periodPreset,
            }
        );

        // Add widgets from template
        const batch = writeBatch(db);

        for (const widgetConfig of template.widgetConfigs) {
            await addWidget(reportId, {
                type: widgetConfig.type,
                accountId,
                campaignIds,
                order: widgetConfig.order,
                settings: widgetConfig.settings,
            });
        }

        // Update report with template reference and design
        const reportRef = doc(db, 'reports', reportId);
        const reportUpdates: any = {
            templateId,
            updatedAt: serverTimestamp(),
        };

        if (template.design) {
            reportUpdates.design = template.design;
        }

        batch.update(reportRef, reportUpdates);
        await batch.commit();

        // Increment template usage
        await incrementTemplateUsage(templateId);

        return reportId;
    } catch (error) {
        console.error('Error creating report from template:', error);
        throw new Error('Failed to create report from template');
    }
}

/**
 * Create a template from an existing report
 */
export async function createTemplateFromReport(
    _reportId: string,
    _userId: string,
    _templateName: string,
    _templateDescription?: string
): Promise<string> {
    try {
        // This will be implemented when we add "Save as Template" feature
        // For now, just throw an error
        throw new Error('Not implemented yet');
    } catch (error) {
        console.error('Error creating template from report:', error);
        throw new Error('Failed to create template from report');
    }
}
