import { useState } from 'react';
import { Shield, Lock, LogOut, ChevronRight, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const SecurityCard = () => {
    const { logout, hasPasswordProvider, createPassword, changePassword } = useAuth();
    const navigate = useNavigate();
    const hasPassword = hasPasswordProvider();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
    const [passwordForm, setPasswordForm] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Erreur lors de la déconnexion');
        }
    };

    const handlePasswordSubmit = async () => {
        if (passwordForm.new !== passwordForm.confirm) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }
        if (passwordForm.new.length < 8) {
            toast.error('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }
        try {
            if (hasPassword) {
                // Change existing password
                if (!passwordForm.current) {
                    toast.error('Veuillez entrer votre mot de passe actuel');
                    return;
                }
                await changePassword(passwordForm.current, passwordForm.new);
                toast.success('Mot de passe modifié avec succès');
            } else {
                // Create new password
                await createPassword(passwordForm.new);
                toast.success('Mot de passe créé avec succès');
            }
            setShowPasswordModal(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
        } catch (error: any) {
            console.error('Password operation error:', error);
            if (error.code === 'auth/wrong-password') {
                toast.error('Mot de passe actuel incorrect');
            } else if (error.code === 'auth/weak-password') {
                toast.error('Le mot de passe est trop faible');
            } else {
                toast.error(hasPassword ? 'Erreur lors du changement de mot de passe' : 'Erreur lors de la création du mot de passe');
            }
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
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-blue-500/10 dark:border-blue-500/20 p-6 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
            >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-lg border border-blue-500/20">
                        <Shield size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    Sécurité
                </h2>

                <div className="space-y-3">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-blue-500/20 dark:border-blue-500/30 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-gray-700/50 hover:border-blue-500/30 dark:hover:border-blue-500/40 transition-all duration-300 shadow-lg shadow-blue-500/5 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-lg group-hover:from-blue-500/20 group-hover:to-blue-600/20 dark:group-hover:from-blue-500/30 dark:group-hover:to-blue-600/30 transition-all duration-300 border border-blue-500/20">
                                <Lock size={18} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {hasPassword ? 'Changer le mot de passe' : 'Créer un mot de passe'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {hasPassword ? 'Modifié il y a 30 jours' : 'Ajoutez une méthode d\'authentification alternative'}
                                </p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-blue-500/50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-red-500/20 dark:border-red-500/30 bg-red-50/30 dark:bg-red-900/10 backdrop-blur-sm hover:bg-red-50/50 dark:hover:bg-red-900/20 hover:border-red-500/30 dark:hover:border-red-500/40 transition-all duration-300 shadow-lg shadow-red-500/5 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 rounded-lg group-hover:from-red-500/20 group-hover:to-red-600/20 dark:group-hover:from-red-500/30 dark:group-hover:to-red-600/30 transition-all duration-300 border border-red-500/20">
                                <LogOut size={18} className="text-red-600 dark:text-red-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-red-700 dark:text-red-400">Se déconnecter</p>
                                <p className="text-sm text-red-600 dark:text-red-500">Déconnexion de votre compte</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-red-500/50 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300" />
                    </button>
                </div>
            </motion.div>

            {/* Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        onClick={() => setShowPasswordModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full shadow-2xl border border-blue-500/20 dark:border-blue-500/30"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {hasPassword ? 'Changer le mot de passe' : 'Créer un mot de passe'}
                                </h3>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                                >
                                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {hasPassword && (
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Mot de passe actuel</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword.current ? "text" : "password"}
                                                value={passwordForm.current}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                                className="w-full px-4 py-3 pr-10 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-blue-500/30 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-lg shadow-blue-500/10 transition-all duration-300 hover:border-blue-500/40 dark:hover:border-blue-500/50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500/70 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                                            >
                                                {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Nouveau mot de passe</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.new ? "text" : "password"}
                                            value={passwordForm.new}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                            className="w-full px-4 py-3 pr-10 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-blue-500/30 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-lg shadow-blue-500/10 transition-all duration-300 hover:border-blue-500/40 dark:hover:border-blue-500/50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500/70 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                                        >
                                            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordForm.new && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                        style={{ width: `${passwordStrength.score}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{passwordStrength.label}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Min 8 caractères, 1 majuscule, 1 chiffre, 1 spécial
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Confirmer</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirm ? "text" : "password"}
                                            value={passwordForm.confirm}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                            className="w-full px-4 py-3 pr-10 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-blue-500/30 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-lg shadow-blue-500/10 transition-all duration-300 hover:border-blue-500/40 dark:hover:border-blue-500/50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500/70 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                                        >
                                            {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">Les mots de passe ne correspondent pas</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <motion.button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all duration-200 font-semibold text-gray-700 dark:text-gray-300"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Annuler
                                </motion.button>
                                <motion.button
                                    onClick={handlePasswordSubmit}
                                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {hasPassword ? 'Changer' : 'Créer'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SecurityCard;
