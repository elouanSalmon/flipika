import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import './Header.css';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const scrollToEmailForm = () => {
    const emailSection = document.getElementById('email-capture');
    if (emailSection) {
      emailSection.scrollIntoView({ behavior: 'smooth' });
    }
  };



  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Mentions Légales', path: '/mentions-legales' },
    { label: 'Confidentialité', path: '/politique-confidentialite' },
    { label: 'Conditions', path: '/conditions-utilisation' },
  ];

  return (
    <motion.header
      className={`header ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="header-container">
        {/* Logo */}
        <motion.div
          className="logo"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="logo-icon">
            <Zap size={24} />
          </div>
          <div className="logo-content">
            <span className="logo-text gradient-text">Flipika</span>
            <span className="logo-subtitle">IA</span>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          {navItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ y: -2 }}
            >
              <Link to={item.path} className="nav-link">
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Theme Toggle - Now visible on both desktop and mobile */}
          <motion.div
            className="theme-toggle-wrapper"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              className={`theme-toggle ${theme === 'dark' ? 'dark' : 'light'}`}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <div className="toggle-track">
                <div className="toggle-thumb">
                  {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                </div>
              </div>
            </button>
          </motion.div>

          {/* CTA Button - Desktop only */}
          <motion.button
            className="btn btn-primary cta-button"
            onClick={scrollToEmailForm}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Commencer Gratuitement
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;