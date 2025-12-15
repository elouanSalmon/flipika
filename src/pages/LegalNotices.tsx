import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SafeHTML } from '../components/SafeHTML';
import SimpleHeader from '../components/SimpleHeader';
import Footer from '../components/Footer';
import './LegalPages.css';

const LegalNotices: React.FC = () => {
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
              {t('common:legalNotices.backToHome')}
            </Link>

            <motion.h1
              className="legal-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('common:legalNotices.title')}
            </motion.h1>

            <motion.div
              className="legal-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <section className="legal-section">
                <h2>{t('common:legalNotices.sections.generalInfo.title')}</h2>
                <SafeHTML tag="p" html={t('common:legalNotices.sections.generalInfo.content')} />
                <p>
                  <SafeHTML tag="span" html={t('common:legalNotices.sections.generalInfo.address')} /><br />
                  <SafeHTML tag="span" html={t('common:legalNotices.sections.generalInfo.phone')} /><br />
                  <SafeHTML tag="span" html={t('common:legalNotices.sections.generalInfo.email')} /><br />
                  <SafeHTML tag="span" html={t('common:legalNotices.sections.generalInfo.director')} />
                </p>
              </section>

              <section className="legal-section">
                <h2>{t('common:legalNotices.sections.hosting.title')}</h2>
                <p>
                  <SafeHTML tag="span" html={t('common:legalNotices.sections.hosting.content')} /><br />
                  <SafeHTML tag="span" html={t('common:legalNotices.sections.hosting.address')} /><br />
                  <SafeHTML tag="span" html={t('common:legalNotices.sections.hosting.phone')} />
                </p>
              </section>

              <section className="legal-section">
                <h2>{t('common:legalNotices.sections.intellectualProperty.title')}</h2>
                <SafeHTML tag="p" html={t('common:legalNotices.sections.intellectualProperty.content1')} />
                <SafeHTML tag="p" html={t('common:legalNotices.sections.intellectualProperty.content2')} />
              </section>

              <section className="legal-section">
                <h2>{t('common:legalNotices.sections.personalData.title')}</h2>
                <SafeHTML tag="p" html={t('common:legalNotices.sections.personalData.content1')} />
                <SafeHTML tag="p" html={t('common:legalNotices.sections.personalData.content2')} />
              </section>

              <section className="legal-section">
                <h2>{t('common:legalNotices.sections.cookies.title')}</h2>
                <SafeHTML tag="p" html={t('common:legalNotices.sections.cookies.content')} />
              </section>

              <section className="legal-section">
                <h2>{t('common:legalNotices.sections.liability.title')}</h2>
                <SafeHTML tag="p" html={t('common:legalNotices.sections.liability.content1')} />
                <SafeHTML tag="p" html={t('common:legalNotices.sections.liability.content2')} />
              </section>

              <section className="legal-section">
                <h2>{t('common:legalNotices.sections.applicableLaw.title')}</h2>
                <SafeHTML tag="p" html={t('common:legalNotices.sections.applicableLaw.content')} />
              </section>

              <section className="legal-section">
                <h2>{t('common:legalNotices.sections.contact.title')}</h2>
                <SafeHTML tag="p" html={t('common:legalNotices.sections.contact.content')} />
              </section>

              <div className="legal-update-info">
                <SafeHTML tag="p" html={t('common:legalNotices.lastUpdate')} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LegalNotices;