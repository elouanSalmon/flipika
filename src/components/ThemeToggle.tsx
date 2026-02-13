import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {showLabel && (
                <div>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">Thème</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {theme === 'light' ? 'Mode clair' : 'Mode sombre'}
                    </p>
                </div>
            )}
            <motion.button
                className={`theme-toggle ${theme === 'dark' ? 'dark' : 'light'}`}
                onClick={toggleTheme}
                aria-label="Toggle theme"
                whileTap={{ scale: 0.95 }}
            >
                <div className="toggle-track">
                    <div className="toggle-thumb">
                        {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                    </div>
                </div>
            </motion.button>
        </div>
    );
};

export default ThemeToggle;
