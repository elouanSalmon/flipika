import React from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  Rocket,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Features.css';

const Features: React.FC = () => {
  const { t } = useTranslation();

  const scrollToEmailForm = () => {
    const emailSection = document.getElementById('email-capture');
    if (emailSection) {
      emailSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const solutions = [
    {
      id: 'create-campaigns',
      icon: Rocket,
      title: t('common:features.createCampaigns.title'),
      subtitle: t('common:features.createCampaigns.subtitle'),
      description: t('common:features.createCampaigns.description'),
      benefits: [
        { icon: CheckCircle, text: t('common:features.createCampaigns.benefits.0') },
        { icon: CheckCircle, text: t('common:features.createCampaigns.benefits.1') },
        { icon: CheckCircle, text: t('common:features.createCampaigns.benefits.2') }
      ],
      color: 'primary',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'auto-optimize',
      icon: Zap,
      title: t('common:features.autoOptimize.title'),
      subtitle: t('common:features.autoOptimize.subtitle'),
      description: t('common:features.autoOptimize.description'),
      benefits: [
        { icon: CheckCircle, text: t('common:features.autoOptimize.benefits.0') },
        { icon: CheckCircle, text: t('common:features.autoOptimize.benefits.1') },
        { icon: CheckCircle, text: t('common:features.autoOptimize.benefits.2') }
      ],
      color: 'accent',
      gradient: 'from-emerald-500 to-emerald-600'
    },

    {
      id: 'actionable-insights',
      icon: Eye,
      title: t('common:features.actionableInsights.title'),
      subtitle: t('common:features.actionableInsights.subtitle'),
      description: t('common:features.actionableInsights.description'),
      benefits: [
        { icon: CheckCircle, text: t('common:features.actionableInsights.benefits.0') },
        { icon: CheckCircle, text: t('common:features.actionableInsights.benefits.1') },
        { icon: CheckCircle, text: t('common:features.actionableInsights.benefits.2') }
      ],
      color: 'accent',
      gradient: 'from-emerald-500 to-emerald-600'
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
    hidden: { opacity: 0, y: 60, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <section className="features" id="features">
      <div className="features-container">
        {/* Header */}
        <motion.div
          className="features-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="features-title">
            {t('common:features.title')}
          </h2>
          <p className="features-subtitle">
            {t('common:features.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.id}
              className={`feature-card feature-${solution.color}`}
              variants={itemVariants}
              whileHover={{
                y: -15,
                scale: 1.03,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              style={{ "--delay": `${index * 0.1}s` } as React.CSSProperties}
            >
              {/* Card Background Gradient */}
              <div className="feature-bg-gradient"></div>

              {/* Icon Section */}
              <div className="feature-header">
                <div className="feature-icon-wrapper icon-4xl">
                  <solution.icon size={24} className="feature-icon icon-md" />
                  <div className="icon-glow"></div>
                </div>
                <div className="feature-badge">
                  <span className="badge-text">IA</span>
                </div>
              </div>

              {/* Content */}
              <div className="feature-content">
                <h3 className="feature-title">{solution.title}</h3>
                <h4 className="feature-subtitle">{solution.subtitle}</h4>
                <p className="feature-description">{solution.description}</p>

                <div className="feature-list">
                  {solution.benefits.map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="feature-item"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx, duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <div className="feature-item-icon-wrapper">
                        <CheckCircle size={16} className="feature-item-icon icon-xs" />
                      </div>
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                className="feature-cta btn btn-secondary"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToEmailForm}
              >
                <span>Découvrir</span>
                <ArrowRight size={20} />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Mini-CTA */}
        <motion.div
          className="features-mini-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="btn btn-outline"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToEmailForm}
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