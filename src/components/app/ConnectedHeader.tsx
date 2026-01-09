import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    FileText,
    LogOut,
    Settings,
    Zap,
    Sun,
    Moon,
    TrendingUp,
    TestTube,
    Menu,
    Palette,
    FileStack,
    Clock,
    Users,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useDemoMode } from "../../contexts/DemoModeContext";
import { useTheme } from "../../hooks/useTheme";
import { useFeatureFlags } from "../../contexts/FeatureFlagsContext";
import { useTranslation } from "react-i18next";
import MobileMenu from "../MobileMenu";
import "../Header.css";

const ConnectedHeader = () => {
    const { t } = useTranslation('common');
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { isDemoMode } = useDemoMode();
    const { enableDashboard, enableAudit, enableReports } = useFeatureFlags();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/secret-login");
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    // Filter navigation items based on feature flags
    const navItems = [
        enableDashboard && { path: "/app/dashboard", label: t('appNavigation.dashboard'), icon: LayoutDashboard },
        enableAudit && { path: "/app/audit", label: t('appNavigation.audit'), icon: TrendingUp },
        enableReports && { path: "/app/reports", label: t('appNavigation.reports'), icon: FileText },
        enableReports && { path: "/app/schedules", label: t('appNavigation.schedules'), icon: Clock },
        enableReports && { path: "/app/templates", label: t('appNavigation.templates'), icon: FileStack },
        { path: "/app/themes", label: t('appNavigation.themes'), icon: Palette },
        { path: "/app/clients", label: t('appNavigation.clients'), icon: Users },
    ].filter(Boolean) as Array<{ path: string; label: string; icon: typeof LayoutDashboard }>;

    return (
        <>
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
                        onClick={() => navigate('/app/reports')}
                    >
                        <div className="logo-icon">
                            <Zap size={24} />
                        </div>
                        <div className="logo-content">
                            <span className="logo-text gradient-text">Flipika</span>
                            <span className="logo-subtitle">IA</span>
                        </div>
                    </motion.div>

                    {/* Burger Menu Button - Mobile Only */}
                    <motion.button
                        className="burger-menu-button"
                        onClick={() => setIsMobileMenuOpen(true)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={t('appNavigation.openMenu')}
                    >
                        <Menu size={24} />
                    </motion.button>

                    {/* Desktop Navigation */}
                    <nav className="nav-desktop">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={item.path}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 + 0.3 }}
                                >
                                    <Link
                                        to={item.path}
                                        className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            color: isActive(item.path) ? 'var(--color-primary)' : undefined,
                                            background: isActive(item.path) ? 'var(--glass-bg)' : undefined,
                                        }}
                                    >
                                        <Icon size={16} />
                                        {item.label}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </nav>

                    {/* Header Actions */}
                    <div className="header-actions">
                        {/* Demo Mode Badge */}
                        {isDemoMode && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700"
                            >
                                <TestTube size={14} className="text-purple-600 dark:text-purple-400" />
                                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                                    {t('appNavigation.demoMode')}
                                </span>
                            </motion.div>
                        )}

                        {/* Theme Toggle */}
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

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Link
                                to="/app/settings"
                                className="nav-link"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <Settings size={16} />
                                <span className="hidden md:inline">{t('appNavigation.settings')}</span>
                            </Link>
                        </motion.div>

                        <motion.button
                            className="btn btn-primary"
                            onClick={handleLogout}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 600,
                            }}
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">{t('appNavigation.logout')}</span>
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu */}
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </>
    );
};

export default ConnectedHeader;
