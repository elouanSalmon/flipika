import { useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';

/**
 * Custom Hook pour gérer l'intégration du chat HubSpot
 * 
 * Méthode officielle HubSpot :
 * - Chargement du script tracking HubSpot
 * - Le chatflow s'affiche automatiquement selon la configuration HubSpot
 * - Identification des utilisateurs Firebase pour le CRM
 */

interface HubSpotChatOptions {
    portalId: string;
    user: User | null;
}

// Déclaration TypeScript pour l'API HubSpot
declare global {
    interface Window {
        _hsq?: Array<any>;
        HubSpotConversations?: any;
    }
}

export const useHubSpotChat = ({ portalId, user }: HubSpotChatOptions) => {
    const scriptLoadedRef = useRef(false);
    const previousUserIdRef = useRef<string | null>(null);

    // Chargement du script HubSpot
    useEffect(() => {
        if (!portalId || portalId === 'YOUR_PORTAL_ID_HERE') {
            console.warn('⚠️ HubSpot Portal ID non configuré.');
            return;
        }

        // Éviter les chargements multiples
        if (scriptLoadedRef.current || document.getElementById('hs-script-loader')) {
            return;
        }

        // Initialisation de la queue HubSpot
        window._hsq = window._hsq || [];

        // Création du script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = 'hs-script-loader';
        script.async = true;
        script.defer = true;
        script.src = `//js-eu1.hs-scripts.com/${portalId}.js`;

        script.onload = () => {
            console.log('✅ HubSpot script loaded');
            scriptLoadedRef.current = true;
        };

        script.onerror = () => {
            console.error('❌ Failed to load HubSpot script');
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup si nécessaire
        };
    }, [portalId]);

    // Identification utilisateur
    useEffect(() => {
        if (!portalId || portalId === 'YOUR_PORTAL_ID_HERE') return;
        if (!window._hsq) return;

        const currentUserId = user?.uid || null;

        if (currentUserId !== previousUserIdRef.current) {
            if (user && user.email) {
                console.log('🔐 Identifying user:', user.email);

                // Identification HubSpot
                window._hsq.push(['identify', {
                    email: user.email,
                    id: user.uid,
                    ...(user.displayName && { firstname: user.displayName.split(' ')[0] }),
                    ...(user.displayName && user.displayName.includes(' ') && {
                        lastname: user.displayName.split(' ').slice(1).join(' ')
                    }),
                }]);

                // Track page view
                window._hsq.push(['setPath', window.location.pathname]);
                window._hsq.push(['trackPageView']);
            }

            previousUserIdRef.current = currentUserId;
        }
    }, [user, portalId]);
    return {
        isLoaded: scriptLoadedRef.current,
    };
};
