import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Zap, 
  Target, 
  ArrowUp, 
  ArrowDown,
  Play,
  CheckCircle,
  Clock,
  Brain,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import './ProductDemo.css';

const ProductDemo: React.FC = () => {
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

  const metrics = [
    {
      label: "Revenus",
      value: "€847K",
      change: "+127% vs mois dernier",
      trend: "up",
      color: "accent"
    },
    {
      label: "ROAS",
      value: "6.8x",
      change: "+89% grâce à l'IA",
      trend: "up",
      color: "primary"
    },
    {
      label: "Conversions",
      value: "12,847",
      change: "+156% ce trimestre",
      trend: "up",
      color: "secondary"
    },
    {
      label: "CPA",
      value: "€18.50",
      change: "-67% optimisé",
      trend: "down",
      color: "warning"
    }
  ];

  const campaigns = [
    {
      name: "Nike Air Max - Lancement Printemps",
      status: "active",
      budget: "€45,000",
      spent: "€32,100",
      roas: "7.2x",
      conversions: "2,847",
      optimization: "IA optimise en temps réel"
    },
    {
      name: "Collection Running - Targeting Athlètes",
      status: "optimizing",
      budget: "€28,500",
      spent: "€19,200",
      roas: "5.9x",
      conversions: "1,923",
      optimization: "Audiences étendues par IA"
    },
    {
      name: "Retargeting Panier Abandonné",
      status: "active",
      budget: "€15,000",
      spent: "€12,800",
      roas: "8.4x",
      conversions: "1,156",
      optimization: "Créas personnalisées auto"
    },
    {
      name: "Lifestyle - Influence Marketing",
      status: "completed",
      budget: "€22,000",
      spent: "€21,900",
      roas: "6.1x",
      conversions: "987",
      optimization: "Campagne terminée"
    }
  ];

  const insights = [
    {
      type: "opportunity",
      title: "Nouvelle audience détectée",
      description: "L'IA a identifié un segment 'Runners urbains 25-35 ans' avec 89% de probabilité de conversion",
      action: "Créer campagne",
      impact: "+€127K revenus estimés"
    },
    {
      type: "optimization",
      title: "Budget redistribué automatiquement",
      description: "€8,500 déplacés de la campagne Lifestyle vers Nike Air Max (+340% performance)",
      action: "Validé",
      impact: "+€45K revenus"
    },
    {
      type: "alert",
      title: "Pic de demande détecté",
      description: "Tendance 'Chaussures trail' en hausse de 267% - Recommandation d'augmenter les enchères",
      action: "Appliquer",
      impact: "+€89K opportunité"
    }
  ];

  return (
    <section id="product-demo" className="product-demo">
      {/* Background Elements */}
      <div className="product-demo-bg">
        <div className="product-demo-gradient"></div>
        <div className="product-demo-grid"></div>
      </div>
      
      <div className="product-demo-container">
        <motion.div
          className="product-demo-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Header */}
          <motion.div className="product-demo-header" variants={itemVariants}>
            <div className="demo-badge">
              <Play size={16} />
              <span>Aperçu du produit</span>
            </div>
            <h2 className="demo-title">
              Votre futur tableau de bord Flipika
            </h2>
            <p className="demo-subtitle">
              Découvrez l'interface intuitive qui transformera votre approche du marketing digital. 
              Cet exemple réel montre comment SportMax Pro a multiplié son ROAS par 6.8 grâce à l'intelligence artificielle de Flipika.
            </p>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div 
            className="dashboard-container"
            variants={itemVariants}
          >
            <div className="dashboard-mockup">
              {/* Header */}
              <div className="dashboard-header">
                <div className="dashboard-nav">
                  <div className="nav-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="nav-title">SportMax Pro - Dashboard Flipika</div>
                  <div className="nav-status">
                    <div className="status-indicator active"></div>
                    <span>IA Active</span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="dashboard-content">
                {/* Metrics Row */}
                <div className="metrics-row">
                  {metrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      className={`metric-card metric-${metric.color}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <div className="metric-header">
                        <span className="metric-label">{metric.label}</span>
                        <div className={`metric-trend trend-${metric.trend}`}>
                          {metric.trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        </div>
                      </div>
                      <div className="metric-value">{metric.value}</div>
                      <div className="metric-change">{metric.change}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Campaign Status */}
                <div className="campaign-section">
                  <div className="section-header">
                    <h3>Campagnes en cours</h3>
                    <div className="ai-indicator">
                      <Zap size={16} />
                      <span>IA optimise...</span>
                    </div>
                  </div>
                  
                  <div className="campaigns-list">
                    {campaigns.map((campaign, index) => (
                      <motion.div
                        key={campaign.name}
                        className={`campaign-item campaign-${campaign.status}`}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <div className="campaign-info">
                          <div className="campaign-name">{campaign.name}</div>
                          <div className="campaign-meta">
                            <span>Budget: {campaign.budget} | Dépensé: {campaign.spent}</span>
                            <span>ROAS: {campaign.roas} | Conversions: {campaign.conversions}</span>
                          </div>
                        </div>
                        <div className="campaign-status">
                          <div className={`status-badge status-${campaign.status}`}>
                            {campaign.status === 'active' && <CheckCircle size={16} />}
                  {campaign.status === 'optimizing' && <Clock size={16} />}
                  {campaign.status === 'completed' && <Target size={16} />}
                            <span>{campaign.optimization}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* AI Insights Section */}
                <div className="insights-section">
                  <div className="section-header">
                    <h3>Insights IA en temps réel</h3>
                    <div className="ai-indicator">
                      <Brain size={16} />
                      <span>3 recommandations</span>
                    </div>
                  </div>
                  
                  <div className="insights-list">
                    {insights.map((insight, index) => (
                      <motion.div
                        key={insight.title}
                        className={`insight-item insight-${insight.type}`}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <div className="insight-icon">
                          {insight.type === 'opportunity' && <Lightbulb size={20} />}
                          {insight.type === 'optimization' && <Zap size={20} />}
                          {insight.type === 'alert' && <AlertTriangle size={20} />}
                        </div>
                        <div className="insight-content">
                          <div className="insight-header">
                            <h4 className="insight-title">{insight.title}</h4>
                            <span className="insight-impact">{insight.impact}</span>
                          </div>
                          <p className="insight-description">{insight.description}</p>
                          <button className={`insight-action action-${insight.type}`}>
                            {insight.action}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="chart-section">
                  <div className="chart-header">
                    <h3>Performance en temps réel</h3>
                    <div className="chart-legend">
                      <div className="legend-item">
                        <div className="legend-color legend-blue"></div>
                        <span>ROAS</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color legend-green"></div>
                        <span>Conversions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="chart-container">
                    <div className="chart-bars">
                      {[65, 78, 45, 89, 72, 95, 83, 91].map((height, index) => (
                        <motion.div
                          key={index}
                          className="chart-bar"
                          style={{ height: `${height}%` }}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${height}%` }}
                          transition={{ delay: index * 0.1, duration: 0.8 }}
                          viewport={{ once: true }}
                        />
                      ))}
                    </div>
                    <div className="chart-overlay">
                      <div className="chart-tooltip">
                        <div className="tooltip-content">
                          <span>ROAS: +32%</span>
                          <span>IA optimisant...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating AI Indicators */}
            <motion.div
              className="ai-indicator-1"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Zap size={20} />
              <span>Campagne créée</span>
            </motion.div>
            
            <motion.div
              className="ai-indicator-2"
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <TrendingUp size={20} />
              <span>ROAS +32%</span>
            </motion.div>
            
            <motion.div
              className="ai-indicator-3"
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Target size={20} />
              <span>IA optimisant...</span>
            </motion.div>
          </motion.div>

          {/* Interface Features Explanation */}
          <motion.div 
            className="interface-explanation"
            variants={itemVariants}
          >
            <div className="explanation-content">
              <h3 className="explanation-title">
                Une interface pensée pour votre succès
              </h3>
              <div className="features-grid">
                <div className="feature-point">
                  <div className="feature-icon">
                    <Brain size={24} />
                  </div>
                  <div className="feature-text">
                    <h4>IA Prédictive</h4>
                    <p>Anticipez les tendances et optimisez vos budgets avant vos concurrents</p>
                  </div>
                </div>
                <div className="feature-point">
                  <div className="feature-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="feature-text">
                    <h4>Métriques en Temps Réel</h4>
                    <p>Suivez vos performances avec des données actualisées à la seconde</p>
                  </div>
                </div>
                <div className="feature-point">
                  <div className="feature-icon">
                    <Zap size={24} />
                  </div>
                  <div className="feature-text">
                    <h4>Optimisation Automatique</h4>
                    <p>L'IA ajuste vos campagnes 24h/24 pour maximiser votre ROAS</p>
                  </div>
                </div>
              </div>
              <p className="explanation-cta">
                <strong>Prêt à transformer vos résultats ?</strong> Rejoignez les 2,847 marketeurs qui utilisent déjà Flipika pour multiplier leurs performances.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductDemo;