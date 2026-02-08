import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import './LegalPages.css';

const TermsOfService: React.FC = () => {
  const { t } = useTranslation();
  const { t: tSeo } = useTranslation('seo');

  return (
    <div className="legal-page flex-1">
      <SEO
        title={tSeo('termsOfService.title')}
        description={tSeo('termsOfService.description')}
        keywords={tSeo('termsOfService.keywords')}
        canonicalPath="/terms-of-service"
      />
      <div className="legal-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
            {t('common:termsOfService.backToHome')}
          </Link>

          <motion.h1
            className="legal-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('common:termsOfService.title')}
          </motion.h1>

          <motion.div
            className="legal-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.acceptance.title')}</h2>
              <p>{t('common:termsOfService.sections.acceptance.content')}</p>
            </section>

            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.serviceDescription.title')}</h2>
              <p>{t('common:termsOfService.sections.serviceDescription.content1')}</p>
              <p>{t('common:termsOfService.sections.serviceDescription.content2')}</p>
            </section>

            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.accessConditions.title')}</h2>
              <p>{t('common:termsOfService.sections.accessConditions.content')}</p>
              <ul>
                {(t('common:termsOfService.sections.accessConditions.list', { returnObjects: true }) as string[]).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.authorizedUse.title')}</h2>
              <p>{t('common:termsOfService.sections.authorizedUse.content')}</p>
              <ul>
                {(t('common:termsOfService.sections.authorizedUse.list', { returnObjects: true }) as string[]).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.intellectualProperty.title')}</h2>
              <p>{t('common:termsOfService.sections.intellectualProperty.content1')}</p>
              <p>{t('common:termsOfService.sections.intellectualProperty.content2')}</p>
            </section>

            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.userData.title')}</h2>
              <p>{t('common:termsOfService.sections.userData.content1')}</p>
              <p>{t('common:termsOfService.sections.userData.content2')}</p>
            </section>

            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.googleAdsAccounts.title')}</h2>
              <p>{t('common:termsOfService.sections.googleAdsAccounts.content')}</p>
              <ul>
                {(t('common:termsOfService.sections.googleAdsAccounts.list', { returnObjects: true }) as string[]).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.liability.title')}</h2>
              <p>{t('common:termsOfService.sections.liability.content1')}</p>
              <p>{t('common:termsOfService.sections.liability.content2')}</p>
            </section>

            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.warrantyDisclaimer.title')}</h2>
              <p>{t('common:termsOfService.sections.warrantyDisclaimer.content1')}</p>
              <p>{t('common:termsOfService.sections.warrantyDisclaimer.content2')}</p>
            </section>

            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.termination.title')}</h2>
              <p>{t('common:termsOfService.sections.termination.content1')}</p>
              <p>{t('common:termsOfService.sections.termination.content2')}</p>
            </section>

            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.serviceChanges.title')}</h2>
              <p>{t('common:termsOfService.sections.serviceChanges.content')}</p>
            </section>

            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.changes.title')}</h2>
              <p>{t('common:termsOfService.sections.changes.content')}</p>
            </section>

            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.applicableLaw.title')}</h2>
              <p>{t('common:termsOfService.sections.applicableLaw.content')}</p>
            </section>

            <section className="legal-section">
              <h2>{t('common:termsOfService.sections.generalProvisions.title')}</h2>
              <p>{t('common:termsOfService.sections.generalProvisions.content1')}</p>
              <p>{t('common:termsOfService.sections.generalProvisions.content2')}</p>
            </section>

            <section className="legal-section">
              <h2>15. Contact</h2>
              <p>
                Pour toute question concernant ces Conditions d'Utilisation, vous pouvez nous contacter à :
                <strong>helloflipika@gmail.com</strong>
              </p>
            </section>

            <div className="legal-update-info">
              <p><strong>Dernière mise à jour :</strong> 1er janvier 2024</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;