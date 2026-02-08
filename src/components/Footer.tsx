import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Linkedin } from 'lucide-react';
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
            <Link to={getPath('/sitemap')} className="footer-simple-link">
              {i18n.language === 'fr' ? 'Plan du site' : 'Sitemap'}
            </Link>
          </div>

          <a
            href="https://www.linkedin.com/company/flipika/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-linkedin-link"
            aria-label="Flipika LinkedIn"
          >
            <Linkedin size={20} />
          </a>

          <div className="footer-simple-copyright">
            © {new Date().getFullYear()} Flipika. {t('common:footer.copyright')}.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;