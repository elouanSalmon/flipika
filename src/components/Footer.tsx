import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Facebook,
  Instagram,
  ArrowUp,
  Rocket,
  Globe,
  Shield,
  Zap
} from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };



  return (
    <footer className="footer">
      {/* Background Elements */}
      <div className="footer-bg">
        <div className="footer-gradient"></div>
        <div className="footer-grid"></div>
      </div>

      <div className="footer-container">
        <motion.div
          className="footer-content"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Main Footer Content */}
          <div className="footer-main">
            {/* Brand Section */}
            <motion.div className="footer-brand" variants={itemVariants}>
              <div className="brand-header">
                <div className="brand-icon">
                  <Zap size={28} />
                  <div className="brand-icon-glow"></div>
                </div>
                <h3 className="footer-logo">
                  <span className="gradient-text">Flipika</span>
                </h3>
              </div>
              <p className="footer-description">
                La plateforme IA qui révolutionne vos campagnes publicitaires Google. 
                Optimisez, créez et analysez vos publicités comme jamais auparavant.
              </p>
              <div className="footer-stats">
                <div className="stat-item">
                  <div className="stat-number">100+</div>
                  <div className="stat-label">Beta Testeurs</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">15+</div>
                  <div className="stat-label">Campagnes Créées</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support</div>
                </div>
              </div>
              <div className="social-links">
                <motion.a 
                  href="#" 
                  className="social-link" 
                  aria-label="Twitter"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Twitter size={18} />
                  <div className="social-glow"></div>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="social-link" 
                  aria-label="LinkedIn"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Linkedin size={18} />
                  <div className="social-glow"></div>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="social-link" 
                  aria-label="Facebook"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Facebook size={18} />
                  <div className="social-glow"></div>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="social-link" 
                  aria-label="Instagram"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Instagram size={20} />
                  <div className="social-glow"></div>
                </motion.a>
              </div>
            </motion.div>

            {/* Product Links */}
            <motion.div className="footer-section" variants={itemVariants}>
              <div className="section-header">
                <Rocket size={20} />
                <h4 className="footer-title">Produit</h4>
              </div>
              <ul className="footer-links">
                <li>
                  <motion.a 
                    href="#features"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    Fonctionnalités
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="#problem"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    Problème
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="#testimonials"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    Témoignages
                  </motion.a>
                </li>
              </ul>
            </motion.div>

            {/* Company Links */}
            <motion.div className="footer-section" variants={itemVariants}>
              <div className="section-header">
                <Globe size={20} />
                <h4 className="footer-title">Entreprise</h4>
              </div>
              <ul className="footer-links">
                <li>
                  <motion.a 
                    href="#about"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    À propos
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="#careers"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    Carrières
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="#press"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    Presse
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="#partners"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    Partenaires
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="#contact"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    Contact
                  </motion.a>
                </li>
              </ul>
            </motion.div>

            {/* Resources Links */}
            <motion.div className="footer-section" variants={itemVariants}>
              <div className="section-header">
                <Shield size={20} />
                <h4 className="footer-title">Ressources</h4>
              </div>
              <ul className="footer-links">
                <li>
                  <motion.a 
                    href="#blog"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    Blog
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="#help"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    Centre d'aide
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="#guides"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    Guides
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="#webinars"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    Webinaires
                  </motion.a>
                </li>
                <li>
                  <motion.a 
                    href="#community"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring" as const, stiffness: 300 }}
                  >
                    Communauté
                  </motion.a>
                </li>
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div className="footer-section" variants={itemVariants}>
              <div className="section-header">
                <Mail size={20} />
                <h4 className="footer-title">Contact</h4>
              </div>
              <div className="contact-info">
                <motion.div 
                  className="contact-item"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ type: "spring" as const, stiffness: 300 }}
                >
                  <div className="contact-icon">
                    <Mail size={16} />
                    <div className="contact-glow"></div>
                  </div>
                  <span>contact@flipika.com</span>
                </motion.div>
                <motion.div 
                  className="contact-item"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ type: "spring" as const, stiffness: 300 }}
                >
                  <div className="contact-icon">
                    <Phone size={16} />
                    <div className="contact-glow"></div>
                  </div>
                  <span>+33 6 76 06 19 02 (France)</span>
                </motion.div>
                <motion.div 
                  className="contact-item"
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ type: "spring" as const, stiffness: 300 }}
                >
                  <div className="contact-icon">
                    <MapPin size={16} />
                    <div className="contact-glow"></div>
                  </div>
                  <span>1 RUE DE STOCKHOLM 75008 PARIS</span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Footer Bottom */}
          <motion.div 
            className="footer-bottom"
            variants={itemVariants}
          >
            <div className="footer-bottom-bg"></div>
            <div className="footer-bottom-content">
              <div className="legal-links">
                <motion.a 
                  href="#privacy"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring" as const, stiffness: 300 }}
                >
                  Politique de confidentialité
                </motion.a>
                <motion.a 
                  href="#terms"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring" as const, stiffness: 300 }}
                >
                  Conditions d'utilisation
                </motion.a>
                <motion.a 
                  href="#cookies"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring" as const, stiffness: 300 }}
                >
                  Cookies
                </motion.a>
                <motion.a 
                  href="#legal"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring" as const, stiffness: 300 }}
                >
                  Mentions légales
                </motion.a>
              </div>
              
              <div className="footer-bottom-right">
                <p className="copyright">
                  © 2025 <span className="gradient-text">Flipika</span>. Tous droits réservés.
                </p>
                
                <motion.button
                  className="scroll-to-top"
                  onClick={scrollToTop}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Retour en haut"
                >
                  <ArrowUp size={20} />
                  <div className="scroll-glow"></div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;