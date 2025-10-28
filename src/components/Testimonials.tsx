import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import './Testimonials.css';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: "Pierre Dubois",
      role: "Propriétaire d'Entreprise",
      content: "Flipika a boosté nos ventes avec l'Optimisation Google Ads IA, qui est unique à la plateforme. La configuration de campagne est maintenant facile et agréable, avec de vrais résultats. La plateforme est intuitive, et nous sommes très satisfaits jusqu'à présent.",
      rating: 5,
      date: "17 OCT 2024"
    },
    {
      id: 2,
      name: "Marie Lefevre",
      role: "Media Buyer",
      content: "J'ai fait passer mon activité de media buyer à 7 chiffres cette année grâce aux outils d'automatisation Google Ads de Flipika !",
      rating: 5,
      date: "07 NOV 2024"
    },
    {
      id: 3,
      name: "Antoine Martin",
      role: "Propriétaire d'Entreprise",
      content: "Pour quiconque cherche à rationaliser sa gestion Google Ads en toute confiance, c'est le système à essayer !",
      rating: 5,
      date: "03 FÉV 2024"
    },
    {
      id: 4,
      name: "Sophie Bernard",
      role: "Marketeur Affilié",
      content: "Les automatisations avancées de Flipika changent la donne pour les marketeurs affiliés, surtout si vous gérez plusieurs comptes Google Ads et campagnes.",
      rating: 5,
      date: "06 JUL 2024"
    },
    {
      id: 5,
      name: "Julien Moreau",
      role: "Propriétaire de Petite Entreprise",
      content: "Je viens de lancer une boutique e-commerce et je n'ai aucune idée de ce que je fais avec Google Ads, mais j'ai commencé à utiliser Flipika, et maintenant j'obtiens quelques ventes chaque jour ! Cet outil IA marketer est si utile et facile à utiliser !",
      rating: 5,
      date: "31 MAI 2024"
    },
    {
      id: 6,
      name: "Camille Rousseau",
      role: "Propriétaire de Marque",
      content: "J'ai bootstrappé ma marque à 6 chiffres et je suis un assez bon media buyer, mais j'avais besoin d'aide pour augmenter mon volume d'annonces, et oh là là, j'ai été agréablement surpris quand j'ai utilisé le générateur d'annonces Google Ads IA ! Je crée maintenant 10 annonces en moins d'1 heure ! Je passe maintenant à 7 chiffres et au-delà !",
      rating: 5,
      date: "03 NOV 2024"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const }
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
      <div className="testimonials-container">
        {/* Header */}
        <motion.div
          className="testimonials-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="testimonials-title">
            Mais vous n'avez pas à nous croire sur parole
          </h2>
          <p className="testimonials-subtitle">
            Découvrez ce que disent nos utilisateurs de la plateforme publicitaire IA #1
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
              className="testimonial-card glass"
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="testimonial-header">
                <Quote size={24} className="quote-icon" />
                <div className="testimonial-rating">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
              
              <p className="testimonial-content">
                "{testimonial.content}"
              </p>
              
              <div className="testimonial-footer">
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
                <div className="testimonial-date">{testimonial.date}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Message */}
        <motion.div
          className="testimonials-bottom"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="bottom-message glass">
            <h3 className="gradient-text">Vous avez scrollé si loin. Vous voulez ça. Faites-nous confiance.</h3>
            <motion.button
              className="final-cta"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Commencer Maintenant
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;