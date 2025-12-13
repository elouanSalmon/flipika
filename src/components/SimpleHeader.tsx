import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import '../components/Header.css'; // Reuse existing header styles

const SimpleHeader = () => {
    const [scrolled, setScrolled] = useState(false);
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    // Gestion du scroll pour l'effet de fond
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'fr' ? 'en' : 'fr';
        i18n.changeLanguage(newLang);
    };

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                {/* Logo */}
                <div className="logo" onClick={() => navigate('/')}>
                    <div className="logo-icon">
                        <Zap size={24} />
                    </div>
                    <div className="logo-content">
                        <span className="logo-text gradient-text">Flipika</span>
                        <span className="logo-subtitle">AI</span>
                    </div>
                </div>

                {/* No Middle Navigation for Simple Header */}

                {/* Actions */}
                <div className="header-actions">
                    {/* Language Switcher */}
                    <button
                        onClick={toggleLanguage}
                        className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] transition-colors text-sm font-medium"
                    >
                        {i18n.language === 'fr' ? 'EN' : 'FR'}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] transition-colors"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* CTA */}
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/secret-login')}>
                        {t('common:header.login')}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default SimpleHeader;
