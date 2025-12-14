import { TestTube, Bell, Key, User } from 'lucide-react';
import { useDemoMode } from '../contexts/DemoModeContext';

const Settings = () => {
    const { isDemoMode, toggleDemoMode } = useDemoMode();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Paramètres</h1>
                    <p className="text-gray-500 text-sm">Gérez vos préférences et configurations</p>
                </div>
            </div>

            {/* Demo Mode Section */}
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                <div className="p-6 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <TestTube size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold mb-1">Mode Démo</h2>
                            <p className="text-gray-500 text-sm mb-4">
                                Testez toutes les fonctionnalités de Flipika avec des données fictives sans connecter votre compte Google Ads.
                            </p>

                            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl border border-gray-200 dark:border-gray-600">
                                <div>
                                    <p className="font-semibold text-base">
                                        {isDemoMode ? 'Mode démo activé' : 'Mode démo désactivé'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {isDemoMode
                                            ? 'Vous utilisez des données fictives'
                                            : 'Vous utilisez vos données Google Ads réelles'}
                                    </p>
                                </div>
                                <button
                                    className={`theme-toggle ${isDemoMode ? 'dark' : 'light'}`}
                                    onClick={toggleDemoMode}
                                    aria-label="Toggle demo mode"
                                >
                                    <div className="toggle-track">
                                        <div className="toggle-thumb">
                                            {isDemoMode ? 'ON' : 'OFF'}
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {isDemoMode && (
                                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl">
                                    <p className="text-sm text-purple-800 dark:text-purple-300">
                                        <strong>Mode démo actif :</strong> Toutes les données affichées sont fictives.
                                        Désactivez le mode démo pour utiliser vos vraies données Google Ads.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Section */}
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <User size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold mb-1">Compte</h2>
                            <p className="text-gray-500 text-sm mb-4">
                                Gérez votre compte et vos informations personnelles
                            </p>
                            <button className="btn btn-ghost text-sm" disabled>
                                Modifier le profil
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <Bell size={24} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold mb-1">Notifications</h2>
                            <p className="text-gray-500 text-sm mb-4">
                                Configurez vos préférences de notifications
                            </p>
                            <button className="btn btn-ghost text-sm" disabled>
                                Gérer les notifications
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Section */}
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                            <Key size={24} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold mb-1">API & Intégrations</h2>
                            <p className="text-gray-500 text-sm mb-4">
                                Gérez vos connexions et clés API
                            </p>
                            <button className="btn btn-ghost text-sm" disabled>
                                Gérer les intégrations
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
