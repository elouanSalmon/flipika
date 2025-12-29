import React, { useState } from 'react';
import { X, Calendar, Target } from 'lucide-react';
import type { Campaign } from '../../types/business';
import './ReportConfigModal.css';

interface GoogleAdsAccount {
    id: string;
    name: string;
}

interface ReportConfigModalProps {
    onClose: () => void;
    onSubmit: (config: ReportConfig) => void;
    accounts: GoogleAdsAccount[];
    selectedAccountId: string;
    onAccountChange: (accountId: string) => void;
    campaigns: Campaign[];
    isEditMode?: boolean;
    initialConfig?: Partial<ReportConfig>;
    isSubmitting?: boolean;
}

export interface ReportConfig {
    title: string;
    accountId: string;
    campaignIds: string[];
    dateRange: {
        start: string;
        end: string;
        preset?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom';
    };
}

const DATE_PRESETS = [
    { value: 'last_7_days', label: 'Derniers 7 jours' },
    { value: 'last_30_days', label: 'Derniers 30 jours' },
    { value: 'last_90_days', label: 'Derniers 90 jours' },
    { value: 'this_month', label: 'Ce mois' },
    { value: 'last_month', label: 'Mois dernier' },
    { value: 'custom', label: 'Personnalisé' },
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

    const [title, setTitle] = useState(initialConfig?.title || 'Nouveau Rapport');
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(initialConfig?.campaignIds || []);
    const [datePreset, setDatePreset] = useState<string>(initialConfig?.dateRange?.preset || 'last_30_days');
    const [customDateRange, setCustomDateRange] = useState(
        initialConfig?.dateRange ? { start: initialConfig.dateRange.start, end: initialConfig.dateRange.end } : getDateRangeFromPreset('last_30_days')
    );
    const [selectAll, setSelectAll] = useState(false);

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

        if (selectedCampaigns.length === 0) {
            alert('Veuillez sélectionner au moins une campagne');
            return;
        }

        onSubmit({
            title,
            accountId: selectedAccountId,
            campaignIds: selectedCampaigns,
            dateRange: {
                ...customDateRange,
                preset: datePreset as any,
            },
        });
    };

    return (
        <div className="report-config-modal-overlay" onClick={onClose}>
            <div className="report-config-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditMode ? 'Paramètres du Rapport' : 'Configuration du Rapport'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-content">
                    {/* Titre */}
                    <div className="form-group">
                        <label htmlFor="title">Titre du rapport</label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Rapport Mensuel Décembre 2024"
                            required
                        />
                    </div>

                    {/* Compte Google Ads */}
                    <div className="form-group">
                        <label htmlFor="account">Compte Google Ads</label>
                        <select
                            id="account"
                            value={selectedAccountId}
                            onChange={(e) => onAccountChange(e.target.value)}
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
                            {accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Période */}
                    <div className="form-group">
                        <label>
                            <Calendar size={18} />
                            <span>Période d'analyse</span>
                        </label>
                        <div className="date-presets">
                            {DATE_PRESETS.map(preset => (
                                <button
                                    key={preset.value}
                                    type="button"
                                    className={`preset-btn ${datePreset === preset.value ? 'active' : ''}`}
                                    onClick={() => handlePresetChange(preset.value)}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        {datePreset === 'custom' && (
                            <div className="custom-date-range">
                                <div className="date-input">
                                    <label htmlFor="start-date">Du</label>
                                    <input
                                        id="start-date"
                                        type="date"
                                        value={customDateRange.start}
                                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="date-input">
                                    <label htmlFor="end-date">Au</label>
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
                            Du {new Date(customDateRange.start).toLocaleDateString('fr-FR')} au {new Date(customDateRange.end).toLocaleDateString('fr-FR')}
                        </div>
                    </div>

                    {/* Campagnes */}
                    <div className="form-group">
                        <label>
                            <Target size={18} />
                            <span>Campagnes ({selectedCampaigns.length} sélectionnée{selectedCampaigns.length > 1 ? 's' : ''})</span>
                        </label>

                        <div className="campaigns-header">
                            <button
                                type="button"
                                className="select-all-btn"
                                onClick={handleSelectAll}
                            >
                                {selectAll ? 'Tout désélectionner' : 'Tout sélectionner'}
                            </button>
                        </div>

                        <div className="campaigns-list">
                            {campaigns.length === 0 ? (
                                <div className="empty-campaigns">
                                    Aucune campagne disponible
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
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={selectedCampaigns.length === 0 || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-[18px] w-[18px] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Mise à jour...
                                </>
                            ) : (
                                isEditMode ? 'Mettre à jour' : 'Créer le rapport'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportConfigModal;
