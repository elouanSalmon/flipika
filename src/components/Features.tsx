import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bolt, 
  Palette, 
  BarChart3, 
  Brain, 
  Rocket, 
  Target,
  TrendingUp,
  Zap,
  Eye,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import './Features.css';

const Features: React.FC = () => {
  const features = [
    {
      id: 'optimization',
      icon: Zap,
      title: 'Optimisation IA',
      subtitle: 'Expert Google Ads IA Personnel',
      description: 'Transformez vos campagnes avec notre IA experte qui analyse, optimise et automatise vos enchères en temps réel pour maximiser votre ROI.',
      features: [
        { icon: Brain, text: 'Optimisation automatique des enchères' },
        { icon: Target, text: 'Ciblage intelligent par mots-clés' },
        { icon: Rocket, text: 'Lancement automatisé de campagnes' }
      ],
      color: 'primary',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'creatives',
      icon: Palette,
      title: 'Création d\'Annonces',
      subtitle: 'Générateur IA Haute Performance',
      description: 'Créez des annonces qui convertissent en quelques secondes. Notre IA génère, teste et optimise automatiquement vos créations publicitaires.',
      features: [
        { icon: Bolt, text: 'Génération IA instantanée' },
        { icon: Eye, text: 'Tests A/B automatiques' },
        { icon: TrendingUp, text: 'Optimisation en continu' }
      ],
      color: 'accent',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Analytics Avancés',
      subtitle: 'Intelligence Prédictive',
      description: 'Découvrez des insights cachés dans vos données. Notre IA prédit les performances et recommande les actions les plus rentables.',
      features: [
        { icon: BarChart3, text: 'Tableaux de bord intelligents' },
        { icon: Brain, text: 'Prédictions de performance' },
        { icon: Target, text: 'Recommandations personnalisées' }
      ],
      color: 'primary',
      gradient: 'from-blue-600 to-blue-400'
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
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
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
            Maîtrisez l'<span className="gradient-text">Optimisation IA des Publicités</span> pour Google
          </h2>
          <p className="features-subtitle">
            Les publicités Google n'ont pas besoin d'être de la science-fiction. Notre Plateforme Publicitaire Intelligente 
            avec Gestionnaire de Campagne IA vous permet de passer moins de temps dans Google Ads Manager et d'accomplir plus 
            avec l'automatisation intelligente des publicités Google.
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
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              className={`feature-card feature-${feature.color}`}
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
                <div className="feature-icon-wrapper">
                  <feature.icon size={28} className="feature-icon" />
                  <div className="icon-glow"></div>
                </div>
                <div className="feature-badge">
                  <span className="badge-text">IA</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <h4 className="feature-subtitle">{feature.subtitle}</h4>
                <p className="feature-description">{feature.description}</p>
                
                <div className="feature-list">
                  {feature.features.map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      className="feature-item"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx, duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <div className="feature-item-icon-wrapper">
                        <CheckCircle size={16} className="feature-item-icon" />
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
              >
                <span>Découvrir</span>
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>


      </div>
    </section>
  );
};

export default Features;