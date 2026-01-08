import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { subscribeEmail, validateEmail } from '../firebase/emailService';

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
    <section id="email-capture" className="relative py-16 bg-[var(--color-bg-secondary)] overflow-hidden">
      {/* Blue light orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '50vw',
            height: '50vw',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            opacity: 0.1,
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(var(--color-grid) 1px, transparent 1px), linear-gradient(90deg, var(--color-grid) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          className="relative p-8 sm:p-10 glass rounded-3xl shadow-xl overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Top accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-primary" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Mail size={28} className="text-primary" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
              {t('common:emailCapture.title')}
            </h2>

            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              {t('common:emailCapture.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form className="mb-8" onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none z-10" />
                <input
                  type="email"
                  placeholder={t('common:emailCapture.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-gray-700/50 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-0 focus:border-primary focus:bg-white dark:focus:bg-gray-700/70 focus:shadow-lg focus:shadow-primary/10 ${
                    status === 'error' ? 'border-primary' : 'border-gray-200/50 dark:border-gray-600/50'
                  }`}
                  disabled={isSubmitting}
                />
              </div>

              <motion.button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
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
                className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium ${
                  status === 'success'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-primary/10 text-primary border border-primary/20'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {status === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{message}</span>
              </motion.div>
            )}
          </form>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {['freeBeta', 'prioritySupport', 'influence'].map((key) => (
              <div key={key} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle size={16} className="text-primary flex-shrink-0" />
                <span>{t(`common:emailCapture.benefits.${key}`)}</span>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                127
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {t('common:emailCapture.trust.activeBeta')}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                73
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {t('common:emailCapture.trust.remainingSpots')}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                +340%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {t('common:emailCapture.trust.averageRoas')}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmailCapture;
