import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { setUserId } from '../utils/ga4';

/**
 * Hook to automatically track user authentication state
 * Sets GA4 User-ID when user logs in, clears it on logout
 */
export const useUserTracking = () => {
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            // Set the Firebase UID as the GA4 User-ID
            setUserId(currentUser.uid);
        } else {
            // Clear the User-ID when logged out
            setUserId(null);
        }
    }, [currentUser]);
};
