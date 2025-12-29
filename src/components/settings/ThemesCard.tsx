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
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/10 dark:border-blue-500/20 p-6 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-lg border border-blue-500/20">
                            <Palette size={20} className="text-blue-600 dark:text-blue-400" />
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
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
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
                                className="mt-6 w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
