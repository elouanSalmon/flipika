import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Zap, TrendingUp, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Hero: React.FC = () => {
  const { t } = useTranslation();

  const scrollToEmailForm = () => {
    const emailSection = document.getElementById('email-capture');
    if (emailSection) {
      emailSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  const stats = [
    { icon: Zap, value: t('common:hero.stats.reportTime.value'), label: t('common:hero.stats.reportTime.label') },
    { icon: TrendingUp, value: t('common:hero.stats.reportsGenerated.value'), label: t('common:hero.stats.reportsGenerated.label') },
    { icon: Target, value: t('common:hero.stats.zeroFormatting.value'), label: t('common:hero.stats.zeroFormatting.label') }
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-gray-900 pt-16 pb-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0, 102, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            className="flex flex-col gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Title */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight"
              variants={itemVariants}
            >
              {t('common:hero.title')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-xl"
              variants={itemVariants}
            >
              {t('common:hero.subtitle')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mt-2"
              variants={itemVariants}
            >
              <motion.button
                className="btn btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold"
                onClick={scrollToEmailForm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{t('common:hero.cta')}</span>
                <ArrowRight size={20} />
              </motion.button>

              <motion.button
                className="btn btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium"
                onClick={scrollToEmailForm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play size={18} />
                <span>{t('common:hero.ctaSecondary')}</span>
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap gap-4 mt-4"
              variants={itemVariants}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="flex items-center gap-3 px-4 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-sm"
                  whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0, 102, 255, 0.12)' }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <stat.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div
            className="relative flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="w-full max-w-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Mockup Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Rapport Client - Janvier 2024
                </span>
              </div>

              {/* Mockup Content */}
              <div className="p-5 space-y-4">
                {/* Metric Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white/80 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600/30">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Impressions
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                      125K
                    </div>
                    <div className="text-xs text-primary font-medium mt-1">
                      +18% vs mois dernier
                    </div>
                  </div>

                  <div className="p-4 bg-white/80 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600/30">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Taux de Conversion
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                      3.2%
                    </div>
                    <div className="text-xs text-primary font-medium mt-1">
                      Performance stable
                    </div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="p-4 bg-white/80 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600/30">
                  <div className="flex items-end justify-around h-20 gap-2">
                    {[60, 80, 45, 90, 75].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-primary to-primary-light rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -left-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Zap size={24} className="text-primary" />
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -right-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
              animate={{ y: [8, -8, 8] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <TrendingUp size={24} className="text-primary" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
