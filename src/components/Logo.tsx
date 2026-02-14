import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface LogoProps {
    className?: string;
    onClick?: () => void;
    scale?: number;
    subtitle?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '', onClick, scale = 1.05, subtitle = 'bêta' }) => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            const isFrench = i18n.language === 'fr';
            navigate(isFrench ? '/fr' : '/');
        }
    };

    return (
        <motion.div
            className={`logo ${className}`}
            whileHover={{ scale }}
            transition={{ duration: 0.2 }}
            onClick={handleClick}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
            <div className="logo-icon" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: 'var(--color-primary, #1963d5)',
                borderRadius: '8px',
                color: 'var(--color-bg-primary, white)'
            }}>
                <Zap size={24} />
            </div>
            <div className="logo-content" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span className="logo-text" style={{
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: 'var(--color-primary, #1963d5)',
                    background: 'none',
                    WebkitTextFillColor: 'initial',
                    backgroundClip: 'border-box',
                    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
                }}>Flipika</span>
                <span className="logo-subtitle" style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--color-text-secondary, #6b6e77)'
                }}>{subtitle}</span>
            </div>
        </motion.div>
    );
};

export default Logo;
