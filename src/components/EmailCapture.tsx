import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { subscribeEmail, validateEmail } from '../firebase/emailService';
import './EmailCapture.css';

const EmailCapture: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage(t('common:emailCapture.errorEmailRequired') || 'Veuillez entrer votre adresse email');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage(t('common:emailCapture.errorEmailInvalid') || 'Veuillez entrer une adresse email valide');
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const result = await subscribeEmail(email);
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    } catch {
      setStatus('error');
      setMessage(t('common:emailCapture.errorGeneric') || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const }
    }
  };

  return (
    <section id="email-capture" className="email-capture">
      <div className="email-capture-container">
        <motion.div
          className="email-capture-content glass"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="capture-header">
            <div className="capture-icon">
              <Mail size={28} />
            </div>
            
            <h2 className="capture-title">
              {t('common:emailCapture.title')}
            </h2>
            
            <p className="capture-subtitle">
              {t('common:emailCapture.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form className="capture-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  placeholder={t('common:emailCapture.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`email-input ${status === 'error' ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
              </div>
              
              <motion.button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              >
                {isSubmitting ? (
                  <motion.div
                    className="loading-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <>
                    <span>{t('common:emailCapture.submitButton')}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </motion.button>
            </div>

            {/* Status Message */}
            {status !== 'idle' && (
              <motion.div
                className={`status-message ${status}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {status === 'success' ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{message}</span>
              </motion.div>
            )}
          </form>

          {/* Benefits */}
          <div className="capture-benefits">
            <div className="benefit-item">
              <CheckCircle size={16} className="benefit-icon" />
              <span>{t('common:emailCapture.benefits.freeBeta')}</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={16} className="benefit-icon" />
              <span>{t('common:emailCapture.benefits.prioritySupport')}</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={16} className="benefit-icon" />
              <span>{t('common:emailCapture.benefits.influence')}</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-number gradient-text">127</span>
              <span className="trust-label">{t('common:emailCapture.trust.activeBeta')}</span>
            </div>
            <div className="trust-item">
              <span className="trust-number gradient-text">73</span>
              <span className="trust-label">{t('common:emailCapture.trust.remainingSpots')}</span>
            </div>
            <div className="trust-item">
              <span className="trust-number gradient-text">+340%</span>
              <span className="trust-label">{t('common:emailCapture.trust.averageRoas')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmailCapture;