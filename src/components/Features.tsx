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
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <section className="relative py-24 bg-[var(--color-bg-secondary)] overflow-hidden" id="features">
      {/* Blue light orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '-10%',
            width: '35vw',
            height: '35vw',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            opacity: 0.08,
            filter: 'blur(100px)',
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
            opacity: 0.06,
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
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            {t('common:features.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('common:features.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {solutions.map((solution) => (
            <motion.div
              key={solution.id}
              className="group relative flex flex-col p-6 glass rounded-2xl"
              variants={itemVariants}
              whileHover={{ y: -8 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 group-hover:scale-110 transition-transform duration-300">
                  <solution.icon size={24} className="text-primary" />
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-light text-white text-xs font-bold shadow-lg shadow-primary/30">
                  IA
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col gap-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {solution.title}
                </h3>
                <h4 className="text-sm font-semibold text-primary">
                  {solution.subtitle}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {solution.description}
                </p>

                {/* Benefits list */}
                <div className="flex flex-col gap-2 mt-4">
                  {solution.benefits.map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
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
                className="mt-6 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-primary border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
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
            className="btn btn-outline inline-flex items-center gap-2"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
          >
            <span>Voir comment ça marche</span>
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
