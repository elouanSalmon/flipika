import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHubSpotChat } from '../hooks/useHubSpotChat';

/**
 * Composant HubSpot Chat Widget
 * 
 * Ce composant doit être placé au niveau racine de l'application (App.tsx)
 * pour garantir sa présence sur toutes les pages.
 * 
 * Fonctionnalités :
 * - Affichage du chat sur Landing Page (visiteurs anonymes)
 * - Affichage du chat dans Dashboard (utilisateurs connectés)
 * - Identification automatique des utilisateurs Firebase
 * - Chargement optimisé pour les Core Web Vitals
 */

const HubSpotChat: React.FC = () => {
    const { currentUser } = useAuth();
    const portalId = import.meta.env.VITE_HUBSPOT_PORTAL_ID || '';

    // Utilisation du hook personnalisé
    const { isLoaded } = useHubSpotChat({
        portalId,
        user: currentUser,
    });

    // Ce composant ne rend rien visuellement (le widget HubSpot s'injecte automatiquement)
    // On peut optionnellement afficher un indicateur de debug en développement
    if (import.meta.env.DEV && !isLoaded && portalId && portalId !== 'YOUR_PORTAL_ID_HERE') {
        return (
            <div
                style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '20px',
                    background: 'rgba(255, 165, 0, 0.1)',
                    border: '1px solid orange',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'orange',
                    zIndex: 9998,
                    pointerEvents: 'none',
                }}
            >
                🔄 Loading HubSpot Chat...
            </div>
        );
    }

    return null;
};

export default HubSpotChat;
