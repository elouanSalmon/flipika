import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ExternalLink, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './AccessDeniedPlaceholder.css';

export interface AccessDeniedPlaceholderProps {
    type: 'subscription' | 'google-ads' | 'both';
    featureName?: string;
}

const AccessDeniedPlaceholder: React.FC<AccessDeniedPlaceholderProps> = ({
    type,
    featureName
}) => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const actualFeatureName = featureName || t('accessDenied.defaultFeatureName');

    const getContent = () => {
        switch (type) {
            case 'subscription':
                return {
                    icon: <CreditCard size={64} />,
                    title: t('accessDenied.subscription.title'),
                    description: t('accessDenied.subscription.description', { featureName: actualFeatureName }),
                    action: t('accessDenied.subscription.action'),
                    onAction: () => navigate('/app/billing'),
                    secondaryAction: null
                };
            case 'google-ads':
                return {
                    icon: <ExternalLink size={64} />,
                    title: t('accessDenied.googleAds.title'),
                    description: t('accessDenied.googleAds.description', { featureName: actualFeatureName }),
                    action: t('accessDenied.googleAds.action'),
                    onAction: () => navigate('/app/settings'),
                    secondaryAction: null
                };
            case 'both':
            default:
                return {
                    icon: <Lock size={64} />,
                    title: t('accessDenied.both.title'),
                    description: t('accessDenied.both.description', { featureName: actualFeatureName }),
                    action: t('accessDenied.both.action'),
                    onAction: () => navigate('/app/settings'),
                    secondaryAction: {
                        label: t('accessDenied.both.secondaryAction'),
                        onClick: () => navigate('/app/billing')
                    }
                };
        }
    };

    const content = getContent();

    return (
        <div className="access-denied-container">
            <div className="access-denied-content">
                <div className="access-denied-icon">
                    {content.icon}
                </div>
                <h2>{content.title}</h2>
                <p>{content.description}</p>
                <div className="access-denied-actions">
                    <button className="btn-primary-action" onClick={content.onAction}>
                        {content.action}
                    </button>
                    {content.secondaryAction && (
                        <button className="btn-secondary-action" onClick={content.secondaryAction.onClick}>
                            {content.secondaryAction.label}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccessDeniedPlaceholder;
