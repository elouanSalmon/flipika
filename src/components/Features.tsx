import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Palette, 
  BarChart3, 
  Brain, 
  Rocket, 
  Target,
  TrendingUp,
  Sparkles,
  Eye
} from 'lucide-react';
import './Features.css';

const Features: React.FC = () => {
  const features = [
    {
      id: 'optimization',
      icon: Zap,
      title: 'Optimisation',
      subtitle: 'Obtenez un Expert Google Ads IA Personnel',
      description: 'L\'IA Marketer fonctionne comme votre expert Google Ads IA personnel, utilisant des algorithmes d\'optimisation avancés et l\'automatisation des enchères pour auditer votre compte, identifier les opportunités d\'amélioration, et vous dire exactement quoi faire ensuite !',
      features: [
        { icon: Brain, text: 'Optimisation automatique des enchères' },
        { icon: Target, text: 'Mots-clés intelligents' },
        { icon: Rocket, text: 'Campagnes automatisées' }
      ],
      color: 'primary'
    },
    {
      id: 'creatives',
      icon: Palette,
      title: 'Annonces',
      subtitle: 'Annonces Google Ads Automatisées Qui Convertissent',
      description: 'Arrêtez de passer des heures à créer des annonces manuellement. Notre Générateur d\'Annonces IA crée des annonces Google Ads haute performance instantanément, tandis que l\'Outil de Test Automatisé optimise vos titres et descriptions.',
      features: [
        { icon: Sparkles, text: 'Génération IA d\'annonces' },
        { icon: Eye, text: 'Tests A/B automatiques' },
        { icon: TrendingUp, text: 'Optimisation continue' }
      ],
      color: 'secondary'
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Analytics',
      subtitle: 'Intelligence Google Ads Qui Va Transformer Votre Business',
      description: 'Submergé par les données de Google Ads ? Notre Analyseur IA coupe à travers le bruit avec une Intelligence Google Ads qui compte vraiment. Obtenez des insights de Performance Marketing IA qui vous montrent exactement où votre budget fonctionne—et où il ne fonctionne pas.',
      features: [
        { icon: BarChart3, text: 'Tableaux de bord Google Ads' },
        { icon: Brain, text: 'Prédictions de performance' },
        { icon: Target, text: 'Recommandations d\'enchères' }
      ],
      color: 'accent'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const }
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
          viewport={{ once: true }}
        >
          {features.map((feature, _index) => (
            <motion.div
              key={feature.id}
              className={`feature-card glass feature-${feature.color}`}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-icon-wrapper">
                <feature.icon size={32} className="feature-icon" />
              </div>
              
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <h4 className="feature-subtitle">{feature.subtitle}</h4>
                <p className="feature-description">{feature.description}</p>
                
                <div className="feature-list">
                  {feature.features.map((item, idx) => (
                    <div key={idx} className="feature-item">
                      <item.icon size={16} className="feature-item-icon" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <motion.button
                className="feature-cta"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                En Savoir Plus
              </motion.button>
            </motion.div>
          ))}
        </motion.div>


      </div>
    </section>
  );
};

export default Features;