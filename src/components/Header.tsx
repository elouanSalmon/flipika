import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from './Logo';
import { ChevronDown } from 'lucide-react';
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

  const location = useLocation();

  const handleNavigation = (sectionId: string) => {
    // If not on landing page, navigate to landing page first
    if (location.pathname !== '/' && location.pathname !== '/fr' && location.pathname !== '/es') {
      navigate(getLangPath('/'));
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

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
    { label: t('header.home'), sectionId: 'hero' },
    { label: t('header.problem'), sectionId: 'problem' },
    { label: t('header.testimonials'), sectionId: 'testimonials' },
  ];

  const featureItems = [
    { label: t('header.features'), sectionId: 'features' },
    { label: t('footer.sections.templates'), path: '/features/report-generation' },
    { label: t('footer.sections.ai'), path: '/features/ai-narration' },
    { label: t('footer.sections.automation'), path: '/features/scheduling-automation' },
    { label: t('footer.sections.exports'), path: '/features/multi-format-exports' },
    { label: t('footer.sections.slideshow'), path: '/features/slideshow-mode' },
    { label: i18n.language === 'fr' ? 'Reporting Google Ads' : (i18n.language === 'es' ? 'Informes Google Ads' : 'Google Ads Reporting'), path: '/google-ads-reporting', isAction: true },
    { label: i18n.language === 'fr' ? 'Reporting Meta Ads' : (i18n.language === 'es' ? 'Informes Meta Ads' : 'Meta Ads Reporting'), path: '/meta-ads-reporting', isAction: true }
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
          <motion.button
            onClick={() => handleNavigation(navItems[0].sectionId)}
            className="nav-link"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -2 }}
          >
            {navItems[0].label}
          </motion.button>

          <motion.button
            onClick={() => handleNavigation(navItems[1].sectionId)}
            className="nav-link"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -2 }}
          >
            {navItems[1].label}
          </motion.button>

          {/* Features Dropdown */}
          <motion.div
            className="nav-dropdown-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button className="nav-link nav-dropdown-trigger">
              {t('header.features')} <ChevronDown size={14} className="dropdown-icon" />
            </button>
            <div className="nav-dropdown-menu">
              {featureItems.map((item, index) => (
                item.path ? (
                  <Link
                    key={index}
                    to={getLangPath(item.path)}
                    className={`dropdown-item ${item.isAction ? 'action-item' : ''}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={index}
                    onClick={() => handleNavigation(item.sectionId as string)}
                    className="dropdown-item"
                  >
                    {item.label}
                  </button>
                )
              ))}
            </div>
          </motion.div>

          <motion.button
            onClick={() => handleNavigation(navItems[2].sectionId)}
            className="nav-link"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -2 }}
          >
            {navItems[2].label}
          </motion.button>
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
              {t('header.login')}
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
              {t('header.signup')}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;