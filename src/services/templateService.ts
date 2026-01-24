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
import type { ReportTemplate, TemplateSlideConfig, PeriodPreset, TiptapJSONContent } from '../types/templateTypes';
import { getDateRangeFromPreset as calculateDateRange } from '../types/templateTypes';
import { createReport, addSlide } from './reportService';

const TEMPLATES_COLLECTION = 'reportTemplates';

/**
 * Helper to recursively remove undefined values
 * Keeps nulls (to clear fields) but removes undefineds (invalid in Firestore)
 */
function removeUndefined(obj: any): any {
    if (obj === undefined) return undefined;
    if (obj === null) return null;
    if (typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj;

    // Handle Arrays
    if (Array.isArray(obj)) {
        return obj.map(v => removeUndefined(v)).filter(v => v !== undefined);
    }

    // Handle Objects
    const newObj: any = {};
    Object.keys(obj).forEach(key => {
        const val = removeUndefined(obj[key]);
        if (val !== undefined) {
            newObj[key] = val;
        }
    });
    return newObj;
}

/**
 * Create a new report template
 */
export async function createTemplate(
    userId: string,
    config: {
        name: string;
        description?: string;
        clientId?: string;
        clientName?: string;
        accountId?: string;
        accountName?: string;
        campaignIds?: string[];
        campaignNames?: string[];
        periodPreset: PeriodPreset;
        slideConfigs?: TemplateSlideConfig[];
        content?: TiptapJSONContent;
        design?: any;
    }
): Promise<string> {
    try {
        const newTemplate: any = {
            userId,
            name: config.name,
            description: config.description || '',
            clientId: config.clientId || null,
            clientName: config.clientName || null,
            accountId: config.accountId || null,
            accountName: config.accountName || null,
            campaignIds: config.campaignIds || [],
            campaignNames: config.campaignNames || [],
            periodPreset: config.periodPreset,
            slideConfigs: config.slideConfigs || [],
            content: config.content || null,
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
            clientId: data.clientId,
            clientName: data.clientName,
            accountId: data.accountId,
            accountName: data.accountName,
            campaignIds: data.campaignIds || [],
            campaignNames: data.campaignNames || [],
            periodPreset: data.periodPreset,
            slideConfigs: data.slideConfigs || [],
            content: data.content || null,
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
                clientId: data.clientId,
                clientName: data.clientName,
                accountId: data.accountId,
                accountName: data.accountName,
                campaignIds: data.campaignIds || [],
                campaignNames: data.campaignNames || [],
                periodPreset: data.periodPreset,
                slideConfigs: data.slideConfigs || [],
                content: data.content || null,
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

        // Deeply clean payload
        const cleanUpdates = removeUndefined(updates);

        const firestoreUpdates: any = {
            ...cleanUpdates,
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
            clientId: template.clientId,
            clientName: template.clientName,
            accountId: template.accountId,
            accountName: template.accountName,
            campaignIds: template.campaignIds,
            campaignNames: template.campaignNames,
            periodPreset: template.periodPreset,
            slideConfigs: template.slideConfigs,
            content: template.content,
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
 * Supports both legacy templates (slideConfigs) and new Tiptap templates (content)
 */
export async function createReportFromTemplate(
    templateId: string,
    userId: string,
    overrides?: {
        title?: string;
        clientId?: string;
        clientName?: string;
        accountId?: string;
        accountName?: string;
        campaignIds?: string[];
        campaignNames?: string[];
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
        const clientId = overrides?.clientId || template.clientId;
        const accountId = overrides?.accountId || template.accountId;
        const accountName = overrides?.accountName || template.accountName;
        const campaignIds = overrides?.campaignIds || template.campaignIds;
        const campaignNames = overrides?.campaignNames || template.campaignNames;
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
            },
            accountName,
            campaignNames,
            clientId
        );

        const batch = writeBatch(db);
        const reportRef = doc(db, 'reports', reportId);
        const reportUpdates: any = {
            templateId,
            updatedAt: serverTimestamp(),
        };

        // Check if template uses new Tiptap format or legacy slideConfigs
        if (template.content) {
            // New Tiptap format: copy content directly to report
            reportUpdates.content = template.content;
        } else {
            // Legacy format: add slides from slideConfigs
            for (const widgetConfig of template.slideConfigs) {
                await addSlide(reportId, {
                    type: widgetConfig.type,
                    accountId,
                    campaignIds,
                    order: widgetConfig.order,
                    settings: widgetConfig.settings,
                });
            }
        }

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

/**
 * Get template with its slide configurations (for template editor)
 */
export async function getTemplateWithSlides(templateId: string): Promise<{
    template: ReportTemplate;
    slides: TemplateSlideConfig[];
} | null> {
    try {
        const template = await getTemplate(templateId);

        if (!template) {
            return null;
        }

        return {
            template,
            slides: template.slideConfigs || [],
        };
    } catch (error) {
        console.error('Error getting template with slides:', error);
        throw new Error('Failed to get template with slides');
    }
}

/**
 * Save template with slides (for template editor)
 */
export async function saveTemplateWithSlides(
    templateId: string,
    updates: {
        name?: string;
        description?: string;
        design?: any;
    },
    slideConfigs: TemplateSlideConfig[]
): Promise<void> {
    try {
        const docRef = doc(db, TEMPLATES_COLLECTION, templateId);

        // Deeply clean payload
        const cleanUpdates = removeUndefined(updates);
        const cleanSlides = removeUndefined(slideConfigs);

        const firestoreUpdates: any = {
            ...cleanUpdates,
            slideConfigs: cleanSlides,
            updatedAt: serverTimestamp(),
        };

        await updateDoc(docRef, firestoreUpdates);
    } catch (error) {
        console.error('Error saving template with slides:', error);
        throw new Error('Failed to save template with slides');
    }
}

/**
 * Update template slides only (for template editor)
 */
export async function updateTemplateSlides(
    templateId: string,
    slideConfigs: TemplateSlideConfig[]
): Promise<void> {
    try {
        const docRef = doc(db, TEMPLATES_COLLECTION, templateId);
        const cleanSlides = removeUndefined(slideConfigs);

        await updateDoc(docRef, {
            slideConfigs: cleanSlides,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating template slides:', error);
        throw new Error('Failed to update template slides');
    }
}

/**
 * Save template with Tiptap content (for new Tiptap template editor)
 */
export async function saveTemplateContent(
    templateId: string,
    updates: {
        name?: string;
        description?: string;
        design?: any;
    },
    content: TiptapJSONContent
): Promise<void> {
    try {
        const docRef = doc(db, TEMPLATES_COLLECTION, templateId);

        // Deeply clean payload to remove any undefined values
        const cleanData = removeUndefined({ ...updates, content });

        await updateDoc(docRef, {
            ...cleanData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving template content:', error);
        throw new Error('Failed to save template content');
    }
}

/**
 * Update template Tiptap content only
 */
export async function updateTemplateContent(
    templateId: string,
    content: TiptapJSONContent
): Promise<void> {
    try {
        const docRef = doc(db, TEMPLATES_COLLECTION, templateId);

        const cleanContent = removeUndefined(content);

        await updateDoc(docRef, {
            content: cleanContent,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating template content:', error);
        throw new Error('Failed to update template content');
    }
}

