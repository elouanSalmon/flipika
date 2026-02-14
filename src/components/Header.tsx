import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import './Header.css';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const getLangPath = (path: string) => {
    const lang = i18n.language;
    if (lang === 'fr' || lang === 'es') {
      return `/${lang}${path}`;
    }
    return path;
  };

  const handleNavigation = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
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
    { label: t('common:header.home'), sectionId: 'hero' },
    { label: t('common:header.problem'), sectionId: 'problem' },
    { label: t('common:header.features'), sectionId: 'features' },
    { label: t('common:header.testimonials'), sectionId: 'testimonials' },
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
        {/* Logo */}
        <div className="logo-wrapper">
          <Logo />
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          {navItems.map((item, index) => (
            <motion.button
              key={item.label}
              onClick={() => handleNavigation(item.sectionId)}
              className="nav-link"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ y: -2 }}
            >
              {item.label}
            </motion.button>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="header-actions">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle - Now visible on both desktop and mobile */}
          <motion.div
            className="theme-toggle-wrapper"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <ThemeToggle />
          </motion.div>

          {/* Auth Actions - Desktop only */}
          <div className="auth-actions">
            <motion.button
              className="btn btn-secondary login-button"
              onClick={() => navigate(getLangPath('/login'))}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('common:header.login')}
            </motion.button>

            <motion.button
              className="btn btn-primary signup-button"
              onClick={() => navigate(getLangPath('/login'))}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('common:header.signup')}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;