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
import './Differentiation.css';

const Differentiation: React.FC = () => {
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
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  const differentiators = [
    {
      icon: Brain,
      title: "Pas un autre outil de copywriting IA",
      subtitle: "Un vrai media buyer",
      description: "Flipika ne génère pas juste du texte. Il analyse, optimise et gère vos campagnes comme un expert avec 10 ans d'expérience.",
      color: "blue"
    },
    {
      icon: Target,
      title: "Conçu pour les performance marketers",
      subtitle: "Pas pour les créateurs de contenu",
      description: "Chaque fonctionnalité est pensée pour maximiser votre ROAS, pas pour créer des posts Instagram.",
      color: "purple"
    },
    {
      icon: Database,
      title: "Utilise VOS vraies données Google Ads",
      subtitle: "Pas des prompts génériques",
      description: "Flipika se connecte directement à votre compte Google Ads pour des optimisations basées sur vos métriques réelles.",
      color: "green"
    },
    {
      icon: TrendingUp,
      title: "Apprend et s'améliore à chaque campagne",
      subtitle: "IA évolutive",
      description: "Plus vous utilisez Flipika, plus il comprend votre business et optimise selon vos objectifs spécifiques.",
      color: "orange"
    }
  ];

  const comparison = [
    {
      feature: "Gestion complète des campagnes",
      flipika: true,
      others: false
    },
    {
      feature: "Optimisation en temps réel",
      flipika: true,
      others: false
    },
    {
      feature: "Connexion directe Google Ads",
      flipika: true,
      others: false
    },
    {
      feature: "IA spécialisée performance marketing",
      flipika: true,
      others: false
    },
    {
      feature: "Apprentissage continu",
      flipika: true,
      others: false
    },
    {
      feature: "Génération de texte générique",
      flipika: false,
      others: true
    }
  ];

  return (
    <section className="differentiation">
      {/* Background Elements */}
      <div className="differentiation-bg">
        <div className="differentiation-gradient"></div>
        <div className="differentiation-grid"></div>
      </div>
      
      <div className="differentiation-container">
        <motion.div
          className="differentiation-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Header */}
          <motion.div className="differentiation-header" variants={itemVariants}>
            <div className="diff-badge">
              <Shield size={16} />
              <span>Pourquoi nous</span>
            </div>
            <h2 className="diff-title">
              Pourquoi Flipika est différent
            </h2>
            <p className="diff-subtitle">
              Nous ne sommes pas un autre "outil IA marketing classique". 
              Voici ce qui nous distingue vraiment.
            </p>
          </motion.div>

          {/* Differentiators Grid */}
          <motion.div className="differentiators-grid" variants={itemVariants}>
            {differentiators.map((diff, index) => (
              <motion.div
                key={diff.title}
                className="differentiator-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="diff-icon">
                  <diff.icon size={32} />
                </div>
                <div className="diff-content">
                  <h3 className="diff-card-title">{diff.title}</h3>
                  <p className="diff-card-subtitle">{diff.subtitle}</p>
                  <p className="diff-card-description">{diff.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Comparison Table */}
          <motion.div className="comparison-section" variants={itemVariants}>
            <div className="comparison-header">
              <h3>Flipika vs Autres outils IA</h3>
              <p>Une comparaison honnête de ce qui nous rend uniques</p>
            </div>
            
            <div className="comparison-table">
              <div className="comparison-headers">
                <div className="feature-header">Fonctionnalité</div>
                <div className="flipika-header">
                  <Zap size={20} />
                  <span>Flipika</span>
                </div>
                <div className="others-header">Autres outils IA</div>
              </div>
              
              <div className="comparison-rows">
                {comparison.map((item, index) => (
                  <motion.div
                    key={item.feature}
                    className="comparison-row"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className="feature-cell">{item.feature}</div>
                    <div className="flipika-cell">
                      {item.flipika ? (
                        <CheckCircle size={16} className="check-icon" />
                      ) : (
                        <X size={16} className="x-icon" />
                      )}
                    </div>
                    <div className="others-cell">
                      {item.others ? (
                        <CheckCircle size={16} className="check-icon" />
                      ) : (
                        <X size={16} className="x-icon" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div className="diff-cta" variants={itemVariants}>
            <div className="cta-content">
              <h3>Prêt à voir la différence ?</h3>
              <p>Découvrez pourquoi les performance marketers choisissent Flipika</p>
            </div>
            <motion.button
              className="cta-button"
              onClick={scrollToEmailForm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Rejoindre la waitlist</span>
              <TrendingUp size={18} />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Differentiation;