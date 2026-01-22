import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { TiptapReportEditor } from '../components/editor';
import { getReportWithSlides, updateReport } from '../services/reportService';
import type { EditableReport, ReportDesign } from '../types/reportTypes';
import { Save, ArrowLeft, Settings, Palette } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import AutoSaveIndicator from '../components/reports/AutoSaveIndicator';
import DesignPanel from '../components/reports/DesignPanel';

/**
 * Tiptap Report Editor Page (Epic 13)
 * 
 * Full-page slide editor with header matching the main editor.
 */
const TiptapReportEditorPage: React.FC = () => {
    const { t } = useTranslation('reports');
    const navigate = useNavigate();
    const { id: reportId } = useParams<{ id: string }>();
    const { currentUser } = useAuth();

    const [report, setReport] = useState<EditableReport | null>(null);
    const [title, setTitle] = useState('');
    const [editorContent, setEditorContent] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const [lastSaved, setLastSaved] = useState<Date | undefined>();
    const [isDirty, setIsDirty] = useState(false);
    const [showDesignPanel, setShowDesignPanel] = useState(false);

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
                setTitle(result.report.title);
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
        if (!report || !currentUser) return;
        try {
            setAutoSaveStatus('saving');
            await updateReport(report.id, {
                content: editorContent as any, // Cast to any to satisfy JSONContent requirement
                title: title,
                design: report.design
            });
            setLastSaved(new Date());
            setIsDirty(false);
            setAutoSaveStatus('saved');
        } catch (error) {
            console.error('Auto-save error:', error);
            setAutoSaveStatus('error');
        }
    }, [report, currentUser, editorContent, title]);

    const handleSave = async () => {
        if (!report || !currentUser) return;
        try {
            setIsSaving(true);
            setAutoSaveStatus('saving');
            await updateReport(report.id, {
                content: (editorContent || {}) as any,
                title: title,
                design: report.design
            });
            setLastSaved(new Date());
            setIsDirty(false);
            setAutoSaveStatus('saved');
            toast.success('Rapport sauvegardé');
        } catch (error) {
            console.error('Error saving report:', error);
            toast.error('Erreur lors de la sauvegarde');
            setAutoSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        setIsDirty(true);
    };

    const handleEditorChange = (newContent: unknown) => {
        if (!report) return;
        setEditorContent(newContent);
        setIsDirty(true);
    };

    const handleDesignChange = (newDesign: ReportDesign) => {
        if (!report) return;
        setReport({ ...report, design: newDesign });
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
            {/* Fixed Header Bar - matching ReportEditorHeader */}
            <header className="tiptap-page-header">
                <div className="tiptap-header-left">
                    {/* Logo */}
                    <div className="tiptap-header-logo">
                        <Logo />
                    </div>

                    {/* Back button */}
                    <button
                        onClick={handleBack}
                        className="tiptap-header-btn"
                        title={t('header.backToReports')}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {/* Editable Title */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="tiptap-title-input"
                        placeholder={t('header.titlePlaceholder')}
                    />

                    {/* Auto-save indicator */}
                    <AutoSaveIndicator status={autoSaveStatus} lastSaved={lastSaved} />

                    {/* Status badge */}
                    <span className={`tiptap-status-badge status-${report.status}`}>
                        {t(`card.status.${report.status}`)}
                    </span>
                </div>

                <div className="tiptap-header-right">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Design/Theme Button */}
                    <button
                        className={`tiptap-header-btn ${showDesignPanel ? 'active' : ''}`}
                        title="Design & Thème"
                        onClick={() => setShowDesignPanel(!showDesignPanel)}
                        style={showDesignPanel ? { color: 'var(--color-primary)', background: 'var(--color-bg-tertiary)' } : {}}
                    >
                        <Palette size={18} />
                    </button>

                    {/* Settings button - future use */}
                    <button
                        className="tiptap-header-btn"
                        title={t('header.settings')}
                    >
                        <Settings size={18} />
                    </button>

                    {/* Save button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || autoSaveStatus === 'saving'}
                        className="tiptap-save-btn"
                    >
                        <Save size={18} />
                        {isSaving ? t('header.saving') : t('header.save')}
                    </button>
                </div>
            </header>

            {/* Editor with Sidebar */}
            <main className="tiptap-page-main relative">
                <TiptapReportEditor
                    content={editorContent}
                    onChange={handleEditorChange}
                    design={report.design}
                    accountId={report.accountId}
                    campaignIds={report.campaignIds}
                    reportId={report.id}
                />

                {/* Design Panel Overlay */}
                {showDesignPanel && (
                    <div className="absolute top-0 right-0 h-full z-40 w-80 border-l border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-xl overflow-y-auto">
                        <div className="p-4">
                            <DesignPanel
                                design={report.design}
                                onChange={handleDesignChange}
                                onClose={() => setShowDesignPanel(false)}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TiptapReportEditorPage;
