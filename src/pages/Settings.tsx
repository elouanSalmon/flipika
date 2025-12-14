import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Moon, Sun, LogOut, User, Shield, Palette, Camera, Lock,
    Link as LinkIcon, Check, X, Eye, EyeOff, AlertCircle,
    CheckCircle, XCircle, Info, Zap, TestTube, Settings as SettingsIcon
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
            // TODO: Implement Firebase profile update
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
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
            // TODO: Implement password change
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                        <SettingsIcon size={32} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Paramètres
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Gérez votre compte et vos préférences
                    </p>
                </motion.div>

                {/* SECTION 1: Account Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <User size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Informations du compte</h2>
                                <p className="text-blue-100 text-sm">Gérez vos informations personnelles</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Photo de profil */}
                        <div className="flex items-center gap-6">
                            <motion.div
                                className="relative group"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 p-1">
                                    <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                        {photoURL ? (
                                            <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <label className="absolute bottom-0 right-0 p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full cursor-pointer hover:shadow-lg transition-all group-hover:scale-110">
                                    <Camera size={18} className="text-white" />
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                    />
                                </label>
                            </motion.div>
                            <div>
                                <h3 className="font-bold text-lg">Photo de profil</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    JPG, PNG ou WEBP. Max 5MB.
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                    Recommandé : 400x400px minimum
                                </p>
                            </div>
                        </div>

                        {/* Form fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nom d'affichage */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Nom d'affichage
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="Votre nom"
                                    />
                                    {displayName && (
                                        <CheckCircle size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Email
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                    {email && (
                                        <CheckCircle size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                                    <AlertCircle size={14} />
                                    <span>Changer l'email nécessite une nouvelle vérification</span>
                                </div>
                            </div>

                            {/* Compte créé le */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Membre depuis
                                </label>
                                <div className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Plan actuel */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Plan actuel
                                </label>
                                <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700">
                                    <div className="flex items-center gap-2">
                                        <Zap size={18} className="text-green-600 dark:text-green-400" />
                                        <span className="font-bold text-green-700 dark:text-green-300">Gratuit</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <AnimatePresence>
                            {hasChanges && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-600"
                                >
                                    <button
                                        onClick={() => {
                                            setDisplayName(user?.displayName || '');
                                            setEmail(user?.email || '');
                                        }}
                                        className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Enregistrement...
                                            </>
                                        ) : (
                                            <>
                                                <Check size={20} />
                                                Enregistrer les modifications
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* SECTION 2: Security */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Sécurité</h2>
                                <p className="text-red-100 text-sm">Protégez votre compte</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-500 transition-colors">
                                    <Lock size={20} className="text-blue-600 dark:text-blue-400 group-hover:text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold">Changer le mot de passe</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Dernière modification il y a 30 jours</p>
                                </div>
                            </div>
                            <div className="text-gray-400 group-hover:text-blue-500 transition-colors">→</div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className="w-full p-4 rounded-xl border-2 border-red-200 dark:border-red-900/50 hover:border-red-500 dark:hover:border-red-500 transition-all flex items-center justify-between group bg-red-50 dark:bg-red-900/10"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-500 transition-colors">
                                    <LogOut size={20} className="text-red-600 dark:text-red-400 group-hover:text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-red-700 dark:text-red-400">Se déconnecter</p>
                                    <p className="text-sm text-red-600 dark:text-red-500">Déconnexion de votre compte</p>
                                </div>
                            </div>
                            <div className="text-red-400 group-hover:text-red-500 transition-colors">→</div>
                        </motion.button>
                    </div>
                </motion.div>

                {/* SECTION 3: Google Ads Connection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
                        <div className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <LinkIcon size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Connexions</h2>
                                <p className="text-green-100 text-sm">Gérez vos intégrations</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center p-2">
                                        <svg className="w-full h-full" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Google Ads</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Non connecté</p>
                                        </div>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all"
                                >
                                    Connecter
                                </motion.button>
                            </div>
                            <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                <Info size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Connectez votre compte Google Ads pour accéder aux données réelles de vos campagnes et bénéficier d'analyses approfondies.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Demo Mode & Appearance - Side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Demo Mode */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
                            <div className="flex items-center gap-3 text-white">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <TestTube size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Mode Démo</h2>
                                    <p className="text-purple-100 text-sm">Données fictives</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Main Toggle */}
                            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                                <div className="flex-1">
                                    <p className="font-semibold text-purple-900 dark:text-purple-100">Activer</p>
                                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                        Testez avec des données fictives
                                    </p>
                                </div>
                                <button
                                    onClick={toggleDemoMode}
                                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all ${isDemoMode ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                >
                                    <motion.span
                                        animate={{ x: isDemoMode ? 36 : 4 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="inline-block h-6 w-6 rounded-full bg-white shadow-lg"
                                    />
                                </button>
                            </div>

                            {/* Advanced Settings */}
                            <AnimatePresence>
                                {isDemoMode && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                                    >
                                        <div>
                                            <label className="block text-sm font-semibold mb-2">
                                                Comptes ({demoSettings.accountCount})
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="10"
                                                value={demoSettings.accountCount}
                                                onChange={(e) => updateDemoSettings({ accountCount: parseInt(e.target.value) })}
                                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold mb-2">Complexité</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['simple', 'medium', 'advanced'] as const).map((level) => (
                                                    <button
                                                        key={level}
                                                        onClick={() => updateDemoSettings({ complexity: level })}
                                                        className={`p-2 rounded-lg text-xs font-semibold transition-all ${demoSettings.complexity === level
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                            }`}
                                                    >
                                                        {level === 'simple' ? 'Simple' : level === 'medium' ? 'Moyen' : 'Avancé'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold mb-2">Secteur</label>
                                            <select
                                                value={demoSettings.industry}
                                                onChange={(e) => updateDemoSettings({ industry: e.target.value as any })}
                                                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
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
                                            className="w-full p-2 rounded-lg border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-sm font-semibold"
                                        >
                                            Réinitialiser
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Appearance */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-orange-500 to-yellow-600 p-6">
                            <div className="flex items-center gap-3 text-white">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Palette size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Apparence</h2>
                                    <p className="text-orange-100 text-sm">Personnalisez le thème</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        {theme === 'light' ? (
                                            <Sun size={20} className="text-orange-600 dark:text-orange-400" />
                                        ) : (
                                            <Moon size={20} className="text-orange-600 dark:text-orange-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold">Thème</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {theme === 'light' ? 'Mode clair' : 'Mode sombre'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className="relative inline-flex h-8 w-16 items-center rounded-full bg-gradient-to-r from-orange-400 to-yellow-500"
                                >
                                    <motion.span
                                        animate={{ x: theme === 'dark' ? 36 : 4 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="inline-block h-6 w-6 rounded-full bg-white shadow-lg flex items-center justify-center"
                                    >
                                        {theme === 'light' ? (
                                            <Sun size={14} className="text-orange-500" />
                                        ) : (
                                            <Moon size={14} className="text-blue-500" />
                                        )}
                                    </motion.span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Password Change Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPasswordModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold">Changer le mot de passe</h3>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Current password */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Mot de passe actuel</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.current ? "text" : "password"}
                                            value={passwordForm.current}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                            className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                        >
                                            {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New password */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Nouveau mot de passe</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.new ? "text" : "password"}
                                            value={passwordForm.new}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                            className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                        >
                                            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordForm.new && (
                                        <div className="mt-2 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${passwordStrength.score}%` }}
                                                        className={`h-full ${passwordStrength.color}`}
                                                    />
                                                </div>
                                                <span className={`text-xs font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Min 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm password */}
                                <div>
                                    <label className="block text-sm font-semibold mb-2">Confirmer le mot de passe</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirm ? "text" : "password"}
                                            value={passwordForm.confirm}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                            className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                        >
                                            {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                            <XCircle size={14} />
                                            Les mots de passe ne correspondent pas
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all"
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
