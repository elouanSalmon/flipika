import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

interface GoogleAdsContextType {
    isConnected: boolean;
    customerId: string | null;
    authError: string | null;
    loading: boolean;
    setLinkedCustomerId: (id: string | null) => void;
    refreshConnectionStatus: () => void;
    disconnect: () => Promise<void>;
}

const GoogleAdsContext = createContext<GoogleAdsContextType | undefined>(undefined);

export const GoogleAdsProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Manual refresh function (kept for compatibility)
    const refreshConnectionStatus = () => {
        // This will be triggered automatically by the Firestore listener
        // but we keep the function for backward compatibility
    };

    // Disconnect function
    const disconnect = async () => {
        if (!currentUser) return;

        try {
            // Call the revokeOAuth Cloud Function
            const token = await currentUser.getIdToken();
            const response = await fetch('https://us-central1-flipika.cloudfunctions.net/revokeOAuth', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to revoke OAuth');
            }

            // Clear localStorage
            localStorage.removeItem('google_ads_customer_id');
            localStorage.removeItem('google_ads_connected');
            localStorage.removeItem('googleAdsConnected');
            localStorage.removeItem('linkedCustomerId');

            console.log('[GoogleAdsContext] Successfully disconnected Google Ads');
        } catch (error) {
            console.error('[GoogleAdsContext] Error disconnecting:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (!currentUser) {
            console.log('[GoogleAdsContext] No current user, setting isConnected to false');
            setIsConnected(false);
            setCustomerId(null);
            setAuthError(null);
            setLoading(false);
            // Clear localStorage when user logs out or changes
            localStorage.removeItem('google_ads_customer_id');
            localStorage.removeItem('google_ads_connected');
            return;
        }

        console.log('[GoogleAdsContext] Setting up Firestore listener for user:', currentUser.uid);
        setLoading(true);

        // Listen to the Google Ads token document in Firestore
        const tokenDocRef = doc(db, 'users', currentUser.uid, 'tokens', 'google_ads');

        const unsubscribe = onSnapshot(
            tokenDocRef,
            (docSnapshot) => {
                const exists = docSnapshot.exists();
                console.log('[GoogleAdsContext] Token document exists:', exists);

                if (exists) {
                    console.log('[GoogleAdsContext] Token data:', docSnapshot.data());
                    setAuthError(null); // Clear error if document exists and is readable
                }

                setIsConnected(exists);

                // Get customer ID from localStorage if available
                // (This is set when user selects a specific account)
                if (exists) {
                    const storedCustomerId = localStorage.getItem('google_ads_customer_id');
                    console.log('[GoogleAdsContext] Customer ID from localStorage:', storedCustomerId);
                    setCustomerId(storedCustomerId);
                } else {
                    setCustomerId(null);
                }
                setLoading(false);
            },
            (error) => {
                console.error('[GoogleAdsContext] Error listening to Google Ads token:', error);

                if (error.code === 'permission-denied') {
                    setAuthError('permission-denied');
                } else if (error.message.includes('invalid_grant') || error.message.includes('UNAUTHENTICATED')) {
                    setAuthError('invalid_grant');
                } else {
                    setAuthError(error.message);
                }

                setIsConnected(false);
                setCustomerId(null);
                setLoading(false);
            }
        );

        return () => {
            console.log('[GoogleAdsContext] Cleaning up Firestore listener');
            unsubscribe();
        };
    }, [currentUser]);

    const setLinkedCustomerId = (id: string | null) => {
        if (id) {
            localStorage.setItem('google_ads_customer_id', id);
        } else {
            localStorage.removeItem('google_ads_customer_id');
        }
        setCustomerId(id);
    };

    return (
        <GoogleAdsContext.Provider
            value={{
                isConnected,
                customerId,
                authError,
                loading,
                setLinkedCustomerId,
                refreshConnectionStatus,
                disconnect,
            }}
        >
            {children}
        </GoogleAdsContext.Provider>
    );
};

export const useGoogleAds = () => {
    const context = useContext(GoogleAdsContext);
    if (!context) {
        throw new Error('useGoogleAds must be used within GoogleAdsProvider');
    }
    return context;
};
