import React from 'react';
import { Calendar, MoreVertical, Copy, Edit2, Trash2, Play, Building, Megaphone, Clock } from 'lucide-react';
import type { ReportTemplate } from '../../types/templateTypes';
import { PERIOD_PRESETS } from '../../types/templateTypes';
import './TemplateCard.css'; // Minimized

interface TemplateCardProps {
    template: ReportTemplate;
    onUse: (template: ReportTemplate) => void;
    onEdit: (template: ReportTemplate) => void;
    onDuplicate: (template: ReportTemplate) => void;
    onDelete: (template: ReportTemplate) => void;
    isGoogleAdsConnected?: boolean;
    accounts?: { id: string; name: string }[];
}

const TemplateCard: React.FC<TemplateCardProps> = ({
    template,
    onUse,
    onEdit,
    onDuplicate,
    onDelete,
    isGoogleAdsConnected = true,
    accounts = [],
}) => {
    const [showMenu, setShowMenu] = React.useState(false);

    const periodPresetLabel = PERIOD_PRESETS.find(p => p.value === template.periodPreset)?.label || template.periodPreset;

    // Resolve account name
    const accountName = template.accountName ||
        accounts.find(a => a.id === template.accountId)?.name ||
        (template.accountId ? 'Compte inconnu' : 'Non défini');

    // Resolve campaigns text
    const campaignsText = template.campaignNames?.length
        ? `${template.campaignNames.length} Campagne${template.campaignNames.length > 1 ? 's' : ''}`
        : (template.campaignIds?.length
            ? `${template.campaignIds.length} Campagne${template.campaignIds.length > 1 ? 's' : ''}`
            : 'Aucune campagne');

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleAction = (action: () => void) => {
        setShowMenu(false);
        action();
    };

    // Calculate time since last use or creation
    const dateLabel = template.lastUsedAt
        ? `Utilisé le ${new Date(template.lastUsedAt).toLocaleDateString('fr-FR')}`
        : `Créé le ${new Date(template.createdAt).toLocaleDateString('fr-FR')}`;

    return (
        <div className={`listing-card group ${showMenu ? 'z-50' : ''}`}>
            <div className="listing-card-header">
                <div className="listing-card-title-group">
                    <h3 className="listing-card-title">{template.name}</h3>
                    <div className="listing-card-subtitle">
                        <Clock size={12} />
                        {dateLabel}
                    </div>
                </div>
                {/* Primary Use Action - Always visible on hover */}
                <button
                    className={`ml-2 p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover:opacity-100 flex-shrink-0 ${!isGoogleAdsConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => onUse(template)}
                    disabled={!isGoogleAdsConnected}
                    title={!isGoogleAdsConnected ? 'Connectez Google Ads' : 'Utiliser ce template'}
                >
                    <Play size={16} fill="currentColor" />
                </button>
            </div>

            <div className="listing-card-body">
                {template.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">
                        {template.description}
                    </p>
                )}

                <div className="space-y-2">
                    <div className="listing-card-row">
                        <div className="listing-card-info-item" title={accountName}>
                            <Building size={14} />
                            <span>{accountName}</span>
                        </div>
                    </div>

                    <div className="listing-card-row">
                        <div className="listing-card-info-item" title={template.campaignNames?.join(', ')}>
                            <Megaphone size={14} />
                            <span>{campaignsText}</span>
                        </div>
                    </div>

                    <div className="listing-card-row">
                        <div className="listing-card-info-item">
                            <Calendar size={14} />
                            <span>{periodPresetLabel}</span>
                        </div>
                    </div>
                </div>

                {/* Widget Badges - Inline */}
                {template.widgetConfigs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {template.widgetConfigs.slice(0, 3).map((widget, index) => (
                            <span key={index} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                                {getWidgetTypeName(widget.type)}
                            </span>
                        ))}
                        {template.widgetConfigs.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded text-xs">
                                +{template.widgetConfigs.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="listing-card-footer">
                <div className="listing-card-stats">
                    <div className="listing-card-stat">
                        <span className="listing-card-stat-value">{template.usageCount}</span>
                        <span className="listing-card-stat-label">Utilisations</span>
                    </div>
                    <div className="listing-card-stat border-l border-gray-200 dark:border-gray-700 pl-4">
                        <span className="listing-card-stat-value">{template.widgetConfigs.length}</span>
                        <span className="listing-card-stat-label">Widgets</span>
                    </div>
                </div>
            </div>

            <div className="listing-card-actions">
                <button
                    onClick={() => handleAction(() => onEdit(template))}
                    disabled={!isGoogleAdsConnected}
                    className={`action-btn-icon ${!isGoogleAdsConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Modifier"
                >
                    <Edit2 size={16} />
                </button>

                <div className="relative">
                    <button
                        onClick={() => handleAction(() => onUse(template))}
                        disabled={!isGoogleAdsConnected}
                        className={`action-btn-icon text-primary hover:text-primary-dark ${!isGoogleAdsConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Créer un rapport"
                    >
                        <Play size={16} fill="currentColor" />
                    </button>
                </div>

                <div className="relative">
                    <button
                        onClick={handleMenuClick}
                        className="action-btn-icon"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 min-w-[12rem] w-auto whitespace-nowrap bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1">
                            <button
                                onClick={() => handleAction(() => onDuplicate(template))}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                                <Copy size={14} /> Dupliquer
                            </button>
                            <button
                                onClick={() => handleAction(() => onDelete(template))}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700 mt-1"
                            >
                                <Trash2 size={14} /> Supprimer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

function getWidgetTypeName(type: string): string {
    const names: Record<string, string> = {
        'performance_overview': 'Perf.',
        'campaign_chart': 'Graph.',
        'key_metrics': 'Métriques',
        'ad_creative': 'Créatives',
        'text_block': 'Texte',
    };
    return names[type] || type;
}

export default TemplateCard;
