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
import type { EditableReport, ReportDesign } from '../types/reportTypes';
import type { Account, Campaign } from '../types/business';
import type { Client } from '../types/client';
import { clientService } from '../services/clientService';
import { Save, ArrowLeft, Settings, Palette, Share2, MoreVertical, Archive, Trash2, Link, ExternalLink, Lock, Unlock, Mail, Presentation } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import AutoSaveIndicator from '../components/reports/AutoSaveIndicator';
import { ThemeSelector } from '../components/editor/ThemeSelector';
import ReportConfigModal, { type ReportConfig } from '../components/reports/ReportConfigModal';
import ReportSecurityModal from '../components/reports/ReportSecurityModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { GoogleSlidesExportModal } from '../components/reports/GoogleSlidesExportModal';
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

    // Security modal state
    const [showSecurityModal, setShowSecurityModal] = useState(false);

    // Google Slides export modal state
    const [showGoogleSlidesModal, setShowGoogleSlidesModal] = useState(false);

    // Actions menu state
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

                // Load client if linked
                if (result.report.clientId && currentUser) {
                    try {
                        const clients = await clientService.getClients(currentUser.uid);
                        const linkedClient = clients.find(c => c.id === result.report.clientId);
                        if (linkedClient) {
                            setClient(linkedClient);
                        }
                    } catch (err) {
                        console.error('Error loading client:', err);
                    }
                }
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

    const handleShareByEmail = async () => {
        if (!report || !currentUser) return;

        try {
            const profile = await getUserProfile(currentUser.uid);

            const campaignNames: string[] = [];
            try {
                const response = await fetchCampaigns(report.accountId);
                if (response.success && response.campaigns) {
                    const campaigns = Array.isArray(response.campaigns) ? response.campaigns : [];
                    report.campaignIds.forEach(id => {
                        const campaign = campaigns.find((c: Campaign) => c.id === id);
                        if (campaign) {
                            campaignNames.push(campaign.name);
                        }
                    });
                }
            } catch (err) {
                console.warn('Could not load campaign names for email:', err);
            }

            const formatDate = (date?: Date) => {
                if (!date) return 'N/A';
                return new Date(date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            };

            const subject = t('editor.email.subject', { title: report.title });
            const passwordPart = report.isPasswordProtected ? t('editor.email.passwordProtected') : '';

            const emailBody = `${t('editor.email.greeting')}

${t('editor.email.intro')}

${t('editor.email.reportTitle', { title: report.title })}
${t('editor.email.period', { startDate: formatDate(report.startDate), endDate: formatDate(report.endDate) })}
${campaignNames.length > 0 ? t('editor.email.campaigns', { names: campaignNames.join(', ') }) : ''}

${t('editor.email.accessLink', { url: window.location.origin + report.shareUrl })}
${passwordPart}

${t('editor.email.questions')}

${t('editor.email.signature')}
${t('editor.email.signatureName', { name: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() })}
${profile?.company ? t('editor.email.signatureCompany', { company: profile.company }) : ''}`;

            const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
            const link = document.createElement('a');
            link.href = mailtoLink;
            link.target = '_self';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(t('editor.messages.emailOpened'));
            setShowShareMenu(false);
        } catch (error) {
            console.error('Error generating email:', error);
            toast.error(t('editor.messages.emailError'));
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
                                                onClick={handleCopyLink}
                                                className="actions-menu-item"
                                            >
                                                <Link size={18} />
                                                <span>{t('header.copyLink')}</span>
                                            </button>
                                        )}

                                        {report.shareUrl && (
                                            <button
                                                onClick={handleOpenInNewTab}
                                                className="actions-menu-item"
                                            >
                                                <ExternalLink size={18} />
                                                <span>{t('header.openInNewTab')}</span>
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
                                                setShowGoogleSlidesModal(true);
                                                setShowShareMenu(false);
                                            }}
                                            className="actions-menu-item"
                                        >
                                            <Presentation size={18} />
                                            <span>Exporter vers Google Slides</span>
                                        </button>
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
                    clientId={report.clientId}
                    client={client}
                    userId={report.userId}
                    onOpenSettings={handleOpenSettings}
                />
            </main>

            {/* Settings Modal */}
            {report && showSettingsModal && (
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
            )}

            {/* Security Modal */}
            {report && showSecurityModal && (
                <ReportSecurityModal
                    isPasswordProtected={report.isPasswordProtected}
                    onClose={() => setShowSecurityModal(false)}
                    onUpdate={handleUpdatePassword}
                />
            )}

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

            {/* Google Slides Export Modal */}
            {showGoogleSlidesModal && report && (
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
            )}
        </div>
    );
};

export default TiptapReportEditorPage;
