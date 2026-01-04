import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SafeHTML } from '../components/SafeHTML';
import SimpleHeader from '../components/SimpleHeader';
import Footer from '../components/Footer';
import './LegalPages.css';

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col">
      <SimpleHeader />

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      <div className="legal-page flex-1">
        <div className="legal-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className="back-link">
              <ArrowLeft size={20} />
              {t('common:privacyPolicy.backToHome')}
            </Link>

            <motion.h1
              className="legal-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('common:privacyPolicy.title')}
            </motion.h1>

            <motion.div
              className="legal-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <section className="legal-section">
                <h2>{t('common:privacyPolicy.sections.introduction.title')}</h2>
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.introduction.content')} />
              </section>

              <section className="legal-section">
                <h2>{t('common:privacyPolicy.sections.whoWeAre.title')}</h2>
                <p>
                  {t('common:privacyPolicy.sections.whoWeAre.content')}<br />
                  {t('common:privacyPolicy.sections.whoWeAre.company')}<br />
                  {t('common:privacyPolicy.sections.whoWeAre.address')}<br />
                  {t('common:privacyPolicy.sections.whoWeAre.email')}<br />
                  {t('common:privacyPolicy.sections.whoWeAre.siret')}
                </p>
              </section>

              <section className="legal-section">
                <h2>{t('common:privacyPolicy.sections.dataCollected.title')}</h2>
                <p>{t('common:privacyPolicy.sections.dataCollected.content')}</p>
                <ul>
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.dataCollected.identificationData')} />
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.dataCollected.connectionData')} />
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.dataCollected.usageData')} />
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.dataCollected.commercialData')} />
                </ul>
              </section>

              <section className="legal-section">
                <h2>{t('common:privacyPolicy.sections.legalBasis.title')}</h2>
                <p>{t('common:privacyPolicy.sections.legalBasis.content')}</p>
                <ul>
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.legalBasis.consent')} />
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.legalBasis.contract')} />
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.legalBasis.legitimateInterest')} />
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.legalBasis.legalObligation')} />
                </ul>
              </section>

              <section className="legal-section">
                <h2>{t('common:privacyPolicy.sections.dataUsage.title')}</h2>
                <p>{t('common:privacyPolicy.sections.dataUsage.content')}</p>
                <ul>
                  <li>{t('common:privacyPolicy.sections.dataUsage.provideServices')}</li>
                  <li>{t('common:privacyPolicy.sections.dataUsage.contact')}</li>
                  <li>{t('common:privacyPolicy.sections.dataUsage.marketing')}</li>
                  <li>{t('common:privacyPolicy.sections.dataUsage.analytics')}</li>
                  <li>{t('common:privacyPolicy.sections.dataUsage.legal')}</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2>{t('common:privacyPolicy.sections.dataRetention.title')}</h2>
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataRetention.content')} />
                <ul>
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.dataRetention.contactData')} />
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.dataRetention.accountData')} />
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.dataRetention.navigationData')} />
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.dataRetention.billingData', { defaultValue: '' })} />
                </ul>
              </section>

              <section className="legal-section">
                <h2>{t('common:privacyPolicy.sections.dataSharing.title')}</h2>
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataSharing.content')} />
              </section>

              <section className="legal-section">
                <h2>{t('common:privacyPolicy.sections.dataSecurity.title')}</h2>
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataSecurity.content')} />
              </section>

              <section className="legal-section">
                <h2>9. Vos droits</h2>
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul>
                  <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                  <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                  <li><strong>Droit d'effacement :</strong> demander la suppression de vos données</li>
                  <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                  <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                  <li><strong>Droit de limitation :</strong> restreindre le traitement de vos données</li>
                </ul>
                <p>
                  Pour exercer ces droits, contactez-nous à : <strong>helloflipika@gmail.com</strong>
                  ou par courrier à l'adresse indiquée ci-dessus.
                </p>
              </section>

              <section className="legal-section">
                <h2>{t('common:privacyPolicy.sections.cookies.title')}</h2>
                <p>{t('common:privacyPolicy.sections.cookies.content')}</p>
                <ul>
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.cookies.essentialCookies')} />
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.cookies.preferenceCookies')} />
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.cookies.analyticsCookies')} />
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.cookies.marketingCookies')} />
                </ul>
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.cookies.manage')} />
              </section>

              <section className="legal-section">
                <h2>{t('common:privacyPolicy.sections.internationalTransfers.title')}</h2>
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.internationalTransfers.content')} />
              </section>

              <section className="legal-section">
                <h2>{t('common:privacyPolicy.sections.policyChanges.title')}</h2>
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.policyChanges.content')} />
              </section>

              <section className="legal-section">
                <h2>{t('common:privacyPolicy.sections.contact.title')}</h2>
                <p>{t('common:privacyPolicy.sections.contact.content')}</p>
                <ul>
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.contact.email')} />
                  <SafeHTML tag="li" html={t('common:privacyPolicy.sections.contact.address')} />
                </ul>
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.contact.cnil')} />
              </section>

              <div className="legal-update-info">
                <SafeHTML tag="p" html={t('common:privacyPolicy.lastUpdate')} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;