import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Loader2 } from 'lucide-react';
import type { Campaign } from '../../types/business';
import { useClients } from '../../hooks/useClients';
import './ReportConfigModal.css';

interface GoogleAdsAccount {
    id: string;
    name: string;
}

interface ReportConfigModalProps {
    onClose: () => void;
    onSubmit: (config: ReportConfig) => void;
    accounts: GoogleAdsAccount[]; // Still useful for validation/name lookup
    selectedAccountId: string; // Legacy/Derived
    onAccountChange: (accountId: string) => void; // Maybe unused now?
    campaigns: Campaign[];
    isEditMode?: boolean;
    initialConfig?: Partial<ReportConfig>;
    isSubmitting?: boolean;
}

export interface ReportConfig {
    title: string;
    clientId: string; // NEW: Required
    accountId: string;
    campaignIds: string[];
    dateRange: {
        start: string;
        end: string;
        preset?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom';
    };
}

const DATE_PRESETS = [
    { value: 'last_7_days', labelKey: 'config.periods.last7Days' },
    { value: 'last_30_days', labelKey: 'config.periods.last30Days' },
    { value: 'last_90_days', labelKey: 'config.periods.last90Days' },
    { value: 'this_month', labelKey: 'config.periods.thisMonth' },
    { value: 'last_month', labelKey: 'config.periods.lastMonth' },
    { value: 'custom', labelKey: 'config.periods.custom' },
];

const getDateRangeFromPreset = (preset: string): { start: string; end: string } => {
    const end = new Date();
    const start = new Date();

    switch (preset) {
        case 'last_7_days':
            start.setDate(end.getDate() - 7);
            break;
        case 'last_30_days':
            start.setDate(end.getDate() - 30);
            break;
        case 'last_90_days':
            start.setDate(end.getDate() - 90);
            break;
        case 'this_month':
            start.setDate(1);
            break;
        case 'last_month':
            start.setMonth(end.getMonth() - 1);
            start.setDate(1);
            end.setDate(0);
            break;
        default:
            start.setDate(end.getDate() - 30);
    }

    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
    };
};

const ReportConfigModal: React.FC<ReportConfigModalProps> = ({
    onClose,
    onSubmit,
    accounts,
    selectedAccountId,
    onAccountChange,
    campaigns,
    isEditMode = false,
    initialConfig,
    isSubmitting = false,
}) => {
    const { t, i18n } = useTranslation('reports');
    // Fetch clients
    const { clients, isLoading: loadingClients } = useClients();

    const [title, setTitle] = useState(initialConfig?.title || t('list.newReport'));
    // New state for Client
    const [selectedClientId, setSelectedClientId] = useState<string>(initialConfig?.clientId || '');

    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(initialConfig?.campaignIds || []);
    const [datePreset, setDatePreset] = useState<string>(initialConfig?.dateRange?.preset || 'last_30_days');
    const [customDateRange, setCustomDateRange] = useState(
        initialConfig?.dateRange ? { start: initialConfig.dateRange.start, end: initialConfig.dateRange.end } : getDateRangeFromPreset('last_30_days')
    );
    const [selectAll, setSelectAll] = useState(false);

    // Effect: When client selection changes, update account ID
    useEffect(() => {
        if (selectedClientId) {
            const client = clients.find(c => c.id === selectedClientId);
            if (client && client.googleAdsCustomerId) {
                // Determine if we need to notify parent about account change (to fetch campaigns)
                if (client.googleAdsCustomerId !== selectedAccountId) {
                    onAccountChange(client.googleAdsCustomerId);
                }
            }
        }
    }, [selectedClientId, clients]);

    // Initial load: If in edit mode and we have clientId, explicit set
    // This is handled by useState initialization if initialConfig has clientId.
    // However, for existing reports (migration scenario), we might have accountId but no clientId.
    // In that case, we should try to reverse-match accountId to a client?
    useEffect(() => {
        if (isEditMode && initialConfig?.accountId && !selectedClientId && clients.length > 0) {
            const matchingClient = clients.find(c => c.googleAdsCustomerId === initialConfig.accountId);
            if (matchingClient) {
                setSelectedClientId(matchingClient.id);
            }
        }
    }, [isEditMode, initialConfig, clients, selectedClientId]);

    const handleClientChange = (clientId: string) => {
        setSelectedClientId(clientId);
        // Effects will trigger account update
        // Reset campaigns when switching client
        setSelectedCampaigns([]);
    };

    const handlePresetChange = (preset: string) => {
        setDatePreset(preset);
        if (preset !== 'custom') {
            setCustomDateRange(getDateRangeFromPreset(preset));
        }
    };

    const handleToggleCampaign = (campaignId: string) => {
        setSelectedCampaigns(prev =>
            prev.includes(campaignId)
                ? prev.filter(id => id !== campaignId)
                : [...prev, campaignId]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedCampaigns([]);
        } else {
            setSelectedCampaigns(campaigns.map(c => c.id));
        }
        setSelectAll(!selectAll);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedClientId) {
            alert(t('config.client.required')); // Need to add translation or hardcode fallback
            return;
        }

        if (selectedCampaigns.length === 0) {
            alert(t('config.campaigns.atLeastOne'));
            return;
        }

        onSubmit({
            title,
            clientId: selectedClientId,
            accountId: selectedAccountId,
            campaignIds: selectedCampaigns,
            dateRange: {
                ...customDateRange,
                preset: datePreset as any,
            },
        });
    };

    return createPortal(
        <div className="report-config-modal-overlay" onClick={onClose}>
            <div className="report-config-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditMode ? t('config.settings') : t('config.title')}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-content">
                    {/* Titre */}
                    <div className="form-group">
                        <label htmlFor="title">{t('config.reportTitle')}</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('config.titlePlaceholder')}
                            required
                        />
                    </div>

                    {/* Client Selection */}
                    <div className="form-group">
                        <label htmlFor="client">{t('config.clientLabel', { defaultValue: 'Client' })}</label>
                        {loadingClients ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Loader2 size={16} className="animate-spin" />
                                {t('config.loadingClients', { defaultValue: 'Chargement des clients...' })}
                            </div>
                        ) : clients.length === 0 ? (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm border border-yellow-200 dark:border-yellow-800">
                                {t('config.noClients', { defaultValue: 'Aucun client trouvé.' })}
                                <a href="/app/clients" className="underline ml-1 font-medium hover:text-yellow-900 dark:hover:text-yellow-100">
                                    {t('config.createClient', { defaultValue: 'Créer un client' })}
                                </a>
                            </div>
                        ) : (
                            <select
                                id="client"
                                value={selectedClientId}
                                onChange={(e) => handleClientChange(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'var(--glass-bg)',
                                    border: '2px solid var(--color-border)',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    color: 'var(--color-text-primary)',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="" disabled>
                                    {t('config.selectClient', { defaultValue: 'Sélectionner un client' })}
                                </option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {/* Selected Account Display (Read-only info) */}
                        {selectedClientId && selectedAccountId && (
                            <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                                <span className="font-medium">Compte Google Ads :</span>
                                {accounts.find(a => a.id === selectedAccountId)?.name || selectedAccountId}
                            </div>
                        )}
                        {selectedClientId && !selectedAccountId && (
                            <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                ⚠ {t('config.noAccountLinked', { defaultValue: 'Aucun compte Google Ads lié à ce client.' })}
                            </div>
                        )}
                    </div>

                    {/* Période */}
                    <div className="form-group">
                        <label>
                            {t('config.analysisPeriod')}
                        </label>
                        <div className="date-presets">
                            {DATE_PRESETS.map(preset => (
                                <button
                                    key={preset.value}
                                    type="button"
                                    className={`preset-btn ${datePreset === preset.value ? 'active' : ''}`}
                                    onClick={() => handlePresetChange(preset.value)}
                                >
                                    {t(preset.labelKey)}
                                </button>
                            ))}
                        </div>

                        {datePreset === 'custom' && (
                            <div className="custom-date-range">
                                <div className="date-input">
                                    <label htmlFor="start-date">{t('config.dateRange.from')}</label>
                                    <input
                                        id="start-date"
                                        type="date"
                                        value={customDateRange.start}
                                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="date-input">
                                    <label htmlFor="end-date">{t('config.dateRange.to')}</label>
                                    <input
                                        id="end-date"
                                        type="date"
                                        value={customDateRange.end}
                                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="date-range-display">
                            {t('config.dateRange.display', {
                                start: new Date(customDateRange.start).toLocaleDateString(i18n.language),
                                end: new Date(customDateRange.end).toLocaleDateString(i18n.language)
                            })}
                        </div>
                    </div>

                    {/* Campagnes */}
                    <div className="form-group">
                        <label>
                            {t('config.campaigns.title', { count: selectedCampaigns.length })}
                        </label>

                        <div className="campaigns-header">
                            <button
                                type="button"
                                className="select-all-btn"
                                onClick={handleSelectAll}
                            >
                                {selectAll ? t('config.campaigns.deselectAll') : t('config.campaigns.selectAll')}
                            </button>
                        </div>

                        <div className="campaigns-list">
                            {campaigns.length === 0 ? (
                                <div className="empty-campaigns">
                                    {t('config.campaigns.noCampaigns')}
                                </div>
                            ) : (
                                campaigns.map(campaign => (
                                    <label key={campaign.id} className="campaign-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedCampaigns.includes(campaign.id)}
                                            onChange={() => handleToggleCampaign(campaign.id)}
                                        />
                                        <span className="campaign-name">{campaign.name}</span>
                                        {campaign.status && (
                                            <span className={`campaign-status status-${String(campaign.status).toLowerCase()}`}>
                                                {String(campaign.status)}
                                            </span>
                                        )}
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            {t('config.actions.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={selectedCampaigns.length === 0 || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin h-[18px] w-[18px] mr-2" />
                                    {t('config.actions.updating')}
                                </>
                            ) : (
                                isEditMode ? t('config.actions.update') : t('config.actions.create')
                            )}
                        </button>
                    </div>
                </form>
            </div >
        </div >,
        document.body
    );
};

export default ReportConfigModal;
