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
    updateReportSettings,
    updateReportPassword,
} from '../services/reportService';
import { getUserProfile } from '../services/userProfileService';
import dataService from '../services/dataService';
import { fetchCampaigns } from '../services/googleAds';
import ReportEditorHeader from '../components/reports/ReportEditorHeader';
import WidgetLibrary from '../components/reports/WidgetLibrary';
import ReportCanvas from '../components/reports/ReportCanvas';
import ThemeManager from '../components/themes/ThemeManager';
import ReportConfigModal, { type ReportConfig } from '../components/reports/ReportConfigModal';
import ReportSecurityModal from '../components/reports/ReportSecurityModal';
import Spinner from '../components/common/Spinner';
import type { EditableReport, WidgetConfig } from '../types/reportTypes';
import { WidgetType } from '../types/reportTypes';
import type { ReportTheme } from '../types/reportThemes';
import type { Account, Campaign } from '../types/business';
import PreFlightModal from '../components/reports/PreFlightModal';
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

    // Theme manager state
    const [showThemeManager, setShowThemeManager] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);

    // Settings modal state
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [settingsCampaigns, setSettingsCampaigns] = useState<Campaign[]>([]);
    const [settingsAccountId, setSettingsAccountId] = useState<string>('');
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);

    // Security modal state
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [tempPassword, setTempPassword] = useState<string>(''); // Temporary password storage for email sharing

    // PreFlight modal state
    const [showPreFlightModal, setShowPreFlightModal] = useState(false);

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
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    };

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

    const handleOpenSettings = async () => {
        if (!report) return;

        try {
            setIsLoadingSettings(true);
            // Set the account ID for the modal
            setSettingsAccountId(report.accountId);

            // Load campaigns for the current account
            const response = await fetchCampaigns(report.accountId);

            if (response.success && response.campaigns) {
                setSettingsCampaigns(Array.isArray(response.campaigns) ? response.campaigns : []);
            } else {
                setSettingsCampaigns([]);
            }

            setShowSettingsModal(true);
        } catch (error) {
            console.error('Error loading campaigns for settings:', error);
            toast.error('Erreur lors du chargement des campagnes');
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
                accountId: config.accountId,
                campaignIds: config.campaignIds,
                startDate: new Date(config.dateRange.start),
                endDate: new Date(config.dateRange.end),
                dateRangePreset: config.dateRange.preset,
            });

            // Update local state
            setReport({
                ...report,
                accountId: config.accountId,
                campaignIds: config.campaignIds,
                startDate: new Date(config.dateRange.start),
                endDate: new Date(config.dateRange.end),
            });

            // Update all widgets with new parameters
            setWidgets(widgets.map(w => ({
                ...w,
                accountId: config.accountId,
                campaignIds: config.campaignIds,
            })));

            setShowSettingsModal(false);
            toast.success('Paramètres mis à jour');

            // Reload the report to get fresh data
            await loadReport(report.id);
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Erreur lors de la mise à jour des paramètres');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSettingsAccountChange = async (accountId: string) => {
        setSettingsAccountId(accountId);
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
        }
    };

    const handleUpdatePassword = async (password: string | null) => {
        if (!report) return;

        try {
            await updateReportPassword(report.id, password);

            // Store password temporarily for email sharing
            setTempPassword(password || '');

            setReport({
                ...report,
                isPasswordProtected: password !== null,
                passwordHash: password ? 'updated' : undefined, // We don't store the actual hash in state
            });
            toast.success(
                password
                    ? 'Protection par mot de passe activée'
                    : 'Protection par mot de passe désactivée'
            );
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error('Erreur lors de la mise à jour du mot de passe');
            throw error;
        }
    };

    const handleOpenPreFlight = () => {
        console.log('🛫 Opening Pre-Flight Check');
        setShowPreFlightModal(true);
    };

    const handlePreFlightDownload = async () => {
        console.log('📥 Pre-Flight validated, proceeding with PDF download/share');
        // Close PreFlight modal
        setShowPreFlightModal(false);

        // TODO: Implement PDF generation (Story 3.2)
        // For now, we'll just trigger the email share
        await handleShareByEmail();
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
            const subject = `Rapport Google Ads - ${report.title}`;
            const body = `Bonjour,

Je vous partage le rapport d'analyse Google Ads suivant :

Rapport : ${report.title}
Période : ${formatDate(report.startDate)} - ${formatDate(report.endDate)}
${campaignNames.length > 0 ? `Campagnes analysées : ${campaignNames.join(', ')}` : ''}

Lien d'accès : ${window.location.origin}${report.shareUrl}
${report.isPasswordProtected && tempPassword ? `Mot de passe : ${tempPassword}` : report.isPasswordProtected ? `Ce rapport est protégé par mot de passe (mot de passe non disponible - veuillez le partager séparément)` : ''}

N'hésitez pas si vous avez des questions.

Cordialement,
${profile?.firstName || ''} ${profile?.lastName || ''}${profile?.company ? `\n${profile.company}` : ''}`;

            const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            console.log('📬 Opening mailto link:', mailtoLink.substring(0, 100) + '...');

            // Create a temporary link and click it (bypasses popup blockers)
            const link = document.createElement('a');
            link.href = mailtoLink;
            link.target = '_self';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Email pré-rempli ouvert !');
        } catch (error) {
            console.error('Error generating email:', error);
            toast.error('Erreur lors de la génération de l\'email');
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
                isSaving={isSaving}
                isLoadingSettings={isLoadingSettings}
                canPublish={widgets.length > 0}
            />

            <div className="report-editor-content">
                <WidgetLibrary
                    onAddWidget={handleAddWidget}
                    userId={currentUser.uid}
                    accountId={report.accountId}
                    selectedTheme={selectedTheme}
                    onThemeSelect={handleThemeSelect}
                    onCreateTheme={() => setShowThemeManager(true)}
                />

                <ReportCanvas
                    widgets={widgets}
                    design={report.design}
                    startDate={report.startDate}
                    endDate={report.endDate}
                    onReorder={handleWidgetReorder}
                    onWidgetUpdate={handleWidgetUpdate}
                    onWidgetDelete={handleWidgetDelete}
                    onWidgetDrop={(type) => handleAddWidget(type as WidgetType)}
                    selectedWidgetId={selectedWidgetId}
                    onWidgetSelect={setSelectedWidgetId}
                    reportId={report.id}
                />
            </div>

            {/* Theme Manager Modal */}
            {showThemeManager && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <ThemeManager accounts={accounts} />
                            <button
                                onClick={() => setShowThemeManager(false)}
                                className="mt-6 w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Fermer
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
                    initialConfig={{
                        title: report.title,
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
