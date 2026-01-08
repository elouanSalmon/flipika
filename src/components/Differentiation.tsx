import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  Database,
  TrendingUp,
  Zap,
  Shield,
  CheckCircle,
  X
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
      icon: Brain,
      title: t('common:differentiation.notCopywritingTool.title'),
      subtitle: t('common:differentiation.notCopywritingTool.subtitle'),
      description: t('common:differentiation.notCopywritingTool.description')
    },
    {
      icon: Target,
      title: t('common:differentiation.designedForMediaBuyers.title'),
      subtitle: t('common:differentiation.designedForMediaBuyers.subtitle'),
      description: t('common:differentiation.designedForMediaBuyers.description')
    },
    {
      icon: Database,
      title: t('common:differentiation.usesRealData.title'),
      subtitle: t('common:differentiation.usesRealData.subtitle'),
      description: t('common:differentiation.usesRealData.description')
    },
    {
      icon: TrendingUp,
      title: t('common:differentiation.learnsAndImproves.title'),
      subtitle: t('common:differentiation.learnsAndImproves.subtitle'),
      description: t('common:differentiation.learnsAndImproves.description')
    }
  ];

  const comparison = [
    { feature: t('common:differentiation.comparison.campaignManagement'), flipika: true, others: false },
    { feature: t('common:differentiation.comparison.realTimeOptimization'), flipika: true, others: false },
    { feature: t('common:differentiation.comparison.directGoogleAds'), flipika: true, others: false },
    { feature: t('common:differentiation.comparison.specializedAI'), flipika: true, others: false },
    { feature: t('common:differentiation.comparison.continuousLearning'), flipika: true, others: false },
    { feature: t('common:differentiation.comparison.genericText'), flipika: false, others: true }
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="relative py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0, 102, 255, 0.1) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            <Shield size={16} />
            <span>{t('common:differentiation.title')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            {t('common:differentiation.subtitle')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('common:differentiation.description')}
          </p>
        </motion.div>

        {/* Differentiators Grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {differentiators.map((diff) => (
            <motion.div
              key={diff.title}
              className="group p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <diff.icon size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {diff.title}
              </h3>
              <p className="text-sm font-medium text-primary mb-2">
                {diff.subtitle}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
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
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('common:differentiation.comparison.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('common:differentiation.comparison.subtitle')}
            </p>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {t('common:differentiation.comparison.featureHeader')}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-primary">
                <Zap size={16} />
                <span>{t('common:differentiation.comparison.flipikaHeader')}</span>
              </div>
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 text-center">
                {t('common:differentiation.comparison.othersHeader')}
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {comparison.map((item) => (
                <div
                  key={item.feature}
                  className="grid grid-cols-3 gap-4 p-4 hover:bg-primary/5 transition-colors"
                >
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {item.feature}
                  </div>
                  <div className="flex justify-center">
                    {item.flipika ? (
                      <CheckCircle size={20} className="text-primary" />
                    ) : (
                      <X size={20} className="text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  <div className="flex justify-center">
                    {item.others ? (
                      <CheckCircle size={20} className="text-primary" />
                    ) : (
                      <X size={20} className="text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {t('common:differentiation.cta')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('common:differentiation.ctaSubtitle') || 'Discover why Media Buyers choose Flipika'}
            </p>
          </div>
          <motion.button
            className="btn btn-primary inline-flex items-center gap-2 whitespace-nowrap"
            onClick={scrollToEmailForm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{t('common:hero.cta')}</span>
            <TrendingUp size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Differentiation;
