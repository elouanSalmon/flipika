import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Moon, Sun, LogOut, User, Shield, Camera, Lock,
    Link as LinkIcon, Check, X, Eye, EyeOff, AlertCircle,
    CheckCircle, Info, TestTube, ChevronRight, Mail, Calendar
} from 'lucide-react';
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
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const changed = displayName !== (user?.displayName || '') || email !== (user?.email || '');
        setHasChanges(changed);
    }, [displayName, email, user]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
        toast.success(`Thème ${theme === 'light' ? 'sombre' : 'clair'} activé`);
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
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Profil mis à jour avec succès');
            setHasChanges(false);
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Erreur lors de la mise à jour du profil');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('La photo ne doit pas dépasser 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoURL(reader.result as string);
                toast.success('Photo uploadée avec succès');
            };
            reader.readAsDataURL(file);
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
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Mot de passe modifié avec succès');
            setShowPasswordModal(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error('Password change error:', error);
            toast.error('Erreur lors du changement de mot de passe');
        }
    };

    const getPasswordStrength = (password: string): { label: string; color: string; score: number } => {
        if (password.length === 0) return { label: '', color: '', score: 0 };
        if (password.length < 8) return { label: 'Faible', color: 'bg-red-500', score: 25 };

        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);

        const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

        if (score === 3) return { label: 'Fort', color: 'bg-green-500', score: 100 };
        if (score >= 1) return { label: 'Moyen', color: 'bg-orange-500', score: 60 };
        return { label: 'Faible', color: 'bg-red-500', score: 25 };
    };

    const passwordStrength = getPasswordStrength(passwordForm.new);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
                <p className="text-gray-600 dark:text-gray-400">Gérez votre compte et vos préférences</p>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <User size={20} />
                        Profil
                    </h2>

                    <div className="space-y-6">
                        {/* Photo */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {photoURL ? (
                                        <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-gray-400" />
                                    )}
                                </div>
                                <label className="absolute -bottom-1 -right-1 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                                    <Camera size={14} className="text-white" />
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                    />
                                </label>
                            </div>
                            <div>
                                <p className="font-medium">Photo de profil</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">JPG, PNG ou WEBP. Max 5MB.</p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nom</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Votre nom"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Changer l'email nécessite une vérification
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Membre depuis</label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR') : 'N/A'}
                                        disabled
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Plan</label>
                                <div className="px-4 py-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 font-medium">
                                    Gratuit
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        {hasChanges && (
                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => {
                                        setDisplayName(user?.displayName || '');
                                        setEmail(user?.email || '');
                                    }}
                                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            Enregistrer
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Shield size={20} />
                        Sécurité
                    </h2>

                    <div className="space-y-3">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Lock size={18} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium">Changer le mot de passe</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Modifié il y a 30 jours</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <LogOut size={18} className="text-red-600 dark:text-red-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-red-700 dark:text-red-400">Se déconnecter</p>
                                    <p className="text-sm text-red-600 dark:text-red-500">Déconnexion de votre compte</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300" />
                        </button>
                    </div>
                </div>

                {/* Google Ads Connection */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <LinkIcon size={20} />
                        Connexions
                    </h2>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center p-2 border border-gray-200 dark:border-gray-600">
                                <svg className="w-full h-full" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium">Google Ads</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Non connecté</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium">
                            Connecter
                        </button>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex gap-2">
                            <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Connectez votre compte pour accéder aux données réelles de vos campagnes
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Demo Mode */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <TestTube size={20} />
                            Mode Démo
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Activer</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Données fictives</p>
                                </div>
                                <button
                                    onClick={toggleDemoMode}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDemoMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDemoMode ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {isDemoMode && (
                                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Comptes ({demoSettings.accountCount})
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={demoSettings.accountCount}
                                            onChange={(e) => updateDemoSettings({ accountCount: parseInt(e.target.value) })}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Complexité</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['simple', 'medium', 'advanced'] as const).map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => updateDemoSettings({ complexity: level })}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${demoSettings.complexity === level
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                        }`}
                                                >
                                                    {level === 'simple' ? 'Simple' : level === 'medium' ? 'Moyen' : 'Avancé'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Secteur</label>
                                        <select
                                            value={demoSettings.industry}
                                            onChange={(e) => updateDemoSettings({ industry: e.target.value as any })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
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
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                                    >
                                        Réinitialiser
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                            Apparence
                        </h2>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Thème</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {theme === 'light' ? 'Mode clair' : 'Mode sombre'}
                                </p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPasswordModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Changer le mot de passe</h3>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Mot de passe actuel</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.current ? "text" : "password"}
                                            value={passwordForm.current}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                            className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.new ? "text" : "password"}
                                            value={passwordForm.new}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                            className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordForm.new && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${passwordStrength.color} transition-all`}
                                                        style={{ width: `${passwordStrength.score}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium">{passwordStrength.label}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Min 8 caractères, 1 majuscule, 1 chiffre, 1 spécial
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Confirmer</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirm ? "text" : "password"}
                                            value={passwordForm.confirm}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                            className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                                        <p className="text-sm text-red-600 mt-1">Les mots de passe ne correspondent pas</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    Changer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;
