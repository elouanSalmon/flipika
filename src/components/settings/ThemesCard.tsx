import { useState } from 'react';
import { Palette, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import ThemeManager from '../themes/ThemeManager';
import { clientService } from '../../services/clientService';
import type { Client } from '../../types/client';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ThemesCard = () => {
    const { t } = useTranslation('settings');
    const { currentUser } = useAuth();
    const [showThemeManager, setShowThemeManager] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        if (currentUser) {
            loadClients();
        }
    }, [currentUser]);

    const loadClients = async () => {
        if (!currentUser) return;
        try {
            const data = await clientService.getClients(currentUser.uid);
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    if (!currentUser) return null;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/10 dark:from-primary/20 dark:to-primary/20 rounded-lg border border-primary/20">
                            <Palette size={20} className="text-primary dark:text-primary-light" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {t('themes.title')}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('themes.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {t('themes.description')}
                    </p>

                    <button
                        onClick={() => setShowThemeManager(true)}
                        className="btn btn-primary w-full justify-center"
                    >
                        <Plus className="w-5 h-5" />
                        {t('themes.manageButton')}
                    </button>
                </div>
            </motion.div>

            {/* Theme Manager Modal */}
            {showThemeManager && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <ThemeManager clients={clients} />
                            <button
                                onClick={() => setShowThemeManager(false)}
                                className="btn btn-secondary w-full"
                            >
                                {t('themes.closeButton')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ThemesCard;
