import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './CookieConsent.css';

const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="cookie-consent">
      <div className="cookie-consent-content">
        <div className="cookie-consent-text">
          <h3>🍪 {t('common:cookieConsent.message')}</h3>
          <p>
            {t('common:cookieConsent.message')}
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button 
            className="cookie-btn cookie-btn-decline" 
            onClick={handleDecline}
          >
            {t('common:cookieConsent.decline')}
          </button>
          <button 
            className="cookie-btn cookie-btn-accept" 
            onClick={handleAccept}
          >
            {t('common:cookieConsent.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;