import { useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';

/**
 * Custom Hook pour gérer l'intégration du chat HubSpot
 * 
 * Fonctionnalités :
 * - Chargement asynchrone du script HubSpot (optimisation Core Web Vitals)
 * - Identification automatique des utilisateurs Firebase
 * - Nettoyage lors de la déconnexion
 * - Gestion du cycle de vie du widget
 */

interface HubSpotChatOptions {
    portalId: string;
    user: User | null;
}

// Déclaration TypeScript pour l'API HubSpot
declare global {
    interface Window {
        _hsq?: Array<any>;
        HubSpotConversations?: {
            widget: {
                load: () => void;
                remove: () => void;
                refresh: () => void;
                status: () => { loaded: boolean };
            };
        };
    }
}

export const useHubSpotChat = ({ portalId, user }: HubSpotChatOptions) => {
    const scriptLoadedRef = useRef(false);
    const previousUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Vérification du Portal ID
        if (!portalId || portalId === 'YOUR_PORTAL_ID_HERE') {
            console.warn('⚠️ HubSpot Portal ID non configuré. Le chat ne sera pas chargé.');
            return;
        }

        // Initialisation de la queue HubSpot (_hsq)
        window._hsq = window._hsq || [];

        // Fonction pour charger le script HubSpot
        const loadHubSpotScript = () => {
            if (scriptLoadedRef.current) return;

            const script = document.createElement('script');
            script.src = `//js.hs-scripts.com/${portalId}.js`;
            script.async = true;
            script.defer = true;
            script.id = 'hs-script-loader';

            script.onload = () => {
                console.log('✅ HubSpot Chat script loaded successfully');
                scriptLoadedRef.current = true;
            };

            script.onerror = () => {
                console.error('❌ Failed to load HubSpot Chat script');
            };

            document.body.appendChild(script);
        };

        // Chargement du script
        loadHubSpotScript();

        // Cleanup function
        return () => {
            // Note: On ne supprime pas le script car HubSpot gère son propre état
            // La suppression complète pourrait causer des problèmes de réinitialisation
        };
    }, [portalId]);

    // Effet séparé pour gérer l'identification utilisateur
    useEffect(() => {
        if (!portalId || portalId === 'YOUR_PORTAL_ID_HERE') return;
        if (!window._hsq) return;

        const currentUserId = user?.uid || null;

        // Si l'utilisateur a changé (connexion/déconnexion)
        if (currentUserId !== previousUserIdRef.current) {
            if (user && user.email) {
                // Utilisateur connecté : identification via l'API HubSpot
                console.log('🔐 Identifying user in HubSpot:', user.email);

                // Méthode 1: Via _hsq.push (tracking code API)
                window._hsq.push(['identify', {
                    email: user.email,
                    id: user.uid,
                    ...(user.displayName && { name: user.displayName }),
                }]);

                // Méthode 2: Via setPath pour forcer le tracking de la page actuelle
                window._hsq.push(['setPath', window.location.pathname]);
                window._hsq.push(['trackPageView']);

                // Propriétés personnalisées additionnelles (optionnel)
                window._hsq.push(['trackCustomBehavioralEvent', {
                    name: 'User Logged In',
                    properties: {
                        userId: user.uid,
                        email: user.email,
                        displayName: user.displayName || 'N/A',
                        loginTimestamp: new Date().toISOString(),
                    }
                }]);

            } else {
                // Utilisateur déconnecté : réinitialisation
                console.log('🚪 User logged out - resetting HubSpot tracking');

                // Réinitialisation du widget (si disponible)
                if (window.HubSpotConversations?.widget) {
                    try {
                        // Refresh du widget pour revenir en mode visiteur anonyme
                        window.HubSpotConversations.widget.refresh();
                    } catch (error) {
                        console.warn('⚠️ Could not refresh HubSpot widget:', error);
                    }
                }

                // Clear des cookies HubSpot (optionnel, plus agressif)
                // Note: HubSpot utilise plusieurs cookies (__hstc, __hssc, __hssrc, hubspotutk)
                // La suppression complète peut affecter le tracking analytics
                // Décommenter si nécessaire :
                /*
                document.cookie.split(";").forEach((c) => {
                  const cookieName = c.trim().split("=")[0];
                  if (cookieName.startsWith('__hs') || cookieName === 'hubspotutk') {
                    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                  }
                });
                */
            }

            previousUserIdRef.current = currentUserId;
        }
    }, [user, portalId]);

    return {
        isLoaded: scriptLoadedRef.current,
    };
};
