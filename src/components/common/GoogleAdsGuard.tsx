import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { useGoogleAds } from '../../contexts/GoogleAdsContext';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { initiateGoogleAdsOAuth } from '../../services/googleAds';
import './GoogleAdsGuard.css';

interface GoogleAdsGuardProps {
    children: React.ReactNode;
    mode?: 'block' | 'partial';
    feature?: string;
    showEmptyState?: boolean;
    allowDemo?: boolean;
}

/**
 * GoogleAdsGuard - Component to enforce Google Ads authentication
 * 
 * @param mode - 'block' replaces all content, 'partial' only shows warning
 * @param feature - Name of the feature requiring Google Ads (for messaging)
 * @param showEmptyState - Whether to show the empty state when not connected
 * @param allowDemo - Whether to allow access in Demo Mode (default: true)
 */
const GoogleAdsGuard: React.FC<GoogleAdsGuardProps> = ({
    children,
    mode = 'partial',
    feature = 'cette fonctionnalité',
    showEmptyState = true,
    allowDemo = true,
}) => {
    const { isConnected, authError } = useGoogleAds();
    const { isDemoMode } = useDemoMode();
    const navigate = useNavigate();

    const authorized = isConnected || (allowDemo && isDemoMode);


    const handleConnectClick = async () => {
        try {
            await initiateGoogleAdsOAuth();
        } catch (error) {
            console.error('Error initiating OAuth:', error);
            // Fallback: redirect to settings
            navigate('/app/settings');
        }
    };

    const getErrorMessage = () => {
        if (authError === 'invalid_grant' || authError === 'UNAUTHENTICATED') {
            return "Session Google Ads expirée. Veuillez vous reconnecter.";
        }
        if (authError === 'permission-denied') {
            return "Accès refusé. Veuillez vérifier vos permissions.";
        }
        return `Connectez votre compte Google Ads pour débloquer ${feature} et accéder à vos données publicitaires.`;
    };

    // If connected or in demo mode, render children normally
    if (authorized) {
        return <>{children}</>;
    }

    // Block mode: replace all content with empty state
    if (mode === 'block' && showEmptyState) {
        return (
            <div className="google-ads-guard-container">
                <div className="google-ads-empty-state">
                    <div className="empty-state-icon">
                        <AlertCircle size={64} />
                    </div>
                    <h2>Connexion Google Ads requise</h2>
                    <p className={authError ? "text-red-500" : ""}>
                        {getErrorMessage()}
                    </p>
                    <div className="empty-state-actions">
                        <button className="btn-connect-google-ads" onClick={handleConnectClick}>
                            <ExternalLink size={20} />
                            <span>Connecter Google Ads</span>
                        </button>
                        {allowDemo && (
                            <button className="btn-secondary" onClick={() => navigate('/app/dashboard')}>
                                <span>Activer le mode démo</span>
                            </button>
                        )}
                        <a href="/app/settings" className="btn-secondary-link">
                            Aller aux paramètres
                        </a>
                    </div>
                    {!authError && (
                        <div className="empty-state-info">
                            <p className="info-text">
                                <strong>Pourquoi cette connexion ?</strong><br />
                                Flipika a besoin d'accéder à vos données Google Ads pour générer des rapports personnalisés et automatiser vos analyses.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Partial mode: show warning banner but render children
    if (mode === 'partial') {
        return (
            <>
                {showEmptyState && (
                    <div className={`google-ads-warning-banner ${authError ? 'error-banner' : ''}`}>
                        <AlertCircle className="warning-icon" size={20} />
                        <div className="warning-content">
                            <h3>Connexion Google Ads requise</h3>
                            <p>
                                {authError ? getErrorMessage() : `Connectez votre compte Google Ads pour débloquer ${feature}.`}
                            </p>
                        </div>
                        <button className="btn-connect-inline" onClick={handleConnectClick}>
                            <ExternalLink size={18} />
                            <span>Connecter</span>
                        </button>
                    </div>
                )}
                {children}
            </>
        );
    }

    // Fallback: render children
    return <>{children}</>;
};

export default GoogleAdsGuard;
