import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Zap, TrendingUp, Target } from 'lucide-react';
import './Hero.css';

const Hero: React.FC = () => {
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
    { icon: TrendingUp, value: '300%', label: 'ROI Moyen', color: 'primary' },
    { icon: Target, value: '85%', label: 'Précision IA', color: 'accent' },
    { icon: Zap, value: '24/7', label: 'Optimisation', color: 'secondary' }
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
            Votre{' '}
            <span className="gradient-text">Media Buyer IA</span>
            <br />
            pour Google Ads.
          </motion.h1>

          {/* Subtitle - Precise Value & Target */}
          <motion.p className="hero-subtitle" variants={itemVariants}>
            Flipika crée, gère et optimise automatiquement vos campagnes publicitaires — 
            comme un Media Buyer expert, mais <strong>100x plus rapide</strong>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div className="hero-cta" variants={itemVariants}>
            <motion.button
              className="btn btn-primary cta-primary"
              onClick={scrollToEmailForm}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Rejoindre la waitlist</span>
              <ArrowRight size={20} />
            </motion.button>
            
            <motion.button
              className="btn btn-secondary cta-secondary"
              onClick={scrollToEmailForm}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={18} />
              <span>Voir comment ça marche</span>
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
              <div className="mockup-title">Flipika Dashboard</div>
            </div>
            
            <div className="mockup-content">
              <div className="metric-card glass">
                <div className="metric-label">ROI Total</div>
                <div className="metric-value gradient-text">+347%</div>
                <div className="metric-trend">↗ +23% ce mois</div>
              </div>
              
              <div className="metric-card glass">
                <div className="metric-label">Coût par Acquisition</div>
                <div className="metric-value gradient-text">-52%</div>
                <div className="metric-trend">↘ Optimisé par IA</div>
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