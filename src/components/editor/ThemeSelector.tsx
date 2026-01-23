import React, { useState, useEffect } from 'react';
import { ExternalLink, Palette, Check, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import themeService from '../../services/themeService';
import type { ReportDesign } from '../../types/reportTypes';
import type { ReportTheme } from '../../types/reportThemes';
import '../reports/ReportEditorHeader.css'; // Reuse existing header styles including actions-menu

interface ThemeSelectorProps {
    design: ReportDesign;
    onChange: (design: ReportDesign) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ design, onChange, isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [userThemes, setUserThemes] = useState<ReportTheme[]>([]);
    const [loadingThemes, setLoadingThemes] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadUserThemes();
        }
    }, [isOpen, currentUser]);

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
        // Verify theme has valid design
        if (!theme.design || !theme.design.colorScheme) {
            console.error('Theme is missing design or colorScheme:', theme);
            return;
        }

        const newDesign: ReportDesign = {
            mode: theme.design.mode || 'light',
            colorScheme: {
                primary: theme.design.colorScheme.primary || '#3b82f6',
                secondary: theme.design.colorScheme.secondary || '#60a5fa',
                accent: theme.design.colorScheme.accent || '#93c5fd',
                background: theme.design.colorScheme.background || '#ffffff',
                text: theme.design.colorScheme.text || '#0f172a',
            },
            typography: theme.design.typography || design.typography,
            layout: theme.design.layout || design.layout,
        };

        onChange(newDesign);
        onClose(); // Close dropdown after selection
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="actions-menu-overlay" onClick={onClose} />
            <div className="actions-menu theme-selector-menu" style={{ width: '300px' }}>
                <div className="p-3 border-b border-[var(--color-border)] mb-2">
                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <Palette size={16} />
                        Thème du Rapport
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Personnalisez l'apparence de votre rapport
                    </p>
                </div>

                <div className="px-2 pb-2 max-h-[400px] overflow-y-auto">
                    {loadingThemes ? (
                        <div className="text-center py-4 text-sm text-[var(--color-text-secondary)]">
                            Chargement...
                        </div>
                    ) : userThemes.length === 0 ? (
                        <div className="text-center py-4 px-2 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border)] border-dashed">
                            <p className="text-sm text-[var(--color-text-secondary)] mb-2">Aucun thème créé</p>
                            <a
                                href="/app/themes"
                                className="text-sm text-[var(--color-primary)] hover:underline flex items-center justify-center gap-1"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Créer un thème <ExternalLink size={14} />
                            </a>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {userThemes
                                .filter((theme) => theme.design && theme.design.colorScheme)
                                .map((theme) => {
                                    const isActive = design?.colorScheme?.primary === theme.design?.colorScheme?.primary;
                                    return (
                                        <button
                                            key={theme.id}
                                            onClick={() => applyTheme(theme)}
                                            className={`
                                                w-full flex items-center gap-3 p-2 rounded-lg transition-all
                                                border border-transparent hover:bg-[var(--glass-bg-hover)]
                                                ${isActive ? 'bg-[var(--color-bg-secondary)] border-[var(--color-primary)]' : ''}
                                            `}
                                        >
                                            {/* Preview Circles */}
                                            <div className="flex -space-x-1 flex-shrink-0">
                                                <span
                                                    className="w-5 h-5 rounded-full border border-[rgba(0,0,0,0.1)] z-30"
                                                    style={{ background: theme.design.colorScheme.primary || '#3b82f6' }}
                                                />
                                                <span
                                                    className="w-5 h-5 rounded-full border border-[rgba(0,0,0,0.1)] z-20"
                                                    style={{ background: theme.design.colorScheme.secondary || '#60a5fa' }}
                                                />
                                                <span
                                                    className="w-5 h-5 rounded-full border border-[rgba(0,0,0,0.1)] z-10"
                                                    style={{ background: theme.design.colorScheme.accent || '#93c5fd' }}
                                                />
                                            </div>

                                            <div className="flex flex-col flex-1 text-left min-w-0">
                                                <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                                                    {theme.name}
                                                </span>
                                                <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                                                    {theme.design.mode === 'dark' ? (
                                                        <>
                                                            <Moon size={12} />
                                                            Sombre
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sun size={12} />
                                                            Clair
                                                        </>
                                                    )}
                                                </span>
                                            </div>

                                            {isActive && (
                                                <Check size={16} className="text-[var(--color-primary)] flex-shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                        </div>
                    )}
                </div>

                {!loadingThemes && userThemes.length > 0 && (
                    <div className="p-2 border-t border-[var(--color-border)] mt-2">
                        <a
                            href="/app/themes"
                            className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] flex items-center justify-center gap-1 py-1"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Gérer les thèmes <ExternalLink size={12} />
                        </a>
                    </div>
                )}
            </div>
        </>
    );
};
