import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { TiptapReportEditor } from '../components/editor';
import {
    getTemplate,
    updateTemplate,
    saveTemplateContent,
} from '../services/templateService';
import dataService from '../services/dataService';
import { fetchCampaigns } from '../services/googleAds';
import type { ReportTemplate } from '../types/templateTypes';
import type { ReportDesign } from '../types/reportTypes';
import type { Account, Campaign } from '../types/business';
import type { Client } from '../types/client';
import { clientService } from '../services/clientService';
import { Save, ArrowLeft, Settings, Palette, LayoutTemplate } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import AutoSaveIndicator from '../components/reports/AutoSaveIndicator';
import { ThemeSelector } from '../components/editor/ThemeSelector';
import TemplateConfigModal, { type TemplateConfig } from '../components/templates/TemplateConfigModal';
import themeService from '../services/themeService';
import { defaultReportDesign } from '../types/reportTypes';
import ReportScopeHeader from '../components/reports/ReportScopeHeader';
import '../components/reports/ReportEditorHeader.css';

/**
 * Tiptap Template Editor Page
 *
 * Full-page slide editor for templates using the new Tiptap editor.
 */
const TiptapTemplateEditorPage: React.FC = () => {
    const { t } = useTranslation('templates');
    const navigate = useNavigate();
    const { id: templateId } = useParams<{ id: string }>();
    const { currentUser } = useAuth();

    const [template, setTemplate] = useState<ReportTemplate | null>(null);
    const [name, setName] = useState('');
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

    // Client for context
    const [client, setClient] = useState<Client | null>(null);

    const autoSaveTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (templateId && currentUser) {
            loadTemplate(templateId);
        } else if (!templateId) {
            navigate('/app/templates');
        }
    }, [templateId, currentUser, navigate]);

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
        if (template?.accountId) {
            const loadScopeCampaigns = async () => {
                try {
                    const response = await fetchCampaigns(template.accountId);
                    if (response.success && response.campaigns) {
                        setScopeCampaigns(Array.isArray(response.campaigns) ? response.campaigns : []);
                    }
                } catch (error) {
                    console.error('Error loading scope campaigns:', error);
                }
            };
            loadScopeCampaigns();
        }
    }, [template?.accountId]);

    useEffect(() => {
        if (isDirty && template && currentUser) {
            if (autoSaveTimerRef.current) {
                window.clearTimeout(autoSaveTimerRef.current);
            }
            autoSaveTimerRef.current = window.setTimeout(() => {
                handleAutoSave();
            }, 5000);
        }
        return () => {
            if (autoSaveTimerRef.current) {
                window.clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [isDirty, template, currentUser]);

    const loadTemplate = async (id: string) => {
        try {
            setIsLoading(true);
            const result = await getTemplate(id);
            if (result) {
                if (result.userId !== currentUser?.uid) {
                    toast.error(t('editor.unauthorized'));
                    navigate('/app/templates');
                    return;
                }

                // Initialize design if missing or load from client theme
                let design = result.design || defaultReportDesign;

                // Load client and its theme if linked
                if (result.clientId && currentUser) {
                    try {
                        const clients = await clientService.getClients(currentUser.uid);
                        const linkedClient = clients.find(c => c.id === result.clientId);
                        if (linkedClient) {
                            setClient(linkedClient);

                            // Load client's theme
                            const clientTheme = await themeService.getThemeForClient(currentUser.uid, result.clientId);
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

                setTemplate({ ...result, design });
                setName(result.name);
                setEditorContent(result.content || null);
                setLastSaved(result.updatedAt);
            } else {
                toast.error(t('editor.notFound'));
                navigate('/app/templates');
            }
        } catch (error) {
            console.error('Error loading template:', error);
            toast.error(t('editor.loadError'));
            navigate('/app/templates');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoSave = useCallback(async () => {
        if (!template || !currentUser) return;
        try {
            setAutoSaveStatus('saving');
            await saveTemplateContent(template.id, {
                name: name,
                design: template.design
            }, editorContent as any);
            setLastSaved(new Date());
            setIsDirty(false);
            setAutoSaveStatus('saved');
        } catch (error) {
            console.error('Auto-save error:', error);
            setAutoSaveStatus('error');
        }
    }, [template, currentUser, editorContent, name]);

    const handleSave = async () => {
        if (!template || !currentUser) return;
        try {
            setIsSaving(true);
            setAutoSaveStatus('saving');
            await saveTemplateContent(template.id, {
                name: name,
                design: template.design
            }, (editorContent || {}) as any);
            setLastSaved(new Date());
            setIsDirty(false);
            setAutoSaveStatus('saved');
            toast.success(t('editor.messages.saved'));
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error(t('editor.messages.saveError'));
            setAutoSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleNameChange = (newName: string) => {
        setName(newName);
        setIsDirty(true);
    };

    const handleEditorChange = (newContent: unknown) => {
        if (!template) return;
        setEditorContent(newContent);
        setIsDirty(true);
    };

    const handleDesignChange = (newDesign: ReportDesign) => {
        if (!template) return;
        setTemplate({ ...template, design: newDesign });
        setIsDirty(true);
    };

    const handleBack = () => {
        navigate('/app/templates');
    };

    const handleOpenSettings = async () => {
        if (!template) return;

        try {
            setIsLoadingSettings(true);
            setShowSettingsModal(true);
            setSettingsAccountId(template.accountId || '');

            if (template.accountId) {
                const response = await fetchCampaigns(template.accountId);
                if (response.success && response.campaigns) {
                    setSettingsCampaigns(Array.isArray(response.campaigns) ? response.campaigns : []);
                } else {
                    setSettingsCampaigns([]);
                }
            }
        } catch (error) {
            console.error('Error loading campaigns for settings:', error);
            toast.error(t('editor.messages.campaignsLoadError'));
        } finally {
            setIsLoadingSettings(false);
        }
    };

    const handleUpdateSettings = async (config: TemplateConfig) => {
        if (!template) return;

        try {
            setIsSaving(true);

            await updateTemplate(template.id, {
                name: config.name,
                description: config.description,
                clientId: config.clientId,
                clientName: config.clientName,
                accountId: config.accountId,
                accountName: config.accountName,
                campaignIds: config.campaignIds,
                campaignNames: config.campaignNames,
                periodPreset: config.periodPreset,
            });

            // Update local state
            setTemplate({
                ...template,
                name: config.name,
                description: config.description,
                clientId: config.clientId,
                clientName: config.clientName,
                accountId: config.accountId,
                accountName: config.accountName,
                campaignIds: config.campaignIds,
                campaignNames: config.campaignNames,
                periodPreset: config.periodPreset,
            });
            setName(config.name);

            // Reload client if changed
            if (config.clientId && currentUser) {
                try {
                    const clients = await clientService.getClients(currentUser.uid);
                    const linkedClient = clients.find(c => c.id === config.clientId);
                    if (linkedClient) {
                        setClient(linkedClient);
                    }
                } catch (err) {
                    console.error('Error loading client:', err);
                }
            } else {
                setClient(null);
            }

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[var(--color-bg-secondary)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!template) {
        return null;
    }

    return (
        <div className={`tiptap-page-layout ${template ? 'with-scope-header' : ''}`}>
            {/* Fixed Header Bar */}
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
                        title={t('editor.backToTemplates')}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    {/* Editable Name */}
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="tiptap-title-input"
                        placeholder={t('editor.namePlaceholder')}
                    />

                    {/* Auto-save indicator */}
                    <AutoSaveIndicator status={autoSaveStatus} lastSaved={lastSaved} />

                    {/* Template badge */}
                    <span className="status-badge neutral">
                        <LayoutTemplate size={14} />
                        Template
                    </span>
                </div>

                <div className="tiptap-header-right">
                    {/* Theme Toggle for Flipika UI */}
                    <ThemeToggle />

                    {/* Save button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || autoSaveStatus === 'saving'}
                        className="tiptap-header-btn auto-width text-sm"
                        title={t('editor.save')}
                    >
                        <Save size={16} />
                        {t('editor.save')}
                    </button>
                </div>
            </header>

            {/* Editor with Sidebar */}
            <main className="tiptap-page-main relative">
                <TiptapReportEditor
                    content={editorContent}
                    onChange={handleEditorChange}
                    design={template.design as ReportDesign}
                    accountId={template.accountId || ''}
                    campaignIds={template.campaignIds || []}
                    reportId={template.id}
                    clientId={template.clientId}
                    client={client}
                    userId={template.userId}
                    isTemplateMode={true}
                    onOpenSettings={handleOpenSettings}
                />
            </main>

            {template && (
                <ReportScopeHeader
                    client={client}
                    campaignIds={template.campaignIds || []}
                    scopeCampaigns={scopeCampaigns}
                    onOpenSettings={handleOpenSettings}
                    isTemplateMode={true}
                    periodPreset={template.periodPreset}
                >
                    {/* Design/Theme Button for Template Slides */}
                    <div className="theme-selector-wrapper relative">
                        <button
                            className={`tiptap-header-btn auto-width text-sm ${showThemeSelector ? 'active' : ''}`}
                            title="Theme du Template"
                            onClick={() => setShowThemeSelector(!showThemeSelector)}
                            style={showThemeSelector ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : {}}
                        >
                            <Palette size={16} />
                            <span>Thèmes</span>
                        </button>
                        <ThemeSelector
                            design={template.design as ReportDesign}
                            onChange={handleDesignChange}
                            isOpen={showThemeSelector}
                            onClose={() => setShowThemeSelector(false)}
                        />
                    </div>

                    {/* Settings button */}
                    <button
                        onClick={handleOpenSettings}
                        disabled={isLoadingSettings}
                        className="tiptap-header-btn auto-width text-sm"
                        title={t('editor.settings')}
                    >
                        {isLoadingSettings ? (
                            <svg className="animate-spin h-[16px] w-[16px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <Settings size={16} />
                        )}
                        <span>Périmètre</span>
                    </button>
                </ReportScopeHeader>
            )}

            {/* Settings Modal */}
            {template && showSettingsModal && (
                <TemplateConfigModal
                    onClose={() => setShowSettingsModal(false)}
                    onSubmit={handleUpdateSettings}
                    accounts={accounts.map(acc => ({ id: acc.id, name: acc.name }))}
                    selectedAccountId={settingsAccountId}
                    onAccountChange={handleSettingsAccountChange}
                    campaigns={settingsCampaigns}
                    isEditMode={true}
                    isSubmitting={isSaving}
                    initialConfig={{
                        name: template.name,
                        description: template.description,
                        clientId: template.clientId,
                        clientName: template.clientName,
                        accountId: template.accountId,
                        accountName: template.accountName,
                        campaignIds: template.campaignIds || [],
                        campaignNames: template.campaignNames,
                        periodPreset: template.periodPreset,
                        slideConfigs: [],
                    }}
                />
            )}
        </div>
    );
};

export default TiptapTemplateEditorPage;
