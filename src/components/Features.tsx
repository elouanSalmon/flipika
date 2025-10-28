import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  Zap,
  ArrowRight,
  Rocket,
  CheckCircle,
  Eye
} from 'lucide-react';
import './Features.css';

const Features: React.FC = () => {
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
      title: 'Créez des campagnes en minutes',
      subtitle: 'À partir d\'un simple brief',
      description: 'Fini les heures de configuration. Décrivez votre objectif et Flipika génère une campagne complète et optimisée.',
      benefits: [
        { icon: CheckCircle, text: 'Configuration automatique' },
        { icon: CheckCircle, text: 'Mots-clés intelligents' },
        { icon: CheckCircle, text: 'Audiences ciblées' }
      ],
      color: 'primary',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'auto-optimize',
      icon: Zap,
      title: 'Auto-optimisation continue',
      subtitle: 'Enchères, budgets et mots-clés',
      description: 'Votre IA media buyer ajuste automatiquement vos campagnes 24/7 pour maximiser vos performances.',
      benefits: [
        { icon: CheckCircle, text: 'Enchères optimisées en temps réel' },
        { icon: CheckCircle, text: 'Répartition intelligente du budget' },
        { icon: CheckCircle, text: 'Mots-clés négatifs automatiques' }
      ],
      color: 'accent',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'boost-roas',
      icon: TrendingUp,
      title: 'Boostez votre ROAS',
      subtitle: 'Avec l\'apprentissage IA continu',
      description: 'Plus Flipika gère vos campagnes, plus elle devient performante. Chaque donnée améliore vos résultats.',
      benefits: [
        { icon: CheckCircle, text: 'ROAS en amélioration constante' },
        { icon: CheckCircle, text: 'Apprentissage de vos données' },
        { icon: CheckCircle, text: 'Prédictions de performance' }
      ],
      color: 'primary',
      gradient: 'from-indigo-600 to-indigo-400'
    },
    {
      id: 'actionable-insights',
      icon: Eye,
      title: 'Insights actionnables',
      subtitle: 'Sans setup, sans agence',
      description: 'Recevez des recommandations claires et précises pour améliorer vos performances, directement dans votre dashboard.',
      benefits: [
        { icon: CheckCircle, text: 'Rapports automatiques' },
        { icon: CheckCircle, text: 'Recommandations personnalisées' },
        { icon: CheckCircle, text: 'Alertes intelligentes' }
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
            Ce que <span className="gradient-text">Flipika</span> fait pour vous
          </h2>
          <p className="features-subtitle">
            Pas de features d'abord — des résultats concrets. 
            Voici comment Flipika transforme votre approche Google Ads.
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