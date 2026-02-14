import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const getLangPath = (path: string) => {
    const isFrench = i18n.language === 'fr';
    return isFrench ? `/fr${path}` : path;
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '60vw',
            height: '60vw',
            maxWidth: '900px',
            maxHeight: '900px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            opacity: 0.06,
            filter: 'blur(120px)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text content */}
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" as const }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-primary bg-primary/8 dark:bg-primary/15 w-fit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Sparkles size={16} />
              <span>{t('common:hero.badge')}</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-neutral-200 leading-[1.1] tracking-tight">
              {t('common:hero.title')}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
              {t('common:hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <motion.button
                className="btn btn-primary inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-semibold rounded-xl shadow-lg shadow-primary/25"
                onClick={() => navigate(getLangPath('/login'))}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span>{t('common:hero.cta')}</span>
                <ArrowRight size={18} />
              </motion.button>

              <motion.button
                className="btn btn-secondary inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-medium rounded-xl"
                onClick={() => navigate(getLangPath('/login'))}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span>{t('common:hero.ctaSecondary')}</span>
              </motion.button>
            </div>

            {/* Trust line */}
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {t('common:hero.noCreditCard')}
            </p>
          </motion.div>

          {/* Right — Image placeholder */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" as const }}
          >
            <div
              className="w-full aspect-[4/3] rounded-2xl flex items-center justify-center overflow-hidden border border-neutral-200/60 dark:border-white/10 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #f0f4ff 0%, #e8edff 50%, #dde5ff 100%)',
              }}
            >
              <span className="text-neutral-400 dark:text-neutral-500 text-sm font-medium px-6 text-center">
                Image / GIF du produit
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
