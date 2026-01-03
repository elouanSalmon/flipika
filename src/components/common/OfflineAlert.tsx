import React from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OfflineAlertProps {
    isOnline: boolean;
}

const OfflineAlert: React.FC<OfflineAlertProps> = ({ isOnline }) => {
    return (
        <AnimatePresence>
            {!isOnline && (
                <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700 text-center"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full">
                                <WifiOff size={48} className="text-red-500 dark:text-red-400" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Pas de connexion Internet
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Il semble que vous soyez hors ligne. Veuillez vérifier votre connexion pour continuer à utiliser Flipika.
                        </p>

                        <div className="animate-pulse text-sm text-primary font-medium">
                            Tentative de reconnexion...
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OfflineAlert;
