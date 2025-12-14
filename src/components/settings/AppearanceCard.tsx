import { useState, useEffect } from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AppearanceCard = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
        toast.success(`Thème ${theme === 'light' ? 'sombre' : 'clair'} activé`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/10 dark:border-blue-500/20 p-6 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
        >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-lg border border-blue-500/20">
                    <Palette size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                Apparence
            </h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-blue-500/20 dark:border-blue-500/30 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm transition-all duration-300 shadow-lg shadow-blue-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-lg border border-blue-500/20">
                            {theme === 'light' ? (
                                <Sun size={18} className="text-blue-600 dark:text-blue-400" />
                            ) : (
                                <Moon size={18} className="text-blue-600 dark:text-blue-400" />
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">Thème</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {theme === 'light' ? 'Mode clair' : 'Mode sombre'}
                            </p>
                        </div>
                    </div>
                    <motion.button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 shadow-lg ${theme === 'dark'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/30'
                                : 'bg-gray-300 dark:bg-gray-600 shadow-gray-500/20'
                            }`}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.span
                            className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-md"
                            animate={{
                                x: theme === 'dark' ? 28 : 4
                            }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default AppearanceCard;
