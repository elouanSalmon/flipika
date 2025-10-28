import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, TrendingUp, Users, Award } from 'lucide-react';
import './Testimonials.css';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: "Pierre Dubois",
      role: "CEO",
      company: "TechStart",
      content: "Flipika a révolutionné notre approche publicitaire. L'IA d'optimisation Google Ads a augmenté notre ROI de 340% en seulement 3 mois. Une plateforme exceptionnelle !",
      rating: 5,
      date: "17 OCT 2024",
      metric: "+340% ROI",
      avatar: "PD"
    },
    {
      id: 2,
      name: "Marie Lefevre",
      role: "Media Buyer",
      company: "Digital Growth",
      content: "Grâce aux automatisations intelligentes de Flipika, j'ai fait passer mon chiffre d'affaires à 7 chiffres cette année. Un outil indispensable pour tout media buyer !",
      rating: 5,
      date: "07 NOV 2024",
      metric: "7 chiffres",
      avatar: "ML"
    },
    {
      id: 3,
      name: "Antoine Martin",
      role: "Fondateur",
      company: "E-Shop Pro",
      content: "La gestion Google Ads n'a jamais été aussi simple. Flipika nous fait économiser 15h par semaine tout en doublant nos conversions.",
      rating: 5,
      date: "03 FÉV 2024",
      metric: "+200% conversions",
      avatar: "AM"
    },
    {
      id: 4,
      name: "Sophie Bernard",
      role: "Marketing Director",
      company: "Scale Agency",
      content: "Pour gérer plusieurs comptes clients, Flipika est un game-changer. L'automatisation avancée nous permet de scaler sans effort.",
      rating: 5,
      date: "06 JUL 2024",
      metric: "15h économisées",
      avatar: "SB"
    },
    {
      id: 5,
      name: "Julien Moreau",
      role: "Entrepreneur",
      company: "StartupLab",
      content: "Débutant en Google Ads, Flipika m'a permis de générer mes premières ventes dès la première semaine. L'IA fait tout le travail complexe !",
      rating: 5,
      date: "31 MAI 2024",
      metric: "Ventes dès J+7",
      avatar: "JM"
    },
    {
      id: 6,
      name: "Camille Rousseau",
      role: "Brand Owner",
      company: "Fashion Forward",
      content: "Le générateur d'annonces IA de Flipika m'a fait passer de 6 à 7 chiffres. Je crée maintenant 50+ annonces par jour avec une qualité exceptionnelle !",
      rating: 5,
      date: "03 NOV 2024",
      metric: "50+ annonces/jour",
      avatar: "CR"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.7, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100
      }
    }
  };



  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={`star ${index < rating ? 'filled' : ''}`}
        fill={index < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <section className="testimonials" id="testimonials">
      {/* Background Elements */}
      <div className="testimonials-bg">
        <div className="testimonials-gradient"></div>
        <div className="testimonials-grid-bg"></div>
      </div>

      <div className="testimonials-container">
        {/* Header */}
        <motion.div
          className="testimonials-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="testimonials-badge">
            <Award size={16} />
            <span>Témoignages Clients</span>
          </div>
          <h2 className="testimonials-title">
            Mais vous n'avez pas à nous croire sur <span className="gradient-text">parole</span>
          </h2>
          <p className="testimonials-subtitle">
            Découvrez comment nos clients transforment leurs campagnes publicitaires avec l'IA
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="testimonials-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, _index) => (
            <motion.div
              key={testimonial.id}
              className="testimonial-card"
              variants={itemVariants}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
            >
              <div className="testimonial-bg-gradient"></div>
              
              <div className="testimonial-header">
                <div className="quote-wrapper">
                  <Quote size={20} className="quote-icon" />
                  <div className="quote-glow"></div>
                </div>
                <div className="testimonial-rating">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
              
              <p className="testimonial-content">
                "{testimonial.content}"
              </p>

              <div className="testimonial-metric">
                <div className="metric-badge">
                  <TrendingUp size={14} />
                  <span>{testimonial.metric}</span>
                </div>
              </div>
              
              <div className="testimonial-footer">
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <span className="avatar-text">{testimonial.avatar}</span>
                    <div className="avatar-glow"></div>
                  </div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                    <div className="author-company">{testimonial.company}</div>
                  </div>
                </div>
                <div className="testimonial-date">{testimonial.date}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="testimonials-bottom"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="bottom-cta">
            <div className="cta-bg-gradient"></div>
            <div className="cta-content">
              <div className="cta-icon">
                <TrendingUp size={32} />
                <div className="cta-icon-glow"></div>
              </div>
              <h3 className="cta-title">
                Prêt à <span className="gradient-text">transformer</span> vos campagnes ?
              </h3>
              <p className="cta-subtitle">
                Rejoignez notre communauté de beta testeurs qui façonnent l'avenir de Flipika
              </p>
              <motion.button
                className="btn btn-primary cta-button"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Commencer Gratuitement</span>
                <TrendingUp size={18} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;