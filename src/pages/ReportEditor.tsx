import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTutorial } from '../contexts/TutorialContext';
import {
    getReportWithSlides,
    saveReportWithSlides,
    publishReport,
    archiveReport,
    deleteReport,
    updateReportSettings,
    updateReportPassword,
} from '../services/reportService';
import { getUserProfile } from '../services/userProfileService';
import dataService from '../services/dataService';
import { fetchCampaigns } from '../services/googleAds';
import ReportEditorHeader from '../components/reports/ReportEditorHeader';
import SlideLibrary from '../components/reports/SlideLibrary';
import ReportCanvas from '../components/reports/ReportCanvas';
import ThemeManager from '../components/themes/ThemeManager';
import ReportConfigModal, { type ReportConfig } from '../components/reports/ReportConfigModal';
import ReportSecurityModal from '../components/reports/ReportSecurityModal';
import Spinner from '../components/common/Spinner';
import type { EditableReport, SlideConfig } from '../types/reportTypes';
import { SlideType } from '../types/reportTypes';
import type { ReportTheme } from '../types/reportThemes';
import type { Account, Campaign } from '../types/business';
import type { Client } from '../types/client';
import { clientService } from '../services/clientService';
import PreFlightModal from '../components/reports/PreFlightModal';
import './ReportEditor.css';

const ReportEditor: React.FC = () => {
    const { t } = useTranslation('reports');
    const navigate = useNavigate();
    const { id: reportId } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const { refresh: refreshTutorial } = useTutorial();

    // Report state
    const [report, setReport] = useState<EditableReport | null>(null);
    const [slides, setSlides] = useState<SlideConfig[]>([]);
    const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<ReportTheme | null>(null);

    // UI state
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
    const [lastSaved, setLastSaved] = useState<Date | undefined>();
    const [isDirty, setIsDirty] = useState(false);

    // Theme manager state
    const [showThemeManager, setShowThemeManager] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [clients, setClients] = useState<Client[]>([]);

    // Settings modal state
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [settingsCampaigns, setSettingsCampaigns] = useState<Campaign[]>([]);
    const [settingsAccountId, setSettingsAccountId] = useState<string>('');
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);

    // Security modal state
    const [showSecurityModal, setShowSecurityModal] = useState(false);

    // PreFlight modal state
    const [showPreFlightModal, setShowPreFlightModal] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [tempPassword, _setTempPassword] = useState<string>(''); // Temporary password storage for email sharing




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
    }, [isDirty, report, slides]);

    // Load Google Ads accounts for theme manager
    useEffect(() => {
        if (currentUser) {
            loadAccounts();
        }
    }, [currentUser]);

    const loadAccounts = async () => {
        try {
            const data = await dataService.getAccounts();
            setAccounts(data);

            if (currentUser) {
                const clientsData = await clientService.getClients(currentUser.uid);
                setClients(clientsData);
            }
        } catch (error) {
            console.error('Error loading accounts/clients:', error);
        }
    };

    const loadReport = async (id: string) => {
        try {
            setIsLoading(true);
            const result = await getReportWithSlides(id);

            if (!result) {
                toast.error(t('editor.notFound'));
                navigate('/app/reports');
                return;
            }

            if (result.report.userId !== currentUser?.uid) {
                toast.error(t('editor.unauthorized'));
                navigate('/app/reports');
                return;
            }

            setReport(result.report);
            setSlides(result.slides);
            setLastSaved(result.report.updatedAt);
        } catch (error) {
            console.error('Error loading report:', error);
            toast.error(t('editor.loadError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoSave = useCallback(async () => {
        if (!report || !currentUser) return;

        try {
            setAutoSaveStatus('saving');
            await saveReportWithSlides(report.id, {
                title: report.title,
                design: report.design,
            }, slides);
            setAutoSaveStatus('saved');
            setLastSaved(new Date());
            setIsDirty(false);
        } catch (error) {
            console.error('Auto-save error:', error);
            setAutoSaveStatus('error');
        }
    }, [report, slides, currentUser]);

    const handleSave = async () => {
        if (!report || !currentUser) return;

        try {
            setIsSaving(true);
            await saveReportWithSlides(report.id, {
                title: report.title,
                design: report.design,
            }, slides);
            setLastSaved(new Date());
            setIsDirty(false);
            await refreshTutorial();
            toast.success(t('editor.messages.saved'));
        } catch (error) {
            console.error('Save error:', error);
            toast.error(t('editor.messages.saveError'));
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
                toast.error(t('editor.messages.usernameRequired'));
                return;
            }

            // Save first
            await handleSave();

            // Then publish
            const shareUrl = await publishReport(report.id, profile.username);

            setReport({ ...report, status: 'published', shareUrl });
            await refreshTutorial(); // Refresh tutorial status as sending/publishing report is a step
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

    const handleAddSlide = (type: SlideType) => {
        if (!report) return;

        const newSlide: SlideConfig = {
            id: `slide-${Date.now()}`,
            type,
            accountId: report.accountId,
            campaignIds: report.campaignIds,
            order: slides.length,
            settings: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        setSlides([...slides, newSlide]);
        setIsDirty(true);
    };

    const handleSlideReorder = (reorderedSlides: SlideConfig[]) => {
        setSlides(reorderedSlides);
        setIsDirty(true);
    };

    const handleSlideUpdate = (slideId: string, config: Partial<SlideConfig>) => {
        setSlides(slides.map(w =>
            w.id === slideId ? { ...w, ...config, updatedAt: new Date() } : w
        ));
        setIsDirty(true);
    };

    const handleSlideDelete = (slideId: string) => {
        setSlides(slides.filter(w => w.id !== slideId));
        if (selectedSlideId === slideId) {
            setSelectedSlideId(null);
        }
        setIsDirty(true);
    };

    const handleOpenSettings = async () => {
        if (!report) return;

        try {
            setIsLoadingSettings(true);
            // Show modal immediately so user sees loader inside
            setShowSettingsModal(true);

            // Set the account ID for the modal
            setSettingsAccountId(report.accountId);

            // Load campaigns for the current account
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

            // Update report settings
            await updateReportSettings(report.id, {
                clientId: config.clientId,
                accountId: config.accountId,
                campaignIds: config.campaignIds,
                startDate: new Date(config.dateRange.start),
                endDate: new Date(config.dateRange.end),
                dateRangePreset: config.dateRange.preset,
            });

            // Update local state
            setReport({
                ...report,
                clientId: config.clientId,
                accountId: config.accountId,
                campaignIds: config.campaignIds,
                startDate: new Date(config.dateRange.start),
                endDate: new Date(config.dateRange.end),
            });

            // Update all slides with new parameters
            setSlides(slides.map(w => ({
                ...w,
                accountId: config.accountId,
                campaignIds: config.campaignIds,
            })));

            setShowSettingsModal(false);
            toast.success(t('editor.messages.settingsUpdated'));

            // Reload the report to get fresh data
            await loadReport(report.id);
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
                passwordHash: password ? 'updated' : undefined, // We don't store the actual hash in state
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

    const handleOpenPreFlight = () => {
        if (!report) return;
        // Navigate to full page preview
        navigate(`/app/reports/${report.id}/preview`);
    };

    const handlePreFlightDownload = async () => {
        console.log('📥 Pre-Flight validated, proceeding with PDF download/share');
        // Close PreFlight modal
        setShowPreFlightModal(false);

        // TODO: Implement PDF generation (Story 3.2)
        // For now, we'll just trigger the email share
        await handleShareByEmail();
        await refreshTutorial(); // Refresh tutorial status
    };

    const handleShareByEmail = async () => {
        console.log('🔵 handleShareByEmail called');
        console.log('Report:', report);
        console.log('Current User:', currentUser);

        if (!report || !currentUser) {
            console.error('❌ Missing report or currentUser');
            return;
        }

        try {
            // Get user profile for signature
            const profile = await getUserProfile(currentUser.uid);

            // Get campaign names - fetch them on demand
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

            // Format dates
            const formatDate = (date?: Date) => {
                if (!date) return 'N/A';
                return new Date(date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            };

            // Build email
            const subject = t('editor.email.subject', { title: report.title });

            const passwordPart = report.isPasswordProtected
                ? (tempPassword
                    ? t('editor.email.password', { password: tempPassword })
                    : t('editor.email.passwordProtected'))
                : '';

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
            console.log('📬 Opening mailto link:', mailtoLink.substring(0, 100) + '...');

            // Create a temporary link and click it (bypasses popup blockers)
            const link = document.createElement('a');
            link.href = mailtoLink;
            link.target = '_self';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(t('editor.messages.emailOpened'));
        } catch (error) {
            console.error('Error generating email:', error);
            toast.error(t('editor.messages.emailError'));
        }
    };

    if (isLoading) {
        return (
            <div className="report-editor loading">
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <Spinner size={48} />
                </div>
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
                shareUrl={report.shareUrl}
                isPasswordProtected={report.isPasswordProtected}
                onSave={handleSave}
                onPublish={handlePublish}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onOpenSettings={handleOpenSettings}
                onOpenSecurity={() => setShowSecurityModal(true)}
                onShareByEmail={handleOpenPreFlight}
                onExportToGoogleSlides={() => {
                    // TODO: Implement export handler
                    console.log('Export to Google Slides clicked');
                    toast('Export Google Slides - En cours de développement', {
                        icon: '📊',
                    });
                }}
                isSaving={isSaving}
                isLoadingSettings={isLoadingSettings}
                canPublish={slides.length > 0}
            />

            <div className="report-editor-content">
                <SlideLibrary
                    onAddSlide={handleAddSlide}
                    userId={currentUser?.uid}
                    clientId={report?.clientId}
                    selectedTheme={selectedTheme}
                    onThemeSelect={handleThemeSelect}
                    onCreateTheme={() => setShowThemeManager(true)}
                />

                <ReportCanvas
                    slides={slides}
                    design={report.design}
                    startDate={report.startDate}
                    endDate={report.endDate}
                    onReorder={handleSlideReorder}
                    onSlideUpdate={handleSlideUpdate}
                    onSlideDelete={handleSlideDelete}
                    onSlideDrop={(type) => handleAddSlide(type as SlideType)}
                    selectedSlideId={selectedSlideId}
                    onSlideSelect={setSelectedSlideId}
                    reportId={report.id}
                    reportAccountId={report.accountId}
                    reportCampaignIds={report.campaignIds}
                />
            </div>

            {/* Theme Manager Modal */}
            {showThemeManager && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <ThemeManager clients={clients} />
                            <button
                                onClick={() => setShowThemeManager(false)}
                                className="mt-6 w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                {t('editor.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettingsModal && report && (
                <ReportConfigModal
                    onClose={() => setShowSettingsModal(false)}
                    onSubmit={handleUpdateSettings}
                    accounts={accounts.map(acc => ({ id: acc.id, name: acc.name }))}
                    selectedAccountId={settingsAccountId}
                    onAccountChange={handleSettingsAccountChange}
                    campaigns={settingsCampaigns}
                    isEditMode={true}
                    isSubmitting={isSaving}
                    isLoadingCampaigns={isLoadingSettings}
                    initialConfig={{
                        title: report.title,
                        clientId: report.clientId, // Pass existing client ID
                        accountId: report.accountId,
                        campaignIds: report.campaignIds,
                        dateRange: {
                            start: report.startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                            end: report.endDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
                            preset: 'custom',
                        },
                    }}
                />
            )}

            {/* Security Modal */}
            {showSecurityModal && report && (
                <ReportSecurityModal
                    isPasswordProtected={report.isPasswordProtected}
                    onClose={() => setShowSecurityModal(false)}
                    onUpdate={handleUpdatePassword}
                />
            )}

            {/* PreFlight Modal */}
            {showPreFlightModal && report && (
                <PreFlightModal
                    isOpen={showPreFlightModal}
                    onClose={() => setShowPreFlightModal(false)}
                    onSendEmail={handlePreFlightDownload}
                    reportId={report.id}
                />
            )}


        </div>
    );
};

export default ReportEditor;
