import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, User, Shield, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDemoMode } from '../contexts/DemoModeContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { user, logout } = useAuth();
    const { isDemoMode, demoSettings, toggleDemoMode, updateDemoSettings, resetDemoData } = useDemoMode();
    const navigate = useNavigate();
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="space-y-8 p-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Paramètres</h1>
                <p className="text-gray-500 mt-1">Gérez votre compte et vos préférences</p>
            </div>

            {/* Account Information */}
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <User size={20} className="text-gray-500" />
                    <h2 className="text-xl font-bold">Informations du compte</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500"
                        />
                    </div>
                </div>
            </div>

            {/* Demo Mode Settings */}
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Palette size={20} className="text-gray-500" />
                    <h2 className="text-xl font-bold">Mode Démo</h2>
                </div>

                {/* Main Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-6">
                    <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Activer le mode démo</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Testez toutes les fonctionnalités avec des données fictives
                        </p>
                    </div>
                    <button
                        onClick={toggleDemoMode}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${isDemoMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                    >
                        <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isDemoMode ? 'translate-x-9' : 'translate-x-1'
                                }`}
                        />
                        <span
                            className={`absolute text-xs font-bold transition-opacity ${isDemoMode
                                    ? 'left-2 text-white opacity-100'
                                    : 'left-2 text-gray-600 opacity-0'
                                }`}
                        >
                            ON
                        </span>
                        <span
                            className={`absolute text-xs font-bold transition-opacity ${!isDemoMode
                                    ? 'right-2 text-gray-600 dark:text-gray-300 opacity-100'
                                    : 'right-2 text-white opacity-0'
                                }`}
                        >
                            OFF
                        </span>
                    </button>
                </div>

                {/* Advanced Demo Settings */}
                {isDemoMode && (
                    <div className="space-y-6 border-t border-gray-200 dark:border-gray-600 pt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Nombre de comptes fictifs
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={demoSettings.accountCount}
                                    onChange={(e) => updateDemoSettings({ accountCount: parseInt(e.target.value) })}
                                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 w-12 text-center">
                                    {demoSettings.accountCount}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Niveau de complexité
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['simple', 'medium', 'advanced'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => updateDemoSettings({ complexity: level })}
                                        className={`p-4 rounded-xl border-2 transition-all font-semibold ${demoSettings.complexity === level
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                            }`}
                                    >
                                        {level === 'simple' ? 'Simple' : level === 'medium' ? 'Moyen' : 'Avancé'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Secteur d'activité
                            </label>
                            <select
                                value={demoSettings.industry}
                                onChange={(e) => updateDemoSettings({ industry: e.target.value as any })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ecommerce">E-commerce</option>
                                <option value="services">Services</option>
                                <option value="saas">SaaS</option>
                                <option value="local">Commerce local</option>
                                <option value="b2b">B2B</option>
                            </select>
                        </div>

                        <button
                            onClick={resetDemoData}
                            className="btn btn-ghost w-full"
                        >
                            Réinitialiser les données démo
                        </button>
                    </div>
                )}
            </div>

            {/* Appearance */}
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Palette size={20} className="text-gray-500" />
                    <h2 className="text-xl font-bold">Apparence</h2>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">Thème</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {theme === 'light' ? 'Mode clair' : 'Mode sombre'}
                        </p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="relative inline-flex h-8 w-16 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
                    >
                        <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white dark:bg-gray-900 transition-transform ${theme === 'dark' ? 'translate-x-9' : 'translate-x-1'
                                } flex items-center justify-center`}
                        >
                            {theme === 'light' ? (
                                <Sun size={14} className="text-yellow-500" />
                            ) : (
                                <Moon size={14} className="text-blue-400" />
                            )}
                        </span>
                    </button>
                </div>
            </div>

            {/* Security */}
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Shield size={20} className="text-gray-500" />
                    <h2 className="text-xl font-bold">Sécurité</h2>
                </div>
                <button
                    onClick={handleLogout}
                    className="btn btn-ghost text-red-600 dark:text-red-400 flex items-center gap-2"
                >
                    <LogOut size={18} />
                    Se déconnecter
                </button>
            </div>
        </div>
    );
};

export default Settings;
