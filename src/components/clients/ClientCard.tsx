import React, { useState } from 'react';
import type { Client } from '../../types/client';
import { getDataSources } from '../../types/clientHelpers';
import { Edit2, Trash2, MoreVertical, Mail, Palette, Layout, Calendar, Building, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ClientLogoAvatar from '../common/ClientLogoAvatar';
// No specific CSS needed, generic listing-card styles from index.css are used

interface ClientCardProps {
    client: Client;
    onEdit: (client: Client) => void;
    onDelete: (client: Client) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onEdit, onDelete }) => {
    const { t } = useTranslation('clients');
    const [showMenu, setShowMenu] = useState(false);

    const hasTemplate = !!client.defaultTemplateId;
    const hasTheme = !!client.defaultThemeId;
    const isConfigured = hasTemplate || hasTheme;

    // Helper to safely handle Firestore Timestamp or Date
    const getFormattedDate = (dateOrTimestamp: any) => {
        if (!dateOrTimestamp) return '';
        const date = dateOrTimestamp.toDate ? dateOrTimestamp.toDate() : new Date(dateOrTimestamp);
        return date.toLocaleDateString('fr-FR');
    };

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleAction = (action: () => void) => {
        setShowMenu(false);
        action();
    };

    return (
        <div className="listing-card group">
            {/* Header Section */}
            <div className="listing-card-header">
                <div className="flex items-center gap-3">
                    <ClientLogoAvatar logo={client.logoUrl} name={client.name} size="lg" />
                    <div className="listing-card-title-group">
                        <h3 className="listing-card-title" title={client.name}>
                            {client.name}
                        </h3>
                        <div className="listing-card-subtitle">
                            <Calendar size={12} />
                            <span>{t('card.createdOn', { date: getFormattedDate(client.createdAt), defaultValue: `Créé le ${getFormattedDate(client.createdAt)}` })}</span>
                        </div>
                    </div>
                </div>
                {/* Status Badge */}
                {isConfigured ? (
                    <div className="status-badge success" title={t('card.status.configured', { defaultValue: 'Compte configuré' })}>
                        <CheckCircle2 size={12} />
                        <span>{t('card.status.ready', { defaultValue: 'Prêt' })}</span>
                    </div>
                ) : (
                    <div className="status-badge warning" title={t('card.status.incomplete', { defaultValue: 'Configuration incomplète' })}>
                        <span>{t('card.status.setup', { defaultValue: 'À configurer' })}</span>
                    </div>
                )}
            </div>

            {/* Body Section */}
            <div className="listing-card-body">
                <div className="space-y-2">
                    {/* Data Sources */}
                    <div className="listing-card-row">
                        <div className="listing-card-info-item flex flex-wrap gap-1.5">
                            {getDataSources(client).map((ds) => (
                                <span
                                    key={`${ds.platform}-${ds.accountId}`}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-50 dark:bg-black text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-100 dark:border-white/10"
                                    title={ds.accountId}
                                >
                                    <Building size={10} />
                                    {ds.platform === 'google_ads' ? 'Google Ads' : 'Meta Ads'}
                                </span>
                            ))}
                            {getDataSources(client).length === 0 && (
                                <span className="text-xs text-neutral-400">-</span>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="listing-card-row">
                        <div className="listing-card-info-item" title={client.email}>
                            <Mail size={14} />
                            <span className="truncate">{client.email}</span>
                        </div>
                    </div>

                    {/* Configuration Chips */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {hasTheme && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-50 dark:bg-black text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-100 dark:border-white/10">
                                <Palette size={10} />
                                <span>{t('card.config.theme', { defaultValue: 'Thème' })}</span>
                            </div>
                        )}
                        {hasTemplate && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-50 dark:bg-black text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-100 dark:border-white/10">
                                <Layout size={10} />
                                <span>{t('card.config.template', { defaultValue: 'Modèle' })}</span>
                            </div>
                        )}
                        {!hasTheme && !hasTemplate && (
                            <span className="text-xs text-neutral-400 italic">{t('card.config.none', { defaultValue: 'Aucune config.' })}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer / Stats Section - Placeholder for now or removed if minimal */}
            {/* <div className="listing-card-footer">
                  <div className="listing-card-stats">
                       <span className="text-xs text-neutral-400">ID: {client.id.slice(0, 8)}...</span>
                  </div>
             </div> */}

            {/* Actions */}
            <div className="listing-card-actions">
                <button
                    onClick={() => handleAction(() => onEdit(client))}
                    className="action-btn-icon"
                    title={t('actions.edit', { defaultValue: 'Modifier' })}
                >
                    <Edit2 size={16} />
                </button>

                <div className="relative">
                    <button
                        onClick={handleMenuClick}
                        className="action-btn-icon"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 min-w-[12rem] bg-white dark:bg-black rounded-lg shadow-xl border border-neutral-200 dark:border-white/10 z-50 py-1">
                            <button
                                onClick={() => handleAction(() => onDelete(client))}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                                <Trash2 size={14} /> {t('actions.delete', { defaultValue: 'Supprimer' })}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
