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

/**
 * Update Google Consent Mode status
 * Called by cookie consent library when user makes choices
 */
export const updateConsent = (consentSettings: {
    ad_storage?: 'granted' | 'denied';
    analytics_storage?: 'granted' | 'denied';
    ad_user_data?: 'granted' | 'denied';
    ad_personalization?: 'granted' | 'denied';
}): void => {
    if (typeof window === 'undefined' || !window.gtag) return;

    try {
        window.gtag('consent', 'update', consentSettings);
        console.log('Consent updated:', consentSettings);
    } catch (error) {
        console.error('Failed to update consent:', error);
    }
};

/**
 * Grant all consent (for "Accept All" button)
 */
export const grantAllConsent = (): void => {
    updateConsent({
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
    });
};

/**
 * Deny all consent (for "Reject All" button)
 */
export const denyAllConsent = (): void => {
    updateConsent({
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
    });
};

// Type augmentation for gtag
declare global {
    interface Window {
        gtag?: (
            command: string,
            action: string,
            params?: Record<string, any>
        ) => void;
        dataLayer?: any[];
    }
}
