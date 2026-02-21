import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Users,
  Database,
  Sparkles,
  Zap,
  Shield,
  CheckCircle,
  X,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Differentiation: React.FC = () => {
  const { t } = useTranslation();

  const scrollToEmailForm = () => {
    const emailSection = document.getElementById('email-capture');
    if (emailSection) {
      emailSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const differentiators = [
    {
      icon: FileText,
      title: t('differentiation.notCopywritingTool.title'),
      subtitle: t('differentiation.notCopywritingTool.subtitle'),
      description: t('differentiation.notCopywritingTool.description')
    },
    {
      icon: Users,
      title: t('differentiation.designedForMediaBuyers.title'),
      subtitle: t('differentiation.designedForMediaBuyers.subtitle'),
      description: t('differentiation.designedForMediaBuyers.description')
    },
    {
      icon: Database,
      title: t('differentiation.usesRealData.title'),
      subtitle: t('differentiation.usesRealData.subtitle'),
      description: t('differentiation.usesRealData.description')
    },
    {
      icon: Sparkles,
      title: t('differentiation.learnsAndImproves.title'),
      subtitle: t('differentiation.learnsAndImproves.subtitle'),
      description: t('differentiation.learnsAndImproves.description')
    }
  ];

  const comparison = [
    { feature: t('differentiation.comparison.campaignManagement'), flipika: true, others: false },
    { feature: t('differentiation.comparison.realTimeOptimization'), flipika: true, others: false },
    { feature: t('differentiation.comparison.directGoogleAds'), flipika: true, others: false },
    { feature: t('differentiation.comparison.specializedAI'), flipika: true, others: false },
    { feature: t('differentiation.comparison.continuousLearning'), flipika: true, others: false },
    { feature: t('differentiation.comparison.genericText'), flipika: false, others: true }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };

  return (
    <section className="relative py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '-10%',
            width: '30vw',
            height: '30vw',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            opacity: 0.06,
            filter: 'blur(120px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '-5%',
            width: '25vw',
            height: '25vw',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            opacity: 0.04,
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

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass text-primary rounded-full text-sm font-medium mb-6 border border-white/10 dark:border-white/5">
            <Shield size={16} />
            <span>{t('differentiation.title')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-neutral-200 mb-5 tracking-tight">
            {t('differentiation.subtitle')}
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            {t('differentiation.description')}
          </p>
        </motion.div>

        {/* Differentiators Grid — Bento style: 2 large + 2 small */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {differentiators.map((diff, index) => (
            <motion.div
              key={diff.title}
              className={`group p-7 glass rounded-3xl border border-white/10 dark:border-white/5 overflow-hidden ${index < 2 ? 'lg:col-span-2' : ''
                }`}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 300 } }}
            >
              {/* Top accent */}
              <div
                className="absolute top-0 left-6 right-6 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
                  opacity: 0.2,
                }}
              />

              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                <diff.icon size={26} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-200 mb-1.5">
                {diff.title}
              </h3>
              <p className="text-sm font-semibold text-primary mb-3">
                {diff.subtitle}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {diff.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-200 mb-3">
              {t('differentiation.comparison.title')}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {t('differentiation.comparison.subtitle')}
            </p>
          </div>

          <div className="glass rounded-3xl overflow-hidden border border-white/10 dark:border-white/5">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 p-5 bg-neutral-50/50 dark:bg-black/50 border-b border-neutral-200/50 dark:border-white/10">
              <div className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                {t('differentiation.comparison.featureHeader')}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-primary">
                <Zap size={16} />
                <span>{t('differentiation.comparison.flipikaHeader')}</span>
              </div>
              <div className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 text-center">
                {t('differentiation.comparison.othersHeader')}
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-neutral-200/50 dark:divide-white/10/50">
              {comparison.map((item) => (
                <div
                  key={item.feature}
                  className="grid grid-cols-3 gap-4 p-5 hover:bg-primary/5 transition-colors duration-200"
                >
                  <div className="text-sm text-neutral-700 dark:text-neutral-300">
                    {item.feature}
                  </div>
                  <div className="flex justify-center">
                    {item.flipika ? (
                      <CheckCircle size={20} className="text-primary" />
                    ) : (
                      <X size={20} className="text-neutral-300 dark:text-neutral-600" />
                    )}
                  </div>
                  <div className="flex justify-center">
                    {item.others ? (
                      <CheckCircle size={20} className="text-primary" />
                    ) : (
                      <X size={20} className="text-neutral-300 dark:text-neutral-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 glass rounded-3xl border border-white/10 dark:border-white/5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
          viewport={{ once: true }}
        >
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-200 mb-2">
              {t('differentiation.cta')}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {t('differentiation.ctaSubtitle') || 'Discover why Media Buyers choose Flipika'}
            </p>
          </div>
          <motion.button
            className="btn btn-primary inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-6 py-3 shadow-lg shadow-primary/25"
            onClick={scrollToEmailForm}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span>{t('hero.cta')}</span>
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Differentiation;
