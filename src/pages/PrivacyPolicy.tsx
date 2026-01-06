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

  // Helper function to safely render arrays
  const renderList = (items: string[] | undefined) => {
    if (!Array.isArray(items)) return null;
    return (
      <ul>
        {items.map((item, index) => (
          <SafeHTML key={index} tag="li" html={item} />
        ))}
      </ul>
    );
  };

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
              {/* 1. Introduction */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.introduction.title')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.introduction.content')} />
              </section>

              {/* 2. Who We Are */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.whoWeAre.title')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.whoWeAre.content')} />
                <p>
                  <SafeHTML tag="span" html={t('common:privacyPolicy.sections.whoWeAre.company')} /><br />
                  <SafeHTML tag="span" html={t('common:privacyPolicy.sections.whoWeAre.address')} /><br />
                  <SafeHTML tag="span" html={t('common:privacyPolicy.sections.whoWeAre.email')} /><br />
                  <SafeHTML tag="span" html={t('common:privacyPolicy.sections.whoWeAre.siret')} />
                </p>
              </section>

              {/* 3. Data Collected */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.dataCollected.title')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataCollected.intro')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataCollected.step1Title')} />
                {renderList(t('common:privacyPolicy.sections.dataCollected.step1List', { returnObjects: true }) as any)}
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataCollected.step2Title')} />
                {renderList(t('common:privacyPolicy.sections.dataCollected.step2List', { returnObjects: true }) as any)}
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataCollected.usageDataTitle')} />
                {renderList(t('common:privacyPolicy.sections.dataCollected.usageDataList', { returnObjects: true }) as any)}
              </section>

              {/* 4. Data Usage */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.dataUsage.title')} />
                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.dataUsage.googleAdsTitle')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataUsage.googleAdsIntro')} />
                {renderList(t('common:privacyPolicy.sections.dataUsage.googleAdsList', { returnObjects: true }) as any)}
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataUsage.notDoingTitle')} />
                {renderList(t('common:privacyPolicy.sections.dataUsage.notDoingList', { returnObjects: true }) as any)}
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataUsage.userDataTitle')} />
                {renderList(t('common:privacyPolicy.sections.dataUsage.userDataList', { returnObjects: true }) as any)}
              </section>

              {/* 5. Data Sharing */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.dataSharing.title')} />
                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.dataSharing.noSharingTitle')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataSharing.noSharingContent')} />
                {renderList(t('common:privacyPolicy.sections.dataSharing.neverList', { returnObjects: true }) as any)}

                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.dataSharing.serviceProvidersTitle')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataSharing.serviceProvidersIntro')} />
                {renderList(t('common:privacyPolicy.sections.dataSharing.serviceProvidersList', { returnObjects: true }) as any)}
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataSharing.serviceProvidersCommitments')} />
                {renderList(t('common:privacyPolicy.sections.dataSharing.commitmentsList', { returnObjects: true }) as any)}

                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.dataSharing.legalObligationsTitle')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataSharing.legalObligationsIntro')} />
                {renderList(t('common:privacyPolicy.sections.dataSharing.legalObligationsList', { returnObjects: true }) as any)}
              </section>

              {/* 6. Data Security */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.dataSecurity.title')} />
                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.dataSecurity.technicalTitle')} />
                {renderList(t('common:privacyPolicy.sections.dataSecurity.technicalList', { returnObjects: true }) as any)}
                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.dataSecurity.organizationalTitle')} />
                {renderList(t('common:privacyPolicy.sections.dataSecurity.organizationalList', { returnObjects: true }) as any)}
                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.dataSecurity.accessControlsTitle')} />
                {renderList(t('common:privacyPolicy.sections.dataSecurity.accessControlsList', { returnObjects: true }) as any)}
              </section>

              {/* 7. Data Retention */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.dataRetention.title')} />
                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.dataRetention.durationTitle')} />
                {renderList(t('common:privacyPolicy.sections.dataRetention.durationList', { returnObjects: true }) as any)}
                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.dataRetention.deletionTitle')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataRetention.deletionIntro')} />
                {renderList(t('common:privacyPolicy.sections.dataRetention.deletionList', { returnObjects: true }) as any)}
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.dataRetention.autoDeletion')} />
              </section>

              {/* 8. User Rights */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.userRights.title')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.userRights.intro')} />
                {renderList(t('common:privacyPolicy.sections.userRights.rightsList', { returnObjects: true }) as any)}
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.userRights.responseTime')} />
              </section>

              {/* 9. Google Compliance */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.googleCompliance.title')} />
                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.googleCompliance.commitmentTitle')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.googleCompliance.commitmentIntro')} />
                {renderList(t('common:privacyPolicy.sections.googleCompliance.commitmentList', { returnObjects: true }) as any)}

                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.googleCompliance.limitedUseTitle')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.googleCompliance.limitedUseIntro')} />
                {renderList(t('common:privacyPolicy.sections.googleCompliance.limitedUseList', { returnObjects: true }) as any)}

                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.googleCompliance.scopeJustificationTitle')} />
                {renderList(t('common:privacyPolicy.sections.googleCompliance.scopeJustificationList', { returnObjects: true }) as any)}
              </section>

              {/* 10. Cookies */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.cookies.title')} />
                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.cookies.usedTitle')} />
                {renderList(t('common:privacyPolicy.sections.cookies.usedList', { returnObjects: true }) as any)}
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.cookies.configuration')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.cookies.management')} />
              </section>

              {/* 11. International Transfers */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.internationalTransfers.title')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.internationalTransfers.content')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.internationalTransfers.guaranteesIntro')} />
                {renderList(t('common:privacyPolicy.sections.internationalTransfers.guaranteesList', { returnObjects: true }) as any)}
              </section>

              {/* 12. Minor Protection */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.minorProtection.title')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.minorProtection.content')} />
              </section>

              {/* 13. Policy Changes */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.policyChanges.title')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.policyChanges.intro')} />
                {renderList(t('common:privacyPolicy.sections.policyChanges.changesList', { returnObjects: true }) as any)}
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.policyChanges.archivedVersions')} />
              </section>

              {/* 14. Contact */}
              <section className="legal-section">
                <SafeHTML tag="h2" html={t('common:privacyPolicy.sections.contact.title')} />
                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.contact.contactUsTitle')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.contact.contactUsIntro')} />
                <p>
                  <SafeHTML tag="span" html={t('common:privacyPolicy.sections.contact.email')} /><br />
                  <SafeHTML tag="span" html={t('common:privacyPolicy.sections.contact.address')} /><br />
                  <SafeHTML tag="span" html={t('common:privacyPolicy.sections.contact.phone')} /><br />
                  <SafeHTML tag="span" html={t('common:privacyPolicy.sections.contact.dpo')} />
                </p>

                <SafeHTML tag="h3" html={t('common:privacyPolicy.sections.contact.authorityTitle')} />
                <SafeHTML tag="p" html={t('common:privacyPolicy.sections.contact.authorityIntro')} />
                <p>
                  <SafeHTML tag="span" html={t('common:privacyPolicy.sections.contact.cnilName')} /><br />
                  <SafeHTML tag="span" html={t('common:privacyPolicy.sections.contact.cnilAddress')} /><br />
                  <SafeHTML tag="span" html={t('common:privacyPolicy.sections.contact.cnilWebsite')} />
                </p>
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
