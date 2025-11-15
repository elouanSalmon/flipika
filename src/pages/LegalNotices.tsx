import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './LegalPages.css';

const LegalNotices: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="legal-page">
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
              <p dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.generalInfo.content') }} />
              <p>
                <span dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.generalInfo.address') }} /><br/>
                <span dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.generalInfo.phone') }} /><br/>
                <span dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.generalInfo.email') }} /><br/>
                <span dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.generalInfo.director') }} />
              </p>
            </section>

            <section className="legal-section">
              <h2>{t('common:legalNotices.sections.hosting.title')}</h2>
              <p>
                <span dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.hosting.content') }} /><br/>
                <span dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.hosting.address') }} /><br/>
                <span dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.hosting.phone') }} />
              </p>
            </section>

            <section className="legal-section">
              <h2>{t('common:legalNotices.sections.intellectualProperty.title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.intellectualProperty.content1') }} />
              <p dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.intellectualProperty.content2') }} />
            </section>

            <section className="legal-section">
              <h2>{t('common:legalNotices.sections.personalData.title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.personalData.content1') }} />
              <p dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.personalData.content2') }} />
            </section>

            <section className="legal-section">
              <h2>{t('common:legalNotices.sections.cookies.title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.cookies.content') }} />
            </section>

            <section className="legal-section">
              <h2>{t('common:legalNotices.sections.liability.title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.liability.content1') }} />
              <p dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.liability.content2') }} />
            </section>

            <section className="legal-section">
              <h2>{t('common:legalNotices.sections.applicableLaw.title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.applicableLaw.content') }} />
            </section>

            <section className="legal-section">
              <h2>{t('common:legalNotices.sections.contact.title')}</h2>
              <p dangerouslySetInnerHTML={{ __html: t('common:legalNotices.sections.contact.content') }} />
            </section>

            <div className="legal-update-info">
              <p dangerouslySetInnerHTML={{ __html: t('common:legalNotices.lastUpdate') }} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LegalNotices;