import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { TiptapReportEditor } from '../components/editor';
import { getReportWithSlides, updateReport } from '../services/reportService';
import type { EditableReport } from '../types/reportTypes';
import { Save, ArrowLeft } from 'lucide-react';

/**
 * Tiptap Report Editor Page (Epic 13)
 * 
 * Simplified editor using Tiptap instead of the slide system.
 * This is a parallel implementation for testing/migration.
 */
const TiptapReportEditorPage: React.FC = () => {
    const { t } = useTranslation('reports');
    const navigate = useNavigate();
    const { id: reportId } = useParams<{ id: string }>();
    const { currentUser } = useAuth();

    const [report, setReport] = useState<EditableReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | undefined>();
    const [isDirty, setIsDirty] = useState(false);

    const autoSaveTimerRef = useRef<number | null>(null);

    // Load report
    useEffect(() => {
        if (reportId && currentUser) {
            loadReport(reportId);
        } else if (!reportId) {
            navigate('/app/reports');
        }
    }, [reportId, currentUser]);

    // Auto-save effect
    useEffect(() => {
        if (isDirty && report && currentUser) {
            if (autoSaveTimerRef.current) {
                window.clearTimeout(autoSaveTimerRef.current);
            }

            autoSaveTimerRef.current = window.setTimeout(() => {
                handleAutoSave();
            }, 3000); // 3 seconds debounce
        }

        return () => {
            if (autoSaveTimerRef.current) {
                window.clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [isDirty, report]);

    const loadReport = async (id: string) => {
        try {
            setIsLoading(true);
            const loadedReport = await getReportWithSlides(id);
            setReport(loadedReport);
        } catch (error) {
            console.error('Error loading report:', error);
            toast.error('Erreur de chargement du rapport');
            navigate('/app/reports');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoSave = useCallback(async () => {
        if (!report || !currentUser) return;

        try {
            await saveReportWithSlides(report.id, {
                title: report.title,
                design: report.design,
                content: report.content, // Save Tiptap JSON
            }, []);
            setLastSaved(new Date());
            setIsDirty(false);
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }, [report, currentUser, editorContent]);

    const handleSave = async () => {
        if (!report || !currentUser || !editorContent) return;

        try {
            setIsSaving(true);
            await updateReport(report.id, {
                content: editorContent,
                tiptapContent: editorContent,
                editorVersion: 'v2-tiptap',
            });
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

    const handleEditorChange = (newContent: any) => {
        if (!report) return;

        setEditorContent(newContent);
        setIsDirty(true);
    };

    const handleBack = () => {
        navigate('/app/reports');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!report || editorContent === null) { // Ensure editorContent is not null before rendering editor
        return null;
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                            title="Retour"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {report.title}
                            </h1>
                            {lastSaved && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Dernière sauvegarde : {lastSaved.toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isDirty && (
                            <span className="text-sm text-orange-600 dark:text-orange-400">
                                Non sauvegardé
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !isDirty}
                            className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Editor */}
            <main className="flex-1 overflow-hidden p-6">
                <div className="max-w-5xl mx-auto h-full">
                    <TiptapReportEditor
                        content={editorContent}
                        onChange={handleEditorChange}
                        placeholder="Commencez à écrire votre rapport... (tapez '/' pour insérer un bloc)"
                        design={report.design}
                    />
                </div>
            </main>
        </div>
    );
};

export default TiptapReportEditorPage;
