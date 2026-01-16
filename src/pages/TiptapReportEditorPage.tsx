import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { TiptapReportEditor } from '../components/editor';
import { getReportWithSlides, updateReport } from '../services/reportService';
import type { EditableReport } from '../types/reportTypes';
import { Save, ArrowLeft, Clock, CheckCircle } from 'lucide-react';

/**
 * Tiptap Report Editor Page (Epic 13)
 * 
 * Full-page slide editor with fixed header, fixed toolbar, and slide navigation.
 */
const TiptapReportEditorPage: React.FC = () => {
    const navigate = useNavigate();
    const { id: reportId } = useParams<{ id: string }>();
    const { currentUser } = useAuth();

    const [report, setReport] = useState<EditableReport | null>(null);
    const [editorContent, setEditorContent] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | undefined>();
    const [isDirty, setIsDirty] = useState(false);

    const autoSaveTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (reportId && currentUser) {
            loadReport(reportId);
        } else if (!reportId) {
            navigate('/app/reports');
        }
    }, [reportId, currentUser, navigate]);

    useEffect(() => {
        if (isDirty && report && currentUser) {
            if (autoSaveTimerRef.current) {
                window.clearTimeout(autoSaveTimerRef.current);
            }
            autoSaveTimerRef.current = window.setTimeout(() => {
                handleAutoSave();
            }, 3000);
        }
        return () => {
            if (autoSaveTimerRef.current) {
                window.clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [isDirty, report, currentUser]);

    const loadReport = async (id: string) => {
        try {
            setIsLoading(true);
            const result = await getReportWithSlides(id);
            if (result) {
                setReport(result.report);
                setEditorContent(result.report.content || null);
            }
        } catch (error) {
            console.error('Error loading report:', error);
            toast.error('Erreur de chargement du rapport');
            navigate('/app/reports');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoSave = useCallback(async () => {
        if (!report || !currentUser || !editorContent) return;
        try {
            await updateReport(report.id, { content: editorContent });
            setLastSaved(new Date());
            setIsDirty(false);
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }, [report, currentUser, editorContent]);

    const handleSave = async () => {
        if (!report || !currentUser) return;
        try {
            setIsSaving(true);
            await updateReport(report.id, { content: editorContent || {} });
            setLastSaved(new Date());
            setIsDirty(false);
            toast.success('Rapport sauvegardé');
        } catch (error) {
            console.error('Error saving report:', error);
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditorChange = (newContent: unknown) => {
        if (!report) return;
        setEditorContent(newContent);
        setIsDirty(true);
    };

    const handleBack = () => {
        navigate('/app/reports');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!report) {
        return null;
    }

    return (
        <div className="tiptap-page-layout">
            {/* Fixed Header Bar */}
            <header className="tiptap-page-header">
                <div className="tiptap-header-left">
                    <button
                        onClick={handleBack}
                        className="tiptap-header-btn"
                        title="Retour aux rapports"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="tiptap-header-title-group">
                        <h1 className="tiptap-header-title">{report.title}</h1>
                        <div className="tiptap-header-status">
                            {isDirty ? (
                                <span className="tiptap-status-unsaved">
                                    <Clock size={14} />
                                    Modifications non sauvegardées
                                </span>
                            ) : lastSaved ? (
                                <span className="tiptap-status-saved">
                                    <CheckCircle size={14} />
                                    Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="tiptap-header-right">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="tiptap-save-btn"
                    >
                        <Save size={18} />
                        {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </header>

            {/* Editor with Sidebar */}
            <main className="tiptap-page-main">
                <TiptapReportEditor
                    content={editorContent}
                    onChange={handleEditorChange}
                    design={report.design}
                />
            </main>
        </div>
    );
};

export default TiptapReportEditorPage;
