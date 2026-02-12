import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  LayoutGrid,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Features: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const solutions = [
    {
      id: 'create-campaigns',
      icon: LayoutGrid,
      title: t('common:features.createCampaigns.title'),
      subtitle: t('common:features.createCampaigns.subtitle'),
      description: t('common:features.createCampaigns.description'),
      benefits: [
        t('common:features.createCampaigns.benefits.0'),
        t('common:features.createCampaigns.benefits.1'),
        t('common:features.createCampaigns.benefits.2')
      ]
    },
    {
      id: 'auto-optimize',
      icon: MessageSquare,
      title: t('common:features.autoOptimize.title'),
      subtitle: t('common:features.autoOptimize.subtitle'),
      description: t('common:features.autoOptimize.description'),
      benefits: [
        t('common:features.autoOptimize.benefits.0'),
        t('common:features.autoOptimize.benefits.1'),
        t('common:features.autoOptimize.benefits.2')
      ]
    },
    {
      id: 'actionable-insights',
      icon: Calendar,
      title: t('common:features.actionableInsights.title'),
      subtitle: t('common:features.actionableInsights.subtitle'),
      description: t('common:features.actionableInsights.description'),
      benefits: [
        t('common:features.actionableInsights.benefits.0'),
        t('common:features.actionableInsights.benefits.1'),
        t('common:features.actionableInsights.benefits.2')
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <section className="relative py-28" id="features">
      <div className="absolute inset-0 pointer-events-none">
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '-10%',
            width: '35vw',
            height: '35vw',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            opacity: 0.06,
            filter: 'blur(120px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
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
          className="text-center mb-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-5 tracking-tight">
            {t('common:features.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('common:features.subtitle')}
          </p>
        </motion.div>

        {/* Bento-style Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.id}
              className={`group relative flex flex-col p-7 glass rounded-3xl border border-white/10 dark:border-white/5 ${index === 0 ? 'lg:col-span-2 lg:row-span-1' : ''
                }`}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 300 } }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-6 right-6 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
                  opacity: 0.3,
                }}
              />

              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
                  <solution.icon size={26} className="text-primary" />
                </div>
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-primary to-primary-light text-white text-xs font-bold shadow-lg shadow-primary/30">
                  IA
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col gap-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300">
                  {solution.title}
                </h3>
                <h4 className="text-sm font-semibold text-primary">
                  {solution.subtitle}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {solution.description}
                </p>

                {/* Benefits list */}
                <div className="flex flex-col gap-2.5 mt-4">
                  {solution.benefits.map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 flex-shrink-0">
                        <CheckCircle size={12} className="text-primary" />
                      </div>
                      <span>{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                className="mt-7 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-primary border border-primary/20 rounded-xl hover:bg-primary/10 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
              >
                <span>Découvrir</span>
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Mini-CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="btn btn-outline inline-flex items-center gap-2 rounded-2xl px-6 py-3"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const isFrench = t('common:language') === 'fr';
              navigate(isFrench ? '/fr/features' : '/features');
            }}
          >
            <span>{t('common:features.viewAll') || (t('common:language') === 'fr' ? 'Voir toutes les fonctionnalités' : 'View all features')}</span>
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
