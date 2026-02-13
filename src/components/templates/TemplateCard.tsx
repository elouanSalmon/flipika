import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MoreVertical, Copy, Edit2, Trash2, Play, Building, Megaphone, Clock, CheckCircle2, FileWarning } from 'lucide-react';
import type { ReportTemplate } from '../../types/templateTypes';
import type { Client } from '../../types/client';
import ClientLogoAvatar from '../common/ClientLogoAvatar';
import './TemplateCard.css'; // Minimized
import { countTiptapSlides } from '../../utils/tiptapUtils';

interface TemplateCardProps {
    template: ReportTemplate;
    onUse: (template: ReportTemplate) => void;
    onEdit: (template: ReportTemplate) => void;
    onDuplicate: (template: ReportTemplate) => void;
    onDelete: (template: ReportTemplate) => void;
    isGoogleAdsConnected?: boolean;
    accounts?: { id: string; name: string }[];
    clients?: Client[];
}

const TemplateCard: React.FC<TemplateCardProps> = ({
    template,
    onUse,
    onEdit,
    onDuplicate,
    onDelete,
    isGoogleAdsConnected = true,
    accounts = [],
    clients = [],
}) => {
    const { t } = useTranslation('templates');
    const [showMenu, setShowMenu] = React.useState(false);

    const periodPresetLabel = template.periodPreset
        ? t(`configModal.presets.${template.periodPreset}.label`)
        : template.periodPreset;

    // Resolve account/client name and logo
    const linkedClient = template.clientId ? clients.find(c => c.id === template.clientId) : null;
    const accountName = accounts.find(a => a.id === template.accountId)?.name || template.accountId || t('card.noAccount');
    const displayName = linkedClient?.name || template.clientName || accountName;
    const isClientLinked = !!linkedClient || !!template.clientName;
    const clientLogo = linkedClient?.logoUrl;

    // Resolve campaigns text
    const campaignsText = template.campaignNames?.length
        ? t('card.campaigns', { count: template.campaignNames.length })
        : (template.campaignIds?.length
            ? t('card.campaigns', { count: template.campaignIds.length })
            : t('card.noCampaigns'));

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
        ? t('card.usedOn', { date: new Date(template.lastUsedAt).toLocaleDateString('fr-FR') })
        : t('card.createdOn', { date: new Date(template.createdAt).toLocaleDateString('fr-FR') });

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
                {/* Status Badge */}
                {(template.content || template.slideConfigs.length > 0) ? (
                    <div className="status-badge success ml-auto" title={t('card.status.ready', { defaultValue: 'Prêt à l\'emploi' })}>
                        <CheckCircle2 size={12} />
                        <span>{t('card.status.ready', { defaultValue: 'Prêt' })}</span>
                    </div>
                ) : (
                    <div className="status-badge warning ml-auto" title={t('card.status.notReady', { defaultValue: 'Aucun contenu configuré' })}>
                        <FileWarning size={12} />
                        <span>{t('card.status.draft', { defaultValue: 'Brouillon' })}</span>
                    </div>
                )}
            </div>

            <div className="listing-card-body">
                {template.description && (
                    <p className="text-sm text-neutral-500 line-clamp-2 mb-3 h-10">
                        {template.description}
                    </p>
                )}

                <div className="space-y-2">
                    <div className="listing-card-row">
                        <div className="listing-card-info-item" title={isClientLinked ? `${displayName} (${accountName})` : accountName}>
                            {isClientLinked ? (
                                <ClientLogoAvatar logo={clientLogo} name={displayName} size="sm" />
                            ) : (
                                <Building size={14} />
                            )}
                            <span>{displayName}</span>
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

                {/* Slide Badges - Inline (only for legacy templates) */}
                {!template.content && template.slideConfigs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {template.slideConfigs.slice(0, 3).map((slide, index) => (
                            <span key={index} className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded text-xs">
                                {getSlideTypeName(slide.type, t)}
                            </span>
                        ))}
                        {template.slideConfigs.length > 3 && (
                            <span className="px-2 py-0.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 rounded text-xs">
                                +{template.slideConfigs.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="listing-card-footer">
                <div className="listing-card-stats">
                    <div className="listing-card-stat">
                        <span className="listing-card-stat-value">{template.usageCount}</span>
                        <span className="listing-card-stat-label">{t('card.uses')}</span>
                    </div>
                    <div className="listing-card-stat border-l border-neutral-200 dark:border-neutral-700 pl-4">
                        <span className="listing-card-stat-value">
                            {template.content ? countTiptapSlides(template.content) : template.slideConfigs.length}
                        </span>
                        <span className="listing-card-stat-label">{t('card.slides')}</span>
                    </div>
                </div>
            </div>

            <div className="listing-card-actions">
                <button
                    onClick={() => handleAction(() => onEdit(template))}
                    disabled={!isGoogleAdsConnected}
                    className={`action-btn-icon ${!isGoogleAdsConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={t('card.actions.edit')}
                >
                    <Edit2 size={16} />
                </button>

                <div className="relative">
                    <button
                        onClick={() => handleAction(() => onUse(template))}
                        disabled={!isGoogleAdsConnected}
                        className={`action-btn-icon text-primary hover:text-primary-dark ${!isGoogleAdsConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={t('card.actions.createReport')}
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
                        <div className="absolute right-0 top-full mt-1 min-w-[12rem] w-auto whitespace-nowrap bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 z-50 py-1">
                            <button
                                onClick={() => handleAction(() => onDuplicate(template))}
                                className="w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-2"
                            >
                                <Copy size={14} /> {t('card.actions.duplicate')}
                            </button>
                            <button
                                onClick={() => handleAction(() => onDelete(template))}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-700 mt-1"
                            >
                                <Trash2 size={14} /> {t('card.actions.delete')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

function getSlideTypeName(type: string, t: any): string {
    const names: Record<string, string> = {
        'performance_overview': t('card.slideTypes.performance'),
        'campaign_chart': t('card.slideTypes.chart'),
        'key_metrics': t('card.slideTypes.metrics'),
        'ad_creative': t('card.slideTypes.creatives'),
        'text_block': t('card.slideTypes.text'),
    };
    return names[type] || type;
}

export default TemplateCard;
