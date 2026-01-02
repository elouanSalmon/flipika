import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, FileStack, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Campaign } from '../../types/business';
import type { PeriodPreset, TemplateWidgetConfig } from '../../types/templateTypes';
import { PERIOD_PRESETS } from '../../types/templateTypes';
import WidgetSelector from './WidgetSelector';
import ConfirmationModal from '../common/ConfirmationModal';
import './TemplateConfigModal.css';

interface GoogleAdsAccount {
    id: string;
    name: string;
}

interface TemplateConfigModalProps {
    onClose: () => void;
    onSubmit: (config: TemplateConfig) => void | Promise<void>;
    accounts: GoogleAdsAccount[];
    selectedAccountId?: string;
    onAccountChange?: (accountId: string) => void;
    campaigns: Campaign[];
    isEditMode?: boolean;
    initialConfig?: Partial<TemplateConfig>;
    isSubmitting?: boolean; // Kept for backward compatibility but ignored in favor of internal state
}

export interface TemplateConfig {
    name: string;
    description?: string;
    accountId?: string;
    accountName?: string;
    campaignIds: string[];
    campaignNames?: string[];
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
}) => {
    const [name, setName] = useState(initialConfig?.name || '');
    const [description, setDescription] = useState(initialConfig?.description || '');
    const [accountId, setAccountId] = useState(selectedAccountId || initialConfig?.accountId || '');
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(initialConfig?.campaignIds || []);
    const [periodPreset, setPeriodPreset] = useState<PeriodPreset>(initialConfig?.periodPreset || 'last_30_days');
    const [widgetConfigs, setWidgetConfigs] = useState<TemplateWidgetConfig[]>(initialConfig?.widgetConfigs || []);
    const [selectAll, setSelectAll] = useState(false);

    // Safeguards
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [initialStateStr, setInitialStateStr] = useState('');

    // Capture initial state for dirty check
    useEffect(() => {
        const state = {
            name: initialConfig?.name || '',
            description: initialConfig?.description || '',
            accountId: selectedAccountId || initialConfig?.accountId || '',
            campaignIds: initialConfig?.campaignIds || [],
            periodPreset: initialConfig?.periodPreset || 'last_30_days',
            widgetConfigs: initialConfig?.widgetConfigs || []
        };
        setInitialStateStr(JSON.stringify(state));
    }, [initialConfig, selectedAccountId]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Veuillez donner un nom au template');
            return;
        }

        if (!accountId) {
            toast.error('Veuillez sélectionner un compte Google Ads');
            return;
        }

        if (selectedCampaigns.length === 0) {
            toast.error('Veuillez sélectionner au moins une campagne');
            return;
        }

        if (widgetConfigs.length === 0) {
            toast.error('Veuillez sélectionner au moins un widget');
            return;
        }

        try {
            setIsSubmitting(true);
            await onSubmit({
                name: name.trim(),
                description: description.trim() || undefined,
                accountId: accountId || undefined,
                accountName: accounts.find(a => a.id === accountId)?.name,
                campaignIds: selectedCampaigns,
                campaignNames: campaigns
                    .filter(c => selectedCampaigns.includes(c.id))
                    .map(c => c.name),
                periodPreset,
                widgetConfigs,
            });
        } catch (error) {
            console.error("Error submitting template:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasUnsavedChanges = () => {
        const currentState = {
            name,
            description,
            accountId,
            campaignIds: selectedCampaigns,
            periodPreset,
            widgetConfigs
        };
        return JSON.stringify(currentState) !== initialStateStr;
    };

    const handleCloseAttempt = () => {
        if (hasUnsavedChanges()) {
            setShowUnsavedModal(true);
        } else {
            onClose();
        }
    };

    const resetAndClose = () => {
        setShowUnsavedModal(false);
        onClose();
    };

    return (
        <>
            <div className="template-config-modal-overlay" onClick={handleCloseAttempt}>
                <div className="template-config-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <div className="header-content">
                            <FileStack size={24} className="header-icon" />
                            <h2>{isEditMode ? 'Modifier le Template' : 'Nouveau Template de Rapport'}</h2>
                        </div>
                        <button className="close-btn" onClick={handleCloseAttempt} disabled={isSubmitting}>
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
                                    disabled={isSubmitting}
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
                                    disabled={isSubmitting}
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
                                        disabled={isSubmitting}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Account & Campaigns (Mandatory) */}
                        <div className="form-section">
                            <h3>
                                <span className="flex items-center gap-2">
                                    Compte et Campagnes
                                    {(!accountId || selectedCampaigns.length === 0) && (
                                        <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">Requis</span>
                                    )}
                                </span>
                            </h3>
                            <p className="section-description">
                                Sélectionnez le compte et les campagnes à analyser pour ce template.
                            </p>

                            {accounts.length > 0 && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="account">Compte Google Ads</label>
                                        <select
                                            id="account"
                                            value={accountId}
                                            onChange={(e) => handleAccountChange(e.target.value)}
                                            disabled={isSubmitting}
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
                                                    disabled={isSubmitting}
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
                                                            disabled={isSubmitting}
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
                            <button type="button" className="btn btn-secondary" onClick={handleCloseAttempt} disabled={isSubmitting}>
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!name.trim() || widgetConfigs.length === 0 || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin h-[18px] w-[18px] mr-2" />
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

            <ConfirmationModal
                isOpen={showUnsavedModal}
                onClose={() => setShowUnsavedModal(false)}
                onConfirm={resetAndClose}
                title="Modifications non enregistrées"
                message="Vous avez des modifications en cours. Êtes-vous sûr de vouloir fermer sans enregistrer ?"
                confirmLabel="Fermer sans enregistrer"
                isDestructive={true}
            />
        </>
    );
};

export default TemplateConfigModal;
