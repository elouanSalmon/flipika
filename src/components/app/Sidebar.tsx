import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Presentation,
    LogOut,
    Settings,
    Sun,
    Moon,
    TrendingUp,
    TestTube,
    Menu,
    Palette,
    LayoutTemplate,
    Clock,
    Users,
    Shield,
    Wallet,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useDemoMode } from "../../contexts/DemoModeContext";
import { useCrmMode } from "../../contexts/CrmModeContext";
import { useTheme } from "../../hooks/useTheme";
import { useFeatureFlags } from "../../contexts/FeatureFlagsContext";
import { useTranslation } from "react-i18next";
import MobileMenu from "../MobileMenu";
import Logo from "../Logo";
import "./Sidebar.css";

const Sidebar = () => {
    const { t } = useTranslation('common');
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { isDemoMode } = useDemoMode();
    const { isCrmModeAvailable } = useCrmMode();
    const { enableDashboard, enableAudit, enableReports } = useFeatureFlags();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    // Filter navigation items based on feature flags
    const navItems = [
        enableDashboard && { path: "/app/dashboard", label: t('appNavigation.dashboard'), icon: LayoutDashboard },
        enableAudit && { path: "/app/audit", label: t('appNavigation.audit'), icon: TrendingUp },
        enableReports && { path: "/app/reports", label: t('appNavigation.reports'), icon: Presentation },
        enableReports && { path: "/app/schedules", label: t('appNavigation.schedules'), icon: Clock },
        enableReports && { path: "/app/templates", label: t('appNavigation.templates'), icon: LayoutTemplate },
        { path: "/app/themes", label: t('appNavigation.themes'), icon: Palette },
        { path: "/app/clients", label: t('appNavigation.clients'), icon: Users },
        { path: "/app/budget-pacing", label: t('appNavigation.budgetPacing'), icon: Wallet },
        isCrmModeAvailable && { path: "/app/crm", label: "CRM", icon: Shield },
    ].filter(Boolean) as Array<{ path: string; label: string; icon: typeof LayoutDashboard }>;

    return (
        <>
            {/* Desktop / Tablet Sidebar */}
            <aside className="app-sidebar">
                {/* Logo */}
                <div className="sidebar-logo" onClick={() => navigate('/app/reports')}>
                    <Logo />
                </div>

                {/* Demo Badge */}
                {isDemoMode && (
                    <motion.div
                        className="sidebar-demo-badge"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <TestTube size={14} />
                        <span>{t('appNavigation.demoMode')}</span>
                    </motion.div>
                )}

                {/* Navigation Links */}
                <nav className="sidebar-nav">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.path}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.04 + 0.1 }}
                            >
                                <Link
                                    to={item.path}
                                    className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                                    data-tooltip={item.label}
                                >
                                    <span className="sidebar-icon">
                                        <Icon size={18} />
                                    </span>
                                    <span className="sidebar-label">{item.label}</span>
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="sidebar-bottom">
                    {/* Theme Toggle */}
                    <div className="sidebar-theme-row">
                        <span className="sidebar-theme-label">
                            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                            <span>{t('appNavigation.theme')}</span>
                        </span>
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
                    </div>

                    {/* Settings */}
                    <Link
                        to="/app/settings"
                        className={`sidebar-link sidebar-settings-link ${isActive('/app/settings') ? 'active' : ''}`}
                        data-tooltip={t('appNavigation.settings')}
                    >
                        <span className="sidebar-icon">
                            <Settings size={18} />
                        </span>
                        <span className="sidebar-label">{t('appNavigation.settings')}</span>
                    </Link>

                    {/* Logout */}
                    <button className="sidebar-logout" onClick={handleLogout}>
                        <span className="sidebar-icon">
                            <LogOut size={18} />
                        </span>
                        <span className="sidebar-label">{t('appNavigation.logout')}</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Top Bar */}
            <div className="sidebar-mobile-topbar">
                <Logo onClick={() => navigate('/app/reports')} />
                <button
                    className="sidebar-mobile-burger"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label={t('appNavigation.openMenu')}
                >
                    <Menu size={22} />
                </button>
            </div>

            {/* Mobile Menu Drawer */}
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </>
    );
};

export default Sidebar;
