import React, { useState } from 'react';
import { BarChart3, LineChart, TrendingUp, FileText, Plus, Trash2, GripVertical } from 'lucide-react';
import type { TemplateSlideConfig } from '../../types/templateTypes';
import { SlideType } from '../../types/reportTypes';
import './WidgetSelector.css';

interface WidgetSelectorProps {
    widgetConfigs: TemplateSlideConfig[];
    onChange: (configs: TemplateSlideConfig[]) => void;
}

const AVAILABLE_WIDGETS = [
    {
        type: SlideType.PERFORMANCE_OVERVIEW,
        name: 'Vue d\'ensemble Performance',
        description: 'Métriques clés avec comparaisons',
        icon: TrendingUp,
        defaultSettings: {
            metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'conversions', 'roas'],
            showComparison: true,
        },
    },
    {
        type: SlideType.CAMPAIGN_CHART,
        name: 'Graphique Campagnes',
        description: 'Évolution des performances',
        icon: LineChart,
        defaultSettings: {
            chartType: 'line' as const,
        },
    },
    {
        type: SlideType.KEY_METRICS,
        name: 'Métriques Clés',
        description: 'Indicateurs principaux',
        icon: BarChart3,
        defaultSettings: {
            metrics: ['impressions', 'clicks', 'conversions', 'cost'],
        },
    },
    {
        type: SlideType.TEXT_BLOCK,
        name: 'Bloc de Texte',
        description: 'Texte personnalise',
        icon: FileText,
        defaultSettings: {
            content: '',
        },
    },
    // Meta Ads widgets
    {
        type: SlideType.META_PERFORMANCE_OVERVIEW,
        name: 'Meta Ads - Performance',
        description: 'Metriques Meta Ads (impressions, clics, budget...)',
        icon: TrendingUp,
        defaultSettings: {
            metrics: ['impressions', 'clicks', 'spend', 'ctr', 'reach', 'conversions'],
            showComparison: true,
        },
    },
    {
        type: SlideType.META_CAMPAIGN_CHART,
        name: 'Meta Ads - Campagnes',
        description: 'Graphique campagnes Meta Ads',
        icon: LineChart,
        defaultSettings: {
            chartType: 'line' as const,
        },
    },
    {
        type: SlideType.META_FUNNEL_ANALYSIS,
        name: 'Meta Ads - Tunnel',
        description: 'Tunnel de conversion Meta Ads',
        icon: TrendingUp,
        defaultSettings: {
            metrics: ['reach', 'impressions', 'clicks', 'conversions'],
        },
    },
];

const WidgetSelector: React.FC<WidgetSelectorProps> = ({ widgetConfigs, onChange }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const addSlide = (slideType: SlideType) => {
        const widgetTemplate = AVAILABLE_WIDGETS.find(w => w.type === slideType);
        if (!widgetTemplate) return;

        const newSlide: TemplateSlideConfig = {
            type: slideType,
            order: widgetConfigs.length,
            settings: { ...widgetTemplate.defaultSettings },
        };

        onChange([...widgetConfigs, newSlide]);
    };

    const removeSlide = (index: number) => {
        const newConfigs = widgetConfigs.filter((_, i) => i !== index);
        // Reorder
        const reordered = newConfigs.map((config, i) => ({ ...config, order: i }));
        onChange(reordered);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newConfigs = [...widgetConfigs];
        const draggedItem = newConfigs[draggedIndex];
        newConfigs.splice(draggedIndex, 1);
        newConfigs.splice(index, 0, draggedItem);

        // Reorder
        const reordered = newConfigs.map((config, i) => ({ ...config, order: i }));
        onChange(reordered);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const updateSlideSettings = (index: number, settings: any) => {
        const newConfigs = [...widgetConfigs];
        newConfigs[index] = {
            ...newConfigs[index],
            settings: { ...newConfigs[index].settings, ...settings },
        };
        onChange(newConfigs);
    };

    const getSlideInfo = (type: SlideType) => {
        return AVAILABLE_WIDGETS.find(w => w.type === type);
    };

    return (
        <div className="widget-selector">
            {/* Available Slides */}
            <h4>Slides disponibles</h4>
            <div className="widget-grid">
                {AVAILABLE_WIDGETS.map(widget => {
                    const Icon = widget.icon;
                    return (
                        <button
                            key={widget.type}
                            type="button"
                            className="widget-option"
                            onClick={() => addSlide(widget.type)}
                            title={widget.description}
                        >
                            <Icon size={20} />
                            <span>{widget.name}</span>
                            <Plus size={16} className="add-icon" />
                        </button>
                    );
                })}
            </div>

            {/* Selected Slides */}
            {widgetConfigs.length > 0 && (
                <>
                    <h4>Slides sélectionnés ({widgetConfigs.length})</h4>
                    <div className="widgets-list">
                        {widgetConfigs.map((config, index) => {
                            const slideInfo = getSlideInfo(config.type);
                            if (!slideInfo) return null;

                            const Icon = slideInfo.icon;

                            return (
                                <div
                                    key={index}
                                    className="selected-widget"
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className="widget-header">
                                        <GripVertical size={16} className="drag-handle" />
                                        <Icon size={18} />
                                        <span className="widget-name">{slideInfo.name}</span>
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removeSlide(index)}
                                            title="Retirer ce widget"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Slide-specific settings */}
                                    {config.type === SlideType.CAMPAIGN_CHART && (
                                        <div className="widget-settings">
                                            <label>
                                                Type de graphique:
                                                <select
                                                    value={config.settings?.chartType || 'line'}
                                                    onChange={(e) => updateSlideSettings(index, { chartType: e.target.value })}
                                                >
                                                    <option value="line">Ligne</option>
                                                    <option value="bar">Barres</option>
                                                    <option value="area">Aires</option>
                                                </select>
                                            </label>
                                        </div>
                                    )}

                                    {config.type === SlideType.PERFORMANCE_OVERVIEW && (
                                        <div className="widget-settings">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={config.settings?.showComparison ?? true}
                                                    onChange={(e) => updateSlideSettings(index, { showComparison: e.target.checked })}
                                                />
                                                <span>Afficher les comparaisons</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {widgetConfigs.length === 0 && (
                <div className="empty-state">
                    <p>Aucun slide sélectionné</p>
                    <p className="empty-hint">Cliquez sur un slide ci-dessus pour l'ajouter</p>
                </div>
            )}
        </div>
    );
};

export default WidgetSelector;
