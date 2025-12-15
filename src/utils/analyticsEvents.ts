import { trackEvent } from './ga4';

/**
 * Analytics event tracking utilities
 * Pre-configured functions for common business events
 */

/**
 * Track user signup/registration
 */
export const trackSignup = (method: 'google' | 'email' = 'google') => {
    trackEvent('sign_up', {
        method,
    });
};

/**
 * Track user login
 */
export const trackLogin = (method: 'google' | 'email' = 'google') => {
    trackEvent('login', {
        method,
    });
};

/**
 * Track subscription/conversion
 */
export const trackSubscription = (planName?: string, value?: number) => {
    trackEvent('purchase', {
        currency: 'EUR',
        value: value || 0,
        items: planName ? [{ item_name: planName }] : [],
    });
};

/**
 * Track Google Ads account connection
 */
export const trackGoogleAdsConnection = (accountId?: string) => {
    trackEvent('google_ads_connected', {
        account_id: accountId,
    });
};

/**
 * Track report generation
 */
export const trackReportGeneration = (reportType?: string) => {
    trackEvent('report_generated', {
        report_type: reportType || 'default',
    });
};

/**
 * Track audit completion
 */
export const trackAuditCompletion = (score?: number) => {
    trackEvent('audit_completed', {
        score: score || 0,
    });
};

/**
 * Track custom conversion event
 */
export const trackConversion = (eventName: string, params?: Record<string, any>) => {
    trackEvent(eventName, params);
};
