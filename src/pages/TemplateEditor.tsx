import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
    getTemplateWithSlides,
    saveTemplateWithSlides,
    updateTemplate,
} from '../services/templateService';
import dataService from '../services/dataService';
import { fetchCampaigns } from '../services/googleAds';
import TemplateEditorHeader from '../components/templates/TemplateEditorHeader';
import SlideLibrary from '../components/reports/SlideLibrary';
import ReportCanvas from '../components/reports/ReportCanvas';
import ThemeManager from '../components/themes/ThemeManager';
import TemplateConfigModal, { type TemplateConfig } from '../components/templates/TemplateConfigModal';
import Spinner from '../components/common/Spinner';
import type { ReportTemplate, TemplateSlideConfig } from '../types/templateTypes';
import { SlideType, defaultReportDesign, type SlideConfig } from '../types/reportTypes';
import type { ReportTheme } from '../types/reportThemes';
import type { Account, Campaign } from '../types/business';
import type { Client } from '../types/client';
import { clientService } from '../services/clientService';
import './ReportEditor.css';

const TemplateEditor: React.FC = () => {
    const { t } = useTranslation('templates');
    const navigate = useNavigate();
    const { id: templateId } = useParams<{ id: string }>();
    const { currentUser } = useAuth();

    // Template state
    const [template, setTemplate] = useState<ReportTemplate | null>(null);
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

    const autoSaveTimerRef = useRef<number | null>(null);

    // Note: Demo mode should be enabled for templates
    // This is handled by the slide rendering components automatically

    // Load template
    useEffect(() => {
        if (templateId && currentUser) {
            loadTemplate(templateId);
        } else if (!templateId) {
            navigate('/app/templates');
        }
    }, [templateId, currentUser]);

    // Auto-save effect
    useEffect(() => {
        if (isDirty && template && currentUser) {
            if (autoSaveTimerRef.current) {
                window.clearTimeout(autoSaveTimerRef.current);
            }

            autoSaveTimerRef.current = window.setTimeout(() => {
                handleAutoSave();
            }, 30000);
        }

        return () => {
            if (autoSaveTimerRef.current) {
                window.clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [isDirty, template, slides]);

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

    const loadTemplate = async (id: string) => {
        try {
            setIsLoading(true);
            const result = await getTemplateWithSlides(id);

            if (!result) {
                toast.error(t('editor.notFound'));
                navigate('/app/templates');
                return;
            }

            if (result.template.userId !== currentUser?.uid) {
                toast.error(t('editor.unauthorized'));
                navigate('/app/templates');
                return;
            }

            setTemplate(result.template);

            // Convert TemplateSlideConfig to SlideConfig
            const convertedSlides: SlideConfig[] = result.slides.map((slide, index) => ({
                id: `slide-${Date.now()}-${index}`,
                type: slide.type,
                accountId: result.template.accountId || '',
                campaignIds: result.template.campaignIds || [],
                order: slide.order,
                settings: slide.settings || {},
                createdAt: new Date(),
                updatedAt: new Date(),
            }));

            setSlides(convertedSlides);
            setLastSaved(result.template.updatedAt);
        } catch (error) {
            console.error('Error loading template:', error);
            toast.error(t('editor.loadError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAutoSave = useCallback(async () => {
        if (!template || !currentUser) return;

        try {
            setAutoSaveStatus('saving');

            // Convert SlideConfig back to TemplateSlideConfig
            const templateSlides: TemplateSlideConfig[] = slides.map(slide => ({
                type: slide.type,
                order: slide.order,
                settings: slide.settings,
            }));

            await saveTemplateWithSlides(template.id, {
                name: template.name,
                design: template.design,
            }, templateSlides);

            setAutoSaveStatus('saved');
            setLastSaved(new Date());
            setIsDirty(false);
        } catch (error) {
            console.error('Auto-save error:', error);
            setAutoSaveStatus('error');
        }
    }, [template, slides, currentUser]);

    const handleSave = async () => {
        if (!template || !currentUser) return;

        try {
            setIsSaving(true);

            // Convert SlideConfig back to TemplateSlideConfig
            const templateSlides: TemplateSlideConfig[] = slides.map(slide => ({
                type: slide.type,
                order: slide.order,
                settings: slide.settings,
            }));

            await saveTemplateWithSlides(template.id, {
                name: template.name,
                design: template.design,
            }, templateSlides);

            setLastSaved(new Date());
            setIsDirty(false);
            toast.success(t('editor.messages.saved'));
        } catch (error) {
            console.error('Save error:', error);
            toast.error(t('editor.messages.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleNameChange = (name: string) => {
        if (!template) return;
        setTemplate({ ...template, name });
        setIsDirty(true);
    };

    const handleThemeSelect = (theme: ReportTheme | null) => {
        if (!template) return;
        setSelectedTheme(theme);
        if (theme) {
            setTemplate({ ...template, design: theme.design });
            setIsDirty(true);
        }
    };

    const handleAddSlide = (type: SlideType) => {
        if (!template) return;

        const newSlide: SlideConfig = {
            id: `slide-${Date.now()}`,
            type,
            accountId: template.accountId || '',
            campaignIds: template.campaignIds || [],
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
                accountName: accounts.find(a => a.id === config.accountId)?.name,
                campaignIds: config.campaignIds,
                campaignNames: config.campaignNames,
                periodPreset: config.periodPreset,
            });

            // Update all slides with new parameters
            setSlides(slides.map(w => ({
                ...w,
                accountId: config.accountId || '',
                campaignIds: config.campaignIds,
            })));

            setShowSettingsModal(false);
            toast.success(t('editor.messages.settingsUpdated'));

            // Reload the template to get fresh data
            await loadTemplate(template.id);
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
            <div className="report-editor loading">
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <Spinner size={48} />
                </div>
            </div>
        );
    }

    if (!template || !currentUser) {
        return null;
    }

    return (
        <div className="report-editor">
            <TemplateEditorHeader
                name={template.name}
                onNameChange={handleNameChange}
                autoSaveStatus={autoSaveStatus}
                lastSaved={lastSaved}
                onSave={handleSave}
                onOpenSettings={handleOpenSettings}
                isSaving={isSaving}
                isLoadingSettings={isLoadingSettings}
            />

            <div className="report-editor-content">
                <SlideLibrary
                    onAddSlide={handleAddSlide}
                    userId={currentUser?.uid}
                    clientId={template?.clientId}
                    selectedTheme={selectedTheme}
                    onThemeSelect={handleThemeSelect}
                    onCreateTheme={() => setShowThemeManager(true)}
                />

                <ReportCanvas
                    slides={slides}
                    design={{ ...defaultReportDesign, ...template.design }}
                    startDate={new Date()}
                    endDate={new Date()}
                    onReorder={handleSlideReorder}
                    onSlideUpdate={handleSlideUpdate}
                    onSlideDelete={handleSlideDelete}
                    onSlideDrop={(type) => handleAddSlide(type as SlideType)}
                    selectedSlideId={selectedSlideId}
                    onSlideSelect={setSelectedSlideId}
                    reportId={template.id}
                    reportAccountId={template.accountId || ''}
                    reportCampaignIds={template.campaignIds || []}
                />
            </div>

            {/* Theme Manager Modal */}
            {showThemeManager && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white dark:bg-black rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <ThemeManager clients={clients} />
                            <button
                                onClick={() => setShowThemeManager(false)}
                                className="mt-6 w-full px-4 py-3 bg-neutral-200 dark:bg-black text-neutral-900 dark:text-neutral-200 rounded-xl font-medium hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                            >
                                {t('editor.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettingsModal && template && (
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
                        campaignIds: template.campaignIds || [],
                        campaignNames: template.campaignNames,
                        periodPreset: template.periodPreset,
                        slideConfigs: [], // Not used in settings modal
                    }}
                />
            )}
        </div>
    );
};

export default TemplateEditor;
