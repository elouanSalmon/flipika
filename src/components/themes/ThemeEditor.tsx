import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { HexColorPicker } from 'react-colorful';
import themeService from '../../services/themeService';
import { getAllThemePresets } from '../../data/defaultThemes';
import type { ReportTheme, ThemePreset, CreateThemeDTO } from '../../types/reportThemes';
import type { Account } from '../../types/business';
import ThemePreview from './ThemePreview';
import './ThemeEditor.css';

interface ThemeEditorProps {
    userId: string;
    theme?: ReportTheme | null;
    accounts?: Account[];
    onSave: (theme: ReportTheme) => void;
    onClose: () => void;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({
    userId,
    theme,
    accounts = [],
    onSave,
    onClose,
}) => {
    const presets = getAllThemePresets();
    const defaultDesign = presets[0]?.design || {
        mode: 'light' as const,
        colorScheme: {
            primary: '#3b82f6',
            secondary: '#1e40af',
            accent: '#60a5fa',
            background: '#ffffff',
            text: '#1f2937',
        },
        typography: {
            fontFamily: 'Inter, sans-serif',
            headingFontFamily: 'Inter, sans-serif',
            fontSize: 16,
            lineHeight: 1.6,
        },
        layout: {
            margins: 40,
            spacing: 24,
            maxWidth: 800,
        },
    };

    const [name, setName] = useState(theme?.name || '');
    const [description, setDescription] = useState(theme?.description || '');
    const [design, setDesign] = useState(theme?.design || defaultDesign);
    const [linkedAccountIds, setLinkedAccountIds] = useState<string[]>(theme?.linkedAccountIds || []);
    const [isDefault, setIsDefault] = useState(theme?.isDefault || false);
    const [saving, setSaving] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

    const handleApplyPreset = (preset: ThemePreset) => {
        setDesign(preset.design);
        if (!name) {
            setName(preset.name);
        }
        toast.success(`Thème "${preset.name}" appliqué`);
    };

    const toggleAccountLink = (accountId: string) => {
        setLinkedAccountIds(prev =>
            prev.includes(accountId)
                ? prev.filter(id => id !== accountId)
                : [...prev, accountId]
        );
    };

    const handleModeChange = (mode: 'light' | 'dark') => {
        // Enforce background color constraints based on mode
        let newBackground = design.colorScheme.background;
        let newText = design.colorScheme.text;

        if (mode === 'light') {
            // Light mode: background must be light (high luminance)
            // If current background is dark, switch to white
            if (isColorDark(design.colorScheme.background)) {
                newBackground = '#ffffff';
            }
            // Ensure text is dark for readability
            if (!isColorDark(design.colorScheme.text)) {
                newText = '#0f172a';
            }
        } else {
            // Dark mode: background must be dark (low luminance)
            // If current background is light, switch to dark
            if (!isColorDark(design.colorScheme.background)) {
                newBackground = '#0f172a';
            }
            // Ensure text is light for readability
            if (isColorDark(design.colorScheme.text)) {
                newText = '#f1f5f9';
            }
        }

        setDesign({
            ...design,
            mode,
            colorScheme: {
                ...design.colorScheme,
                background: newBackground,
                text: newText,
            },
        });
    };

    // Helper function to determine if a color is dark
    const isColorDark = (hexColor: string): boolean => {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        // Calculate relative luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5;
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Veuillez entrer un nom pour le thème');
            return;
        }

        setSaving(true);
        try {
            if (theme?.id) {
                await themeService.updateTheme(theme.id, {
                    name,
                    description,
                    design,
                    linkedAccountIds,
                    isDefault,
                });

                const updatedTheme = await themeService.getTheme(theme.id);
                if (updatedTheme) {
                    onSave(updatedTheme);
                    toast.success('Thème mis à jour');
                }
            } else {
                const themeData: CreateThemeDTO = {
                    userId,
                    name,
                    description,
                    design,
                    linkedAccountIds,
                    isDefault,
                };

                const newTheme = await themeService.createTheme(userId, themeData);
                onSave(newTheme);
                toast.success('Thème créé');
            }

            onClose();
        } catch (error) {
            console.error('Error saving theme:', error);
            toast.error('Erreur lors de la sauvegarde du thème');
        } finally {
            setSaving(false);
        }
    };

    return createPortal(
        <div className="theme-editor-overlay">
            <div className="theme-editor-modal">
                {/* Header */}
                <div className="theme-editor-header">
                    <div className="theme-editor-header-left">
                        <Sparkles size={24} />
                        <h2>{theme ? 'Modifier le thème' : 'Créer un thème'}</h2>
                    </div>
                    <button className="theme-editor-close" onClick={onClose} aria-label="Fermer">
                        <X size={20} />
                    </button>
                </div>

                <div className="theme-editor-body">
                    {/* Left Column - Form */}
                    <div className="theme-editor-form">
                        {/* Quick Start with Presets */}
                        <div className="theme-editor-section">
                            <div className="theme-editor-section-header">
                                <h3>Démarrage rapide</h3>
                                <p>Choisissez un thème prédéfini comme base</p>
                            </div>
                            <div className="theme-editor-presets-grid">
                                {presets.map(preset => (
                                    <button
                                        key={preset.id}
                                        className="theme-editor-preset-button"
                                        onClick={() => handleApplyPreset(preset)}
                                        title={preset.description}
                                    >
                                        <ThemePreview theme={preset} size="small" />
                                        <span className="theme-editor-preset-name">{preset.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="theme-editor-section">
                            <div className="theme-editor-section-header">
                                <h3>Informations</h3>
                            </div>
                            <div className="theme-editor-field">
                                <label>Nom du thème *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: Thème Corporate"
                                    className="theme-editor-input"
                                />
                            </div>
                            <div className="theme-editor-field">
                                <label>Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Description du thème..."
                                    className="theme-editor-textarea"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Mode Selection */}
                        <div className="theme-editor-section">
                            <div className="theme-editor-section-header">
                                <h3>Mode d'affichage</h3>
                                <p>Choisissez le mode clair ou sombre pour votre thème</p>
                            </div>
                            <div className="theme-editor-mode-selector">
                                <button
                                    type="button"
                                    className={`theme-editor-mode-button ${design.mode === 'light' ? 'active' : ''}`}
                                    onClick={() => handleModeChange('light')}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="5" />
                                        <line x1="12" y1="1" x2="12" y2="3" />
                                        <line x1="12" y1="21" x2="12" y2="23" />
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                        <line x1="1" y1="12" x2="3" y2="12" />
                                        <line x1="21" y1="12" x2="23" y2="12" />
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </svg>
                                    <span>Clair</span>
                                </button>
                                <button
                                    type="button"
                                    className={`theme-editor-mode-button ${design.mode === 'dark' ? 'active' : ''}`}
                                    onClick={() => handleModeChange('dark')}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                    <span>Sombre</span>
                                </button>
                            </div>
                            {design.mode === 'light' && (
                                <p className="theme-editor-mode-hint">
                                    💡 Mode clair : L'arrière-plan sera automatiquement clair et le texte sombre
                                </p>
                            )}
                            {design.mode === 'dark' && (
                                <p className="theme-editor-mode-hint">
                                    🌙 Mode sombre : L'arrière-plan sera automatiquement sombre et le texte clair
                                </p>
                            )}
                        </div>

                        {/* Colors */}
                        <div className="theme-editor-section">
                            <div className="theme-editor-section-header">
                                <h3>Couleurs</h3>
                            </div>
                            <div className="theme-editor-colors-grid">
                                <div className="theme-editor-color-field">
                                    <label>Couleur principale</label>
                                    <button
                                        className="theme-editor-color-button"
                                        onClick={() => setShowColorPicker(showColorPicker === 'primary' ? null : 'primary')}
                                        style={{ backgroundColor: design.colorScheme.primary }}
                                    >
                                        <span>{design.colorScheme.primary}</span>
                                    </button>
                                    {showColorPicker === 'primary' && (
                                        <div className="theme-editor-color-picker-popup">
                                            <HexColorPicker
                                                color={design.colorScheme.primary}
                                                onChange={(color) => setDesign({ ...design, colorScheme: { ...design.colorScheme, primary: color } })}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="theme-editor-color-field">
                                    <label>Couleur secondaire</label>
                                    <button
                                        className="theme-editor-color-button"
                                        onClick={() => setShowColorPicker(showColorPicker === 'secondary' ? null : 'secondary')}
                                        style={{ backgroundColor: design.colorScheme.secondary }}
                                    >
                                        <span>{design.colorScheme.secondary}</span>
                                    </button>
                                    {showColorPicker === 'secondary' && (
                                        <div className="theme-editor-color-picker-popup">
                                            <HexColorPicker
                                                color={design.colorScheme.secondary}
                                                onChange={(color) => setDesign({ ...design, colorScheme: { ...design.colorScheme, secondary: color } })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Typography */}
                        <div className="theme-editor-section">
                            <div className="theme-editor-section-header">
                                <h3>Typographie</h3>
                            </div>
                            <div className="theme-editor-field">
                                <label>Police de caractères</label>
                                <select
                                    value={design.typography.fontFamily}
                                    onChange={(e) => setDesign({ ...design, typography: { ...design.typography, fontFamily: e.target.value } })}
                                    className="theme-editor-select"
                                >
                                    <option value="Inter, sans-serif">Inter</option>
                                    <option value="Roboto, sans-serif">Roboto</option>
                                    <option value="Open Sans, sans-serif">Open Sans</option>
                                    <option value="Lato, sans-serif">Lato</option>
                                    <option value="Montserrat, sans-serif">Montserrat</option>
                                </select>
                            </div>
                        </div>

                        {/* Linked Accounts */}
                        {accounts.length > 0 && (
                            <div className="theme-editor-section">
                                <div className="theme-editor-section-header">
                                    <h3>Comptes Google Ads liés</h3>
                                    <p>Application automatique pour ces comptes</p>
                                </div>
                                <div className="theme-editor-accounts-list">
                                    {accounts.map(account => (
                                        <label key={account.id} className="theme-editor-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={linkedAccountIds.includes(account.id)}
                                                onChange={() => toggleAccountLink(account.id)}
                                                className="theme-editor-checkbox-input"
                                            />
                                            <span>{account.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Default Theme */}
                        <div className="theme-editor-section">
                            <label className="theme-editor-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    className="theme-editor-checkbox-input"
                                />
                                <span>Définir comme thème par défaut</span>
                            </label>
                        </div>
                    </div>

                    {/* Right Column - Live Preview */}
                    <div className="theme-editor-preview">
                        <div className="theme-editor-preview-header">
                            <h3>Aperçu en direct</h3>
                        </div>
                        <div className="theme-editor-preview-content">
                            <ThemePreview
                                theme={{
                                    id: 'preview',
                                    name,
                                    description,
                                    design,
                                    userId,
                                    linkedAccountIds,
                                    isDefault,
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                }}
                                size="large"
                                showDetails
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="theme-editor-footer">
                    <button className="px-6 py-3 border-2 border-primary/30 dark:border-primary/40 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-200 font-semibold" onClick={onClose}>
                        Annuler
                    </button>
                    <button
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary-dark transition-all duration-200 font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                {theme ? 'Mettre à jour' : 'Créer le thème'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ThemeEditor;
