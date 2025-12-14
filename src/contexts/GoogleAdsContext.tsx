import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { isGoogleAdsConnected, getLinkedCustomerId } from '../services/googleAds';

interface GoogleAdsContextType {
    isConnected: boolean;
    customerId: string | null;
    refreshConnectionStatus: () => void;
}

const GoogleAdsContext = createContext<GoogleAdsContextType | undefined>(undefined);

export const GoogleAdsProvider = ({ children }: { children: ReactNode }) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [customerId, setCustomerId] = useState<string | null>(null);

    const refreshConnectionStatus = () => {
        const connected = isGoogleAdsConnected();
        const id = getLinkedCustomerId();
        setIsConnected(connected);
        setCustomerId(id);
    };

    useEffect(() => {
        refreshConnectionStatus();

        // Listen for storage changes (e.g., when connection is made in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'google_ads_customer_id') {
                refreshConnectionStatus();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <GoogleAdsContext.Provider
            value={{
                isConnected,
                customerId,
                refreshConnectionStatus,
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
