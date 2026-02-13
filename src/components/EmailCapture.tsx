import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { subscribeEmail, validateEmail } from '../firebase/emailService';

const EmailCapture: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

        // Redirect to login page after successful submission
        setTimeout(() => {
          navigate('/login');
        }, 1500);
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
      transition: { duration: 0.7, ease: "easeOut" as const }
    }
  };

  return (
    <section id="email-capture" className="relative py-20">
      <div className="absolute inset-0 pointer-events-none">
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
            opacity: 0.08,
            filter: 'blur(120px)',
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
          className="relative p-10 sm:p-12 glass rounded-3xl shadow-2xl overflow-hidden border border-white/15 dark:border-white/5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Top accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-primary" />

          {/* Subtle glow behind the card */}
          <div
            className="absolute -inset-4 -z-10"
            style={{
              background: 'var(--gradient-primary)',
              opacity: 0.06,
              filter: 'blur(40px)',
              borderRadius: '40px',
            }}
          />

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <Mail size={28} className="text-primary" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-white mb-4 tracking-tight">
              {t('common:emailCapture.title')}
            </h2>

            <p className="text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
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
                  className={`w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-neutral-700/50 border-2 rounded-2xl text-neutral-900 dark:text-white placeholder-neutral-400 transition-all duration-300 focus:outline-none focus:ring-0 focus:border-primary focus:bg-white dark:focus:bg-neutral-700/70 focus:shadow-lg focus:shadow-primary/10 ${status === 'error' ? 'border-primary' : 'border-neutral-200/50 dark:border-neutral-600/50'
                    }`}
                  disabled={isSubmitting}
                />
              </div>

              <motion.button
                type="submit"
                className="flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-2xl shadow-lg shadow-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
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
                className={`flex items-center justify-center gap-2 p-4 rounded-xl text-sm font-medium ${status === 'success'
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
              <div key={key} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <CheckCircle size={16} className="text-primary flex-shrink-0" />
                <span>{t(`common:emailCapture.benefits.${key}`)}</span>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { value: '127', label: t('common:emailCapture.trust.activeBeta') },
              { value: '73', label: t('common:emailCapture.trust.remainingSpots') },
              { value: '+340%', label: t('common:emailCapture.trust.averageRoas') }
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                  {stat.value}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmailCapture;
