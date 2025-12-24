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
                    <button className="btn btn-secondary" onClick={onClose}>
                        Annuler
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                    >
                        {saving ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
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
