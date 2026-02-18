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
                            <h2>{t('common:salesTerms.sections.services.title')}</h2>
                            <p>{t('common:salesTerms.sections.services.intro')}</p>
                            <ul>
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.services.subscription') }} />
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.services.lifetime') }} />
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.orders.title')}</h2>
                            <p>{t('common:salesTerms.sections.orders.content')}</p>
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.pricing.title')}</h2>
                            <p>{t('common:salesTerms.sections.pricing.content')}</p>
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.payment.title')}</h2>
                            <p>{t('common:salesTerms.sections.payment.content')}</p>
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.subscriptionTerms.title')}</h2>
                            <ul>
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.subscriptionTerms.duration') }} />
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.subscriptionTerms.termination') }} />
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.lifetimeTerms.title')}</h2>
                            <ul>
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.lifetimeTerms.definition') }} />
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.lifetimeTerms.nonTransferable') }} />
                                <li dangerouslySetInnerHTML={{ __html: t('common:salesTerms.sections.lifetimeTerms.refund') }} />
                            </ul>
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.withdrawal.title')}</h2>
                            <p>{t('common:salesTerms.sections.withdrawal.content')}</p>
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.liability.title')}</h2>
                            <p>{t('common:salesTerms.sections.liability.content')}</p>
                        </section>

                        <section className="legal-section">
                            <h2>{t('common:salesTerms.sections.applicableLaw.title')}</h2>
                            <p>{t('common:salesTerms.sections.applicableLaw.content')}</p>
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
