import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import ConnectedHeader from './app/ConnectedHeader';
import '../components/Header.css';

const SimpleHeader = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isConnected = !!currentUser;

    const getLangPath = (path: string) => {
        const isFrench = i18n.language === 'fr';
        return isFrench ? `/fr${path}` : path;
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [navigate]);

    if (isConnected) {
        return <ConnectedHeader />;
    }

    const navItems = [
        { label: t('common:header.home'), path: '/' },
        { label: t('common:header.pricing'), path: '/pricing' },
        { label: t('common:header.roadmap'), path: '/roadmap' },
    ];

    return (
        <>
            <header className={`header ${scrolled ? 'scrolled' : ''}`}>
                <div className="header-container">
                    {/* Logo */}
                    <Logo />

                    {/* Desktop Navigation */}
                    <nav className="nav-desktop">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={getLangPath(item.path)}
                                className="nav-link"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="header-actions">
                        <LanguageSwitcher />
                        <ThemeToggle />

                        {/* CTA - desktop only */}
                        <button
                            className="btn btn-primary cta-button"
                            onClick={() => navigate(getLangPath('/login'))}
                        >
                            {t('common:header.login')}
                        </button>

                        {/* Burger menu - mobile only */}
                        <button
                            className="burger-menu-button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Menu"
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="fixed inset-0 z-[39] pt-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Menu panel */}
                        <motion.nav
                            className="relative mx-4 mt-2 glass rounded-2xl p-4 shadow-xl"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex flex-col gap-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={getLangPath(item.path)}
                                        className="px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--glass-bg)] transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ))}

                                <div className="my-2 border-t border-[var(--color-border)]" />

                                <Link
                                    to={getLangPath('/login')}
                                    className="btn btn-primary w-full text-center py-3"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {t('common:header.login')}
                                </Link>
                            </div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SimpleHeader;
