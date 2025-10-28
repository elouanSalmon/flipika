import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

const CookieConsent: React.FC = () => {
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
          <h3>🍪 Nous utilisons des cookies</h3>
          <p>
            Nous utilisons des cookies pour améliorer votre expérience sur notre site, 
            analyser le trafic et personnaliser le contenu. En continuant à naviguer, 
            vous acceptez notre utilisation des cookies.
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button 
            className="cookie-btn cookie-btn-decline" 
            onClick={handleDecline}
          >
            Refuser
          </button>
          <button 
            className="cookie-btn cookie-btn-accept" 
            onClick={handleAccept}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;