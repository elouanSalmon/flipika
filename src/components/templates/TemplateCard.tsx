import React from 'react';
import { Calendar, Layers, MoreVertical, Copy, Edit2, Trash2, Play } from 'lucide-react';
import type { ReportTemplate } from '../../types/templateTypes';
import { PERIOD_PRESETS } from '../../types/templateTypes';
import './TemplateCard.css';

interface TemplateCardProps {
    template: ReportTemplate;
    onUse: (template: ReportTemplate) => void;
    onEdit: (template: ReportTemplate) => void;
    onDuplicate: (template: ReportTemplate) => void;
    onDelete: (template: ReportTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
    template,
    onUse,
    onEdit,
    onDuplicate,
    onDelete,
}) => {
    const [showMenu, setShowMenu] = React.useState(false);

    const periodPresetLabel = PERIOD_PRESETS.find(p => p.value === template.periodPreset)?.label || template.periodPreset;

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleAction = (action: () => void) => {
        setShowMenu(false);
        action();
    };

    return (
        <div className="template-card">
            <div className="template-card-header">
                <h3>{template.name}</h3>
                <div className="template-actions">
                    <button
                        className="action-btn primary-action"
                        onClick={() => onUse(template)}
                        title="Utiliser ce template"
                    >
                        <Play size={18} />
                        <span>Utiliser</span>
                    </button>
                    <div className="menu-wrapper">
                        <button
                            className="action-btn menu-btn"
                            onClick={handleMenuClick}
                            title="Plus d'actions"
                        >
                            <MoreVertical size={18} />
                        </button>
                        {showMenu && (
                            <>
                                <div className="menu-overlay" onClick={() => setShowMenu(false)} />
                                <div className="action-menu">
                                    <button onClick={() => handleAction(() => onEdit(template))}>
                                        <Edit2 size={16} />
                                        <span>Modifier</span>
                                    </button>
                                    <button onClick={() => handleAction(() => onDuplicate(template))}>
                                        <Copy size={16} />
                                        <span>Dupliquer</span>
                                    </button>
                                    <button
                                        className="danger"
                                        onClick={() => handleAction(() => onDelete(template))}
                                    >
                                        <Trash2 size={16} />
                                        <span>Supprimer</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {template.description && (
                <p className="template-description">{template.description}</p>
            )}

            <div className="template-meta">
                <div className="meta-item">
                    <Calendar size={16} />
                    <span>{periodPresetLabel}</span>
                </div>
                <div className="meta-item">
                    <Layers size={16} />
                    <span>{template.widgetConfigs.length} widget{template.widgetConfigs.length > 1 ? 's' : ''}</span>
                </div>
            </div>

            <div className="template-stats">
                <div className="stat">
                    <span className="stat-label">Utilisations</span>
                    <span className="stat-value">{template.usageCount}</span>
                </div>
                {template.lastUsedAt && (
                    <div className="stat">
                        <span className="stat-label">Dernière utilisation</span>
                        <span className="stat-value">
                            {new Date(template.lastUsedAt).toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                )}
            </div>

            {template.widgetConfigs.length > 0 && (
                <div className="template-widgets">
                    <span className="widgets-label">Widgets:</span>
                    <div className="widget-badges">
                        {template.widgetConfigs.slice(0, 3).map((widget, index) => (
                            <span key={index} className="widget-badge">
                                {getWidgetTypeName(widget.type)}
                            </span>
                        ))}
                        {template.widgetConfigs.length > 3 && (
                            <span className="widget-badge more">
                                +{template.widgetConfigs.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

function getWidgetTypeName(type: string): string {
    const names: Record<string, string> = {
        'performance_overview': 'Performance',
        'campaign_chart': 'Graphique',
        'key_metrics': 'Métriques',
        'ad_creative': 'Créatives',
        'text_block': 'Texte',
    };
    return names[type] || type;
}

export default TemplateCard;
