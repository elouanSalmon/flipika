import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Plus, Grid, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Campaign } from '../../types/business';
import type { PeriodPreset, TemplateSlideConfig } from '../../types/templateTypes';
import { PERIOD_PRESETS } from '../../types/templateTypes';
import { SlideType } from '../../types/reportTypes';
import ConfirmationModal from '../common/ConfirmationModal';
import './TemplateConfigModal.css';
import SlideLibrary from '../reports/SlideLibrary';
import { useTutorial } from '../../contexts/TutorialContext';
import { useTranslation } from 'react-i18next';

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
    widgetConfigs: TemplateSlideConfig[];
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
    const [widgetConfigs, setSlideConfigs] = useState<TemplateSlideConfig[]>(initialConfig?.widgetConfigs || []);
    // selectAll state removed as it was unused and replaced by derived state
    const [showSlideLibrary, setShowSlideLibrary] = useState(false);
    const { t } = useTranslation('templates');

    const getSlideTitle = (type: string) => {
        switch (type) {
            case SlideType.PERFORMANCE_OVERVIEW: return t('configModal.slideTitles.performance');
            case SlideType.KEY_METRICS: return t('configModal.slideTitles.metrics');
            case SlideType.CAMPAIGN_CHART: return t('configModal.slideTitles.chart');
            case SlideType.AD_CREATIVE: return t('configModal.slideTitles.creative');
            case SlideType.TEXT_BLOCK: return t('configModal.slideTitles.text');
            case SlideType.CUSTOM: return t('configModal.slideTitles.custom');
            default: return type;
        }
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

    const handleAddSlide = (type: SlideType) => {
        const newSlide: TemplateSlideConfig = {
            type,
            order: widgetConfigs.length,
            settings: {} // Initialize with empty settings
        };
        setSlideConfigs(prev => [...prev, newSlide]);
        setShowSlideLibrary(false);
    };

    const handleRemoveSlide = (indexToRemove: number) => {
        setSlideConfigs(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error(t('configModal.validation.nameRequired'));
            return;
        }

        if (!accountId) {
            toast.error(t('configModal.validation.accountRequired'));
            return;
        }

        if (selectedCampaigns.length === 0) {
            toast.error(t('configModal.validation.campaignsRequired'));
            return;
        }

        if (widgetConfigs.length === 0) {
            toast.error(t('configModal.validation.slidesRequired'));
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
                            <h2>{isEditMode ? t('configModal.title.edit') : t('configModal.title.create')}</h2>
                            <button className="close-btn" onClick={handleCloseAttempt} disabled={isSubmitting}>
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

                            {/* Account & Campaigns (Mandatory) */}
                            <div className="form-section">
                                <h3>
                                    {t('configModal.account.title')}
                                    {(!accountId || selectedCampaigns.length === 0) && (
                                        <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400 ml-2">{t('configModal.account.requiredBadge')}</span>
                                    )}
                                </h3>
                                <p className="section-description">
                                    {t('configModal.account.description')}
                                </p>

                                {accounts.length > 0 && (
                                    <>
                                        <div className="form-group">
                                            <label htmlFor="template-account">{t('configModal.account.label')}</label>
                                            <select
                                                id="template-account"
                                                value={accountId}
                                                onChange={(e) => handleAccountChange(e.target.value)}
                                                required
                                                disabled={isSubmitting}
                                            >
                                                <option value="">{t('configModal.account.defaultOption')}</option>
                                                {accounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                                ))}
                                            </select>
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
                                    </>
                                )}
                            </div>

                            {/* Slides Configuration */}
                            <div className="form-section">
                                <div className="section-header">
                                    <div>
                                        <h3>{t('configModal.slides.title')}</h3>
                                        <p className="section-description">
                                            {t('configModal.slides.description')}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="add-widget-btn"
                                        onClick={() => setShowSlideLibrary(true)}
                                        disabled={isSubmitting}
                                    >
                                        <Plus size={16} /> {t('configModal.slides.addFirst')}
                                    </button>
                                </div>

                                {widgetConfigs.length === 0 ? (
                                    <div className="empty-slides" onClick={() => setShowSlideLibrary(true)}>
                                        <div className="empty-icon"><Grid size={32} /></div>
                                        <p>{t('configModal.slides.emptyTitle')}</p>
                                        <span>{t('configModal.slides.emptyDesc')}</span>
                                    </div>
                                ) : (
                                    <div className="widgets-list">
                                        {widgetConfigs.map((config, index) => (
                                            <div key={index} className="widget-preview-item">
                                                <div className="widget-info">
                                                    {/* <span className="widget-type">{config.type}</span> */}
                                                    <span className="widget-title">{getSlideTitle(config.type)}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="remove-widget-btn"
                                                    onClick={() => handleRemoveSlide(index)}
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
                                    {t('configModal.actions.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={!name.trim() || widgetConfigs.length === 0 || isSubmitting}
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

                        {/* Slide Library Modal (Nested) */}
                        {showSlideLibrary && (
                            <div className="nested-modal-overlay">
                                <div className="nested-modal-content">
                                    <div className="nested-modal-header">
                                        <h3>{t('configModal.slides.addFirst')}</h3>
                                        <button onClick={() => setShowSlideLibrary(false)}><X size={20} /></button>
                                    </div>
                                    <SlideLibrary
                                        onAddSlide={handleAddSlide}
                                        onClose={() => setShowSlideLibrary(false)}
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
                title={t('configModal.unsaved.title')}
                message={t('configModal.unsaved.message')}
                confirmLabel={t('configModal.unsaved.confirm')}
                isDestructive={true}
            />
        </>
    );
};

export default TemplateConfigModal;
