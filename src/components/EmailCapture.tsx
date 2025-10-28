import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { subscribeEmail, validateEmail } from '../firebase/emailService';
import './EmailCapture.css';

const EmailCapture: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Veuillez entrer votre adresse email');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Veuillez entrer une adresse email valide');
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
    } catch (error) {
      setStatus('error');
      setMessage('Une erreur est survenue. Veuillez réessayer.');
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
              Rejoignez la <span className="gradient-text">Révolution</span> Google Ads
            </h2>
            
            <p className="capture-subtitle">
              Soyez parmi les premiers à accéder à l'IA qui transforme vos campagnes en machines à profit. 
              <strong>Places limitées pour la bêta exclusive.</strong>
            </p>
          </div>

          {/* Form */}
          <form className="capture-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  placeholder="Entrez votre adresse email"
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
                    <span>Réserver ma Place Bêta</span>
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
              <span>Accès bêta gratuit à vie</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={16} className="benefit-icon" />
              <span>Support prioritaire 1-on-1</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={16} className="benefit-icon" />
              <span>Influence sur les nouvelles fonctionnalités</span>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="trust-indicators">
            <div className="trust-item">
              <span className="trust-number gradient-text">87</span>
              <span className="trust-label">Beta Testeurs Actifs</span>
            </div>
            <div className="trust-item">
              <span className="trust-number gradient-text">13</span>
              <span className="trust-label">Places Restantes</span>
            </div>
            <div className="trust-item">
              <span className="trust-number gradient-text">+180%</span>
              <span className="trust-label">ROAS Moyen</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmailCapture;