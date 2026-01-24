import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { TiptapReportEditor } from '../components/editor';
import {
    getReportWithSlides,
    updateReport,
    publishReport,
    archiveReport,
    deleteReport,
    updateReportSettings,
    updateReportPassword,
} from '../services/reportService';
import { getUserProfile } from '../services/userProfileService';
import dataService from '../services/dataService';
import { fetchCampaigns } from '../services/googleAds';
import pdfGenerationService from '../services/pdfGenerationService';
import type { EditableReport, ReportDesign } from '../types/reportTypes';
import type { Account, Campaign } from '../types/business';
import type { Client } from '../types/client';
import { clientService } from '../services/clientService';
import { Save, ArrowLeft, Settings, Palette, Share2, MoreVertical, Archive, Trash2, Link, ExternalLink, Lock, Unlock, Mail, Presentation, Download, Loader2, Play, Calendar, Briefcase, Target } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import AutoSaveIndicator from '../components/reports/AutoSaveIndicator';
import { PresentationOverlay } from '../components/presentation/PresentationOverlay';
import { ThemeSelector } from '../components/editor/ThemeSelector';
import ReportConfigModal, { type ReportConfig } from '../components/reports/ReportConfigModal';
import ReportSecurityModal from '../components/reports/ReportSecurityModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { GoogleSlidesExportModal } from '../components/reports/GoogleSlidesExportModal';
import themeService from '../services/themeService';
import { defaultReportDesign } from '../types/reportTypes';
import '../components/reports/ReportEditorHeader.css';
import { extractSlidesFromTiptapContent } from '../utils/slidesExtraction';


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
    const [showThemeSelector, setShowThemeSelector] = useState(false);

    // Settings modal state
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [settingsCampaigns, setSettingsCampaigns] = useState<Campaign[]>([]);
    const [settingsAccountId, setSettingsAccountId] = useState<string>('');
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);
    const [scopeCampaigns, setScopeCampaigns] = useState<Campaign[]>([]);

    // Security modal state
    const [showSecurityModal, setShowSecurityModal] = useState(false);

    // Google Slides export modal state
    const [showGoogleSlidesModal, setShowGoogleSlidesModal] = useState(false);

    // Actions menu state
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // PDF Generation state
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const [pdfProgress, setPdfProgress] = useState(0);
    const reportContainerRef = useRef<HTMLDivElement>(null);
    const [showPresentationMode, setShowPresentationMode] = useState(false);

    // Client for context
    const [client, setClient] = useState<Client | null>(null);

    const autoSaveTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (reportId && currentUser) {
            loadReport(reportId);
        } else if (!reportId) {
            navigate('/app/reports');
        }
    }, [reportId, currentUser, navigate]);

    // Load accounts for settings modal
    useEffect(() => {
        if (currentUser) {
            loadAccounts();
        }
    }, [currentUser]);

    const loadAccounts = async () => {
        try {
            const data = await dataService.getAccounts();
            setAccounts(data);
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    };

    // Load campaigns for scope display
    useEffect(() => {
        if (report?.accountId) {
            const loadScopeCampaigns = async () => {
                try {
                    const response = await fetchCampaigns(report.accountId);
                    if (response.success && response.campaigns) {
                        setScopeCampaigns(Array.isArray(response.campaigns) ? response.campaigns : []);
                    }
                } catch (error) {
                    console.error('Error loading scope campaigns:', error);
                }
            };
            loadScopeCampaigns();
        }
    }, [report?.accountId]);

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
                // Initialize design if missing or load from client theme
                let design = result.report.design || defaultReportDesign;

                // Load client and its theme if linked
                if (result.report.clientId && currentUser) {
                    try {
                        const clients = await clientService.getClients(currentUser.uid);
                        const linkedClient = clients.find(c => c.id === result.report.clientId);
                        if (linkedClient) {
                            setClient(linkedClient);

                            // Load client's theme
                            const clientTheme = await themeService.getThemeForClient(currentUser.uid, result.report.clientId);
                            if (clientTheme) {
                                design = clientTheme.design;
                            }
                        }
                    } catch (err) {
                        console.error('Error loading client:', err);
                    }
                }

                // If no client theme, try to load default theme
                if (design === defaultReportDesign && currentUser) {
                    try {
                        const defaultTheme = await themeService.getDefaultTheme(currentUser.uid);
                        if (defaultTheme) {
                            design = defaultTheme.design;
                        }
                    } catch (err) {
                        console.error('Error loading default theme:', err);
                    }
                }

                setReport({ ...result.report, design });
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

    const handlePublish = async () => {
        if (!report || !currentUser) return;

        try {
            setIsSaving(true);

            // Get user profile for username
            const profile = await getUserProfile(currentUser.uid);
            if (!profile?.username) {
                toast.error(t('editor.messages.usernameRequired'));
                return;
            }

            // Save first
            await handleSave();

            // Then publish
            const shareUrl = await publishReport(report.id, profile.username);

            setReport({ ...report, status: 'published', shareUrl });
            toast.success(t('editor.messages.published'));
        } catch (error) {
            console.error('Publish error:', error);
            toast.error(t('editor.messages.publishError'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleArchive = async () => {
        if (!report) return;

        try {
            await archiveReport(report.id);
            setReport({ ...report, status: 'archived' });
            toast.success(t('editor.messages.archived'));
        } catch (error) {
            console.error('Archive error:', error);
            toast.error(t('editor.messages.archiveError'));
        }
    };

    const handleDelete = async () => {
        if (!report) return;

        try {
            await deleteReport(report.id);
            toast.success(t('editor.messages.deleted'));
            navigate('/app/reports');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(t('editor.messages.deleteError'));
        }
    };

    const handleOpenSettings = async () => {
        if (!report) return;

        try {
            setIsLoadingSettings(true);
            setShowSettingsModal(true);
            setSettingsAccountId(report.accountId);

            const response = await fetchCampaigns(report.accountId);
            if (response.success && response.campaigns) {
                setSettingsCampaigns(Array.isArray(response.campaigns) ? response.campaigns : []);
            } else {
                setSettingsCampaigns([]);
            }
        } catch (error) {
            console.error('Error loading campaigns for settings:', error);
            toast.error(t('editor.messages.campaignsLoadError'));
        } finally {
            setIsLoadingSettings(false);
        }
    };

    const handleUpdateSettings = async (config: ReportConfig) => {
        if (!report) return;

        try {
            setIsSaving(true);

            await updateReportSettings(report.id, {
                clientId: config.clientId,
                accountId: config.accountId,
                campaignIds: config.campaignIds,
                startDate: new Date(config.dateRange.start),
                endDate: new Date(config.dateRange.end),
                dateRangePreset: config.dateRange.preset,
            });

            setReport({
                ...report,
                clientId: config.clientId,
                accountId: config.accountId,
                campaignIds: config.campaignIds,
                startDate: new Date(config.dateRange.start),
                endDate: new Date(config.dateRange.end),
            });

            setShowSettingsModal(false);
            toast.success(t('editor.messages.settingsUpdated'));
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error(t('editor.messages.settingsUpdateError'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSettingsAccountChange = async (accountId: string) => {
        setSettingsAccountId(accountId);
        setIsLoadingSettings(true);
        try {
            const response = await fetchCampaigns(accountId);
            if (response.success && response.campaigns) {
                setSettingsCampaigns(Array.isArray(response.campaigns) ? response.campaigns : []);
            } else {
                setSettingsCampaigns([]);
            }
        } catch (error) {
            console.error('Error loading campaigns:', error);
            setSettingsCampaigns([]);
        } finally {
            setIsLoadingSettings(false);
        }
    };

    const handleUpdatePassword = async (password: string | null) => {
        if (!report) return;

        try {
            await updateReportPassword(report.id, password);

            setReport({
                ...report,
                isPasswordProtected: password !== null,
                passwordHash: password ? 'updated' : undefined,
            });
            toast.success(
                password
                    ? t('editor.messages.passwordEnabled')
                    : t('editor.messages.passwordDisabled')
            );
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(t('editor.messages.passwordError'));
            throw error;
        }
    };

    const handleCopyLink = () => {
        if (!report?.shareUrl) return;
        const fullUrl = `${window.location.origin}${report.shareUrl}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success(t('header.linkCopied'));
        setShowShareMenu(false);
    };

    const handleOpenInNewTab = () => {
        if (!report?.shareUrl) return;
        const fullUrl = `${window.location.origin}${report.shareUrl}`;
        window.open(fullUrl, '_blank');
        setShowShareMenu(false);
    };

    // Navigate to preview page for email sharing (like old editor)
    const handleOpenPreFlight = () => {
        if (!report) return;
        navigate(`/app/reports/${report.id}/preview`);
    };

    const handleDownloadPDF = async () => {
        if (!report || !currentUser) return;

        try {
            setPdfGenerating(true);
            setPdfProgress(0);

            // Fetch extra context if needed (similar to ReportPreview)
            let profile = null;
            let clientData = client;

            if (currentUser?.uid) {
                try {
                    profile = await getUserProfile(currentUser.uid);
                } catch (err) {
                    console.warn('Could not load user profile:', err);
                }
            }

            // Build filename
            const dateStr = new Date().toISOString().split('T')[0];
            const clientName = clientData?.name
                ? clientData.name
                    .trim()
                    .replace(/[^a-zA-Z0-9àâçéèêëîïôûùüÿñæoeÀÂÇÉÈÊËÎÏÔÛÙÜŸÑÆŒ\s]/g, '')
                    .replace(/\s+/g, '_')
                    .substring(0, 50)
                : '';

            const filename = clientName
                ? `Rapport_${clientName}_${dateStr}.pdf`
                : `Rapport_${dateStr}.pdf`;

            // PDF Title
            const isValidTitle = report.title &&
                !report.title.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) &&
                report.title.trim().length > 0;
            const pdfTitle = isValidTitle
                ? report.title.trim().substring(0, 100)
                : (clientData?.name ? `Rapport ${clientData.name}` : 'Rapport de Performance');

            if (!reportContainerRef.current) {
                throw new Error('Report container not found');
            }

            await pdfGenerationService.generateReportPDF(
                reportContainerRef.current,
                {
                    filename,
                    reportTitle: pdfTitle,
                    startDate: report.startDate ? new Date(report.startDate) : undefined,
                    endDate: report.endDate ? new Date(report.endDate) : undefined,
                    design: report.design,
                    client: clientData || undefined,
                    user: profile || undefined,
                    onProgress: (progress) => {
                        setPdfProgress(progress);
                    },
                    translations: {
                        title: t('preFlight.pdf.overlay.title'),
                        preparing: t('preFlight.pdf.overlay.preparing'),
                        creatingDocument: t('preFlight.pdf.overlay.creatingDocument'),
                        coverPage: t('preFlight.pdf.overlay.coverPage'),
                        slideProgress: t('preFlight.pdf.overlay.slideProgress'),
                        finalizing: t('preFlight.pdf.overlay.finalizing'),
                        saving: t('preFlight.pdf.overlay.saving'),
                        complete: t('preFlight.pdf.overlay.complete'),
                        pleaseWait: t('preFlight.pdf.overlay.pleaseWait'),
                        generatedOn: t('preFlight.pdf.overlay.generatedOn'),
                    }
                }
            );

            toast.success(t('preFlight.pdf.success'));
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error(error instanceof Error ? error.message : t('preFlight.pdf.error'));
        } finally {
            setPdfGenerating(false);
            setPdfProgress(0);
        }
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
        <div className={`tiptap-page-layout ${report ? 'with-scope-header' : ''}`}>
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
                        style={{ width: `${Math.max(12, title.length + 2)}ch` }}
                    />

                    {/* Auto-save indicator */}
                    <div className="mr-4">
                        <AutoSaveIndicator status={autoSaveStatus} lastSaved={lastSaved} />
                    </div>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

                    {/* Presentation Mode Button */}


                    {/* Status badge */}
                    <span className={`tiptap-status-badge status-${report.status}`}>
                        {t(`card.status.${report.status}`)}
                    </span>
                </div>

                <div className="tiptap-header-right">
                    {/* Theme Toggle for Flipika UI */}
                    <ThemeToggle />

                    {/* Design/Theme Button for Report Slides */}
                    {/* Design/Theme Button for Report Slides */}
                    <div className="theme-selector-wrapper relative">
                        <button
                            className={`tiptap-header-btn ${showThemeSelector ? 'active' : ''}`}
                            title="Thème du Rapport"
                            onClick={() => setShowThemeSelector(!showThemeSelector)}
                            style={showThemeSelector ? { color: 'var(--color-primary)', background: 'var(--color-bg-tertiary)' } : {}}
                        >
                            <Palette size={18} />
                        </button>
                        <ThemeSelector
                            design={report.design}
                            onChange={handleDesignChange}
                            isOpen={showThemeSelector}
                            onClose={() => setShowThemeSelector(false)}
                        />
                    </div>

                    {/* Settings button */}
                    <button
                        onClick={handleOpenSettings}
                        disabled={isLoadingSettings}
                        className="tiptap-header-btn"
                        title={t('header.settings')}
                    >
                        {isLoadingSettings ? (
                            <svg className="animate-spin h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <Settings size={18} />
                        )}
                    </button>

                    {/* Save button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || autoSaveStatus === 'saving'}
                        className="tiptap-header-btn"
                        title={t('header.save')}
                    >
                        <Save size={18} />
                    </button>

                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

                    {/* Presentation Mode Button */}
                    <button
                        onClick={() => setShowPresentationMode(true)}
                        className="tiptap-header-btn auto-width group mr-2"
                        title={t('header.present')}
                    >
                        <Play size={18} className="fill-current" />
                        <span className="hidden sm:inline">{t('header.present')}</span>
                    </button>

                    {/* Publish button (for drafts) */}
                    {report.status === 'draft' && (
                        <button
                            onClick={handlePublish}
                            disabled={isSaving}
                            className="tiptap-save-btn"
                        >
                            <Share2 size={18} />
                            {t('header.publish')}
                        </button>
                    )}

                    {/* Share Dropdown (for published reports) */}
                    {report.status === 'published' && (
                        <div className="actions-menu-wrapper">
                            <button
                                onClick={() => setShowShareMenu(!showShareMenu)}
                                className="tiptap-save-btn"
                            >
                                <Share2 size={18} />
                                {t('header.share')}
                            </button>

                            {showShareMenu && (
                                <>
                                    <div
                                        className="actions-menu-overlay"
                                        onClick={() => setShowShareMenu(false)}
                                    />
                                    <div className="actions-menu share-menu">
                                        {report.shareUrl && (
                                            <button
                                                onClick={handleOpenPreFlight}
                                                className="actions-menu-item"
                                            >
                                                <Mail size={18} />
                                                <span>{t('header.shareEmail')}</span>
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                handleDownloadPDF();
                                                setShowShareMenu(false);
                                            }}
                                            disabled={pdfGenerating}
                                            className="actions-menu-item"
                                        >
                                            {pdfGenerating ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    <span>{Math.round(pdfProgress)}%</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Download size={18} />
                                                    <span>{t('preFlight.actions.downloadPdf')}</span>
                                                </>
                                            )}
                                        </button>

                                        {report.shareUrl && (
                                            <button
                                                onClick={handleOpenInNewTab}
                                                className="actions-menu-item"
                                            >
                                                <ExternalLink size={18} />
                                                <span>{t('header.openInNewTab')}</span>
                                            </button>
                                        )}

                                        {report.shareUrl && (
                                            <button
                                                onClick={handleCopyLink}
                                                className="actions-menu-item"
                                            >
                                                <Link size={18} />
                                                <span>{t('header.copyLink')}</span>
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                setShowSecurityModal(true);
                                                setShowShareMenu(false);
                                            }}
                                            className="actions-menu-item"
                                        >
                                            {report.isPasswordProtected ? <Lock size={18} /> : <Unlock size={18} />}
                                            <span>{report.isPasswordProtected ? t('header.managePassword') : t('header.protectPassword')}</span>
                                        </button>

                                        {import.meta.env.MODE === 'development' && (
                                            <button
                                                onClick={() => {
                                                    setShowGoogleSlidesModal(true);
                                                    setShowShareMenu(false);
                                                }}
                                                className="actions-menu-item"
                                            >
                                                <Presentation size={18} />
                                                <span>{t('header.exportGoogleSlides')}</span>
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* More Actions Menu */}
                    <div className="actions-menu-wrapper">
                        <button
                            onClick={() => setShowActionsMenu(!showActionsMenu)}
                            className="tiptap-header-btn"
                            title={t('header.moreActions')}
                        >
                            <MoreVertical size={18} />
                        </button>

                        {showActionsMenu && (
                            <>
                                <div
                                    className="actions-menu-overlay"
                                    onClick={() => setShowActionsMenu(false)}
                                />
                                <div className="actions-menu">
                                    {report.status !== 'archived' && (
                                        <button
                                            onClick={() => {
                                                handleArchive();
                                                setShowActionsMenu(false);
                                            }}
                                            className="actions-menu-item"
                                        >
                                            <Archive size={18} />
                                            <span>{t('header.archive')}</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setIsDeleteModalOpen(true);
                                            setShowActionsMenu(false);
                                        }}
                                        className="actions-menu-item danger"
                                    >
                                        <Trash2 size={18} />
                                        <span>{t('header.delete')}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div >
            </header >

            {/* Sub-header for Report Scope */}
            {report && (
                <div
                    className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between text-xs shadow-sm z-30"
                    style={{
                        position: 'fixed',
                        top: 'var(--page-header-height)',
                        left: '200px', /* Shifted to account for sidebar */
                        right: 0,
                        height: 'var(--scope-header-height)',
                        zIndex: 38
                    }}
                >
                    <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar max-w-full h-full">
                        {/* Dates */}
                        <div
                            className="flex items-center text-gray-600 dark:text-gray-300 whitespace-nowrap min-w-fit cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                            onClick={() => setShowSettingsModal(true)}
                        >
                            <Calendar size={12} className="mr-1.5 opacity-70" />
                            <span className="font-medium mr-1">{t('common.period')}:</span>
                            <span>
                                {report.startDate ? new Date(report.startDate).toLocaleDateString() : 'N/A'} - {report.endDate ? new Date(report.endDate).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>

                        <div className="h-3 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

                        {/* Client (replaced Account) */}
                        <div
                            className="flex items-center text-gray-600 dark:text-gray-300 whitespace-nowrap min-w-fit cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                            onClick={() => setShowSettingsModal(true)}
                        >
                            <Briefcase size={12} className="mr-1.5 opacity-70" />
                            <span className="font-medium mr-1">{t('common.client')}:</span>
                            <span className="truncate max-w-[200px]" title={client?.name || 'Client introuvable'}>
                                {client?.name || 'Client introuvable'}
                            </span>
                        </div>

                        <div className="h-3 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

                        {/* Campaigns */}
                        <div
                            className="flex items-center text-gray-600 dark:text-gray-300 whitespace-nowrap min-w-fit cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                            onClick={() => setShowSettingsModal(true)}
                        >
                            <Target size={12} className="mr-1.5 opacity-70" />
                            <span className="font-medium mr-1">{t('common.campaigns')}:</span>
                            <span className="truncate max-w-[300px]" title={
                                !report.campaignIds || report.campaignIds.length === 0
                                    ? t('common.allCampaigns')
                                    : scopeCampaigns
                                        .filter(c => report.campaignIds.includes(c.id.toString()))
                                        .map(c => c.name)
                                        .join(', ')
                            }>
                                {!report.campaignIds || report.campaignIds.length === 0 ? (
                                    t('common.allCampaigns')
                                ) : (
                                    (() => {
                                        const selectedCampaigns = scopeCampaigns.filter(c => report.campaignIds.includes(c.id.toString()));
                                        if (selectedCampaigns.length === 0) return `${report.campaignIds.length} ${t('common.selected')}`;
                                        if (selectedCampaigns.length <= 2) return selectedCampaigns.map(c => c.name).join(', ');
                                        return `${selectedCampaigns[0].name}, ${selectedCampaigns[1].name} +${selectedCampaigns.length - 2}`;
                                    })()
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Editor with Sidebar */}
            <main className="tiptap-page-main relative" ref={reportContainerRef}>
                <TiptapReportEditor
                    content={editorContent}
                    onChange={handleEditorChange}
                    design={report.design}
                    accountId={report.accountId}
                    campaignIds={report.campaignIds}
                    reportId={report.id}
                    clientId={report.clientId}
                    client={client}
                    userId={report.userId}
                    onOpenSettings={handleOpenSettings}
                />
            </main >

            {/* Settings Modal */}
            {
                report && showSettingsModal && (
                    <ReportConfigModal
                        onClose={() => setShowSettingsModal(false)}
                        onSubmit={handleUpdateSettings}
                        initialConfig={{
                            title: report.title,
                            clientId: report.clientId,
                            accountId: settingsAccountId || report.accountId,
                            campaignIds: report.campaignIds,
                            dateRange: {
                                start: report.startDate ? new Date(report.startDate).toISOString() : new Date().toISOString(),
                                end: report.endDate ? new Date(report.endDate).toISOString() : new Date().toISOString(),
                                preset: (report as any).dateRangePreset || 'custom'
                            }
                        }}
                        selectedAccountId={settingsAccountId || report.accountId}
                        accounts={accounts}
                        campaigns={settingsCampaigns}
                        isLoadingCampaigns={isLoadingSettings}
                        onAccountChange={handleSettingsAccountChange}
                        isEditMode={true}
                    />
                )
            }

            {/* Security Modal */}
            {
                report && showSecurityModal && (
                    <ReportSecurityModal
                        isPasswordProtected={report.isPasswordProtected}
                        onClose={() => setShowSecurityModal(false)}
                        onUpdate={handleUpdatePassword}
                    />
                )
            }

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={t('header.deleteReport')}
                message={t('messages.deleteReportConfirm')}
                confirmLabel={t('header.delete')}
                cancelLabel={t('common.cancel')}
                isDestructive
            />

            {/* Presentation Mode Overlay */}
            {showPresentationMode && report && (
                <PresentationOverlay
                    report={report}
                    onClose={() => setShowPresentationMode(false)}
                />
            )}

            {/* Google Slides Export Modal */}
            {
                showGoogleSlidesModal && report && (
                    <GoogleSlidesExportModal
                        isOpen={showGoogleSlidesModal}
                        onClose={() => setShowGoogleSlidesModal(false)}
                        reportId={report.id}
                        reportTitle={title}
                        slides={extractSlidesFromTiptapContent(
                            editorContent,
                            report.accountId,
                            report.campaignIds
                        )}
                        accountId={report.accountId}
                        campaignIds={report.campaignIds}
                        startDate={report.startDate}
                        endDate={report.endDate}
                    />
                )
            }
        </div >
    );
};

export default TiptapReportEditorPage;
