import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Save, ArrowLeft, Sparkles, Settings } from 'lucide-react';
import AutoSaveIndicator from '../reports/AutoSaveIndicator';
import ThemeToggle from '../ThemeToggle';
import '../reports/ReportEditorHeader.css';

interface TemplateEditorHeaderProps {
    name: string;
    onNameChange: (name: string) => void;
    autoSaveStatus: 'saved' | 'saving' | 'error';
    lastSaved?: Date;

    // Actions
    onSave: () => void;
    onOpenSettings: () => void;

    // State
    isSaving: boolean;
    isLoadingSettings?: boolean;
}

const TemplateEditorHeader: React.FC<TemplateEditorHeaderProps> = ({
    name,
    onNameChange,
    autoSaveStatus,
    lastSaved,
    onSave,
    onOpenSettings,
    isSaving,
    isLoadingSettings = false,
}) => {
    const { t } = useTranslation('templates');
    const navigate = useNavigate();

    return (
        <div className="report-editor-header">
            <div className="report-editor-header-left">
                <div className="report-editor-logo">
                    <div className="logo-icon">
                        <Sparkles size={24} />
                    </div>
                    <div className="logo-content">
                        <span className="logo-text gradient-text">Flipika</span>
                        <span className="logo-subtitle">IA</span>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/app/templates')}
                    className="btn-back"
                    title={t('editor.backToTemplates')}
                    aria-label={t('editor.backToTemplates')}
                >
                    <ArrowLeft size={20} />
                </button>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    className="report-title-input"
                    placeholder={t('editor.namePlaceholder')}
                />
                <AutoSaveIndicator status={autoSaveStatus} lastSaved={lastSaved} />
                <span className="report-status-badge status-draft">
                    {t('editor.templateBadge')}
                </span>
            </div>

            <div className="report-editor-header-right">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Settings Button */}
                <button
                    onClick={onOpenSettings}
                    disabled={isLoadingSettings}
                    className="btn btn-secondary"
                    title={t('editor.settings')}
                >
                    {isLoadingSettings ? (
                        <>
                            <svg className="animate-spin h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{t('editor.loading')}</span>
                        </>
                    ) : (
                        <>
                            <Settings size={18} />
                            <span>{t('editor.settings')}</span>
                        </>
                    )}
                </button>

                {/* Save Template Button */}
                <button
                    onClick={onSave}
                    disabled={isSaving || autoSaveStatus === 'saving'}
                    className="btn btn-primary"
                    title={t('editor.saveTemplate')}
                >
                    <Save size={18} />
                    <span>{t('editor.saveTemplate')}</span>
                </button>
            </div>
        </div>
    );
};

export default TemplateEditorHeader;
