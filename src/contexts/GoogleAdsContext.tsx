import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { fetchAccessibleCustomers } from '../services/googleAds';
import toast from 'react-hot-toast';

// Define the shape of an account object
export interface GoogleAdsAccount {
    id: string;
    name: string;
}

interface GoogleAdsContextType {
    isConnected: boolean;
    customerId: string | null;
    authError: string | null;
    loading: boolean;
    accounts: GoogleAdsAccount[];
    setLinkedCustomerId: (id: string | null) => void;
    refreshConnectionStatus: () => Promise<void>;
    disconnect: () => Promise<void>;
}

const GoogleAdsContext = createContext<GoogleAdsContextType | undefined>(undefined);

export const GoogleAdsProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);

    // Reset state when user logs out
    useEffect(() => {
        if (!currentUser) {
            setIsConnected(false);
            setCustomerId(null);
            setAuthError(null);
            setAccounts([]);
            setLoading(false);
        }
    }, [currentUser]);

    // Main Listener Effect
    useEffect(() => {
        if (!currentUser) return;

        setLoading(true);
        const tokenDocRef = doc(db, 'users', currentUser.uid, 'tokens', 'google_ads');
        const userDocRef = doc(db, 'users', currentUser.uid);
        const accountsDocRef = doc(db, 'users', currentUser.uid, 'integrations', 'google_ads');

        const unsubscribeToken = onSnapshot(tokenDocRef, (docSnapshot) => {
            setIsConnected(docSnapshot.exists());
        }, (error) => {
            console.error('[GoogleAdsContext] Error listening to token:', error);
            setIsConnected(false);
        });

        const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                const defaultId = data.googleAdsDefaultAccountId || null;
                setCustomerId(defaultId);
            }
        });

        const unsubscribeAccounts = onSnapshot(accountsDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                if (data.accounts && Array.isArray(data.accounts)) {
                    setAccounts(data.accounts);
                }
            }
            // Once we've checked everything (or at least attached listeners), we can stop loading
            setLoading(false);
        }, (error) => {
            console.error('[GoogleAdsContext] Error listening to accounts:', error);
            setLoading(false);
        });

        return () => {
            unsubscribeToken();
            unsubscribeUser();
            unsubscribeAccounts();
        };
    }, [currentUser]);

    // Auto-sync accounts if connected but list is empty
    useEffect(() => {
        if (isConnected && currentUser && accounts.length === 0 && !loading) {
            // Ideally we don't want to loop if sync fails/returns empty, so maybe check a "last attempted" flag?
            // For now, let's just trigger it once.
            syncAccounts();
        }
    }, [isConnected, currentUser, loading]); // Remove 'accounts' from dep to avoid loop if it stays empty, but 'accounts.length === 0' condition is safer if sync adds them.

    const syncAccounts = async () => {
        if (!currentUser) return;
        try {
            console.log('[GoogleAdsContext] Syncing accounts...');
            const response = await fetchAccessibleCustomers();

            if (response.success && response.customers) {
                const fetchedAccounts: GoogleAdsAccount[] = response.customers.map((c: any) => ({
                    id: c.id,
                    name: c.name || c.id
                }));

                const accountsDocRef = doc(db, 'users', currentUser.uid, 'integrations', 'google_ads');
                await setDoc(accountsDocRef, {
                    accounts: fetchedAccounts,
                    lastSyncedAt: new Date()
                }, { merge: true });

                toast.success('Comptes Google Ads synchronisés');
            }
        } catch (error) {
            console.error('[GoogleAdsContext] Error syncing accounts:', error);
        }
    };

    const refreshConnectionStatus = async () => {
        if (currentUser) {
            await syncAccounts();
        }
    };

    const disconnect = async () => {
        if (!currentUser) return;
        try {
            // Revoke OAuth
            const token = await currentUser.getIdToken();
            await fetch('https://us-central1-flipika.cloudfunctions.net/revokeOAuth', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Clean up strictly local things if needed, but Firestore listener handles most.
            // We might want to clear the token doc manually if the cloud function doesn't?
            // Assuming cloud function deletes the token doc.
        } catch (error) {
            console.error('Disconnect failed:', error);
            toast.error('Erreur lors de la déconnexion');
        }
    };

    const setLinkedCustomerId = async (id: string | null) => {
        if (!currentUser) return;
        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await setDoc(userDocRef, { googleAdsDefaultAccountId: id }, { merge: true });
            setCustomerId(id); // Optimistic update
        } catch (error) {
            console.error('Error setting default account:', error);
            toast.error('Erreur lors de la mise à jour du compte par défaut');
        }
    };

    return (
        <GoogleAdsContext.Provider
            value={{
                isConnected,
                customerId,
                authError,
                loading,
                accounts,
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
