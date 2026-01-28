import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();

  const getPath = (path: string) => {
    const isFrench = i18n.language === 'fr';
    if (isFrench) {
      return `/fr${path}`;
    }
    return path;
  };

  return (
    <footer className="footer-simple">
      <div className="footer-simple-container">
        <div className="footer-simple-content">
          <div className="footer-simple-logo">
            <Link to={i18n.language === 'fr' ? '/fr' : '/'}>
              <span className="gradient-text">Flipika</span>
            </Link>
          </div>

          <div className="footer-simple-links">
            <Link to={getPath('/legal-notices')} className="footer-simple-link">
              {t('common:footer.legal')}
            </Link>
            <Link to={getPath('/privacy-policy')} className="footer-simple-link">
              {t('common:footer.privacy')}
            </Link>
            <Link to={getPath('/terms-of-service')} className="footer-simple-link">
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