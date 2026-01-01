import React, { useState } from 'react';
import { X, Calendar, FileText, FileStack } from 'lucide-react';
import type { Campaign } from '../../types/business';
import type { PeriodPreset, TemplateWidgetConfig } from '../../types/templateTypes';
import { PERIOD_PRESETS } from '../../types/templateTypes';
import WidgetSelector from './WidgetSelector';
import './TemplateConfigModal.css';

interface GoogleAdsAccount {
    id: string;
    name: string;
}

interface TemplateConfigModalProps {
    onClose: () => void;
    onSubmit: (config: TemplateConfig) => void;
    accounts: GoogleAdsAccount[];
    selectedAccountId?: string;
    onAccountChange?: (accountId: string) => void;
    campaigns: Campaign[];
    isEditMode?: boolean;
    initialConfig?: Partial<TemplateConfig>;
    isSubmitting?: boolean;
}

export interface TemplateConfig {
    name: string;
    description?: string;
    accountId?: string;
    campaignIds: string[];
    periodPreset: PeriodPreset;
    widgetConfigs: TemplateWidgetConfig[];
}

const TemplateConfigModal: React.FC<TemplateConfigModalProps> = ({
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
    const [name, setName] = useState(initialConfig?.name || '');
    const [description, setDescription] = useState(initialConfig?.description || '');
    const [accountId, setAccountId] = useState(selectedAccountId || initialConfig?.accountId || '');
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(initialConfig?.campaignIds || []);
    const [periodPreset, setPeriodPreset] = useState<PeriodPreset>(initialConfig?.periodPreset || 'last_30_days');
    const [widgetConfigs, setWidgetConfigs] = useState<TemplateWidgetConfig[]>(initialConfig?.widgetConfigs || []);
    const [selectAll, setSelectAll] = useState(false);

    const handleAccountChange = (newAccountId: string) => {
        setAccountId(newAccountId);
        if (onAccountChange) {
            onAccountChange(newAccountId);
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

        if (!name.trim()) {
            alert('Veuillez donner un nom au template');
            return;
        }

        if (widgetConfigs.length === 0) {
            alert('Veuillez sélectionner au moins un widget');
            return;
        }

        onSubmit({
            name: name.trim(),
            description: description.trim() || undefined,
            accountId: accountId || undefined,
            campaignIds: selectedCampaigns,
            periodPreset,
            widgetConfigs,
        });
    };

    return (
        <div className="template-config-modal-overlay" onClick={onClose}>
            <div className="template-config-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-content">
                        <FileStack size={24} className="header-icon" />
                        <h2>{isEditMode ? 'Modifier le Template' : 'Nouveau Template de Rapport'}</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-content">
                    {/* Template Info */}
                    <div className="form-section">
                        <h3>
                            <FileText size={18} />
                            <span>Informations du Template</span>
                        </h3>

                        <div className="form-group">
                            <label htmlFor="template-name">Nom du template *</label>
                            <input
                                id="template-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Rapport Mensuel Performance"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="template-description">Description (optionnel)</label>
                            <textarea
                                id="template-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Décrivez ce template et son utilisation..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Period Preset */}
                    <div className="form-section">
                        <h3>
                            <Calendar size={18} />
                            <span>Période d'analyse</span>
                        </h3>
                        <p className="section-description">
                            Sélectionnez une période relative. Les dates seront calculées automatiquement lors de la création du rapport.
                        </p>

                        <div className="period-presets">
                            {PERIOD_PRESETS.map(preset => (
                                <button
                                    key={preset.value}
                                    type="button"
                                    className={`preset-btn ${periodPreset === preset.value ? 'active' : ''}`}
                                    onClick={() => setPeriodPreset(preset.value)}
                                    title={preset.description}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Account & Campaigns (Optional) */}
                    <div className="form-section optional-section">
                        <h3>Compte et Campagnes (optionnel)</h3>
                        <p className="section-description">
                            Vous pouvez pré-sélectionner un compte et des campagnes, ou les définir lors de l'utilisation du template.
                        </p>

                        {accounts.length > 0 && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="account">Compte Google Ads</label>
                                    <select
                                        id="account"
                                        value={accountId}
                                        onChange={(e) => handleAccountChange(e.target.value)}
                                    >
                                        <option value="">-- Définir lors de l'utilisation --</option>
                                        {accounts.map(account => (
                                            <option key={account.id} value={account.id}>
                                                {account.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {accountId && campaigns.length > 0 && (
                                    <div className="form-group">
                                        <label>
                                            Campagnes ({selectedCampaigns.length} sélectionnée{selectedCampaigns.length > 1 ? 's' : ''})
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
                                            {campaigns.map(campaign => (
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
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Widget Selection */}
                    <div className="form-section">
                        <h3>Widgets à inclure *</h3>
                        <p className="section-description">
                            Sélectionnez et configurez les widgets qui seront automatiquement ajoutés aux rapports créés depuis ce template.
                        </p>

                        <WidgetSelector
                            widgetConfigs={widgetConfigs}
                            onChange={setWidgetConfigs}
                        />
                    </div>

                    {/* Actions */}
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!name.trim() || widgetConfigs.length === 0 || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-[18px] w-[18px] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {isEditMode ? 'Mise à jour...' : 'Création...'}
                                </>
                            ) : (
                                isEditMode ? 'Mettre à jour le template' : 'Créer le template'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TemplateConfigModal;
