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
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDemoMode } from '../contexts/DemoModeContext';
import { useTheme } from '../hooks/useTheme';
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';
import './MobileMenu.css';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
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
        enableDashboard && { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        enableAudit && { path: '/app/audit', label: 'Audit', icon: TrendingUp },
        enableReports && { path: '/app/reports', label: 'Rapports', icon: FileText },
        { path: '/app/settings', label: 'Paramètres', icon: Settings },
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
                        aria-label="Menu de navigation mobile"
                        aria-modal="true"
                    >
                        {/* Header */}
                        <div className="mobile-menu-header">
                            <h2 className="mobile-menu-title">Menu</h2>
                            <button
                                className="mobile-menu-close"
                                onClick={onClose}
                                aria-label="Fermer le menu"
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
                                <span>Mode Démo</span>
                            </motion.div>
                        )}

                        {/* Navigation Links */}
                        <nav className="mobile-menu-nav" aria-label="Navigation principale">
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
                            <span className="mobile-menu-theme-label">Thème</span>
                            <button
                                className={`theme-toggle ${theme === 'dark' ? 'dark' : 'light'}`}
                                onClick={toggleTheme}
                                aria-label={`Changer vers le thème ${theme === 'dark' ? 'clair' : 'sombre'}`}
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
                            aria-label="Se déconnecter"
                        >
                            <LogOut size={20} />
                            <span>Déconnexion</span>
                        </motion.button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileMenu;
