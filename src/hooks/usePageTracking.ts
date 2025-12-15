import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/ga4';

/**
 * Hook to automatically track page views on route changes
 * Handles SPA navigation with React Router
 */
export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        // Construct full path with search params and hash
        const fullPath = location.pathname + location.search + location.hash;

        // Track the page view
        trackPageView(fullPath);
    }, [location]);
};
