import { Link as LinkIcon, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const ConnectionsCard = () => {
    const handleConnect = () => {
        // This will be connected to the existing Google Ads OAuth flow
        console.log('Connecting to Google Ads...');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/10 dark:border-blue-500/20 p-6 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
        >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-lg border border-blue-500/20">
                    <LinkIcon size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                Connexions
            </h2>

            <div className="flex items-center justify-between p-4 rounded-xl border-2 border-blue-500/20 dark:border-blue-500/30 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-gray-700/50 hover:border-blue-500/30 dark:hover:border-blue-500/40 transition-all duration-300 shadow-lg shadow-blue-500/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg shadow-md flex items-center justify-center p-1.5 border border-gray-200 dark:border-gray-600">
                        <svg className="w-full h-full" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Google Ads</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Non connecté</p>
                    </div>
                </div>
                <motion.button
                    onClick={handleConnect}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-200 text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Connecter
                </motion.button>
            </div>

            <div className="mt-4 p-3.5 bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm">
                <div className="flex gap-2">
                    <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Connectez votre compte pour accéder aux données réelles de vos campagnes
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default ConnectionsCard;
