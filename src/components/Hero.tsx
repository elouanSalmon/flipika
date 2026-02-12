import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const getLangPath = (path: string) => {
    const isFrench = i18n.language === 'fr';
    return isFrench ? `/fr${path}` : path;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" as const }
    }
  };

  const stats = [
    { icon: Zap, value: t('common:hero.stats.reportTime.value'), label: t('common:hero.stats.reportTime.label') },
    { icon: TrendingUp, value: t('common:hero.stats.reportsGenerated.value'), label: t('common:hero.stats.reportsGenerated.label') },
    { icon: Sparkles, value: t('common:hero.stats.zeroFormatting.value'), label: t('common:hero.stats.zeroFormatting.label') }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80vw',
            height: '80vw',
            maxWidth: '1200px',
            maxHeight: '1200px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            opacity: 0.07,
            filter: 'blur(120px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '-10%',
            width: '30vw',
            height: '30vw',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            opacity: 0.05,
            filter: 'blur(100px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '-5%',
            width: '20vw',
            height: '20vw',
            borderRadius: '50%',
            background: 'var(--gradient-secondary)',
            opacity: 0.04,
            filter: 'blur(80px)',
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Centered Content */}
        <motion.div
          className="flex flex-col items-center text-center gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium text-primary"
            variants={itemVariants}
          >
            <Sparkles size={16} />
            <span>{t('common:hero.badge') || 'Powered by AI'}</span>
          </motion.div>

          {/* Title — larger, bolder */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight max-w-4xl"
            variants={itemVariants}
          >
            {t('common:hero.title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed"
            variants={itemVariants}
          >
            {t('common:hero.subtitle')}
          </motion.p>

          {/* CTA Buttons — bigger, more dramatic */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mt-4"
            variants={itemVariants}
          >
            <motion.button
              className="btn btn-primary inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold rounded-2xl shadow-lg shadow-primary/25"
              onClick={() => navigate(getLangPath('/login'))}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span>{t('common:hero.cta')}</span>
              <ArrowRight size={20} />
            </motion.button>

            <motion.button
              className="btn btn-secondary inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-medium rounded-2xl"
              onClick={() => navigate(getLangPath('/login'))}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Play size={18} />
              <span>{t('common:hero.ctaSecondary')}</span>
            </motion.button>
          </motion.div>

          {/* Stats pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mt-6"
            variants={itemVariants}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="flex items-center gap-3 px-5 py-3 glass rounded-2xl border border-white/10 dark:border-white/5"
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0, 102, 255, 0.1)' }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                  <stat.icon size={20} className="text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup — centered, larger, more dramatic */}
        <motion.div
          className="relative flex justify-center items-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" as const }}
        >
          {/* Glow behind mockup */}
          <div
            className="absolute inset-0 -m-8"
            style={{
              background: 'var(--gradient-primary)',
              opacity: 0.08,
              filter: 'blur(60px)',
              borderRadius: '32px',
            }}
          />

          <div className="relative w-full glass rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/5">
            {/* Mockup Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Rapport Client - Janvier 2024
              </span>
              <div className="w-16" />
            </div>

            {/* Mockup Content */}
            <div className="p-6 space-y-4">
              {/* Metric Cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Impressions', value: '125K', change: '+18% vs mois dernier' },
                  { label: 'Taux de Conversion', value: '3.2%', change: 'Performance stable' },
                  { label: 'ROAS', value: '4.8x', change: '+22% ce trimestre' }
                ].map((metric) => (
                  <div key={metric.label} className="p-4 bg-white/80 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600/30">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      {metric.label}
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                      {metric.value}
                    </div>
                    <div className="text-xs text-primary font-medium mt-1">
                      {metric.change}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Placeholder */}
              <div className="p-5 bg-white/80 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600/30">
                <div className="flex items-end justify-around h-24 gap-2">
                  {[60, 80, 45, 90, 75, 85, 70].map((height, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary to-primary-light rounded-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: 0.7 + i * 0.1, ease: "easeOut" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <motion.div
            className="absolute -top-5 -left-5 p-3.5 glass rounded-2xl shadow-lg border border-white/20 dark:border-white/5"
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Zap size={24} className="text-primary" />
          </motion.div>

          <motion.div
            className="absolute -bottom-5 -right-5 p-3.5 glass rounded-2xl shadow-lg border border-white/20 dark:border-white/5"
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <TrendingUp size={24} className="text-primary" />
          </motion.div>

          <motion.div
            className="absolute top-1/2 -right-10 p-3 glass rounded-2xl shadow-lg border border-white/20 dark:border-white/5"
            animate={{ y: [-6, 6, -6], x: [0, 4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles size={20} className="text-primary" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
