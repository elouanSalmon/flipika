import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  List,
  LogOut,
  Settings,
  Zap,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import "../components/Header.css"; // Use header styles
import "../components/app/Connected.css";
import Footer from "../components/Footer";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/secret-login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="app-connected flex h-screen bg-[var(--color-bg-secondary)] overflow-hidden">
      {/* Sidebar - Increased width and padding */}
      <aside className="w-72 glass border-r border-[var(--color-border)] flex flex-col z-20">
        {/* Logo Area */}
        <div className="p-8">
          <Link to="/" className="logo">
            <div className="logo-icon scale-90">
              <Zap size={24} />
            </div>
            <div className="logo-content">
              <span className="logo-text gradient-text text-2xl">Flipika</span>
              <span className="logo-subtitle text-sm">IA</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-6 space-y-3 overflow-y-auto">
          <div className="nav-section-title mb-4 px-2">Menu Principal</div>

          <Link
            to="/app/dashboard"
            className={`nav-item ${isActive("/app/dashboard") ? "active" : ""}`}
          >
            <LayoutDashboard size={22} className="icon" />
            Overview
          </Link>

          <Link
            to="/app/copilot"
            className={`nav-item ${isActive("/app/copilot") ? "active" : ""}`}
          >
            <MessageSquare size={22} className="icon" />
            AI Copilot
            <span className="nav-badge">New</span>
          </Link>

          <Link
            to="/app/campaigns"
            className={`nav-item ${isActive("/app/campaigns") ? "active" : ""}`}
          >
            <List size={22} className="icon" />
            New Campaigns
          </Link>
        </nav>

        <div className="p-6 border-t border-[var(--color-border)] space-y-3 bg-[var(--color-bg-secondary)]/30 backdrop-blur-sm">
          <button className="nav-item w-full">
            <Settings size={22} className="icon" />
            Settings
          </button>
          <button onClick={handleLogout} className="nav-item danger w-full">
            <LogOut size={22} className="icon" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content - Improved Spacing */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[var(--gradient-bg)]"></div>

        <header className="h-20 glass border-b border-[var(--color-border)] sticky top-0 z-10 backdrop-blur-md">
          <div className="content-container flex items-center justify-between w-full">
            <div>
              <h1 className="text-2xl font-bold tracking-tight gradient-text">
                {isActive("/app/dashboard")
                  ? "Dashboard"
                  : isActive("/app/copilot")
                    ? "AI Copilot"
                    : "New Campaigns"}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {isActive("/app/dashboard")
                  ? "Bienvenue sur votre espace de pilotage"
                  : isActive("/app/copilot")
                    ? "Votre assistant d'optimisation en temps réel"
                    : "Gérez vos performances"}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Demo User
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Pro Plan
                </span>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20 cursor-pointer border border-white/20"
              >
                FK
              </motion.div>
            </div>
          </div>
        </header>

        <main className="overflow-auto flex-1 relative z-0 scroll-smooth flex flex-col">
          <div className="content-container space-y-8">
            <Outlet />
          </div>

          {/* App Footer: identical to landing */}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
