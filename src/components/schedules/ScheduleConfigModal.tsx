import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { ScheduledReport, ScheduleConfig } from '../../types/scheduledReportTypes';
import type { ReportTemplate } from '../../types/templateTypes';
import FrequencySelector from './FrequencySelector';
import './ScheduleConfigModal.css';

interface GoogleAdsAccount {
    id: string;
    name: string;
}

export interface ScheduleFormData {
    name: string;
    description: string;
    templateId: string;
    accountId: string;
    scheduleConfig: ScheduleConfig;
}

interface ScheduleConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ScheduleFormData) => void;
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
        accountId: '',
        scheduleConfig: {
            frequency: 'daily',
            hour: 9,
        },
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (editingSchedule) {
            setFormData({
                name: editingSchedule.name,
                description: editingSchedule.description || '',
                templateId: editingSchedule.templateId,
                accountId: editingSchedule.accountId,
                scheduleConfig: editingSchedule.scheduleConfig,
            });
        } else {
            // Reset form when modal opens for new schedule
            setFormData({
                name: '',
                description: '',
                templateId: templates[0]?.id || '',
                accountId: accounts[0]?.id || '',
                scheduleConfig: {
                    frequency: 'daily',
                    hour: 9,
                },
            });
        }
        setErrors({});
    }, [editingSchedule, isOpen, templates, accounts]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Le nom est requis';
        }

        if (!formData.templateId) {
            newErrors.templateId = 'Veuillez sélectionner un template';
        }

        if (!formData.accountId) {
            newErrors.accountId = 'Veuillez sélectionner un compte';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSave(formData);
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            templateId: '',
            accountId: '',
            scheduleConfig: {
                frequency: 'daily',
                hour: 9,
            },
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    const selectedTemplate = templates.find(t => t.id === formData.templateId);

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="schedule-config-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editingSchedule ? 'Modifier le schedule' : 'Nouveau schedule'}</h2>
                    <button className="close-btn" onClick={handleClose}>
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
                                        <span className="preview-value">{selectedTemplate.periodPreset}</span>
                                    </div>
                                    <div className="preview-item">
                                        <span className="preview-label">Widgets:</span>
                                        <span className="preview-value">{selectedTemplate.widgetConfigs.length}</span>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="account">
                                    <span className="label-text">Compte Google Ads *</span>
                                    <select
                                        id="account"
                                        value={formData.accountId}
                                        onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                        className={errors.accountId ? 'error' : ''}
                                    >
                                        <option value="">Sélectionner un compte</option>
                                        {accounts.map((account) => (
                                            <option key={account.id} value={account.id}>
                                                {account.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.accountId && <span className="error-message">{errors.accountId}</span>}
                                </label>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Fréquence de génération</h3>
                            <FrequencySelector
                                value={formData.scheduleConfig}
                                onChange={(config) => setFormData({ ...formData, scheduleConfig: config })}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={handleClose}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-primary">
                            {editingSchedule ? 'Enregistrer' : 'Créer le schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleConfigModal;
