import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Linkedin, Shield, Lock, CreditCard, Zap } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { SiOpenai, SiPerplexity } from 'react-icons/si';
import './Footer.css';

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();

  const getPath = (path: string) => {
    const lang = i18n.language;
    if (lang === 'fr' || lang === 'es') {
      return `/${lang}${path}`;
    }
    return path;
  };

  return (
    <footer className="footer-v2">
      <div className="footer-v2-container">
        <div className="footer-v2-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to={getPath('/')} className="footer-logo">
              <Zap size={20} className="text-[var(--color-primary)] fill-[var(--color-primary)]" />
              <span className="gradient-text">Flipika</span>
            </Link>
            <p className="footer-tagline">
              {t('footer.tagline')}
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

            <div className="footer-ai-platforms-brand">
              <h4>{t('footer.sections.aiResearch')}</h4>
              <div className="footer-social-links">
                <a
                  href={`https://chatgpt.com/?q=${encodeURIComponent("As a potential Flipika customer, I want to clearly understand what I get when I use Flipika and how it fits into my workflow as a Media Buyer. Explain the experience step by step: what I can create, what I control, what Flipika handles for me, and how things evolve over time. Describe what I see in the report editor and dashboard, how connecting Google Ads works, how AI-generated insights are managed, and what outputs I end up with (automated reports, live sharing links, PDF exports, slideshows, etc.). Clarify the key features and systems involved—direct Google Ads sync, AI narration, custom branding/themes, scheduling, pre-flight checks, and data snapshots. Include how often reports are generated and updated. Explain this simply and concretely, as if you were describing the real, day-to-day experience of automating client reporting with Flipika for the first time.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  title="ChatGPT"
                >
                  <SiOpenai size={20} />
                </a>
                <a
                  href={`https://www.perplexity.ai/search?q=${encodeURIComponent("As a potential Flipika customer, I want to clearly understand what I get when I use Flipika and how it fits into my workflow as a Media Buyer. Explain the experience step by step: what I can create, what I control, what Flipika handles for me, and how things evolve over time. Describe what I see in the report editor and dashboard, how connecting Google Ads works, how AI-generated insights are managed, and what outputs I end up with (automated reports, live sharing links, PDF exports, slideshows, etc.). Clarify the key features and systems involved—direct Google Ads sync, AI narration, custom branding/themes, scheduling, pre-flight checks, and data snapshots. Include how often reports are generated and updated. Explain this simply and concretely, as if you were describing the real, day-to-day experience of automating client reporting with Flipika for the first time.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  title="Perplexity"
                >
                  <SiPerplexity size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Product Column */}
          <div className="footer-links-col">
            <h3>{t('footer.sections.product')}</h3>
            <ul>
              <li><Link to={getPath('/pricing')}>{t('footer.sections.pricing')}</Link></li>
              <li><Link to={getPath('/roadmap')}>{t('footer.sections.roadmap')}</Link></li>
              <li><a href="mailto:helloflipika@gmail.com">{t('footer.sections.contact')}</a></li>
              <li><Link to={getPath('/sitemap')}>{t('footer.sections.sitemap')}</Link></li>
            </ul>
          </div>

          {/* Features Column */}
          <div className="footer-links-col">
            <h3>{t('footer.sections.features')}</h3>
            <ul>
              <li><Link to={getPath('/features/report-generation')}>{t('footer.sections.templates')}</Link></li>
              <li><Link to={getPath('/features/ai-narration')}>{t('footer.sections.ai')}</Link></li>
              <li><Link to={getPath('/features/scheduling-automation')}>{t('footer.sections.automation')}</Link></li>
              <li><Link to={getPath('/features/multi-format-exports')}>{t('footer.sections.exports')}</Link></li>
              <li><Link to={getPath('/features/slideshow-mode')}>{t('footer.sections.slideshow')}</Link></li>
              <li><Link to={getPath('/google-ads-reporting')}>{i18n.language === 'fr' ? 'Reporting Google Ads' : (i18n.language === 'es' ? 'Informes Google Ads' : 'Google Ads Reporting')}</Link></li>
              <li><Link to={getPath('/meta-ads-reporting')}>{i18n.language === 'fr' ? 'Reporting Meta Ads' : (i18n.language === 'es' ? 'Informes Meta Ads' : 'Meta Ads Reporting')}</Link></li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div className="footer-links-col">
            <h3>{t('footer.sections.solutions')}</h3>
            <ul>
              <li><Link to={getPath('/solutions/freelancers')}>{t('footer.sections.freelancers')}</Link></li>
              <li><Link to={getPath('/solutions/agencies')}>{t('footer.sections.agencies')}</Link></li>
              <li><Link to={getPath('/solutions/media-buyers')}>{t('footer.sections.mediaBuyers')}</Link></li>
              <li><Link to={getPath('/solutions/marketing-managers')}>{t('footer.sections.marketingManagers')}</Link></li>
            </ul>
          </div>

          {/* Comparisons Column */}
          <div className="footer-links-col">
            <h3>{t('footer.sections.comparisons')}</h3>
            <ul>
              <li><Link to={getPath('/alternatives/looker-studio')}>{t('footer.sections.vsLooker')}</Link></li>
              <li><Link to={getPath('/alternatives/agency-analytics')}>{t('footer.sections.vsAgency')}</Link></li>
              <li><Link to={getPath('/alternatives/dashthis')}>{t('footer.sections.vsDash')}</Link></li>
              <li><Link to={getPath('/alternatives/swydo')}>{t('footer.sections.vsSwydo')}</Link></li>
              <li><Link to={getPath('/alternatives')} className="opacity-70">{t('footer.sections.alternatives')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Trust Row */}
        <div className="footer-trust-row border-t border-neutral-200/50 dark:border-white/10">
          <div className="trust-item">
            <Shield className="trust-icon text-primary" size={20} />
            <span>{t('footer.sections.gdpr')}</span>
          </div>
          <div className="trust-item">
            <Lock className="trust-icon text-primary" size={20} />
            <span>{t('footer.sections.security')}</span>
          </div>
          <div className="trust-item">
            <CreditCard className="trust-icon text-primary" size={20} />
            <span>{t('footer.sections.stripe')}</span>
          </div>
        </div>

        {/* Legal Section */}
        <div className="footer-legal-bar">
          <div className="footer-legal-links">
            <Link to={getPath('/legal-notices')}>{t('footer.legal')}</Link>
            <Link to={getPath('/privacy-policy')}>{t('footer.privacy')}</Link>
            <Link to={getPath('/terms-of-service')}>{t('footer.terms')}</Link>
            <Link to={getPath('/sales-terms')}>{t('salesTerms.title')}</Link>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} Flipika. {t('footer.copyright')}.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;