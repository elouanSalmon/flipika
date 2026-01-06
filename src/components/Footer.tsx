import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer-simple">
      <div className="footer-simple-container">
        <div className="footer-simple-content">
          <div className="footer-simple-logo">
            <span className="gradient-text">Flipika</span>
          </div>
          
          <div className="footer-simple-links">
            <Link to="/legal-notices" className="footer-simple-link">
              {t('common:footer.legal')}
            </Link>
            <Link to="/privacy-policy" className="footer-simple-link">
              {t('common:footer.privacy')}
            </Link>
            <Link to="/terms-of-service" className="footer-simple-link">
              {t('common:footer.terms')}
            </Link>
          </div>
          
          <div className="footer-simple-copyright">
            © 2025 Flipika. {t('common:footer.copyright')}.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;