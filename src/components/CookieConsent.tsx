import { useEffect } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';
import { cookieConsentConfig } from '../config/consent-config';
import 'vanilla-cookieconsent/dist/cookieconsent.css';

/**
 * CookieConsent Component
 * Initializes and manages the cookie consent banner
 * Implements Google Consent Mode v2 (Advanced Implementation)
 */
const CookieConsentComponent = () => {
  useEffect(() => {
    // Initialize cookie consent
    CookieConsent.run(cookieConsentConfig);

    console.log('Cookie Consent initialized');

    // Cleanup on unmount
    return () => {
      // Note: vanilla-cookieconsent doesn't provide a destroy method
      // The library handles its own cleanup
    };
  }, []);

  // This component doesn't render anything
  // The library manages its own DOM elements
  return null;
};

export default CookieConsentComponent;