import ReactGA from 'react-ga4';

/**
 * Initialize Google Analytics 4
 * Automatically excludes localhost/development environments
 */
export const initGA4 = (): void => {
    const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;

    // Check if we're in development (localhost)
    const isDevelopment =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '';

    if (isDevelopment) {
        console.log('GA4 disabled in development (localhost)');
        return;
    }

    if (!measurementId) {
        console.warn('GA4 Measurement ID not found. Analytics will not be tracked.');
        return;
    }

    try {
        ReactGA.initialize(measurementId, {
            gaOptions: {
                anonymizeIp: true,
                cookieFlags: 'SameSite=None;Secure',
            },
            gtagOptions: {
                send_page_view: false, // We'll handle page views manually for SPA
            },
        });

        console.log('GA4 initialized successfully');
    } catch (error) {
        console.error('Failed to initialize GA4:', error);
    }
};

/**
 * Check if GA4 is enabled (not in development)
 */
export const isGA4Enabled = (): boolean => {
    const isDevelopment =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '';

    return !isDevelopment && !!import.meta.env.VITE_GA4_MEASUREMENT_ID;
};

/**
 * Track a custom event
 */
export const trackEvent = (
    eventName: string,
    eventParams?: Record<string, any>
): void => {
    if (!isGA4Enabled()) return;

    try {
        ReactGA.event(eventName, eventParams);
    } catch (error) {
        console.error('Failed to track event:', error);
    }
};

/**
 * Set user ID for cross-device tracking
 */
export const setUserId = (userId: string | null): void => {
    if (!isGA4Enabled()) return;

    try {
        if (userId) {
            ReactGA.set({ user_id: userId });
            console.log('GA4 User ID set:', userId);
        } else {
            ReactGA.set({ user_id: undefined });
            console.log('GA4 User ID cleared');
        }
    } catch (error) {
        console.error('Failed to set user ID:', error);
    }
};

/**
 * Track a page view
 */
export const trackPageView = (path: string, title?: string): void => {
    if (!isGA4Enabled()) return;

    try {
        ReactGA.send({
            hitType: 'pageview',
            page: path,
            title: title || document.title,
        });
    } catch (error) {
        console.error('Failed to track page view:', error);
    }
};
