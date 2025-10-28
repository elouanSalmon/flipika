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
  ArrowUp
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
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="footer">
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
              <h3 className="footer-logo">
                <span className="gradient-text">Flipika</span>
              </h3>
              <p className="footer-description">
                La plateforme IA qui révolutionne vos campagnes publicitaires Google. 
                Optimisez, créez et analysez vos publicités comme jamais auparavant.
              </p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="social-link" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
              </div>
            </motion.div>

            {/* Product Links */}
            <motion.div className="footer-section" variants={itemVariants}>
              <h4 className="footer-title">Produit</h4>
              <ul className="footer-links">
                <li><a href="#features">Fonctionnalités</a></li>
                <li><a href="#pricing">Tarifs</a></li>
                <li><a href="#integrations">Intégrations</a></li>
                <li><a href="#api">API</a></li>
                <li><a href="#changelog">Nouveautés</a></li>
              </ul>
            </motion.div>

            {/* Company Links */}
            <motion.div className="footer-section" variants={itemVariants}>
              <h4 className="footer-title">Entreprise</h4>
              <ul className="footer-links">
                <li><a href="#about">À propos</a></li>
                <li><a href="#careers">Carrières</a></li>
                <li><a href="#press">Presse</a></li>
                <li><a href="#partners">Partenaires</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </motion.div>

            {/* Resources Links */}
            <motion.div className="footer-section" variants={itemVariants}>
              <h4 className="footer-title">Ressources</h4>
              <ul className="footer-links">
                <li><a href="#blog">Blog</a></li>
                <li><a href="#help">Centre d'aide</a></li>
                <li><a href="#guides">Guides</a></li>
                <li><a href="#webinars">Webinaires</a></li>
                <li><a href="#community">Communauté</a></li>
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div className="footer-section" variants={itemVariants}>
              <h4 className="footer-title">Contact</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <Mail size={16} />
                  <span>contact@flipika.com</span>
                </div>
                <div className="contact-item">
                  <Phone size={16} />
                  <span>+33 6 76 06 19 02 (France)</span>
                </div>
                <div className="contact-item">
                  <MapPin size={16} />
                  <span>1 RUE DE STOCKHOLM 75008 PARIS</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Bottom */}
          <motion.div 
            className="footer-bottom"
            variants={itemVariants}
          >
            <div className="footer-bottom-content">
              <div className="legal-links">
                <a href="#privacy">Politique de confidentialité</a>
                <a href="#terms">Conditions d'utilisation</a>
                <a href="#cookies">Cookies</a>
                <a href="#legal">Mentions légales</a>
              </div>
              
              <div className="footer-bottom-right">
                <p className="copyright">
                  © 2025 Flipika. Tous droits réservés.
                </p>
                
                <motion.button
                  className="scroll-to-top"
                  onClick={scrollToTop}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Retour en haut"
                >
                  <ArrowUp size={20} />
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