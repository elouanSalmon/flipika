import React, { useState, useEffect } from 'react';
import type { Client, CreateClientInput, UpdateClientInput } from '../../types/client';
import type { ReportTemplate } from '../../types/templateTypes';
import type { ReportTheme } from '../../types/reportThemes';
import { Upload, Loader2, Settings, X } from 'lucide-react';
import { useGoogleAds } from '../../contexts/GoogleAdsContext';
import { listUserTemplates } from '../../services/templateService';
import themeService from '../../services/themeService';
import { getAuth } from 'firebase/auth';

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
    const [name, setName] = useState(initialData?.name || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [googleAdsId, setGoogleAdsId] = useState(initialData?.googleAdsCustomerId || '');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logoUrl || null);
    const [errors, setErrors] = useState<{ name?: string, email?: string, googleAdsId?: string }>({});
    const { accounts, isConnected } = useGoogleAds();

    // Preset configuration state
    const [defaultTemplateId, setDefaultTemplateId] = useState<string>(initialData?.defaultTemplateId || '');
    const [defaultThemeId, setDefaultThemeId] = useState<string>(initialData?.defaultThemeId || '');
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [themes, setThemes] = useState<ReportTheme[]>([]);
    const [loadingPresets, setLoadingPresets] = useState(false);

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
        if (!name.trim()) newErrors.name = "Le nom est requis";
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Format d'email invalide";
        }
        // Google Ads ID validation (10 digits, optional dashes)
        const cleanId = googleAdsId.replace(/\D/g, '');
        if (!cleanId) {
            newErrors.googleAdsId = "L'ID Google Ads est requis";
        } else if (cleanId.length !== 10) {
            newErrors.googleAdsId = "L'ID doit contenir 10 chiffres";
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

            await onSubmit(updateData);
        } else {
            await onSubmit({
                name,
                email,
                googleAdsCustomerId: cleanAdsId,
                logoFile: logoFile || undefined
            });
        }
    };



    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo
                </label>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden relative group">
                        {logoPreview ? (
                            <>
                                <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-white text-xs">Modifier</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-2">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                <span className="text-xs text-gray-500">Ajouter</span>
                            </div>
                        )}
                        <input
                            type="file"
                            id="logo"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            title="Changer le logo"
                        />
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>PNG, JPG ou SVG recommandés</p>
                        <p>Max. 2 Mo</p>
                        {logoPreview && (
                            <button
                                type="button"
                                onClick={() => {
                                    setLogoFile(null);
                                    setLogoPreview(initialData?.logoUrl || null);
                                }}
                                className="text-red-500 hover:text-red-700 text-xs mt-2 underline"
                            >
                                Supprimer / Réinitialiser
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom du client *
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
                    placeholder="Ex: Acme Corp"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
                <label htmlFor="googleAdsId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Compte Google Ads *
                </label>
                {!isConnected ? (
                    <div className="p-3 mb-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            Vous devez connecter votre compte Google Ads pour sélectionner un client.
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
                        <option value="">Sélectionner un compte</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name} ({account.id})
                            </option>
                        ))}
                    </select>
                )}
                {errors.googleAdsId && <p className="mt-1 text-sm text-red-600">{errors.googleAdsId}</p>}
                <p className="mt-1 text-xs text-gray-500">
                    Sélectionnez le compte Google Ads à associer à ce client.
                </p>
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email de contact
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
                    placeholder="contact@acme.com"
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
                                Paramètres par défaut des rapports
                            </h3>
                        </div>
                        {(defaultTemplateId || defaultThemeId) && (
                            <button
                                type="button"
                                onClick={handleClearPreset}
                                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
                            >
                                <X className="w-3 h-3" />
                                Effacer
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                        Configurez les paramètres par défaut pour la génération de rapports de ce client.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="defaultTemplate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Template par défaut
                            </label>
                            <select
                                id="defaultTemplate"
                                value={defaultTemplateId}
                                onChange={(e) => setDefaultTemplateId(e.target.value)}
                                disabled={loadingPresets}
                                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">Aucun template par défaut</option>
                                {templates.map((template) => (
                                    <option key={template.id} value={template.id}>
                                        {template.name}
                                    </option>
                                ))}
                            </select>
                            {loadingPresets && <p className="mt-1 text-xs text-gray-500">Chargement des templates...</p>}
                        </div>

                        <div>
                            <label htmlFor="defaultTheme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Thème par défaut
                            </label>
                            <select
                                id="defaultTheme"
                                value={defaultThemeId}
                                onChange={(e) => setDefaultThemeId(e.target.value)}
                                disabled={loadingPresets}
                                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">Aucun thème par défaut</option>
                                {themes.map((theme) => (
                                    <option key={theme.id} value={theme.id}>
                                        {theme.name}
                                    </option>
                                ))}
                            </select>
                            {loadingPresets && <p className="mt-1 text-xs text-gray-500">Chargement des thèmes...</p>}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {initialData ? 'Enregistrer' : 'Créer le client'}
                </button>
            </div>
        </form>
    );
};
