import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Client, CreateClientInput, UpdateClientInput } from '../../types/client';
import { getMetaAdsAccountId } from '../../types/clientHelpers';
import type { ReportTemplate } from '../../types/templateTypes';
import type { ReportTheme } from '../../types/reportThemes';
import { Upload, Loader2, X, Building2, Mail, Palette, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useGoogleAds } from '../../contexts/GoogleAdsContext';
import { useMetaAds } from '../../contexts/MetaAdsContext';
import { listUserTemplates } from '../../services/templateService';
import themeService from '../../services/themeService';
import { getAuth } from 'firebase/auth';
import { useTutorial } from '../../contexts/TutorialContext';
import { EmailPresetEditor } from './EmailPresetEditor';
import { EMAIL_PRESET_KEYS } from '../../constants/emailDefaults';
import './ClientForm.css';
import { motion } from 'framer-motion';

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
    const [metaAdsId, setMetaAdsId] = useState(initialData ? (getMetaAdsAccountId(initialData) || '') : '');
    const [errors, setErrors] = useState<{ name?: string, email?: string, googleAdsId?: string }>({});
    const { accounts, isConnected } = useGoogleAds();
    const { accounts: metaAccounts, isConnected: isMetaConnected } = useMetaAds();
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
    // The keys contain tags like [client_name] which are resolved at send time, not here.
    const defaultSubject = t(EMAIL_PRESET_KEYS.SUBJECT_DEFAULT);
    const defaultBody = t(EMAIL_PRESET_KEYS.BODY_DEFAULT);

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

    // Update form state when initialData changes
    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setEmail(initialData.email || '');
            setGoogleAdsId(initialData.googleAdsCustomerId || '');
            setLogoPreview(initialData.logoUrl || null);
            setDefaultTemplateId(initialData.defaultTemplateId || '');
            setDefaultThemeId(initialData.defaultThemeId || '');
            setMetaAdsId(getMetaAdsAccountId(initialData) || '');
            // Only update email preset if it exists, otherwise define defaults logic if needed,
            // but usually we keep existing local state if user started typing?
            // Better to overwrite if initialData is late-arriving essentially "loading".
            if (initialData.emailPreset) {
                setEmailSubject(initialData.emailPreset.subject);
                setEmailBody(initialData.emailPreset.body);
            }
        }
    }, [initialData]);

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
            if (metaAdsId !== (getMetaAdsAccountId(initialData) || '')) updateData.metaAdsAccountId = metaAdsId || undefined;
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
                metaAdsAccountId: metaAdsId || undefined,
                logoFile: logoFile || undefined,
                defaultTemplateId: defaultTemplateId || undefined,
                defaultThemeId: defaultThemeId || undefined,
                emailPreset: {
                    subject: emailSubject,
                    body: emailBody
                }
            });
        }
        await refreshTutorial();
    };



    return (
        <form onSubmit={handleSubmit} className="client-form-container">
            {/* Reassurance Banner */}
            <div className="reassurance-banner">
                <ShieldCheck className="reassurance-banner-icon" />
                <div className="reassurance-banner-content">
                    <span className="reassurance-banner-text">{t('form.reassurance.banner')}</span>
                </div>
            </div>

            {/* Basic Information Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="client-form-section"
            >
                <div className="client-form-section-header">
                    <div className="flex flex-col gap-1">
                        <div className="client-form-section-title">
                            <div className="client-form-section-icon">
                                <Building2 />
                            </div>
                            {t('form.sections.basicInfo')}
                        </div>
                        <p className="client-form-section-description">
                            {t('form.sections.basicInfoDescription')}
                        </p>
                    </div>
                </div>

                {/* Logo Upload */}
                <div className="client-form-group">
                    <label htmlFor="logo" className="client-form-label">
                        {t('form.logo.label')}
                    </label>
                    <div className="client-form-logo-container">
                        <div className="client-form-logo-preview">
                            {logoPreview ? (
                                <>
                                    <img src={logoPreview} alt={t('form.logo.alt')} />
                                    <div className="client-form-logo-overlay">
                                        <span>{t('form.logo.change')}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="client-form-logo-placeholder">
                                    <Upload />
                                    <span>{t('form.logo.upload')}</span>
                                </div>
                            )}
                            <input
                                type="file"
                                id="logo"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="client-form-logo-input"
                                title={t('form.logo.change')}
                            />
                        </div>
                        <div className="client-form-logo-info">
                            <p className="client-form-helper">{t('form.logo.helper')}</p>
                            {logoPreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLogoFile(null);
                                        setLogoPreview(initialData?.logoUrl || null);
                                    }}
                                    className="client-form-logo-remove"
                                >
                                    {t('form.logo.remove')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Client Name */}
                <div className="client-form-group">
                    <label htmlFor="name" className="client-form-label">
                        {t('form.name.label')}
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`client-form-input ${errors.name ? 'error' : ''}`}
                        placeholder={t('form.name.placeholder')}
                    />
                    {errors.name && <p className="client-form-error">{errors.name}</p>}
                </div>

                {/* Google Ads Account */}
                <div className="client-form-group">
                    <label htmlFor="googleAdsId" className="client-form-label">
                        {t('form.googleAds.label')}
                    </label>
                    {!isConnected ? (
                        <div className="client-form-warning">
                            <p>{t('form.googleAds.noConnection')}</p>
                        </div>
                    ) : (
                        <select
                            id="googleAdsId"
                            value={googleAdsId}
                            onChange={(e) => setGoogleAdsId(e.target.value)}
                            className={`client-form-select ${errors.googleAdsId ? 'error' : ''}`}
                        >
                            <option value="">{t('form.googleAds.placeholder')}</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name} ({account.id})
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.googleAdsId && <p className="client-form-error">{errors.googleAdsId}</p>}
                    <p className="client-form-helper">{t('form.googleAds.helper')}</p>
                </div>

                {/* Meta Ads Account (Optional) */}
                <div className="client-form-group">
                    <label htmlFor="metaAdsId" className="client-form-label">
                        {t('dataSources.metaAds.label')}
                    </label>
                    {!isMetaConnected ? (
                        <div className="client-form-warning">
                            <p>{t('dataSources.metaAds.noConnection')}</p>
                        </div>
                    ) : (
                        <select
                            id="metaAdsId"
                            value={metaAdsId}
                            onChange={(e) => setMetaAdsId(e.target.value)}
                            className="client-form-select"
                        >
                            <option value="">{t('dataSources.metaAds.placeholder')}</option>
                            {metaAccounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name} ({account.id})
                                </option>
                            ))}
                        </select>
                    )}
                    <p className="client-form-helper">{t('dataSources.metaAds.helper')}</p>
                </div>

                {/* Email */}
                <div className="client-form-group">
                    <label htmlFor="email" className="client-form-label">
                        {t('form.email.label')}
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`client-form-input ${errors.email ? 'error' : ''}`}
                        placeholder={t('form.email.placeholder')}
                    />
                    {errors.email && <p className="client-form-error">{errors.email}</p>}
                </div>
            </motion.div>

            {/* Preset Configuration Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="client-form-section"
            >
                <div className="client-form-section-header">
                    <div className="flex flex-col gap-1">
                        <div className="client-form-section-title">
                            <div className="client-form-section-icon">
                                <Palette />
                            </div>
                            {t('form.presets.title')}
                        </div>
                        <p className="client-form-section-description">
                            {t('form.presets.description')}
                        </p>
                        {(!defaultTemplateId && !defaultThemeId) && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs rounded-lg border border-amber-100 dark:border-amber-800">
                                <AlertTriangle size={14} className="flex-shrink-0" />
                                <span>{t('form.presets.missingWarning', { defaultValue: 'Configurez au moins un modèle ou un thème pour que le compte soit "Prêt".' })}</span>
                            </div>
                        )}
                    </div>
                    {(defaultTemplateId || defaultThemeId) && (
                        <button
                            type="button"
                            onClick={handleClearPreset}
                            className="client-form-preset-clear"
                        >
                            <X />
                            {t('form.presets.clear')}
                        </button>
                    )}
                </div>

                <div className="client-form-group">
                    <label htmlFor="defaultTemplate" className="client-form-label">
                        {t('form.presets.template.label')}
                    </label>
                    <select
                        id="defaultTemplate"
                        value={defaultTemplateId}
                        onChange={(e) => setDefaultTemplateId(e.target.value)}
                        disabled={loadingPresets}
                        className="client-form-select"
                    >
                        <option value="">{t('form.presets.template.placeholder')} {defaultThemeId ? '' : '*'}</option>
                        {templates.map((template) => (
                            <option key={template.id} value={template.id}>
                                {template.name}
                            </option>
                        ))}
                    </select>
                    {!defaultTemplateId && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        {t('form.presets.template.recommended', { defaultValue: 'Recommandé pour la génération de rapports' })}
                    </p>}
                    {loadingPresets && <p className="client-form-helper">{t('loading')}...</p>}
                </div>

                <div className="client-form-group">
                    <label htmlFor="defaultTheme" className="client-form-label">
                        {t('form.presets.theme.label')}
                    </label>
                    <select
                        id="defaultTheme"
                        value={defaultThemeId}
                        onChange={(e) => setDefaultThemeId(e.target.value)}
                        disabled={loadingPresets}
                        className="client-form-select"
                    >
                        <option value="">{t('form.presets.theme.placeholder')}</option>
                        {themes.map((theme) => (
                            <option key={theme.id} value={theme.id}>
                                {theme.name}
                            </option>
                        ))}
                    </select>
                    {loadingPresets && <p className="client-form-helper">{t('loading')}...</p>}
                </div>
            </motion.div>

            {/* Email Configuration Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="client-form-section"
            >
                <div className="client-form-section-header">
                    <div className="flex flex-col gap-1">
                        <div className="client-form-section-title">
                            <div className="client-form-section-icon">
                                <Mail />
                            </div>
                            {t('form.emailConfig.title')}
                        </div>
                        <p className="client-form-section-description">
                            {t('form.emailConfig.description')}
                        </p>
                    </div>
                </div>
                <EmailPresetEditor
                    subject={emailSubject}
                    body={emailBody}
                    onSubjectChange={setEmailSubject}
                    onBodyChange={setEmailBody}
                    clientName={name}
                />
            </motion.div>

            {/* Form Footer */}
            <div className="client-form-footer">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="client-form-btn client-form-btn-secondary"
                >
                    {t('form.buttons.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="client-form-btn client-form-btn-primary"
                >
                    {isLoading && <Loader2 className="animate-spin" />}
                    {initialData ? t('form.buttons.update') : t('form.buttons.create')}
                </button>
            </div>
        </form >
    );
};
