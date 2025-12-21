import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Zap, TrendingUp, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Hero.css';

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
    { icon: TrendingUp, value: '4h', label: 'Gagnées / semaine', color: 'primary' },
    { icon: Target, value: '100+', label: 'Rapports générés', color: 'accent' },
    { icon: Zap, value: '2 min', label: 'Création rapport', color: 'secondary' }
  ];

  return (
    <section className="hero">
      {/* Background Elements */}
      <div className="hero-bg">
        <div className="hero-gradient"></div>
        <div className="hero-grid"></div>
      </div>

      <div className="hero-container">
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >


          {/* Main Heading - YC Style Punchline */}
          <motion.h1 className="hero-title" variants={itemVariants}>
            {t('common:hero.title')}
          </motion.h1>

          {/* Subtitle - Precise Value & Target */}
          <motion.p className="hero-subtitle" variants={itemVariants}>
            {t('common:hero.subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div className="hero-cta" variants={itemVariants}>
            <motion.button
              className="btn btn-primary cta-primary"
              onClick={scrollToEmailForm}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{t('common:hero.cta')}</span>
              <ArrowRight size={20} />
            </motion.button>

            <motion.button
              className="btn btn-secondary cta-secondary"
              onClick={scrollToEmailForm}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={18} />
              <span>{t('common:hero.ctaSecondary')}</span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div className="hero-stats" variants={itemVariants}>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className={`stat-item stat-${stat.color}`}
                whileHover={{ y: -8, scale: 1.05 }}
                transition={{ delay: index * 0.1, type: "spring" as const, stiffness: 300 }}
              >
                <div className="stat-icon-wrapper icon-2xl">
                  <stat.icon size={24} className="stat-icon icon-md" />
                  <div className="stat-glow"></div>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="dashboard-mockup glass">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="mockup-title">Rapport Client - Janvier 2024</div>
            </div>

            <div className="mockup-content">
              <div className="metric-card glass">
                <div className="metric-label">Impressions</div>
                <div className="metric-value gradient-text">125K</div>
                <div className="metric-trend">↗ +18% vs mois dernier</div>
              </div>

              <div className="metric-card glass">
                <div className="metric-label">Taux de Conversion</div>
                <div className="metric-value gradient-text">3.2%</div>
                <div className="metric-trend">↗ Performance stable</div>
              </div>

              <div className="chart-placeholder glass">
                <div className="chart-bars">
                  <div className="bar" style={{ height: '60%' }}></div>
                  <div className="bar" style={{ height: '80%' }}></div>
                  <div className="bar" style={{ height: '45%' }}></div>
                  <div className="bar" style={{ height: '90%' }}></div>
                  <div className="bar" style={{ height: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <motion.div
            className="floating-element element-1"
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Zap size={20} />
          </motion.div>

          <motion.div
            className="floating-element element-2"
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <TrendingUp size={20} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;