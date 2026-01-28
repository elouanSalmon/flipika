import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import ConnectedHeader from './app/ConnectedHeader';
import '../components/Header.css'; // Reuse existing header styles

const SimpleHeader = () => {
    const [scrolled, setScrolled] = useState(false);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const isConnected = !!currentUser;

    // Gestion du scroll pour l'effet de fond
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (isConnected) {
        return <ConnectedHeader />;
    }

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                {/* Logo */}
                <Logo />

                {/* No Middle Navigation for Simple Header */}

                {/* Actions */}
                <div className="header-actions">
                    {/* Language Switcher */}
                    <LanguageSwitcher />

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* CTA */}
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(i18n.language === 'fr' ? '/fr/login' : '/login')}>
                        {t('common:header.login')}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default SimpleHeader;
