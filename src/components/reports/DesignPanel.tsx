import React, { useState, useEffect } from 'react';
import { Palette, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import themeService from '../../services/themeService';
import type { ReportDesign } from '../../types/reportTypes';
import type { ReportTheme } from '../../types/reportThemes';
import './DesignPanel.css';

interface DesignPanelProps {
    design: ReportDesign;
    onChange: (design: ReportDesign) => void;
    onClose?: () => void;
}

const DesignPanel: React.FC<DesignPanelProps> = ({ design, onChange, onClose }) => {
    const { currentUser } = useAuth();
    const [userThemes, setUserThemes] = useState<ReportTheme[]>([]);
    const [loadingThemes, setLoadingThemes] = useState(true);

    useEffect(() => {
        loadUserThemes();
    }, [currentUser]);

    const loadUserThemes = async () => {
        if (!currentUser) {
            setLoadingThemes(false);
            return;
        }

        try {
            const themes = await themeService.getUserThemes(currentUser.uid);
            setUserThemes(themes);
        } catch (error) {
            console.error('Error loading themes:', error);
        } finally {
            setLoadingThemes(false);
        }
    };

    const applyTheme = (theme: ReportTheme) => {
        // Vérifier que le thème a un design valide
        if (!theme.design || !theme.design.colorScheme) {
            console.error('Theme is missing design or colorScheme:', theme);
            return;
        }

        // Appliquer le design du thème (ReportTheme.design est déjà un ReportDesign)
        const newDesign: ReportDesign = {
            mode: theme.design.mode || 'light',
            colorScheme: {
                primary: theme.design.colorScheme.primary || '#3b82f6',
                secondary: theme.design.colorScheme.secondary || '#60a5fa',
                accent: theme.design.colorScheme.accent || '#93c5fd',
                background: theme.design.colorScheme.background || '#ffffff',
                text: theme.design.colorScheme.text || '#0f172a',
            },
            typography: theme.design.typography || design.typography, // Utiliser la typo du thème ou garder l'existante
            layout: theme.design.layout || design.layout, // Utiliser le layout du thème ou garder l'existant
        };

        onChange(newDesign);
    };

    return (
        <div className="design-panel">
            <div className="design-panel-header">
                <h3 className="design-panel-title">Design</h3>
                {onClose && (
                    <button className="design-panel-close" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="design-panel-content">
                {/* Theme Selector */}
                <div className="design-section">
                    <div className="design-section-header">
                        <Palette size={18} />
                        <h4 className="design-section-title">Thème du Rapport</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Sélectionnez un thème pour définir les couleurs et le style du rapport (y compris le mode clair/sombre).
                    </p>
                    {loadingThemes ? (
                        <div className="text-center py-4 text-gray-500">Chargement...</div>
                    ) : userThemes.length === 0 ? (
                        <div className="empty-themes">
                            <p className="text-sm text-gray-500 mb-2">Aucun thème créé</p>
                            <a
                                href="/app/themes"
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Créer un thème <ExternalLink size={14} />
                            </a>
                        </div>
                    ) : (
                        <div className="theme-presets">
                            {userThemes
                                .filter((theme) => theme.design && theme.design.colorScheme)
                                .map((theme) => (
                                    <button
                                        key={theme.id}
                                        className={`theme-preset ${design.colorScheme.primary === theme.design.colorScheme.primary ? 'active' : ''}`}
                                        onClick={() => applyTheme(theme)}
                                    >
                                        <div className="theme-preset-colors">
                                            <span style={{ background: theme.design.colorScheme.primary || '#3b82f6' }} />
                                            <span style={{ background: theme.design.colorScheme.secondary || '#60a5fa' }} />
                                            <span style={{ background: theme.design.colorScheme.accent || '#93c5fd' }} />
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className="theme-preset-name">{theme.name}</span>
                                            <span className="text-xs text-gray-500">
                                                {theme.design.mode === 'dark' ? '🌙 Sombre' : '☀️ Clair'}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                        </div>
                    )}
                    {!loadingThemes && userThemes.length > 0 && (
                        <a
                            href="/app/themes"
                            className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1 mt-3"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Gérer les thèmes <ExternalLink size={14} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesignPanel;
