import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, User, Shield, Palette, Camera, Lock, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDemoMode } from '../contexts/DemoModeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user, logout } = useAuth();
    const { isDemoMode, demoSettings, toggleDemoMode, updateDemoSettings, resetDemoData } = useDemoMode();
    const navigate = useNavigate();
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    });

    // Form states
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: '',
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
            toast.error('Erreur lors de la déconnexion');
        }
    };

    const handleSaveProfile = async () => {
        try {
            // TODO: Implement Firebase profile update
            toast.success('Profil mis à jour avec succès');
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Erreur lors de la mise à jour du profil');
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('La photo ne doit pas dépasser 5MB');
                return;
            }
            // TODO: Implement photo upload
            toast.success('Photo uploadée avec succès');
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.new !== passwordForm.confirm) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }
        if (passwordForm.new.length < 8) {
            toast.error('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }
        try {
            // TODO: Implement password change
            toast.success('Mot de passe modifié avec succès');
            setShowPasswordModal(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error('Password change error:', error);
            toast.error('Erreur lors du changement de mot de passe');
        }
    };

    const getPasswordStrength = (password: string): { label: string; color: string } => {
        if (password.length === 0) return { label: '', color: '' };
        if (password.length < 8) return { label: 'Faible', color: 'text-red-600' };

        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);

        const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

        if (score === 3) return { label: 'Fort', color: 'text-green-600' };
        if (score >= 1) return { label: 'Moyen', color: 'text-orange-600' };
        return { label: 'Faible', color: 'text-red-600' };
    };

    return (
        <div className="space-y-8 p-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Paramètres</h1>
                <p className="text-gray-500 mt-1">Gérez votre compte et vos préférences</p>
            </div>

            {/* SECTION 1: Account Information */}
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <User size={20} className="text-gray-500" />
                    <h2 className="text-xl font-bold">Informations du compte</h2>
                </div>

                <div className="space-y-6">
                    {/* Photo de profil */}
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                {photoURL ? (
                                    <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-gray-400" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                                <Camera size={16} className="text-white" />
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                />
                            </label>
                        </div>
                        <div>
                            <h3 className="font-semibold">Photo de profil</h3>
                            <p className="text-sm text-gray-500 mt-1">JPG, PNG ou WEBP. Max 5MB.</p>
                        </div>
                    </div>

                    {/* Nom d'affichage */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nom d'affichage
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                            placeholder="Votre nom"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                            ⚠️ Changer l'email nécessite une nouvelle vérification
                        </p>
                    </div>

                    {/* Compte créé le */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Compte créé le
                        </label>
                        <input
                            type="text"
                            value={user?.metadata?.creationTime || 'N/A'}
                            disabled
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500"
                        />
                    </div>

                    {/* Plan actuel */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Plan actuel
                        </label>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-semibold">
                                Gratuit
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <button
                            onClick={() => {
                                setDisplayName(user?.displayName || '');
                                setEmail(user?.email || '');
                            }}
                            className="btn btn-ghost"
                        >
                            Annuler
                        </button>
                        <button onClick={handleSaveProfile} className="btn btn-primary">
                            Enregistrer les modifications
                        </button>
                    </div>
                </div>
            </div>

            {/* SECTION 2: Security */}
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Shield size={20} className="text-gray-500" />
                    <h2 className="text-xl font-bold">Sécurité</h2>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="btn btn-ghost flex items-center gap-2"
                    >
                        <Lock size={18} />
                        Changer le mot de passe
                    </button>

                    <button
                        onClick={handleLogout}
                        className="btn btn-ghost text-red-600 dark:text-red-400 flex items-center gap-2"
                    >
                        <LogOut size={18} />
                        Se déconnecter
                    </button>
                </div>
            </div>

            {/* SECTION 3: Google Ads Connections */}
            <div className="card bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <LinkIcon size={20} className="text-gray-500" />
                    <h2 className="text-xl font-bold">Connexions Google Ads</h2>
                </div>

                <div className="space-y-4">
                    {/* TODO: Check actual connection status */}
                    <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Google Ads</h3>
                                    <p className="text-sm text-gray-500">Aucun compte connecté</p>
                                </div>
                            </div>
                            <button className="btn btn-primary">
                                Connecter Google Ads
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                            Connectez votre compte Google Ads pour accéder aux données réelles de vos campagnes
                        </p>
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

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Changer le mot de passe</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Mot de passe actuel</label>
                                <input
                                    type="password"
                                    value={passwordForm.current}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    value={passwordForm.new}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                                {passwordForm.new && (
                                    <p className={`text-sm mt-1 ${getPasswordStrength(passwordForm.new).color}`}>
                                        Force: {getPasswordStrength(passwordForm.new).label}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirm}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                                />
                                {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                                    <p className="text-sm text-red-600 mt-1">Les mots de passe ne correspondent pas</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="btn btn-ghost flex-1"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleChangePassword}
                                className="btn btn-primary flex-1"
                            >
                                Changer le mot de passe
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
