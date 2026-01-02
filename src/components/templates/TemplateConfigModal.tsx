import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Plus, Grid, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Campaign } from '../../types/business';
import type { PeriodPreset, TemplateWidgetConfig } from '../../types/templateTypes';
import { PERIOD_PRESETS } from '../../types/templateTypes';
import { WidgetType } from '../../types/reportTypes';
import ConfirmationModal from '../common/ConfirmationModal';
import './TemplateConfigModal.css';
import WidgetLibrary from '../reports/WidgetLibrary';

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
    isSubmitting?: boolean;
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

const getWidgetTitle = (type: string) => {
    switch (type) {
        case WidgetType.PERFORMANCE_OVERVIEW: return 'Vue d\'ensemble';
        case WidgetType.KEY_METRICS: return 'Métriques Clés';
        case WidgetType.CAMPAIGN_CHART: return 'Graphique';
        case WidgetType.AD_CREATIVE: return 'Aperçu d\'annonce';
        case WidgetType.TEXT_BLOCK: return 'Bloc de texte';
        case WidgetType.CUSTOM: return 'Personnalisé';
        default: return type;
    }
};

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
    // selectAll state removed as it was unused and replaced by derived state
    const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);

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
        setSelectedCampaigns([]); // Reset campaigns on account change
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

    const currentAccountCampaigns = campaigns.filter(c => c.accountId === accountId);

    const handleSelectAllCampaigns = () => {
        if (selectedCampaigns.length === currentAccountCampaigns.length) {
            setSelectedCampaigns([]);
        } else {
            setSelectedCampaigns(currentAccountCampaigns.map(c => c.id));
        }
    };

    const handleAddWidget = (type: WidgetType) => {
        const newWidget: TemplateWidgetConfig = {
            type,
            order: widgetConfigs.length,
            settings: {} // Initialize with empty settings
        };
        setWidgetConfigs(prev => [...prev, newWidget]);
        setShowWidgetLibrary(false);
    };

    const handleRemoveWidget = (indexToRemove: number) => {
        setWidgetConfigs(prev => prev.filter((_, index) => index !== indexToRemove));
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
            {createPortal(
                <div className="template-config-modal-overlay" onClick={handleCloseAttempt}>
                    <div className="template-config-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditMode ? 'Modifier le Template' : 'Nouveau Template de Rapport'}</h2>
                            <button className="close-btn" onClick={handleCloseAttempt} disabled={isSubmitting}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-content">
                            {/* Template Info */}
                            <div className="form-section">
                                <h3>Informations du Template</h3>

                                <div className="form-group">
                                    <label htmlFor="template-name">Nom du template *</label>
                                    <input
                                        id="template-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Rapport Hebdomadaire SEA"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="template-desc">Description (optionnel)</label>
                                    <textarea
                                        id="template-desc"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Description de ce template..."
                                        rows={3}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Period Preset */}
                            <div className="form-section">
                                <h3>Période d'analyse</h3>
                                <p className="section-description">
                                    Sélectionnez une période relative. Les dates seront calculées automatiquement lors de la création du rapport.
                                </p>
                                <div className="period-presets">
                                    {PERIOD_PRESETS.map((preset) => (
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
                                    Compte et Campagnes
                                    {(!accountId || selectedCampaigns.length === 0) && (
                                        <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400 ml-2">Requis</span>
                                    )}
                                </h3>
                                <p className="section-description">
                                    Sélectionnez le compte et les campagnes à analyser pour ce template.
                                </p>

                                {accounts.length > 0 && (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="template-account">Compte Google Ads *</label>
                                            <select
                                                id="template-account"
                                                value={accountId}
                                                onChange={(e) => handleAccountChange(e.target.value)}
                                                required
                                                disabled={isSubmitting}
                                            >
                                                <option value="">-- Définir lors de l'utilisation --</option>
                                                {accounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {accountId && (
                                            <div className="form-group">
                                                <label>Campagnes ({selectedCampaigns.length} sélectionnée{selectedCampaigns.length > 1 ? 's' : ''}) *</label>
                                                <div className="campaigns-selection">
                                                    <div className="campaigns-header">
                                                        <button
                                                            type="button"
                                                            className="select-all-btn"
                                                            onClick={handleSelectAllCampaigns}
                                                            disabled={isSubmitting}
                                                        >
                                                            {selectedCampaigns.length === currentAccountCampaigns.length && currentAccountCampaigns.length > 0 ? 'Tout désélectionner' : 'Tout sélectionner'}
                                                        </button>
                                                    </div>
                                                    <div className="campaigns-list">
                                                        {currentAccountCampaigns.length === 0 ? (
                                                            <div className="empty-message">Aucune campagne trouvée pour ce compte</div>
                                                        ) : (
                                                            currentAccountCampaigns.map(campaign => (
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
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Widgets Configuration */}
                            <div className="form-section">
                                <div className="section-header">
                                    <div>
                                        <h3>Widgets à inclure *</h3>
                                        <p className="section-description">
                                            Configurez les widgets par défaut pour ce template.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="add-widget-btn"
                                        onClick={() => setShowWidgetLibrary(true)}
                                        disabled={isSubmitting}
                                    >
                                        <Plus size={16} /> Ajouter un widget
                                    </button>
                                </div>

                                {widgetConfigs.length === 0 ? (
                                    <div className="empty-widgets" onClick={() => setShowWidgetLibrary(true)}>
                                        <div className="empty-icon"><Grid size={32} /></div>
                                        <p>Aucun widget configuré</p>
                                        <span>Cliquez pour ajouter des widgets au template</span>
                                    </div>
                                ) : (
                                    <div className="widgets-list">
                                        {widgetConfigs.map((config, index) => (
                                            <div key={index} className="widget-preview-item">
                                                <div className="widget-info">
                                                    {/* <span className="widget-type">{config.type}</span> */}
                                                    <span className="widget-title">{getWidgetTitle(config.type)}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="remove-widget-btn"
                                                    onClick={() => handleRemoveWidget(index)}
                                                    disabled={isSubmitting}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={handleCloseAttempt} disabled={isSubmitting}>
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
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

                        {/* Widget Library Modal (Nested) */}
                        {showWidgetLibrary && (
                            <div className="nested-modal-overlay">
                                <div className="nested-modal-content">
                                    <div className="nested-modal-header">
                                        <h3>Ajouter un widget</h3>
                                        <button onClick={() => setShowWidgetLibrary(false)}><X size={20} /></button>
                                    </div>
                                    <WidgetLibrary
                                        onAddWidget={handleAddWidget}
                                        onClose={() => setShowWidgetLibrary(false)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}

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
