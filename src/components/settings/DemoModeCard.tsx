import { TestTube } from 'lucide-react';
import { useDemoMode } from '../../contexts/DemoModeContext';
import { motion } from 'framer-motion';

const DemoModeCard = () => {
    const { isDemoMode, demoSettings, toggleDemoMode, updateDemoSettings, resetDemoData } = useDemoMode();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
        >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/10 dark:from-primary/20 dark:to-primary/20 rounded-lg border border-primary/20">
                    <TestTube size={20} className="text-primary dark:text-primary-light" />
                </div>
                Mode Démo
            </h2>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Activer</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Données fictives</p>
                    </div>
                    <button
                        onClick={toggleDemoMode}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${isDemoMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                    >
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${isDemoMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {isDemoMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                Comptes ({demoSettings.accountCount})
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={demoSettings.accountCount}
                                onChange={(e) => updateDemoSettings({ accountCount: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                                style={{
                                    background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${((demoSettings.accountCount - 1) / 9) * 100}%, rgb(229, 231, 235) ${((demoSettings.accountCount - 1) / 9) * 100}%, rgb(229, 231, 235) 100%)`
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Complexité</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['simple', 'medium', 'advanced'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => updateDemoSettings({ complexity: level })}
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${demoSettings.complexity === level
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                                            }`}
                                    >
                                        {level === 'simple' ? 'Simple' : level === 'medium' ? 'Moyen' : 'Avancé'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Secteur</label>
                            <select
                                value={demoSettings.industry}
                                onChange={(e) => updateDemoSettings({ industry: e.target.value as any })}
                                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 cursor-pointer"
                            >
                                <option value="ecommerce">E-commerce</option>
                                <option value="services">Services</option>
                                <option value="saas">SaaS</option>
                                <option value="local">Local</option>
                                <option value="b2b">B2B</option>
                            </select>
                        </div>

                        <button
                            onClick={resetDemoData}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all duration-200 text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                            Réinitialiser
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default DemoModeCard;
