import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
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
        // Also listen to the user profile for default account setting
        const userDocRef = doc(db, 'users', currentUser.uid);

        // We combine the listeners or just fetch user doc once? 
        // For now, let's keep the token listener as primary for connection status.
        // And use a separate listener or fetch for the default account ID.
        // Since we want it to be reactive (if user changes it in settings), a listener is better.

        let defaultAccountId: string | null = null;

        const unsubscribeToken = onSnapshot(
            tokenDocRef,
            (docSnapshot) => {
                const exists = docSnapshot.exists();
                console.log('[GoogleAdsContext] Token document exists:', exists);

                if (exists) {
                    console.log('[GoogleAdsContext] Token data:', docSnapshot.data());
                    setAuthError(null); // Clear error if document exists and is readable
                }

                setIsConnected(exists);

                // If not connected, clear customer ID
                if (!exists) {
                    setCustomerId(null);
                } else if (defaultAccountId) {
                    // If connected and we already have the default ID from the other listener/fetch
                    setCustomerId(defaultAccountId);
                }

                // If we haven't loaded the user doc yet, we wait. 
                // But we need to handle the loading state carefully.
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

        const unsubscribeUser = onSnapshot(
            userDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    defaultAccountId = data.googleAdsDefaultAccountId || null;
                    console.log('[GoogleAdsContext] Default Account ID from Firestore:', defaultAccountId);
                    if (isConnected) {
                        setCustomerId(defaultAccountId);
                    }
                }
                setLoading(false); // Enable UI once we have at least tried to fetch user data
            },
            (error) => {
                console.error('[GoogleAdsContext] Error listening to user profile:', error);
                setLoading(false);
            }
        );

        return () => {
            console.log('[GoogleAdsContext] Cleaning up Firestore listeners');
            unsubscribeToken();
            unsubscribeUser();
        };
    }, [currentUser, isConnected]); // Added isConnected dependency to retry setting customerId if connection status changes

    const setLinkedCustomerId = async (id: string | null) => {
        if (!currentUser) return;

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await setDoc(userDocRef, { googleAdsDefaultAccountId: id }, { merge: true });

            setCustomerId(id);
            // Also update localStorage for backward compatibility if needed, but we wanted to move away.
            // Let's keep it for now as a fallback for non-migrated parts but rely on Firestore.
            if (id) {
                localStorage.setItem('google_ads_customer_id', id);
            } else {
                localStorage.removeItem('google_ads_customer_id');
            }
        } catch (error) {
            console.error('[GoogleAdsContext] Error setting default account:', error);
            // Fallback to local state update so UI is responsive
            setCustomerId(id);
        }
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
