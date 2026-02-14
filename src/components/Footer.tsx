import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Linkedin, Shield, Lock, CreditCard } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
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
    <footer className="footer-v2">
      <div className="footer-v2-container">
        <div className="footer-v2-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to={i18n.language === 'fr' ? '/fr' : '/'} className="footer-logo">
              <span className="gradient-text">Flipika</span>
            </Link>
            <p className="footer-tagline">
              {t('common:footer.tagline')}
            </p>
            <div className="footer-social-links">
              <a
                href="https://www.linkedin.com/company/flipika/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Flipika LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://wa.me/33676061902"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="Contact Flipika WhatsApp"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="footer-links-col">
            <h3>{t('common:footer.sections.product')}</h3>
            <ul>
              <li><Link to={getPath('/features')}>{t('common:footer.sections.features')}</Link></li>
              <li><Link to={getPath('/pricing')}>{t('common:footer.sections.pricing')}</Link></li>
              <li><Link to={getPath('/roadmap')}>{t('common:footer.sections.roadmap')}</Link></li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div className="footer-links-col">
            <h3>{t('common:footer.sections.solutions')}</h3>
            <ul>
              <li><Link to={getPath('/features/report-generation')}>{t('common:footer.sections.templates')}</Link></li>
              <li><Link to={getPath('/features/ai-narration')}>{t('common:footer.sections.ai')}</Link></li>
              <li><Link to={getPath('/features/scheduling-automation')}>{t('common:footer.sections.automation')}</Link></li>
              <li><Link to={getPath('/features/multi-format-exports')}>{t('common:footer.sections.exports')}</Link></li>
              <li><Link to={getPath('/features/slideshow-mode')}>{t('common:footer.sections.slideshow')}</Link></li>
            </ul>
          </div>

          {/* Comparisons Column */}
          <div className="footer-links-col">
            <h3>{t('common:footer.sections.comparisons')}</h3>
            <ul>
              <li><Link to={getPath('/alternatives/looker-studio')}>{t('common:footer.sections.vsLooker')}</Link></li>
              <li><Link to={getPath('/alternatives/agency-analytics')}>{t('common:footer.sections.vsAgency')}</Link></li>
              <li><Link to={getPath('/alternatives/dashthis')}>{t('common:footer.sections.vsDash')}</Link></li>
              <li><Link to={getPath('/alternatives/swydo')}>{t('common:footer.sections.vsSwydo')}</Link></li>
              <li><Link to={getPath('/alternatives')} className="opacity-70">{t('common:footer.sections.alternatives')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Trust Row */}
        <div className="footer-trust-row border-t border-neutral-200/50 dark:border-white/10">
          <div className="trust-item">
            <Shield className="trust-icon text-primary" size={20} />
            <span>{t('common:footer.sections.gdpr')}</span>
          </div>
          <div className="trust-item">
            <Lock className="trust-icon text-primary" size={20} />
            <span>{t('common:footer.sections.security')}</span>
          </div>
          <div className="trust-item">
            <CreditCard className="trust-icon text-primary" size={20} />
            <span>{t('common:footer.sections.stripe')}</span>
          </div>
        </div>

        {/* Legal Section */}
        <div className="footer-legal-bar">
          <div className="footer-legal-links">
            <Link to={getPath('/legal-notices')}>{t('common:footer.legal')}</Link>
            <Link to={getPath('/privacy-policy')}>{t('common:footer.privacy')}</Link>
            <Link to={getPath('/terms-of-service')}>{t('common:footer.terms')}</Link>
            <Link to={getPath('/sitemap')}>{t('common:footer.sections.sitemap')}</Link>
            <a href="mailto:helloflipika@gmail.com">{t('common:footer.sections.contact')}</a>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Flipika. {t('common:footer.copyright')}.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;