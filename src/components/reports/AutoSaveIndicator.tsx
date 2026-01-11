import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './AutoSaveIndicator.css';

interface AutoSaveIndicatorProps {
    status: 'saved' | 'saving' | 'error';
    lastSaved?: Date;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ status, lastSaved }) => {
    const { t, i18n } = useTranslation('reports');

    const getStatusConfig = () => {
        switch (status) {
            case 'saved':
                return {
                    icon: <Check size={14} />,
                    text: t('header.autoSave.saved'),
                    className: 'saved',
                };
            case 'saving':
                return {
                    icon: <Clock size={14} />,
                    text: t('header.autoSave.saving'),
                    className: 'saving',
                };
            case 'error':
                return {
                    icon: <AlertCircle size={14} />,
                    text: t('header.autoSave.error'),
                    className: 'error',
                };
        }
    };

    const formatLastSaved = () => {
        if (!lastSaved) return '';

        const now = new Date();
        const diff = now.getTime() - lastSaved.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (seconds < 60) {
            return t('header.autoSave.justNow');
        } else if (minutes < 60) {
            return t('header.autoSave.ago_minutes', { count: minutes });
        } else if (hours < 24) {
            return t('header.autoSave.ago_hours', { count: hours });
        } else {
            return lastSaved.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            });
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`auto-save-indicator ${config.className}`}>
            <div className="indicator-icon">{config.icon}</div>
            <div className="indicator-text">
                <span className="status-text">{config.text}</span>
                {status === 'saved' && lastSaved && (
                    <span className="last-saved-text">{formatLastSaved()}</span>
                )}
            </div>
        </div>
    );
};

export default AutoSaveIndicator;
