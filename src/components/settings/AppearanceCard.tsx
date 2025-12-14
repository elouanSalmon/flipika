import { Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from '../ThemeToggle';

const AppearanceCard = () => {
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
                    <ThemeToggle showLabel={true} />
                </div>
            </div>
        </motion.div>
    );
};

export default AppearanceCard;
