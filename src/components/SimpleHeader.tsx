import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    ChevronDown,
    FileBarChart,
    Sparkles,
    FileText,
    Calendar,
    Download,
    Mail,
    Presentation,
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import ConnectedHeader from './app/ConnectedHeader';
import '../components/Header.css';

// Icon mapping for features
const iconMap: Record<string, typeof FileBarChart> = {
    FileBarChart,
    Sparkles,
    FileText,
    Calendar,
    Download,
    Mail,
    Presentation,
};

const SimpleHeader = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
    const { t, i18n } = useTranslation(['common', 'features']);
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

    // Get features from translation
    const features = t('features:features', { returnObjects: true }) as Array<{
        id: string;
        icon: string;
        title: string;
    }>;


    const navItems = [
        { label: t('common:header.home'), path: '/' },
        { label: t('common:header.roadmap'), path: '/roadmap' },
        { label: t('common:header.pricing'), path: '/pricing' },
    ];

    return (
        <>
            <header className={`header ${scrolled ? 'scrolled' : ''}`}>
                <div className="header-container">
                    {/* Logo */}
                    <Logo />


                    {/* Desktop Navigation */}
                    <nav className="nav-desktop">
                        <Link
                            to={getLangPath('/')}
                            className="nav-link"
                        >
                            {t('common:header.home')}
                        </Link>

                        {/* Features Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setFeaturesDropdownOpen(true)}
                            onMouseLeave={() => setFeaturesDropdownOpen(false)}
                        >
                            <Link
                                to={getLangPath('/features')}
                                className="nav-link inline-flex items-center gap-1"
                            >
                                <span>{t('common:header.features')}</span>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${featuresDropdownOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </Link>

                            <AnimatePresence>
                                {featuresDropdownOpen && (
                                    <motion.div
                                        className="absolute top-full left-0 mt-2 rounded-xl shadow-xl overflow-hidden z-50"
                                        style={{
                                            width: '400px',
                                            backgroundColor: 'var(--color-bg-secondary)',
                                            backdropFilter: 'blur(12px)',
                                            border: '1px solid var(--color-border)',
                                        }}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <div className="py-1">
                                            {features.map((feature) => {
                                                const Icon = iconMap[feature.icon] || Sparkles;
                                                return (
                                                    <Link
                                                        key={feature.id}
                                                        to={getLangPath(`/features/${feature.id}`)}
                                                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--glass-bg)] transition-colors"
                                                    >
                                                        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                                                            <Icon size={16} className="text-primary" />
                                                        </div>
                                                        <span className="text-sm text-[var(--color-text-primary)]">
                                                            {feature.title}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Link
                            to={getLangPath('/pricing')}
                            className="nav-link"
                        >
                            {t('common:header.pricing')}
                        </Link>

                        <Link
                            to={getLangPath('/roadmap')}
                            className="nav-link"
                        >
                            {t('common:header.roadmap')}
                        </Link>
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
                            className="relative mx-4 mt-2 glass rounded-2xl p-4 shadow-xl max-h-[calc(100vh-6rem)] overflow-y-auto"
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

                                {/* Features Section in Mobile */}
                                <div className="py-1">
                                    <Link
                                        to={getLangPath('/features')}
                                        className="px-4 py-3 rounded-xl text-sm font-semibold text-primary hover:bg-[var(--glass-bg)] transition-colors block"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {t('common:header.features')}
                                    </Link>

                                    <div className="ml-2 mt-1 space-y-0.5">
                                        {features.map((feature) => {
                                            const Icon = iconMap[feature.icon] || Sparkles;
                                            return (
                                                <Link
                                                    key={feature.id}
                                                    to={getLangPath(`/features/${feature.id}`)}
                                                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl hover:bg-[var(--glass-bg)] transition-colors"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <Icon size={14} className="text-primary" />
                                                    <span className="text-xs text-[var(--color-text-secondary)]">
                                                        {feature.title}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>

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
