import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Quote, 
  TrendingUp, 
  Award, 
  Users, 
  Target, 
  Zap,
  CheckCircle,
  ArrowUp
} from 'lucide-react';
import './Testimonials.css';

const SocialProof: React.FC = () => {
  const scrollToEmailForm = () => {
    const emailSection = document.getElementById('email-capture');
    if (emailSection) {
      emailSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Détecter si on est sur mobile pour désactiver les animations de survol
  const isMobile = () => {
    return window.innerWidth <= 480;
  };

  const earlyAdopters = [
    {
      id: 1,
      name: "Pierre D.",
      role: "Media Buyer",
      company: "TechStart",
      content: "J'ai rejoint la beta de Flipika il y a 3 mois. Résultat : +340% de ROAS sur mes campagnes Google Ads. L'IA comprend vraiment le performance marketing.",
      rating: 5,
      metric: "+340% ROAS",
      avatar: "PD",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      verified: true,
      betaUser: true
    },
    {
      id: 2,
      name: "Marie L.",
      role: "Media Buyer Freelance",
      company: "Indépendante",
      content: "Flipika m'a fait passer de 50k€ à 500k€ de CA géré par mois. L'automatisation me fait gagner 20h/semaine que je peux consacrer à mes autres clients.",
      rating: 5,
      metric: "500k€ CA/mois",
      avatar: "ML",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      verified: true,
      betaUser: true
    },
    {
      id: 3,
      name: "Antoine M.",
      role: "Founder",
      company: "E-commerce",
      content: "En tant qu'early adopter, j'ai vu Flipika évoluer. Aujourd'hui, c'est l'outil le plus puissant que j'ai testé pour Google Ads. Mes CPA ont baissé de 60%.",
      rating: 5,
      metric: "-60% CPA",
      avatar: "AM",
      avatarUrl: "https://randomuser.me/api/portraits/men/75.jpg",
      verified: true,
      betaUser: true
    }
  ];

  const metrics = [
    {
      value: "150+",
      label: "Early adopters",
      icon: Users,
      color: "primary"
    },
    {
      value: "+280%",
      label: "ROAS moyen",
      icon: TrendingUp,
      color: "accent"
    },
    {
      value: "€2.3M",
      label: "Budget optimisé",
      icon: Target,
      color: "secondary"
    },
    {
      value: "98%",
      label: "Satisfaction",
      icon: Star,
      color: "warning"
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
        type: "spring" as const,
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
    <section id="testimonials" className="testimonials social-proof">
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
            <span>Early Adopters</span>
          </div>
          <h2 className="testimonials-title">
            Ils ont testé Flipika en <span className="gradient-text">avant-première</span>
          </h2>
          <p className="testimonials-subtitle">
            Découvrez les résultats de nos 150+ early adopters qui utilisent déjà Flipika
          </p>
        </motion.div>

        {/* Metrics Row */}
        <motion.div
          className="metrics-showcase"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {metrics.map((metric) => (
            <motion.div
              key={metric.label}
              className={`metric-showcase-card metric-${metric.color}`}
              variants={itemVariants}
              whileHover={isMobile() ? {} : { y: -5, scale: 1.05 }}
            >
              <div className="metric-icon">
                <metric.icon size={24} />
              </div>
              <div className="metric-content">
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Early Adopters Testimonials */}
        <motion.div
          className="testimonials-grid early-adopters-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {earlyAdopters.map((testimonial, _index) => (
            <motion.div
              key={testimonial.id}
              className="testimonial-card early-adopter-card"
              variants={itemVariants}
              whileHover={isMobile() ? {} : { 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
            >
              {/* Beta Badge */}
              {testimonial.betaUser && (
                <div className="beta-badge">
                  <Zap size={16} />
                  <span>Beta User</span>
                </div>
              )}

              {/* Quote Icon */}
              <div className="quote-icon">
                <Quote size={24} />
              </div>

              {/* Content */}
              <div className="testimonial-content">
                <p className="testimonial-text">{testimonial.content}</p>
              </div>

              {/* Rating */}
              <div className="testimonial-rating">
                <div className="stars">
                  {renderStars(testimonial.rating)}
                </div>
              </div>

              {/* Metric Highlight */}
              <div className="metric-highlight">
                <ArrowUp size={16} />
                <span>{testimonial.metric}</span>
              </div>

              {/* Author */}
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonial.avatarUrl ? (
                    <img 
                      src={testimonial.avatarUrl} 
                      alt={testimonial.name}
                      className="avatar-image"
                    />
                  ) : (
                    <span>{testimonial.avatar}</span>
                  )}
                  {testimonial.verified && (
                    <div className="verified-badge">
                      <CheckCircle size={14} />
                    </div>
                  )}
                </div>
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                  <div className="author-company">{testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>



        {/* Waitlist CTA */}
        <motion.div
          className="social-proof-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="cta-content">
            <h3>Rejoignez les early adopters</h3>
            <p>Soyez parmi les premiers à accéder à Flipika et transformez vos campagnes Google Ads</p>
          </div>
          <motion.button
            className="cta-button primary"
            onClick={scrollToEmailForm}
            whileHover={isMobile() ? {} : { scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Rejoindre la waitlist</span>
            <TrendingUp size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;