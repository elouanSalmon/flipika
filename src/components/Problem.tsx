import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, DollarSign, TrendingDown } from 'lucide-react';
import './Problem.css';

const Problem: React.FC = () => {
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  const problems = [
    {
      icon: Clock,
      title: "Vous passez des heures à gérer Google Ads",
      description: "et gaspillez encore du budget.",
      color: "red"
    },
    {
      icon: TrendingDown,
      title: "Vos campagnes sont incohérentes",
      description: "et difficiles à scaler.",
      color: "blue"
    },
    {
      icon: DollarSign,
      title: "Embaucher une agence ou un expert",
      description: "coûte cher et prend du temps.",
      color: "blue"
    }
  ];

  return (
    <section id="problem" className="problem-section">
      {/* Background Elements */}
      <div className="problem-bg">
        <div className="problem-gradient"></div>
        <div className="problem-grid-bg"></div>
      </div>
      
      <div className="problem-container">
        <motion.div
          className="problem-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Section Header */}
          <motion.div className="problem-header" variants={itemVariants}>
            <div className="problem-badge">
              <AlertTriangle size={20} />
              <span>Le problème</span>
            </div>
            <h2 className="problem-title">
              Vous reconnaissez-vous ?
            </h2>
          </motion.div>

          {/* Problem Points */}
          <motion.div className="problem-grid" variants={containerVariants}>
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                className="problem-card"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="problem-bg-gradient"></div>
                <div className="problem-icon-wrapper">
                  <problem.icon size={24} className="problem-icon" />
                  <div className="problem-icon-glow"></div>
                </div>
                <div className="problem-text">
                  <h3 className="problem-card-title">{problem.title}</h3>
                  <p className="problem-card-description">{problem.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Transition */}
          <motion.div className="problem-transition" variants={itemVariants}>
            <div className="transition-line"></div>
            <p className="transition-text">
              C'est pourquoi nous avons créé <strong>Flipika</strong> — 
              votre media buyer IA qui ne dort jamais.
            </p>
            <div className="transition-line"></div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Problem;