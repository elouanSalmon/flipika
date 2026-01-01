import { useState } from 'react';
import { Palette, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleAds } from '../../contexts/GoogleAdsContext';
import ThemeManager from '../themes/ThemeManager';
import dataService from '../../services/dataService';
import type { Account } from '../../types/business';
import { useEffect } from 'react';

const ThemesCard = () => {
    const { currentUser } = useAuth();
    const { isConnected } = useGoogleAds();
    const [showThemeManager, setShowThemeManager] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);

    useEffect(() => {
        if (isConnected) {
            loadAccounts();
        }
    }, [isConnected]);

    const loadAccounts = async () => {
        try {
            const data = await dataService.getAccounts();
            setAccounts(data);
        } catch (error) {
            console.error('Error loading accounts:', error);
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
                                Thèmes de rapport
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Personnalisez l'apparence de vos rapports
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Créez des thèmes personnalisés pour vos rapports Google Ads et liez-les à vos comptes pour une application automatique.
                    </p>

                    <button
                        onClick={() => setShowThemeManager(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold hover:from-primary-dark hover:to-primary-dark transition-all duration-200 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                    >
                        <Plus className="w-5 h-5" />
                        Gérer mes thèmes
                    </button>
                </div>
            </motion.div>

            {/* Theme Manager Modal */}
            {showThemeManager && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <ThemeManager accounts={accounts} />
                            <button
                                onClick={() => setShowThemeManager(false)}
                                className="mt-6 w-full px-4 py-3 border-2 border-primary/30 dark:border-primary/40 text-gray-900 dark:text-gray-100 rounded-xl font-semibold hover:bg-white/50 dark:hover:bg-gray-700/50 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-200"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ThemesCard;
