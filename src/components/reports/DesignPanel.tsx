import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Palette, Type, Layout, X } from 'lucide-react';
import type { ReportDesign } from '../../types/reportTypes';
import './DesignPanel.css';

interface DesignPanelProps {
    design: ReportDesign;
    onChange: (design: ReportDesign) => void;
    onClose?: () => void;
}

const DesignPanel: React.FC<DesignPanelProps> = ({ design, onChange, onClose }) => {
    const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

    const updateColor = (key: keyof ReportDesign['colorScheme'], color: string) => {
        onChange({
            ...design,
            colorScheme: {
                ...design.colorScheme,
                [key]: color,
            },
        });
    };

    const updateTypography = (key: keyof ReportDesign['typography'], value: any) => {
        onChange({
            ...design,
            typography: {
                ...design.typography,
                [key]: value,
            },
        });
    };

    const updateLayout = (key: keyof ReportDesign['layout'], value: number) => {
        onChange({
            ...design,
            layout: {
                ...design.layout,
                [key]: value,
            },
        });
    };

    const applyTheme = (themeName: string) => {
        const themes: Record<string, Partial<ReportDesign>> = {
            professional: {
                colorScheme: {
                    primary: '#1e40af',
                    secondary: '#3b82f6',
                    accent: '#60a5fa',
                    background: '#ffffff',
                    text: '#0f172a',
                },
            },
            modern: {
                colorScheme: {
                    primary: '#7c3aed',
                    secondary: '#a78bfa',
                    accent: '#c4b5fd',
                    background: '#ffffff',
                    text: '#1e1b4b',
                },
            },
            minimalist: {
                colorScheme: {
                    primary: '#0f172a',
                    secondary: '#475569',
                    accent: '#94a3b8',
                    background: '#ffffff',
                    text: '#0f172a',
                },
            },
        };

        const theme = themes[themeName];
        if (theme) {
            onChange({
                ...design,
                ...theme,
            });
        }
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
                {/* Theme Presets */}
                <div className="design-section">
                    <div className="design-section-header">
                        <Palette size={18} />
                        <h4 className="design-section-title">Thèmes</h4>
                    </div>
                    <div className="theme-presets">
                        <button className="theme-preset" onClick={() => applyTheme('professional')}>
                            <div className="theme-preset-colors">
                                <span style={{ background: '#1e40af' }} />
                                <span style={{ background: '#3b82f6' }} />
                                <span style={{ background: '#60a5fa' }} />
                            </div>
                            <span className="theme-preset-name">Professionnel</span>
                        </button>
                        <button className="theme-preset" onClick={() => applyTheme('modern')}>
                            <div className="theme-preset-colors">
                                <span style={{ background: '#7c3aed' }} />
                                <span style={{ background: '#a78bfa' }} />
                                <span style={{ background: '#c4b5fd' }} />
                            </div>
                            <span className="theme-preset-name">Moderne</span>
                        </button>
                        <button className="theme-preset" onClick={() => applyTheme('minimalist')}>
                            <div className="theme-preset-colors">
                                <span style={{ background: '#0f172a' }} />
                                <span style={{ background: '#475569' }} />
                                <span style={{ background: '#94a3b8' }} />
                            </div>
                            <span className="theme-preset-name">Minimaliste</span>
                        </button>
                    </div>
                </div>

                {/* Color Scheme */}
                <div className="design-section">
                    <div className="design-section-header">
                        <Palette size={18} />
                        <h4 className="design-section-title">Couleurs</h4>
                    </div>
                    <div className="color-controls">
                        {Object.entries(design?.colorScheme || {}).map(([key, value]) => (
                            <div key={key} className="color-control">
                                <label className="color-control-label">
                                    {key === 'primary' && 'Primaire'}
                                    {key === 'secondary' && 'Secondaire'}
                                    {key === 'accent' && 'Accent'}
                                    {key === 'background' && 'Fond'}
                                    {key === 'text' && 'Texte'}
                                </label>
                                <div className="color-control-input">
                                    <button
                                        className="color-swatch"
                                        style={{ background: value }}
                                        onClick={() =>
                                            setActiveColorPicker(activeColorPicker === key ? null : key)
                                        }
                                    />
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) =>
                                            updateColor(key as keyof ReportDesign['colorScheme'], e.target.value)
                                        }
                                        className="color-input"
                                    />
                                </div>
                                {activeColorPicker === key && (
                                    <div className="color-picker-popover">
                                        <HexColorPicker
                                            color={value}
                                            onChange={(color) =>
                                                updateColor(key as keyof ReportDesign['colorScheme'], color)
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Typography */}
                <div className="design-section">
                    <div className="design-section-header">
                        <Type size={18} />
                        <h4 className="design-section-title">Typographie</h4>
                    </div>
                    <div className="typography-controls">
                        <div className="control-group">
                            <label className="control-label">Police</label>
                            <select
                                value={design?.typography?.fontFamily || 'Inter, sans-serif'}
                                onChange={(e) => updateTypography('fontFamily', e.target.value)}
                                className="control-select"
                            >
                                <option value="Inter, sans-serif">Inter</option>
                                <option value="Roboto, sans-serif">Roboto</option>
                                <option value="'Open Sans', sans-serif">Open Sans</option>
                                <option value="'Lato', sans-serif">Lato</option>
                                <option value="'Montserrat', sans-serif">Montserrat</option>
                                <option value="Georgia, serif">Georgia</option>
                                <option value="'Times New Roman', serif">Times New Roman</option>
                            </select>
                        </div>
                        <div className="control-group">
                            <label className="control-label">Taille: {design?.typography?.fontSize || 16}px</label>
                            <input
                                type="range"
                                min="12"
                                max="20"
                                value={design?.typography?.fontSize || 16}
                                onChange={(e) => updateTypography('fontSize', parseInt(e.target.value))}
                                className="control-range"
                            />
                        </div>
                        <div className="control-group">
                            <label className="control-label">
                                Hauteur de ligne: {design?.typography?.lineHeight || 1.5}
                            </label>
                            <input
                                type="range"
                                min="1.2"
                                max="2"
                                step="0.1"
                                value={design?.typography?.lineHeight || 1.5}
                                onChange={(e) => updateTypography('lineHeight', parseFloat(e.target.value))}
                                className="control-range"
                            />
                        </div>
                    </div>
                </div>

                {/* Layout */}
                <div className="design-section">
                    <div className="design-section-header">
                        <Layout size={18} />
                        <h4 className="design-section-title">Mise en page</h4>
                    </div>
                    <div className="layout-controls">
                        <div className="control-group">
                            <label className="control-label">Marges: {design?.layout?.margins || 40}px</label>
                            <input
                                type="range"
                                min="20"
                                max="80"
                                value={design?.layout?.margins || 40}
                                onChange={(e) => updateLayout('margins', parseInt(e.target.value))}
                                className="control-range"
                            />
                        </div>
                        <div className="control-group">
                            <label className="control-label">Espacement: {design?.layout?.spacing || 24}px</label>
                            <input
                                type="range"
                                min="12"
                                max="48"
                                value={design?.layout?.spacing || 24}
                                onChange={(e) => updateLayout('spacing', parseInt(e.target.value))}
                                className="control-range"
                            />
                        </div>
                        <div className="control-group">
                            <label className="control-label">Largeur max: {design?.layout?.maxWidth || 1200}px</label>
                            <input
                                type="range"
                                min="600"
                                max="1200"
                                step="50"
                                value={design?.layout?.maxWidth || 1200}
                                onChange={(e) => updateLayout('maxWidth', parseInt(e.target.value))}
                                className="control-range"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignPanel;
