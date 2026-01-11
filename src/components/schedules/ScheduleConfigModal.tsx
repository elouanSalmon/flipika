import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import type { ScheduledReport, ScheduleConfig } from '../../types/scheduledReportTypes';
import type { ReportTemplate } from '../../types/templateTypes';
import FrequencySelector from './FrequencySelector';
import ConfirmationModal from '../common/ConfirmationModal';
import './ScheduleConfigModal.css';

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
            newErrors.name = 'Le nom est requis';
        }

        if (!formData.templateId) {
            newErrors.templateId = 'Veuillez sélectionner un template';
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
                        <h2>{editingSchedule ? 'Modifier le schedule' : 'Nouveau schedule'}</h2>
                        <button className="close-btn" onClick={handleCloseAttempt} disabled={isSubmitting}>
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="form-section">
                                <h3>Informations générales</h3>

                                <div className="form-group">
                                    <label htmlFor="name">
                                        <span className="label-text">Nom du schedule *</span>
                                        <input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ex: Rapport hebdomadaire"
                                            className={errors.name ? 'error' : ''}
                                            disabled={isSubmitting}
                                        />
                                        {errors.name && <span className="error-message">{errors.name}</span>}
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">
                                        <span className="label-text">Description (optionnel)</span>
                                        <textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Description du schedule..."
                                            rows={3}
                                            disabled={isSubmitting}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Configuration</h3>

                                <div className="form-group">
                                    <label htmlFor="template">
                                        <span className="label-text">Template *</span>
                                        <select
                                            id="template"
                                            value={formData.templateId}
                                            onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                                            className={errors.templateId ? 'error' : ''}
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Sélectionner un template</option>
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
                                            <span className="preview-label">Période:</span>
                                            <span className="preview-value">{selectedTemplate?.periodPreset}</span>
                                        </div>
                                        <div className="preview-item">
                                            <span className="preview-label">Slides:</span>
                                            <span className="preview-value">{selectedTemplate?.slideConfigs?.length}</span>
                                        </div>
                                    </div>
                                )}


                            </div>

                            <div className="form-section">
                                <h3>Fréquence de génération</h3>
                                <FrequencySelector
                                    value={formData.scheduleConfig}
                                    onChange={handleScheduleConfigChange}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-secondary" onClick={handleCloseAttempt} disabled={isSubmitting}>
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex items-center justify-center gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                                {editingSchedule ? 'Enregistrer' : 'Créer le schedule'}
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
        </>,
        document.body
    );
};

export default ScheduleConfigModal;
