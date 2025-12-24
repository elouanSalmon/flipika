import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
    getReportWithWidgets,
    saveReportWithWidgets,
    publishReport,
    archiveReport,
    deleteReport,
} from '../services/reportService';
import { getUserProfile } from '../services/userProfileService';
import ReportEditorHeader from '../components/reports/ReportEditorHeader';
import WidgetLibrary from '../components/reports/WidgetLibrary';
import ReportCanvas from '../components/reports/ReportCanvas';
import type { EditableReport, WidgetConfig } from '../types/reportTypes';
import { WidgetType } from '../types/reportTypes';
import type { ReportTheme } from '../types/reportThemes';
import './ReportEditor.css';

const ReportEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id: reportId } = useParams<{ id: string }>();
    const { currentUser } = useAuth();

    // Report state
    const [report, setReport] = useState<EditableReport | null>(null);
    const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
    const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<ReportTheme | null>(null);

    // UI state
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const [lastSaved, setLastSaved] = useState<Date | undefined>();
    const [isDirty, setIsDirty] = useState(false);

    const autoSaveTimerRef = useRef<number | null>(null);

    // Load report
    useEffect(() => {
        if (reportId && currentUser) {
            loadReport(reportId);
        } else if (!reportId) {
            // No report ID - redirect to reports list
            navigate('/app/reports');
        }
    }, [reportId, currentUser]);

    // Auto-save effect
    useEffect(() => {
        if (isDirty && report && currentUser) {
            // Clear existing timer
            if (autoSaveTimerRef.current) {
                window.clearTimeout(autoSaveTimerRef.current);
            }

            // Set new timer for 30 seconds
            autoSaveTimerRef.current = window.setTimeout(() => {
                handleAutoSave();
            }, 30000);
        }

        return () => {
            if (autoSaveTimerRef.current) {
                window.clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [isDirty, report, widgets]);

    const loadReport = async (id: string) => {
        try {
            setIsLoading(true);
            const result = await getReportWithWidgets(id);

            if (!result) {
                toast.error('Rapport introuvable');
                navigate('/app/reports');
                return;
            }

            if (result.report.userId !== currentUser?.uid) {
                toast.error('Accès non autorisé');
                navigate('/app/reports');
                return;
            }

            setReport(result.report);
            setWidgets(result.widgets);
            setLastSaved(result.report.updatedAt);
        } catch (error) {
            console.error('Error loading report:', error);
            toast.error('Erreur lors du chargement du rapport');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoSave = useCallback(async () => {
        if (!report || !currentUser) return;

        try {
            setAutoSaveStatus('saving');
            await saveReportWithWidgets(report.id, {
                title: report.title,
                design: report.design,
            }, widgets);
            setAutoSaveStatus('saved');
            setLastSaved(new Date());
            setIsDirty(false);
        } catch (error) {
            console.error('Auto-save error:', error);
            setAutoSaveStatus('error');
        }
    }, [report, widgets, currentUser]);

    const handleSave = async () => {
        if (!report || !currentUser) return;

        try {
            setIsSaving(true);
            await saveReportWithWidgets(report.id, {
                title: report.title,
                design: report.design,
            }, widgets);
            setLastSaved(new Date());
            setIsDirty(false);
            toast.success('Rapport sauvegardé');
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!report || !currentUser) return;

        try {
            setIsSaving(true);

            // Get user profile for username
            const profile = await getUserProfile(currentUser.uid);
            if (!profile?.username) {
                toast.error('Veuillez configurer votre nom d\'utilisateur dans les paramètres');
                return;
            }

            // Save first
            await handleSave();

            // Then publish
            const shareUrl = await publishReport(report.id, profile.username);

            setReport({ ...report, status: 'published', shareUrl });
            toast.success('Rapport publié !');
        } catch (error) {
            console.error('Publish error:', error);
            toast.error('Erreur lors de la publication');
        } finally {
            setIsSaving(false);
        }
    };

    const handleArchive = async () => {
        if (!report) return;

        try {
            await archiveReport(report.id);
            setReport({ ...report, status: 'archived' });
            toast.success('Rapport archivé');
        } catch (error) {
            console.error('Archive error:', error);
            toast.error('Erreur lors de l\'archivage');
        }
    };

    const handleDelete = async () => {
        if (!report) return;

        try {
            await deleteReport(report.id);
            toast.success('Rapport supprimé');
            navigate('/app/reports');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleTitleChange = (title: string) => {
        if (!report) return;
        setReport({ ...report, title });
        setIsDirty(true);
    };

    const handleThemeSelect = (theme: ReportTheme | null) => {
        if (!report) return;
        setSelectedTheme(theme);
        if (theme) {
            setReport({ ...report, design: theme.design });
            setIsDirty(true);
        }
    };

    const handleAddWidget = (type: WidgetType) => {
        if (!report) return;

        const newWidget: WidgetConfig = {
            id: `widget-${Date.now()}`,
            type,
            accountId: report.accountId,
            campaignIds: report.campaignIds,
            order: widgets.length,
            settings: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        setWidgets([...widgets, newWidget]);
        setIsDirty(true);
    };

    const handleWidgetReorder = (reorderedWidgets: WidgetConfig[]) => {
        setWidgets(reorderedWidgets);
        setIsDirty(true);
    };

    const handleWidgetUpdate = (widgetId: string, config: Partial<WidgetConfig>) => {
        setWidgets(widgets.map(w =>
            w.id === widgetId ? { ...w, ...config, updatedAt: new Date() } : w
        ));
        setIsDirty(true);
    };

    const handleWidgetDelete = (widgetId: string) => {
        setWidgets(widgets.filter(w => w.id !== widgetId));
        if (selectedWidgetId === widgetId) {
            setSelectedWidgetId(null);
        }
        setIsDirty(true);
    };

    if (isLoading) {
        return (
            <div className="report-editor loading">
                <div className="loading-spinner">Chargement...</div>
            </div>
        );
    }

    if (!report || !currentUser) {
        return null;
    }

    return (
        <div className="report-editor">
            <ReportEditorHeader
                title={report.title}
                onTitleChange={handleTitleChange}
                autoSaveStatus={autoSaveStatus}
                lastSaved={lastSaved}
                status={report.status}
                userId={currentUser.uid}
                accountId={report.accountId}
                selectedTheme={selectedTheme}
                onThemeSelect={handleThemeSelect}
                onCreateTheme={() => {/* TODO */ }}
                onSave={handleSave}
                onPublish={handlePublish}
                onArchive={handleArchive}
                onDelete={handleDelete}
                isSaving={isSaving}
                canPublish={widgets.length > 0}
            />

            <div className="report-editor-content">
                <WidgetLibrary onAddWidget={handleAddWidget} />

                <ReportCanvas
                    widgets={widgets}
                    onReorder={handleWidgetReorder}
                    onWidgetUpdate={handleWidgetUpdate}
                    onWidgetDelete={handleWidgetDelete}
                    onWidgetDrop={(type) => handleAddWidget(type as WidgetType)}
                    selectedWidgetId={selectedWidgetId}
                    onWidgetSelect={setSelectedWidgetId}
                />
            </div>
        </div>
    );
};

export default ReportEditor;
