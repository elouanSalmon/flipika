import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ExternalLink, CreditCard } from 'lucide-react';
import './AccessDeniedPlaceholder.css';

export interface AccessDeniedPlaceholderProps {
    type: 'subscription' | 'google-ads' | 'both';
    featureName?: string;
}

const AccessDeniedPlaceholder: React.FC<AccessDeniedPlaceholderProps> = ({
    type,
    featureName = 'cette fonctionnalité'
}) => {
    const navigate = useNavigate();

    const getContent = () => {
        switch (type) {
            case 'subscription':
                return {
                    icon: <CreditCard size={64} />,
                    title: "Abonnement requis",
                    description: `Pour utiliser ${featureName}, vous avez besoin d'un abonnement actif. Profitez de toutes les fonctionnalités de Flipika en mettant à niveau votre plan.`,
                    action: "Voir les plans",
                    onAction: () => navigate('/app/billing'),
                    secondaryAction: null
                };
            case 'google-ads':
                return {
                    icon: <ExternalLink size={64} />,
                    title: "Compte Google Ads requis",
                    description: `Pour utiliser ${featureName}, vous devez connecter un compte Google Ads. C'est nécessaire pour récupérer vos données et générer des rapports.`,
                    action: "Connecter Google Ads",
                    onAction: () => navigate('/app/settings'),
                    secondaryAction: null
                };
            case 'both':
            default:
                return {
                    icon: <Lock size={64} />,
                    title: "Configuration requise",
                    description: `Pour utiliser ${featureName}, vous devez avoir un abonnement actif et un compte Google Ads connecté.`,
                    action: "Configurer mon compte",
                    onAction: () => navigate('/app/settings'),
                    secondaryAction: {
                        label: "Voir les plans",
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
