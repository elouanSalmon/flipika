import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Client, CreateClientInput, UpdateClientInput } from '../../types/client';
import type { ReportTemplate } from '../../types/templateTypes';
import type { ReportTheme } from '../../types/reportThemes';
import { Upload, Loader2, Settings, X, Mail } from 'lucide-react';
import { useGoogleAds } from '../../contexts/GoogleAdsContext';
import { listUserTemplates } from '../../services/templateService';
import themeService from '../../services/themeService';
import { getAuth } from 'firebase/auth';
import { useTutorial } from '../../contexts/TutorialContext';

interface ClientFormProps {
    initialData?: Client;
    onSubmit: (data: CreateClientInput | UpdateClientInput) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading
}) => {
    const { t } = useTranslation('clients');
    const [name, setName] = useState(initialData?.name || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [googleAdsId, setGoogleAdsId] = useState(initialData?.googleAdsCustomerId || '');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl || null);
    const [errors, setErrors] = useState<{ name?: string, email?: string, googleAdsId?: string }>({});
    const { accounts, isConnected } = useGoogleAds();
    const { refresh: refreshTutorial } = useTutorial();

    // Preset configuration state
    const [defaultTemplateId, setDefaultTemplateId] = useState<string>(initialData?.defaultTemplateId || '');
    const [defaultThemeId, setDefaultThemeId] = useState<string>(initialData?.defaultThemeId || '');
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [themes, setThemes] = useState<ReportTheme[]>([]);
    const [loadingPresets, setLoadingPresets] = useState(false);

    // Email Config State
    // We use a useEffect to update these validation-dependent defaults if needed, 
    // but simple initialization is usually enough. 
    // However, for "Report for {{clientName}}", we might want it to update if name changes?
    // Let's keep it simple: Initialize with current name or placeholder.
    const defaultSubject = t('form.emailConfig.subject.default', { clientName: initialData?.name || '' });
    const defaultBody = t('form.emailConfig.body.default');

    const [emailSubject, setEmailSubject] = useState(initialData?.emailPreset?.subject || defaultSubject);
    const [emailBody, setEmailBody] = useState(initialData?.emailPreset?.body || defaultBody);

    useEffect(() => {
        // Cleanup preview URL if it was created locally
        return () => {
            if (logoPreview && !logoPreview.startsWith('http') && !initialData?.logoUrl) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview, initialData]);

    // Load templates and themes for preset configuration
    useEffect(() => {
        const loadPresetsData = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            setLoadingPresets(true);
            try {
                const [templatesData, themesData] = await Promise.all([
                    listUserTemplates(user.uid),
                    themeService.getUserThemes(user.uid)
                ]);
                setTemplates(templatesData);
                setThemes(themesData);
            } catch (error) {
                console.error('Error loading preset data:', error);
            } finally {
                setLoadingPresets(false);
            }
        };

        loadPresetsData();
    }, []);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const validate = () => {
        const newErrors: { name?: string, email?: string, googleAdsId?: string } = {};
        if (!name.trim()) newErrors.name = t('form.name.error');
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = t('form.email.error');
        }
        // Google Ads ID validation (10 digits, optional dashes)
        const cleanId = googleAdsId.replace(/\D/g, '');
        if (!cleanId) {
            newErrors.googleAdsId = t('form.googleAds.error.required');
        } else if (cleanId.length !== 10) {
            newErrors.googleAdsId = t('form.googleAds.error.format');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClearPreset = () => {
        setDefaultTemplateId('');
        setDefaultThemeId('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        // Clean ID format (e.g., 123-456-7890 -> 1234567890)
        const cleanAdsId = googleAdsId.replace(/\D/g, '');

        if (initialData) {
            const updateData: UpdateClientInput = {};
            if (name !== initialData.name) updateData.name = name;
            if (email !== initialData.email) updateData.email = email;
            if (cleanAdsId !== initialData.googleAdsCustomerId) updateData.googleAdsCustomerId = cleanAdsId;
            if (logoFile) updateData.logoFile = logoFile;

            // Handle preset changes
            if (defaultTemplateId !== (initialData.defaultTemplateId || '')) {
                updateData.defaultTemplateId = defaultTemplateId || undefined;
            }
            if (defaultThemeId !== (initialData.defaultThemeId || '')) {
                updateData.defaultThemeId = defaultThemeId || undefined;
            }

            // Handle email preset changes
            // We save if it's different from initial or if we're establishing a default where none existed
            if (
                emailSubject !== (initialData.emailPreset?.subject) ||
                emailBody !== (initialData.emailPreset?.body)
            ) {
                updateData.emailPreset = {
                    subject: emailSubject,
                    body: emailBody
                };
            }

            await onSubmit(updateData);
        } else {
            await onSubmit({
                name,
                email,
                googleAdsCustomerId: cleanAdsId,
                googleAdsCustomerId: cleanAdsId,
                logoFile: logoFile || undefined,
                emailPreset: {
                    subject: emailSubject,
                    body: emailBody
                }
            });
        }
        await refreshTutorial();
    };



    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('form.logo.label')}
                </label>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden relative group">
                        {logoPreview ? (
                            <>
                                <img src={logoPreview} alt={t('form.logo.alt')} className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-white text-xs">{t('form.logo.change')}</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-2">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-500">{t('form.logo.upload')}</span>
                            </div>
                        )}
                        <input
                            type="file"
                            id="logo"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            title={t('form.logo.change')}
                        />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>{t('form.logo.helper')}</p>
                        {logoPreview && (
                            <button
                                type="button"
                                onClick={() => {
                                    setLogoFile(null);
                                    setLogoPreview(initialData?.logoUrl || null);
                                }}
                                className="text-red-500 hover:text-red-700 text-xs mt-2 underline"
                            >
                                {t('form.logo.remove')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('form.name.label')}
                </label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`
            block w-full rounded-md border shadow-sm px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 sm:text-sm
            ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
          `}
                    placeholder={t('form.name.placeholder')}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
                <label htmlFor="googleAdsId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('form.googleAds.label')}
                </label>
                {!isConnected ? (
                    <div className="p-3 mb-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            {t('form.googleAds.noConnection')}
                        </p>
                    </div>
                ) : (
                    <select
                        id="googleAdsId"
                        value={googleAdsId}
                        onChange={(e) => setGoogleAdsId(e.target.value)}
                        className={`
                            block w-full rounded-md border shadow-sm px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                            ${errors.googleAdsId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
                        `}
                    >
                        <option value="">{t('form.googleAds.placeholder')}</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name} ({account.id})
                            </option>
                        ))}
                    </select>
                )}
                {errors.googleAdsId && <p className="mt-1 text-sm text-red-600">{errors.googleAdsId}</p>}
                <p className="mt-1 text-xs text-gray-500">
                    {t('form.googleAds.helper')}
                </p>
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('form.email.label')}
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`
            block w-full rounded-md border shadow-sm px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 sm:text-sm
            ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
          `}
                    placeholder={t('form.email.placeholder')}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Preset Configuration Section */}
            {initialData && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-gray-500" />
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                {t('form.presets.title')}
                            </h3>
                        </div>
                        {(defaultTemplateId || defaultThemeId) && (
                            <button
                                type="button"
                                onClick={handleClearPreset}
                                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
                            >
                                <X className="w-3 h-3" />
                                {t('form.presets.clear')}
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        {t('form.presets.description')}
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="defaultTemplate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('form.presets.template.label')}
                            </label>
                            <select
                                id="defaultTemplate"
                                value={defaultTemplateId}
                                onChange={(e) => setDefaultTemplateId(e.target.value)}
                                disabled={loadingPresets}
                                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">{t('form.presets.template.placeholder')}</option>
                                {templates.map((template) => (
                                    <option key={template.id} value={template.id}>
                                        {template.name}
                                    </option>
                                ))}
                            </select>
                            {loadingPresets && <p className="mt-1 text-xs text-gray-500">{t('common:loading')}...</p>}
                        </div>

                        <div>
                            <label htmlFor="defaultTheme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('form.presets.theme.label')}
                            </label>
                            <select
                                id="defaultTheme"
                                value={defaultThemeId}
                                onChange={(e) => setDefaultThemeId(e.target.value)}
                                disabled={loadingPresets}
                                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">{t('form.presets.theme.placeholder')}</option>
                                {themes.map((theme) => (
                                    <option key={theme.id} value={theme.id}>
                                        {theme.name}
                                    </option>
                                ))}
                            </select>
                            {loadingPresets && <p className="mt-1 text-xs text-gray-500">{t('common:loading')}...</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Email Configuration Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('form.emailConfig.title')}
                    </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {t('form.emailConfig.description')}
                </p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('form.emailConfig.subject.label')}
                        </label>
                        <input
                            type="text"
                            id="emailSubject"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder={t('form.emailConfig.subject.placeholder', { clientName: name || 'Client' })}
                        />
                    </div>

                    <div>
                        <label htmlFor="emailBody" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {t('form.emailConfig.body.label')}
                        </label>
                        <textarea
                            id="emailBody"
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            rows={6}
                            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder={t('form.emailConfig.body.placeholder')}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                    {t('form.buttons.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {initialData ? t('form.buttons.update') : t('form.buttons.create')}
                </button>
            </div>
        </form>
    );
};
