import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { HexColorPicker } from 'react-colorful';
import themeService from '../../services/themeService';
import { getAllThemePresets } from '../../data/defaultThemes';
import type { ReportTheme, ThemePreset, CreateThemeDTO } from '../../types/reportThemes';
import type { Client } from '../../types/client';
import ThemePreview from './ThemePreview';
import { useTranslation } from 'react-i18next';
import './ThemeEditor.css';

interface ThemeEditorProps {
    userId: string;
    theme?: ReportTheme | null;
    clients?: Client[];
    onSave: (theme: ReportTheme) => void;
    onClose: () => void;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({
    userId,
    theme,
    clients = [],
    onSave,
    onClose,
}) => {
    const { t } = useTranslation('themes');
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
    const [linkedClientIds, setLinkedClientIds] = useState<string[]>(theme?.linkedClientIds || []);
    const [isDefault, setIsDefault] = useState(theme?.isDefault || false);
    const [saving, setSaving] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

    // Removed useEffect that was mistakenly overwriting linkedClientIds from client defaultThemeId
    // We now count linkedClientIds as the source of truth for the local state, which comes from theme prop.

    const handleApplyPreset = (preset: ThemePreset) => {
        setDesign(preset.design);
        if (!name) {
            setName(preset.name);
        }
        toast.success(t('editor.presetApplied', { name: preset.name }));
    };

    const toggleClientLink = (clientId: string) => {
        setLinkedClientIds(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
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
            toast.error(t('editor.errorNameRequired'));
            return;
        }

        setSaving(true);
        try {
            let savedThemeId: string;
            let finalTheme: ReportTheme;

            // 1. Save or Create Theme
            if (theme?.id) {
                await themeService.updateTheme(theme.id, {
                    name,
                    description,
                    design,
                    linkedClientIds,
                    isDefault,
                });
                savedThemeId = theme.id;
            } else {
                const themeData: CreateThemeDTO = {
                    userId,
                    name,
                    description,
                    design,
                    linkedClientIds,
                    isDefault,
                };
                finalTheme = await themeService.createTheme(userId, themeData);
                savedThemeId = finalTheme.id;
            }

            // 2. Sync Clients (Many-to-Many)
            const { clientService } = await import('../../services/clientService');

            const originalLinkedIds = theme?.linkedClientIds || [];
            const newLinkedIds = linkedClientIds;

            const addedIds = newLinkedIds.filter(id => !originalLinkedIds.includes(id));
            const removedIds = originalLinkedIds.filter(id => !newLinkedIds.includes(id));
            const unchangedIds = newLinkedIds.filter(id => originalLinkedIds.includes(id));

            const updatePromises: Promise<void>[] = [];

            // Handle Added: Add to linkedThemeIds and set as default (preserving "assign" behavior)
            for (const clientId of addedIds) {
                const client = clients.find(c => c.id === clientId);
                if (client) {
                    const currentLinked = client.linkedThemeIds || [];
                    // Add only if not present
                    const newLinked = currentLinked.includes(savedThemeId)
                        ? currentLinked
                        : [...currentLinked, savedThemeId];

                    updatePromises.push(clientService.updateClient(userId, clientId, {
                        linkedThemeIds: newLinked,
                        defaultThemeId: savedThemeId
                    }));
                }
            }

            // Handle Removed: Remove from linkedThemeIds and unset default if it matches
            for (const clientId of removedIds) {
                const client = clients.find(c => c.id === clientId);
                if (client) {
                    const currentLinked = client.linkedThemeIds || [];
                    const newLinked = currentLinked.filter(id => id !== savedThemeId);

                    const updates: any = { linkedThemeIds: newLinked };
                    if (client.defaultThemeId === savedThemeId) {
                        // If we are removing the default theme, what should happen?
                        // For now, unset it (create empty string/undefined behavior)
                        // Note: undefined in updateClient might skip it, so we might need distinct logic if clearing.
                        // clientService.updateClient handles explicit undefined? check impl.
                        // impl checks `if (input.defaultThemeId !== undefined)`.
                        // So to UNSET, we might need to send null or empty string?
                        // Firestore usually needs deleteField() or null.
                        // But `updateClient` types are string | undefined. 
                        // Let's assume empty string is safe enough for "no ID" or handled by UI.
                        updates.defaultThemeId = '';
                    }
                    updatePromises.push(clientService.updateClient(userId, clientId, updates));
                }
            }

            // Handle Unchanged: Ensure backfill (Migration)
            for (const clientId of unchangedIds) {
                const client = clients.find(c => c.id === clientId);
                if (client) {
                    const currentLinked = client.linkedThemeIds || [];
                    if (!currentLinked.includes(savedThemeId)) {
                        const newLinked = [...currentLinked, savedThemeId];
                        updatePromises.push(clientService.updateClient(userId, clientId, {
                            linkedThemeIds: newLinked
                        }));
                    }
                }
            }

            await Promise.all(updatePromises);

            // 3. Return updated object
            const updatedTheme = await themeService.getTheme(savedThemeId);
            if (updatedTheme) {
                onSave(updatedTheme);
                toast.success(theme ? t('editor.successUpdate') : t('editor.successCreate'));
            }

            onClose();
        } catch (error) {
            console.error('Error saving theme:', error);
            toast.error(t('editor.errorSave'));
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
                        <h2>{theme ? t('editor.titleEdit') : t('editor.titleCreate')}</h2>
                    </div>
                    <button className="theme-editor-close" onClick={onClose} aria-label={t('editor.close')}>
                        <X size={20} />
                    </button>
                </div>

                <div className="theme-editor-body">
                    {/* Left Column - Form */}
                    <div className="theme-editor-form">
                        {/* Quick Start with Presets */}
                        <div className="theme-editor-section">
                            <div className="theme-editor-section-header">
                                <h3>{t('editor.quickStartTitle')}</h3>
                                <p>{t('editor.quickStartDesc')}</p>
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
                                <h3>{t('editor.infoTitle')}</h3>
                            </div>
                            <div className="theme-editor-field">
                                <label>{t('editor.nameLabel')}</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('editor.namePlaceholder')}
                                    className="theme-editor-input"
                                />
                            </div>
                            <div className="theme-editor-field">
                                <label>{t('editor.descLabel')}</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t('editor.descPlaceholder')}
                                    className="theme-editor-textarea"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Mode Selection */}
                        <div className="theme-editor-section">
                            <div className="theme-editor-section-header">
                                <h3>{t('editor.modeTitle')}</h3>
                                <p>{t('editor.modeDesc')}</p>
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
                                    <span>{t('editor.modeLight')}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`theme-editor-mode-button ${design.mode === 'dark' ? 'active' : ''}`}
                                    onClick={() => handleModeChange('dark')}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                    <span>{t('editor.modeDark')}</span>
                                </button>
                            </div>
                            {design.mode === 'light' && (
                                <p className="theme-editor-mode-hint">
                                    {t('editor.modeLightHint')}
                                </p>
                            )}
                            {design.mode === 'dark' && (
                                <p className="theme-editor-mode-hint">
                                    {t('editor.modeDarkHint')}
                                </p>
                            )}
                        </div>

                        {/* Colors */}
                        <div className="theme-editor-section">
                            <div className="theme-editor-section-header">
                                <h3>{t('editor.colorsTitle')}</h3>
                            </div>
                            <div className="theme-editor-colors-grid">
                                <div className="theme-editor-color-field">
                                    <label>{t('editor.primaryColor')}</label>
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
                                    <label>{t('editor.secondaryColor')}</label>
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
                                <h3>{t('editor.typographyTitle')}</h3>
                            </div>
                            <div className="theme-editor-field">
                                <label>{t('editor.fontLabel')}</label>
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

                        {/* Linked Clients */}
                        {clients.length > 0 && (
                            <div className="theme-editor-section">
                                <div className="theme-editor-section-header">
                                    <h3>{t('editor.linkedClientsTitle')}</h3>
                                    <p>{t('editor.linkedClientsDesc')}</p>
                                </div>
                                <div className="theme-editor-accounts-list">
                                    {clients.map(client => (
                                        <label key={client.id} className="theme-editor-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={linkedClientIds.includes(client.id)}
                                                onChange={() => toggleClientLink(client.id)}
                                                className="theme-editor-checkbox-input"
                                            />
                                            <span>{client.name}</span>
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
                                <span>{t('editor.setAsDefault')}</span>
                            </label>
                        </div>
                    </div>

                    {/* Right Column - Live Preview */}
                    <div className="theme-editor-preview">
                        <div className="theme-editor-preview-header">
                            <h3>{t('editor.previewTitle')}</h3>
                        </div>
                        <div className="reassurance-hint" style={{ marginTop: '0', marginBottom: '12px' }}>
                            <Info className="reassurance-hint-icon" />
                            <span className="reassurance-hint-text">{t('editor.reassurance.preview')}</span>
                        </div>
                        <div className="theme-editor-preview-content">
                            <ThemePreview
                                theme={{
                                    id: 'preview',
                                    name,
                                    description,
                                    design,
                                    userId,
                                    linkedClientIds,
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

                <div className="theme-editor-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        {t('editor.cancel')}
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                    >
                        {saving ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('editor.saving')}
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                {theme ? t('editor.update') : t('editor.save')}
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
