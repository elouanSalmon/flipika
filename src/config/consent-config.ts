import type { CookieConsentConfig } from 'vanilla-cookieconsent';
import i18n from '../i18n';

/**
 * Update Google Consent Mode status
 * This function is called when user makes consent choices
 */
const updateGoogleConsent = (categories: string[]) => {
    if (typeof window === 'undefined' || !window.gtag) return;

    const hasAnalytics = categories.includes('analytics');
    const hasMarketing = categories.includes('marketing');

    // Update consent for all 4 required signals
    window.gtag('consent', 'update', {
        'ad_storage': hasMarketing ? 'granted' : 'denied',
        'analytics_storage': hasAnalytics ? 'granted' : 'denied',
        'ad_user_data': hasMarketing ? 'granted' : 'denied',
        'ad_personalization': hasMarketing ? 'granted' : 'denied',
    });

    console.log('Google Consent Mode updated:', {
        analytics: hasAnalytics ? 'granted' : 'denied',
        marketing: hasMarketing ? 'granted' : 'denied',
    });
};

/**
 * Get current language from i18n
 */
const getCurrentLanguage = (): 'fr' | 'en' => {
    const lang = i18n.language || 'fr';
    return lang.startsWith('fr') ? 'fr' : 'en';
};

/**
 * Vanilla Cookie Consent Configuration
 * Implements Google Consent Mode v2 (Advanced Implementation)
 */
export const cookieConsentConfig: CookieConsentConfig = {
    // Disable page scripts management (we handle gtag manually)
    manageScriptTags: false,

    // Auto-clear cookies when consent is revoked
    autoClearCookies: true,

    // Revision number (increment to force re-consent)
    revision: 1,

    // Cookie settings
    cookie: {
        name: 'cc_cookie',
        domain: window.location.hostname,
        path: '/',
        sameSite: 'Lax',
        expiresAfterDays: 365,
    },

    // GUI Options
    guiOptions: {
        consentModal: {
            layout: 'box inline',
            position: 'bottom center',
            equalWeightButtons: true,
            flipButtons: false,
        },
        preferencesModal: {
            layout: 'box',
            position: 'right',
            equalWeightButtons: true,
            flipButtons: false,
        },
    },

    // Callbacks
    onFirstConsent: ({ cookie }) => {
        console.log('First consent given:', cookie);
    },

    onConsent: ({ cookie }) => {
        console.log('Consent updated:', cookie);
        updateGoogleConsent(cookie.categories);
    },

    onChange: ({ changedCategories, changedServices }) => {
        console.log('Consent changed:', { changedCategories, changedServices });
    },

    // Cookie Categories
    categories: {
        necessary: {
            enabled: true,
            readOnly: true,
        },
        analytics: {
            enabled: false,
            readOnly: false,
            autoClear: {
                cookies: [
                    {
                        name: /^_ga/, // Google Analytics cookies
                    },
                    {
                        name: '_gid',
                    },
                ],
            },
        },
        marketing: {
            enabled: false,
            readOnly: false,
            autoClear: {
                cookies: [
                    {
                        name: /^_gcl/, // Google Ads cookies
                    },
                ],
            },
        },
    },

    // Multi-language support with i18n integration
    language: {
        default: getCurrentLanguage(),
        autoDetect: 'document',
        translations: {
            fr: {
                consentModal: {
                    title: '🍪 Nous utilisons des cookies',
                    description:
                        'Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser les publicités. Vous pouvez choisir les cookies que vous acceptez.',
                    acceptAllBtn: 'Tout accepter',
                    acceptNecessaryBtn: 'Tout refuser',
                    showPreferencesBtn: 'Personnaliser',
                    footer: `
                        <a href="/politique-confidentialite">Politique de confidentialité</a>
                        <a href="/mentions-legales">Mentions légales</a>
                    `,
                },
                preferencesModal: {
                    title: 'Préférences de cookies',
                    acceptAllBtn: 'Tout accepter',
                    acceptNecessaryBtn: 'Tout refuser',
                    savePreferencesBtn: 'Enregistrer',
                    closeIconLabel: 'Fermer',
                    serviceCounterLabel: 'Service|Services',
                    sections: [
                        {
                            title: 'Utilisation des cookies',
                            description:
                                'Nous utilisons des cookies pour améliorer votre expérience sur notre site. Vous pouvez personnaliser vos préférences ci-dessous.',
                        },
                        {
                            title: 'Cookies strictement nécessaires',
                            description:
                                'Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.',
                            linkedCategory: 'necessary',
                        },
                        {
                            title: 'Cookies analytiques',
                            description:
                                'Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site.',
                            linkedCategory: 'analytics',
                        },
                        {
                            title: 'Cookies marketing',
                            description:
                                'Ces cookies sont utilisés pour afficher des publicités pertinentes.',
                            linkedCategory: 'marketing',
                        },
                    ],
                },
            },
            en: {
                consentModal: {
                    title: '🍪 We use cookies',
                    description:
                        'We use cookies to enhance your experience, analyze traffic, and personalize ads. You can choose which cookies you accept.',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    showPreferencesBtn: 'Customize',
                    footer: `
                        <a href="/politique-confidentialite">Privacy Policy</a>
                        <a href="/mentions-legales">Legal Notices</a>
                    `,
                },
                preferencesModal: {
                    title: 'Cookie Preferences',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    savePreferencesBtn: 'Save',
                    closeIconLabel: 'Close',
                    serviceCounterLabel: 'Service|Services',
                    sections: [
                        {
                            title: 'Cookie Usage',
                            description:
                                'We use cookies to improve your experience on our site. You can customize your preferences below.',
                        },
                        {
                            title: 'Strictly Necessary Cookies',
                            description:
                                'These cookies are essential for the website to function and cannot be disabled.',
                            linkedCategory: 'necessary',
                        },
                        {
                            title: 'Analytics Cookies',
                            description:
                                'These cookies help us understand how visitors interact with our site.',
                            linkedCategory: 'analytics',
                        },
                        {
                            title: 'Marketing Cookies',
                            description:
                                'These cookies are used to display relevant ads.',
                            linkedCategory: 'marketing',
                        },
                    ],
                },
            },
        },
    },
};

// Type augmentation for gtag
declare global {
    interface Window {
        gtag?: (
            command: string,
            action: string,
            params?: Record<string, any>
        ) => void;
    }
}

