import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to check if user has a Google Ads token stored in Firestore
 * This is more secure than checking localStorage
 */
export const useGoogleAdsToken = () => {
    const { currentUser } = useAuth();
    const [hasToken, setHasToken] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setHasToken(false);
            setLoading(false);
            return;
        }

        const checkToken = async () => {
            try {
                const tokenDoc = await getDoc(
                    doc(db, 'users', currentUser.uid, 'tokens', 'google_ads')
                );
                setHasToken(tokenDoc.exists());
            } catch (error) {
                console.error('Error checking token:', error);
                setHasToken(false);
            } finally {
                setLoading(false);
            }
        };

        checkToken();
    }, [currentUser]);

    return { hasToken, loading };
};
