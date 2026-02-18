import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Info } from 'lucide-react';
import type { ScheduledReport, ScheduleConfig } from '../../types/scheduledReportTypes';
import type { ReportTemplate } from '../../types/templateTypes';
import { PERIOD_PRESETS } from '../../types/templateTypes';
import FrequencySelector from './FrequencySelector';
import ConfirmationModal from '../common/ConfirmationModal';
import './ScheduleConfigModal.css';
import { countTiptapSlides } from '../../utils/tiptapUtils';

interface GoogleAdsAccount {
    id: string;
    name: string;
}

export interface ScheduleFormData {
    name: string;
    description: string;
    templateId: string;
    scheduleConfig: ScheduleConfig;
}

interface ScheduleConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ScheduleFormData) => void | Promise<void>;
    templates: ReportTemplate[];
    accounts: GoogleAdsAccount[];
    editingSchedule?: ScheduledReport;
}

const ScheduleConfigModal: React.FC<ScheduleConfigModalProps> = ({
    isOpen,
    onClose,
    onSave,
    templates,
    accounts,
    editingSchedule,
}) => {
    const { t } = useTranslation('schedules');
    const [formData, setFormData] = useState<ScheduleFormData>({
        name: '',
        description: '',
        templateId: '',
        scheduleConfig: {
            frequency: 'daily',
            hour: 9,
        },
    });

    const [imgInitialData, setImgInitialData] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    useEffect(() => {
        let initial: ScheduleFormData;
        if (editingSchedule) {
            initial = {
                name: editingSchedule.name,
                description: editingSchedule.description || '',
                templateId: editingSchedule.templateId,
                scheduleConfig: editingSchedule.scheduleConfig,
            };
        } else {
            initial = {
                name: '',
                description: '',
                templateId: templates[0]?.id || '',
                scheduleConfig: {
                    frequency: 'daily',
                    hour: 9,
                },
            };
        }
        setFormData(initial);
        setImgInitialData(JSON.stringify(initial));
        setErrors({});
    }, [editingSchedule, isOpen, templates, accounts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('config.name.required');
        }

        if (!formData.templateId) {
            newErrors.templateId = t('config.template.required');
        }



        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            await onSave(formData);
        } catch (error) {
            console.error('Error saving schedule:', error);
            // Error is handled by parent, but we stop loading
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasUnsavedChanges = () => {
        return JSON.stringify(formData) !== imgInitialData;
    };

    const handleCloseAttempt = () => {
        if (hasUnsavedChanges()) {
            setShowUnsavedModal(true);
        } else {
            resetAndClose();
        }
    };

    const resetAndClose = () => {
        setShowUnsavedModal(false);
        // Resetting form data is handled by useEffect when isOpen changes to false/true or when editingSchedule changes
        // But we can explicitly reset if needed, though mostly unnecessary if unmounted or controlled.
        // For good measure, let's just call onClose.
        onClose();
    };

    const handleScheduleConfigChange = React.useCallback((config: ScheduleConfig) => {
        setFormData(prev => ({ ...prev, scheduleConfig: config }));
    }, []);

    if (!isOpen) return null;

    const selectedTemplate = templates.find(t => t.id === formData.templateId);

    return createPortal(
        <>
            <div className="modal-overlay" onClick={handleCloseAttempt}>
                <div className="schedule-config-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>{editingSchedule ? t('config.editTitle') : t('config.title')}</h2>
                        <button className="close-btn" onClick={handleCloseAttempt} disabled={isSubmitting}>
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="form-section">
                                <h3>{t('config.generalInfo')}</h3>

                                <div className="form-group">
                                    <label htmlFor="name">
                                        <span className="label-text">{t('config.name.label')} *</span>
                                        <input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData(prev => ({ ...prev, name: val }));
                                        }}
                                            placeholder={t('config.name.placeholder')}
                                            className={errors.name ? 'error' : ''}
                                            disabled={isSubmitting}
                                        />
                                        {errors.name && <span className="error-message">{errors.name}</span>}
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">
                                        <span className="label-text">{t('config.description.label')} {t('config.description.optional')}</span>
                                        <textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData(prev => ({ ...prev, description: val }));
                                        }}
                                            placeholder={t('config.description.placeholder')}
                                            rows={3}
                                            disabled={isSubmitting}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>{t('config.configuration')}</h3>
                                <div className="reassurance-hint" style={{ marginBottom: '16px' }}>
                                    <Info className="reassurance-hint-icon" />
                                    <span className="reassurance-hint-text">{t('config.reassurance.frequency')}</span>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="template">
                                        <span className="label-text">{t('config.template.label')} *</span>
                                        <select
                                            id="template"
                                            value={formData.templateId}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData(prev => ({ ...prev, templateId: val }));
                                            }}
                                            className={errors.templateId ? 'error' : ''}
                                            disabled={isSubmitting}
                                        >
                                            <option value="">{t('config.template.placeholder')}</option>
                                            {templates.map((template) => (
                                                <option key={template.id} value={template.id}>
                                                    {template.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.templateId && <span className="error-message">{errors.templateId}</span>}
                                    </label>
                                </div>

                                {selectedTemplate && (
                                    <div className="template-preview">
                                        <div className="preview-item">
                                            <span className="preview-label">{t('config.preview.period')}:</span>
                                            <span className="preview-value">{PERIOD_PRESETS.find(p => p.value === selectedTemplate?.periodPreset)?.label || selectedTemplate?.periodPreset}</span>
                                        </div>
                                        <div className="preview-item">
                                            <span className="preview-label">{t('config.preview.slides')}:</span>
                                            <span className="preview-value">
                                                {selectedTemplate?.content
                                                    ? countTiptapSlides(selectedTemplate.content)
                                                    : selectedTemplate?.slideConfigs?.length || 0}
                                            </span>
                                        </div>
                                    </div>
                                )}


                            </div>

                            <div className="form-section">
                                <h3>{t('config.frequency')}</h3>
                                <FrequencySelector
                                    value={formData.scheduleConfig}
                                    onChange={handleScheduleConfigChange}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-secondary" onClick={handleCloseAttempt} disabled={isSubmitting}>
                                {t('config.actions.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex items-center justify-center gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                                {editingSchedule ? t('config.actions.save') : t('config.actions.create')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showUnsavedModal}
                onClose={() => setShowUnsavedModal(false)}
                onConfirm={resetAndClose}
                title={t('config.unsavedChanges.title')}
                message={t('config.unsavedChanges.message')}
                confirmLabel={t('config.unsavedChanges.confirm')}
                isDestructive={true}
            />
        </>,
        document.body
    );
};

export default ScheduleConfigModal;
