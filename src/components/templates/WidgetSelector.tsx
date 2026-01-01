import React, { useState } from 'react';
import { BarChart3, LineChart, TrendingUp, FileText, Plus, Trash2, GripVertical } from 'lucide-react';
import type { TemplateWidgetConfig } from '../../types/templateTypes';
import { WidgetType } from '../../types/reportTypes';
import './WidgetSelector.css';

interface WidgetSelectorProps {
    widgetConfigs: TemplateWidgetConfig[];
    onChange: (configs: TemplateWidgetConfig[]) => void;
}

const AVAILABLE_WIDGETS = [
    {
        type: WidgetType.PERFORMANCE_OVERVIEW,
        name: 'Vue d\'ensemble Performance',
        description: 'Métriques clés avec comparaisons',
        icon: TrendingUp,
        defaultSettings: {
            metrics: ['impressions', 'clicks', 'ctr', 'cpc', 'conversions', 'roas'],
            showComparison: true,
        },
    },
    {
        type: WidgetType.CAMPAIGN_CHART,
        name: 'Graphique Campagnes',
        description: 'Évolution des performances',
        icon: LineChart,
        defaultSettings: {
            chartType: 'line' as const,
        },
    },
    {
        type: WidgetType.KEY_METRICS,
        name: 'Métriques Clés',
        description: 'Indicateurs principaux',
        icon: BarChart3,
        defaultSettings: {
            metrics: ['impressions', 'clicks', 'conversions', 'cost'],
        },
    },
    {
        type: WidgetType.TEXT_BLOCK,
        name: 'Bloc de Texte',
        description: 'Texte personnalisé',
        icon: FileText,
        defaultSettings: {
            content: '',
        },
    },
];

const WidgetSelector: React.FC<WidgetSelectorProps> = ({ widgetConfigs, onChange }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const addWidget = (widgetType: WidgetType) => {
        const widgetTemplate = AVAILABLE_WIDGETS.find(w => w.type === widgetType);
        if (!widgetTemplate) return;

        const newWidget: TemplateWidgetConfig = {
            type: widgetType,
            order: widgetConfigs.length,
            settings: { ...widgetTemplate.defaultSettings },
        };

        onChange([...widgetConfigs, newWidget]);
    };

    const removeWidget = (index: number) => {
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

    const updateWidgetSettings = (index: number, settings: any) => {
        const newConfigs = [...widgetConfigs];
        newConfigs[index] = {
            ...newConfigs[index],
            settings: { ...newConfigs[index].settings, ...settings },
        };
        onChange(newConfigs);
    };

    const getWidgetInfo = (type: WidgetType) => {
        return AVAILABLE_WIDGETS.find(w => w.type === type);
    };

    return (
        <div className="widget-selector">
            {/* Available Widgets */}
            <h4>Widgets disponibles</h4>
            <div className="widget-grid">
                {AVAILABLE_WIDGETS.map(widget => {
                    const Icon = widget.icon;
                    return (
                        <button
                            key={widget.type}
                            type="button"
                            className="widget-option"
                            onClick={() => addWidget(widget.type)}
                            title={widget.description}
                        >
                            <Icon size={20} />
                            <span>{widget.name}</span>
                            <Plus size={16} className="add-icon" />
                        </button>
                    );
                })}
            </div>

            {/* Selected Widgets */}
            {widgetConfigs.length > 0 && (
                <>
                    <h4>Widgets sélectionnés ({widgetConfigs.length})</h4>
                    <div className="widgets-list">
                        {widgetConfigs.map((config, index) => {
                            const widgetInfo = getWidgetInfo(config.type);
                            if (!widgetInfo) return null;

                            const Icon = widgetInfo.icon;

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
                                        <span className="widget-name">{widgetInfo.name}</span>
                                        <button
                                            type="button"
                                            className="remove-btn"
                                            onClick={() => removeWidget(index)}
                                            title="Retirer ce widget"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Widget-specific settings */}
                                    {config.type === WidgetType.CAMPAIGN_CHART && (
                                        <div className="widget-settings">
                                            <label>
                                                Type de graphique:
                                                <select
                                                    value={config.settings?.chartType || 'line'}
                                                    onChange={(e) => updateWidgetSettings(index, { chartType: e.target.value })}
                                                >
                                                    <option value="line">Ligne</option>
                                                    <option value="bar">Barres</option>
                                                    <option value="area">Aires</option>
                                                </select>
                                            </label>
                                        </div>
                                    )}

                                    {config.type === WidgetType.PERFORMANCE_OVERVIEW && (
                                        <div className="widget-settings">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={config.settings?.showComparison ?? true}
                                                    onChange={(e) => updateWidgetSettings(index, { showComparison: e.target.checked })}
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
                    <p>Aucun widget sélectionné</p>
                    <p className="empty-hint">Cliquez sur un widget ci-dessus pour l'ajouter</p>
                </div>
            )}
        </div>
    );
};

export default WidgetSelector;
