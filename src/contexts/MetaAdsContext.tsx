import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { fetchMetaAdAccounts } from '../services/metaAds';

export interface MetaAdsAccount {
    id: string;
    name: string;
}

interface MetaAdsContextType {
    isConnected: boolean;
    loading: boolean;
    accounts: MetaAdsAccount[];
    tokenExpiresAt: Date | null;
    isTokenExpired: boolean;
    refreshAccounts: () => Promise<void>;
    disconnect: () => Promise<void>;
}

const MetaAdsContext = createContext<MetaAdsContextType | undefined>(undefined);

export const MetaAdsProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<MetaAdsAccount[]>([]);
    const [tokenExpiresAt, setTokenExpiresAt] = useState<Date | null>(null);
    const [isTokenExpired, setIsTokenExpired] = useState(false);

    // Reset state when user logs out
    useEffect(() => {
        if (!currentUser) {
            setIsConnected(false);
            setAccounts([]);
            setTokenExpiresAt(null);
            setIsTokenExpired(false);
            setLoading(false);
        }
    }, [currentUser]);

    // Listen for Meta token existence and expiration
    useEffect(() => {
        if (!currentUser) return;

        setLoading(true);
        const tokenDocRef = doc(db, 'users', currentUser.uid, 'tokens', 'meta_ads');
        const accountsDocRef = doc(db, 'users', currentUser.uid, 'integrations', 'meta_ads');

        const unsubscribeToken = onSnapshot(tokenDocRef, (docSnapshot) => {
            const exists = docSnapshot.exists();
            setIsConnected(exists);

            if (exists) {
                const data = docSnapshot.data();
                if (data?.expires_at) {
                    const expiry = data.expires_at.toDate();
                    setTokenExpiresAt(expiry);
                    setIsTokenExpired(expiry < new Date());
                }
            } else {
                setTokenExpiresAt(null);
                setIsTokenExpired(false);
            }
        }, (error) => {
            console.error('[MetaAdsContext] Error listening to token:', error);
            setIsConnected(false);
        });

        const unsubscribeAccounts = onSnapshot(accountsDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                if (data?.accounts && Array.isArray(data.accounts)) {
                    setAccounts(data.accounts);
                }
            }
            setLoading(false);
        }, (error) => {
            console.error('[MetaAdsContext] Error listening to accounts:', error);
            setLoading(false);
        });

        return () => {
            unsubscribeToken();
            unsubscribeAccounts();
        };
    }, [currentUser]);

    // Auto-sync accounts when connected but list is empty
    useEffect(() => {
        if (isConnected && currentUser && accounts.length === 0 && !loading && !isTokenExpired) {
            syncAccounts();
        }
    }, [isConnected, currentUser, loading, isTokenExpired]);

    const syncAccounts = async () => {
        if (!currentUser) return;
        try {
            console.log('[MetaAdsContext] Syncing Meta ad accounts...');
            const response = await fetchMetaAdAccounts();

            if (response.success && response.accounts) {
                // Accounts are cached in Firestore by the Cloud Function,
                // and the onSnapshot listener above will pick them up
                console.log(`[MetaAdsContext] Synced ${response.accounts.length} accounts`);
            } else if (response.code === 'TOKEN_EXPIRED') {
                setIsTokenExpired(true);
            }
        } catch (error) {
            console.error('[MetaAdsContext] Error syncing accounts:', error);
        }
    };

    const refreshAccounts = async () => {
        if (currentUser) {
            await syncAccounts();
        }
    };

    const disconnect = async () => {
        if (!currentUser) return;
        try {
            const { revokeMetaOAuth } = await import('../services/metaAds');
            await revokeMetaOAuth();
        } catch (error) {
            console.error('[MetaAdsContext] Disconnect failed:', error);
            throw error;
        }
    };

    return (
        <MetaAdsContext.Provider
            value={{
                isConnected,
                loading,
                accounts,
                tokenExpiresAt,
                isTokenExpired,
                refreshAccounts,
                disconnect,
            }}
        >
            {children}
        </MetaAdsContext.Provider>
    );
};

export const useMetaAds = () => {
    const context = useContext(MetaAdsContext);
    if (!context) {
        throw new Error('useMetaAds must be used within MetaAdsProvider');
    }
    return context;
};
