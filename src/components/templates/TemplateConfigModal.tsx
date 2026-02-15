import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Users, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Campaign } from '../../types/business';
import type { PeriodPreset, TemplateSlideConfig } from '../../types/templateTypes';
import { PERIOD_PRESETS } from '../../types/templateTypes';
import ConfirmationModal from '../common/ConfirmationModal';
import './TemplateConfigModal.css';
import { useTutorial } from '../../contexts/TutorialContext';
import { useTranslation } from 'react-i18next';
import { useClients } from '../../hooks/useClients';
import { getGoogleAdsAccountId, getMetaAdsAccountId } from '../../types/clientHelpers';
import { fetchMetaCampaigns } from '../../services/metaAds';

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
    clientId?: string;
    clientName?: string;
    accountId?: string;
    campaignIds: string[];
    campaignNames?: string[];
    metaAccountId?: string;
    metaCampaignIds?: string[];
    periodPreset: PeriodPreset;
    slideConfigs: TemplateSlideConfig[];
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

    // Client & Account State
    const { clients, isLoading: loadingClients } = useClients();
    const [selectedClientId, setSelectedClientId] = useState<string>(initialConfig?.clientId || '');
    const [accountId, setAccountId] = useState(selectedAccountId || initialConfig?.accountId || '');

    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(initialConfig?.campaignIds || []);
    const [periodPreset, setPeriodPreset] = useState<PeriodPreset>(initialConfig?.periodPreset || 'last_30_days');
    const { t } = useTranslation('templates');

    // Meta Ads State
    const [metaAccountId, setMetaAccountId] = useState<string>(initialConfig?.metaAccountId || '');
    const [metaCampaigns, setMetaCampaigns] = useState<any[]>([]);
    const [selectedMetaCampaigns, setSelectedMetaCampaigns] = useState<string[]>(initialConfig?.metaCampaignIds || []);
    const [isLoadingMetaCampaigns, setIsLoadingMetaCampaigns] = useState(false);

    // Effect: When client selection changes, update account ID
    useEffect(() => {
        if (selectedClientId) {
            const client = clients.find(c => c.id === selectedClientId);

            // Handle Google Ads
            const clientGoogleAdsId = client ? getGoogleAdsAccountId(client) : null;
            if (clientGoogleAdsId) {
                if (clientGoogleAdsId !== accountId) {
                    setAccountId(clientGoogleAdsId);
                    if (onAccountChange) {
                        onAccountChange(clientGoogleAdsId);
                    }
                    setSelectedCampaigns([]);
                }
            } else if (client && !clientGoogleAdsId) {
                setAccountId('');
                if (onAccountChange) {
                    onAccountChange('');
                }
                setSelectedCampaigns([]);
            }

            // Handle Meta Ads
            const clientMetaAdsId = client ? getMetaAdsAccountId(client) : null;
            if (clientMetaAdsId && clientMetaAdsId !== metaAccountId) {
                setMetaAccountId(clientMetaAdsId);
                setSelectedMetaCampaigns([]);
            } else if (!clientMetaAdsId) {
                setMetaAccountId('');
                setMetaCampaigns([]);
                setSelectedMetaCampaigns([]);
            }
        }
    }, [selectedClientId, clients]);

    // Effect: Load Meta Campaigns
    useEffect(() => {
        if (metaAccountId) {
            loadMetaCampaigns(metaAccountId);
        } else {
            setMetaCampaigns([]);
        }
    }, [metaAccountId]);

    const loadMetaCampaigns = async (accountId: string) => {
        setIsLoadingMetaCampaigns(true);
        try {
            const response = await fetchMetaCampaigns(accountId);
            if (response.success && response.campaigns) {
                setMetaCampaigns(response.campaigns);
            } else {
                setMetaCampaigns([]);
            }
        } catch (error) {
            console.error('Error loading Meta campaigns:', error);
            setMetaCampaigns([]);
        } finally {
            setIsLoadingMetaCampaigns(false);
        }
    };

    // Backward compatibility: If editing and we have accountId but no clientId, try to match
    useEffect(() => {
        if (isEditMode && initialConfig?.accountId && !selectedClientId && clients.length > 0) {
            const matchingClient = clients.find(c => getGoogleAdsAccountId(c) === initialConfig.accountId);
            if (matchingClient) {
                setSelectedClientId(matchingClient.id);
            }
        }
    }, [isEditMode, initialConfig, clients, selectedClientId]);

    const handleClientChange = (clientId: string) => {
        setSelectedClientId(clientId);
        // Effect will handle accountId update and campaign reset
    };

    // Safeguards
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { refresh: refreshTutorial } = useTutorial();
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [initialStateStr, setInitialStateStr] = useState('');

    // Capture initial state for dirty check
    useEffect(() => {
        const state = {
            name: initialConfig?.name || '',
            description: initialConfig?.description || '',
            clientId: initialConfig?.clientId || '',
            accountId: selectedAccountId || initialConfig?.accountId || '',
            campaignIds: initialConfig?.campaignIds || [],
            periodPreset: initialConfig?.periodPreset || 'last_30_days'
        };
        setInitialStateStr(JSON.stringify(state));
    }, [initialConfig, selectedAccountId]);

    // Manual account selection is deprecated in favor of client selection
    // But we keep this internal helper if needed or just remove it.
    // Logic moved to effect.

    const handleToggleCampaign = (campaignId: string) => {
        setSelectedCampaigns(prev =>
            prev.includes(campaignId)
                ? prev.filter(id => id !== campaignId)
                : [...prev, campaignId]
        );
    };

    const currentAccountCampaigns = campaigns;

    const handleSelectAllCampaigns = () => {
        if (selectedCampaigns.length === currentAccountCampaigns.length) {
            setSelectedCampaigns([]);
        } else {
            setSelectedCampaigns(currentAccountCampaigns.map(c => c.id));
        }
    };

    const handleToggleMetaCampaign = (campaignId: string) => {
        setSelectedMetaCampaigns(prev =>
            prev.includes(campaignId)
                ? prev.filter(id => id !== campaignId)
                : [...prev, campaignId]
        );
    };

    const handleSelectAllMetaCampaigns = () => {
        if (selectedMetaCampaigns.length === metaCampaigns.length) {
            setSelectedMetaCampaigns([]);
        } else {
            setSelectedMetaCampaigns(metaCampaigns.map(c => c.id));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error(t('configModal.validation.nameRequired'));
            return;
        }

        if (!selectedClientId) {
            toast.error(t('configModal.validation.clientRequired', { defaultValue: 'Veuillez sélectionner un client' }));
            return;
        }

        if (!accountId) {
            toast.error(t('configModal.validation.accountRequired'));
            return;
        }

        if (selectedCampaigns.length === 0 && selectedMetaCampaigns.length === 0) {
            toast.error(t('configModal.validation.campaignsRequired'));
            return;
        }

        try {
            setIsSubmitting(true);
            const client = clients.find(c => c.id === selectedClientId);

            await onSubmit({
                name: name.trim(),
                description: description.trim() || undefined,
                clientId: selectedClientId,
                clientName: client?.name,
                accountId: accountId || undefined,
                campaignIds: selectedCampaigns,
                campaignNames: campaigns
                    .filter(c => selectedCampaigns.includes(c.id))
                    .map(c => c.name),
                metaAccountId: metaAccountId || undefined,
                metaCampaignIds: selectedMetaCampaigns.length > 0 ? selectedMetaCampaigns : undefined,
                periodPreset,
                slideConfigs: [], // Empty array - slides will be configured in editor
            });
            await refreshTutorial();
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
            clientId: selectedClientId,
            accountId,
            campaignIds: selectedCampaigns,
            periodPreset
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
                <div className="modal-overlay" onClick={handleCloseAttempt}>
                    <div className="template-config-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditMode ? t('configModal.title.edit') : t('configModal.title.create')}</h2>
                            <button
                                type="button"
                                className="close-btn"
                                onClick={handleCloseAttempt}
                                disabled={isSubmitting}
                                aria-label={t('configModal.actions.cancel')}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-content">
                            {/* Template Info */}
                            <div className="form-section">
                                <h3>{t('configModal.info.title')}</h3>

                                <div className="form-group">
                                    <label htmlFor="template-name">{t('configModal.info.nameLabel')}</label>
                                    <input
                                        id="template-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t('configModal.info.namePlaceholder')}
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="template-desc">{t('configModal.info.descLabel')}</label>
                                    <textarea
                                        id="template-desc"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder={t('configModal.info.descPlaceholder')}
                                        rows={3}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            {/* Period Preset */}
                            <div className="form-section">
                                <h3>{t('configModal.period.title')}</h3>
                                <p className="section-description">
                                    {t('configModal.period.description')}
                                </p>
                                <div className="period-presets">
                                    {PERIOD_PRESETS.map((preset) => (
                                        <button
                                            key={preset.value}
                                            type="button"
                                            className={`preset-btn ${periodPreset === preset.value ? 'active' : ''}`}
                                            onClick={() => setPeriodPreset(preset.value)}
                                            title={t(`configModal.presets.${preset.value}.description`)}
                                            disabled={isSubmitting}
                                        >
                                            {t(`configModal.presets.${preset.value}.label`)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Client & Account Selection */}
                            <div className="form-section">
                                <h3>
                                    {t('configModal.account.title')}
                                    {(!accountId || selectedCampaigns.length === 0) && (
                                        <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400 ml-2">{t('configModal.account.requiredBadge')}</span>
                                    )}
                                </h3>
                                <div className="reassurance-hint" style={{ marginTop: '-8px', marginBottom: '16px' }}>
                                    <Info className="reassurance-hint-icon" />
                                    <span className="reassurance-hint-text">{t('configModal.reassurance.campaigns')}</span>
                                </div>
                                <p className="section-description">
                                    {t('configModal.account.description')}
                                </p>

                                <div className="form-group">
                                    <label htmlFor="template-client">{t('configModal.client.label', { defaultValue: 'Client' })}</label>
                                    {loadingClients ? (
                                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                                            <Loader2 size={16} className="animate-spin" />
                                            {t('common:loading', { defaultValue: 'Chargement...' })}
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={18} />
                                            <select
                                                id="template-client"
                                                value={selectedClientId}
                                                onChange={(e) => handleClientChange(e.target.value)}
                                                required
                                                disabled={isSubmitting}
                                                className="pl-10 appearance-none w-full"
                                                style={{
                                                    paddingLeft: '2.5rem' // Ensure padding despite css class if needed
                                                }}
                                            >
                                                <option value="">{t('configModal.client.placeholder', { defaultValue: 'Sélectionner un client' })}</option>
                                                {clients.map(client => (
                                                    <option key={client.id} value={client.id}>{client.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Account Feedback */}
                                    {selectedClientId && accountId && (
                                        <div className="mt-2 text-sm text-neutral-500 flex items-center gap-1 bg-neutral-50 dark:bg-black/50 p-2 rounded-md border border-neutral-100 dark:border-white/10">
                                            <span className="font-medium">Compte Google Ads :</span>
                                            {accounts.find(a => a.id === accountId)?.name || accountId}
                                        </div>
                                    )}
                                    {selectedClientId && !accountId && (
                                        <div className="mt-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                                            <span className="font-bold">⚠</span>
                                            {t('configModal.client.noAccount', { defaultValue: 'Ce client n\'est lié à aucun compte Google Ads.' })}
                                        </div>
                                    )}
                                </div>

                                {accountId && (
                                    <div className="form-group">
                                        <label>{t('configModal.account.campaignsLabel', { count: selectedCampaigns.length })}</label>
                                        <div className="campaigns-selection">
                                            <div className="campaigns-header">
                                                <button
                                                    type="button"
                                                    className="select-all-btn"
                                                    onClick={handleSelectAllCampaigns}
                                                    disabled={isSubmitting}
                                                >
                                                    {selectedCampaigns.length === currentAccountCampaigns.length && currentAccountCampaigns.length > 0 ? t('configModal.account.deselectAll') : t('configModal.account.selectAll')}
                                                </button>
                                            </div>
                                            <div className="campaigns-list">
                                                {currentAccountCampaigns.length === 0 ? (
                                                    <div className="empty-message">{t('configModal.account.noCampaigns')}</div>
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

                                {metaAccountId && (
                                    <div className="form-group mt-6">
                                        <label>Meta Ads ({selectedMetaCampaigns.length})</label>
                                        <div className="campaigns-selection">
                                            <div className="campaigns-header">
                                                <button
                                                    type="button"
                                                    className="select-all-btn"
                                                    onClick={handleSelectAllMetaCampaigns}
                                                    disabled={isSubmitting}
                                                >
                                                    {selectedMetaCampaigns.length === metaCampaigns.length && metaCampaigns.length > 0 ? t('configModal.account.deselectAll') : t('configModal.account.selectAll')}
                                                </button>
                                            </div>
                                            <div className="campaigns-list">
                                                {isLoadingMetaCampaigns ? (
                                                    <div className="flex flex-col items-center justify-center p-4">
                                                        <Loader2 className="animate-spin text-primary-500" size={24} />
                                                    </div>
                                                ) : metaCampaigns.length === 0 ? (
                                                    <div className="empty-message">{t('configModal.account.noCampaigns')}</div>
                                                ) : (
                                                    metaCampaigns.map(campaign => (
                                                        <label key={campaign.id} className="campaign-item">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedMetaCampaigns.includes(campaign.id)}
                                                                onChange={() => handleToggleMetaCampaign(campaign.id)}
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
                            </div>

                            {/* Actions */}
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={handleCloseAttempt} disabled={isSubmitting}>
                                    {t('configModal.actions.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={!name.trim() || !selectedClientId || (!accountId && !metaAccountId) || (selectedCampaigns.length === 0 && selectedMetaCampaigns.length === 0) || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin h-[18px] w-[18px] mr-2" />
                                            {isEditMode ? t('configModal.actions.updating') : t('configModal.actions.creating')}
                                        </>
                                    ) : (
                                        isEditMode ? t('configModal.actions.update') : t('configModal.actions.create')
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            <ConfirmationModal
                isOpen={showUnsavedModal}
                onClose={() => setShowUnsavedModal(false)}
                onConfirm={resetAndClose}
                title={t('configModal.unsaved.title')}
                message={t('configModal.unsaved.message')}
                confirmLabel={t('configModal.unsaved.confirm')}
                isDestructive={true}
            />
        </>
    );
};

export default TemplateConfigModal;
