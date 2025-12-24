import React from 'react';
import type { ReportTheme, ThemePreset } from '../../types/reportThemes';
import './ThemePreview.css';

interface ThemePreviewProps {
    theme?: ReportTheme | ThemePreset;
    size?: 'small' | 'medium' | 'large';
    showDetails?: boolean;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({
    theme,
    size = 'medium',
    showDetails = false
}) => {
    if (!theme) {
        return (
            <div className={`theme-preview theme-preview-${size} theme-preview-empty`}>
                <div className="theme-preview-placeholder">Aucun thème</div>
            </div>
        );
    }

    const { design } = theme;
    const { colorScheme, typography, layout } = design;

    return (
        <div className={`theme-preview theme-preview-${size}`}>
            <div
                className="theme-preview-canvas"
                style={{
                    backgroundColor: colorScheme.background,
                    color: colorScheme.text,
                    fontFamily: typography.fontFamily,
                    padding: `${layout.margins / 4}px`,
                }}
            >
                {/* Header */}
                <div
                    className="theme-preview-header"
                    style={{
                        backgroundColor: colorScheme.primary,
                        color: '#ffffff',
                        padding: `${layout.spacing / 4}px`,
                        marginBottom: `${layout.spacing / 4}px`,
                        borderRadius: '4px',
                    }}
                >
                    <div className="theme-preview-title" style={{ fontFamily: typography.headingFontFamily }}>
                        Rapport
                    </div>
                </div>

                {/* Content */}
                <div className="theme-preview-content">
                    <div
                        className="theme-preview-section"
                        style={{
                            backgroundColor: colorScheme.background,
                            borderLeft: `3px solid ${colorScheme.secondary}`,
                            padding: `${layout.spacing / 6}px`,
                            marginBottom: `${layout.spacing / 6}px`,
                        }}
                    >
                        <div className="theme-preview-text" style={{ fontSize: `${typography.fontSize / 2}px` }}>
                            Métriques
                        </div>
                    </div>

                    <div
                        className="theme-preview-section"
                        style={{
                            backgroundColor: colorScheme.background,
                            borderLeft: `3px solid ${colorScheme.accent}`,
                            padding: `${layout.spacing / 6}px`,
                        }}
                    >
                        <div className="theme-preview-text" style={{ fontSize: `${typography.fontSize / 2}px` }}>
                            Analyse
                        </div>
                    </div>
                </div>
            </div>

            {showDetails && (
                <div className="theme-preview-details">
                    <div className="theme-preview-name">{theme.name}</div>
                    {theme.description && (
                        <div className="theme-preview-description">{theme.description}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ThemePreview;
