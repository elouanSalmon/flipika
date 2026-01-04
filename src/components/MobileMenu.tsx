import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    TrendingUp,
    FileText,
    Settings,
    LogOut,
    X,
    TestTube,
    Sun,
    Moon,
    Palette,
    FileStack,
    Clock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDemoMode } from '../contexts/DemoModeContext';
import { useTheme } from '../hooks/useTheme';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import { useTranslation } from 'react-i18next';
import './MobileMenu.css';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation('common');
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { isDemoMode } = useDemoMode();
    const { enableDashboard, enableAudit, enableReports } = useFeatureFlags();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/secret-login');
            onClose();
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    const handleLinkClick = () => {
        onClose();
    };

    // Filter navigation items based on feature flags
    const navItems = [
        enableDashboard && { path: '/app/dashboard', label: t('appNavigation.dashboard'), icon: LayoutDashboard },
        enableAudit && { path: '/app/audit', label: t('appNavigation.audit'), icon: TrendingUp },
        enableReports && { path: '/app/reports', label: t('appNavigation.reports'), icon: FileText },
        enableReports && { path: '/app/schedules', label: t('appNavigation.schedules'), icon: Clock },
        enableReports && { path: '/app/templates', label: t('appNavigation.templates'), icon: FileStack },
        { path: '/app/themes', label: t('appNavigation.themes'), icon: Palette },
        { path: '/app/settings', label: t('appNavigation.settings'), icon: Settings },
    ].filter(Boolean) as Array<{ path: string; label: string; icon: typeof LayoutDashboard }>;


    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        className="mobile-menu-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Menu Drawer */}
                    <motion.div
                        className="mobile-menu-drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        role="dialog"
                        aria-label={t('appNavigation.menu')}
                        aria-modal="true"
                    >
                        {/* Header */}
                        <div className="mobile-menu-header">
                            <h2 className="mobile-menu-title">{t('appNavigation.menu')}</h2>
                            <button
                                className="mobile-menu-close"
                                onClick={onClose}
                                aria-label={t('appNavigation.closeMenu')}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Demo Mode Badge */}
                        {isDemoMode && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mobile-menu-demo-badge"
                            >
                                <TestTube size={16} />
                                <span>{t('appNavigation.demoMode')}</span>
                            </motion.div>
                        )}

                        {/* Navigation Links */}
                        <nav className="mobile-menu-nav" aria-label={t('appNavigation.mainNavigation')}>
                            {navItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.path}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + index * 0.05 }}
                                    >
                                        <Link
                                            to={item.path}
                                            className={`mobile-menu-link ${isActive(item.path) ? 'active' : ''}`}
                                            onClick={handleLinkClick}
                                        >
                                            <Icon size={20} />
                                            <span>{item.label}</span>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </nav>

                        {/* Divider */}
                        <div className="mobile-menu-divider" />

                        {/* Theme Toggle */}
                        <motion.div
                            className="mobile-menu-theme-toggle"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <span className="mobile-menu-theme-label">{t('appNavigation.theme')}</span>
                            <button
                                className={`theme-toggle ${theme === 'dark' ? 'dark' : 'light'}`}
                                onClick={toggleTheme}
                                aria-label={t('appNavigation.toggleTheme', { theme: theme === 'dark' ? t('appNavigation.light') : t('appNavigation.dark') })}
                            >
                                <div className="toggle-track">
                                    <div className="toggle-thumb">
                                        {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                                    </div>
                                </div>
                            </button>
                        </motion.div>

                        {/* Logout Button */}
                        <motion.button
                            className="mobile-menu-logout"
                            onClick={handleLogout}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            aria-label={t('appNavigation.logout')}
                        >
                            <LogOut size={20} />
                            <span>{t('appNavigation.logout')}</span>
                        </motion.button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileMenu;
