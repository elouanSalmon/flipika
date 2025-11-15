import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-simple">
      <div className="footer-simple-container">
        <div className="footer-simple-content">
          <div className="footer-simple-logo">
            <span className="gradient-text">Flipika</span>
          </div>
          
          <div className="footer-simple-links">
            <Link to="/mentions-legales" className="footer-simple-link">
              Mentions Légales
            </Link>
            <Link to="/politique-confidentialite" className="footer-simple-link">
              Confidentialité
            </Link>
            <Link to="/conditions-utilisation" className="footer-simple-link">
              Conditions
            </Link>
          </div>
          
          <div className="footer-simple-copyright">
            © 2025 Flipika. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;