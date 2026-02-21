import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import './LegalPages.css';

const SalesTerms: React.FC = () => {
    const { t } = useTranslation();
    // Using generic SEO or adding keys later. For now, hardcoded fallback or re-using similar keys if available.
    // Ideally we should add 'salesTerms' to seo.json but for now let's use direct values or common keys.

    return (
        <div className="legal-page flex-1">
            <SEO
                title={t('common:salesTerms.title')}
                description="Conditions Générales de Vente de Flipika (CGV)"
                keywords="CGV, Sales Terms, Subscription, Lifetime Plan, Flipika"
                canonicalPath="/sales-terms"
            />
            <div className="legal-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link to="/" className="back-link">
                        <ArrowLeft size={20} />
                        {t('common:salesTerms.backToHome')}
                    </Link>

                    <motion.h1
                        className="legal-title"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {t('common:salesTerms.title')}
                    </motion.h1>

                    <motion.div
                        className="legal-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.preamble.title')}</h2>
                            <p dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.preamble.content') }} />
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.definitions.title')}</h2>
                            <div dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.definitions.content') }} />
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.orders.title')}</h2>
                            <p dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.orders.content') }} />
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.services.title')}</h2>
                            <p dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.services.intro') }} />
                            <ul>
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.services.subscription') }} />
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.services.lifetime') }} />
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.financial.title')}</h2>
                            <ul>
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.financial.pricing') }} />
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.financial.payment') }} />
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.financial.latePayment') }} />
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.duration.title')}</h2>
                            <ul>
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.duration.subscriptionDuration') }} />
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.duration.terminationForBreach') }} />
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.duration.lifetimeDuration') }} />
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.obligations.title')}</h2>
                            <ul>
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.obligations.flipika') }} />
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.obligations.client') }} />
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.liability.title')}</h2>
                            <p dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.liability.content') }} />
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.ip.title')}</h2>
                            <ul>
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.ip.flipika') }} />
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.ip.client') }} />
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.personalData.title')}</h2>
                            <p dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.personalData.content') }} />
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.forceMajeure.title')}</h2>
                            <p dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.forceMajeure.content') }} />
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.applicableLaw.title')}</h2>
                            <p dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.applicableLaw.content') }} />
                        </section>

                        <div className="legal-update-info">
                            <p dangerouslySetInnerHTML={{ __html: t('common:salesTerms.lastUpdate') }} />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default SalesTerms;
