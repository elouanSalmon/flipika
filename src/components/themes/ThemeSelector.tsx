import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import themeService from '../../services/themeService';
import Spinner from '../common/Spinner';
import type { ReportTheme } from '../../types/reportThemes';
import ThemePreview from './ThemePreview';
import './ThemeSelector.css';

interface ThemeSelectorProps {
    userId: string;
    accountId?: string;
    selectedTheme: ReportTheme | null;
    onThemeSelect: (theme: ReportTheme | null) => void;
    onCreateTheme?: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
    userId,
    accountId,
    selectedTheme,
    onThemeSelect,
    onCreateTheme,
}) => {
    const [themes, setThemes] = useState<ReportTheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        loadThemes();
    }, [userId]);

    useEffect(() => {
        // Auto-select theme linked to the account
        if (accountId && themes.length > 0) {
            const linkedTheme = themes.find(theme =>
                theme.linkedAccountIds.includes(accountId)
            );
            if (linkedTheme && linkedTheme.id !== selectedTheme?.id) {
                onThemeSelect(linkedTheme);
            }
        }
    }, [accountId, themes]);

    const loadThemes = async () => {
        try {
            setLoading(true);
            const userThemes = await themeService.getUserThemes(userId);
            setThemes(userThemes);
        } catch (error) {
            console.error('Error loading themes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleThemeSelect = (theme: ReportTheme | null) => {
        onThemeSelect(theme);
        setIsOpen(false);
    };

    if (loading) {
        return (
            <div className="theme-selector-loading">
                <Spinner size={16} />
                <span style={{ marginLeft: '8px' }}>Chargement des thèmes...</span>
            </div>
        );
    }

    return (
        <div className="theme-selector">
            <label className="theme-selector-label">Thème du rapport</label>

            <div className="theme-selector-dropdown">
                <button
                    type="button"
                    className="theme-selector-button"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="theme-selector-button-content">
                        {selectedTheme ? (
                            <>
                                <ThemePreview theme={selectedTheme} size="small" />
                                <span className="theme-selector-button-text">{selectedTheme.name}</span>
                            </>
                        ) : (
                            <span className="theme-selector-button-text">Thème par défaut</span>
                        )}
                    </div>
                    <ChevronDown size={18} className={`theme-selector-chevron ${isOpen ? 'open' : ''}`} />
                </button>

                {isOpen && (
                    <div className="theme-selector-menu">
                        <div className="theme-selector-menu-header">
                            <span>Sélectionner un thème</span>
                        </div>

                        <div className="theme-selector-menu-content">
                            {/* Default option */}
                            <button
                                type="button"
                                className={`theme-selector-option ${!selectedTheme ? 'selected' : ''}`}
                                onClick={() => handleThemeSelect(null)}
                            >
                                <div className="theme-selector-option-preview">
                                    <ThemePreview size="small" />
                                </div>
                                <div className="theme-selector-option-info">
                                    <div className="theme-selector-option-name">Thème par défaut</div>
                                    <div className="theme-selector-option-description">Design standard de Flipika</div>
                                </div>
                            </button>

                            {/* User themes */}
                            {themes.map(theme => (
                                <button
                                    key={theme.id}
                                    type="button"
                                    className={`theme-selector-option ${selectedTheme?.id === theme.id ? 'selected' : ''}`}
                                    onClick={() => handleThemeSelect(theme)}
                                >
                                    <div className="theme-selector-option-preview">
                                        <ThemePreview theme={theme} size="small" />
                                    </div>
                                    <div className="theme-selector-option-info">
                                        <div className="theme-selector-option-name">
                                            {theme.name}
                                            {theme.isDefault && <span className="theme-selector-badge">Par défaut</span>}
                                            {accountId && theme.linkedAccountIds.includes(accountId) && (
                                                <span className="theme-selector-badge linked">Lié au compte</span>
                                            )}
                                        </div>
                                        {theme.description && (
                                            <div className="theme-selector-option-description">{theme.description}</div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {onCreateTheme && (
                            <div className="theme-selector-menu-footer">
                                <button
                                    type="button"
                                    className="theme-selector-create-button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        onCreateTheme();
                                    }}
                                >
                                    + Créer un nouveau thème
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Click outside to close */}
            {isOpen && (
                <div
                    className="theme-selector-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default ThemeSelector;
