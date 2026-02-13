import { useState } from 'react';
import { Shield, Lock, LogOut, ChevronRight, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const SecurityCard = () => {
    const { t } = useTranslation('settings');
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
            toast.error(t('security.errors.logout'));
        }
    };

    const handlePasswordSubmit = async () => {
        if (passwordForm.new !== passwordForm.confirm) {
            toast.error(t('security.errors.passwordMismatch'));
            return;
        }
        if (passwordForm.new.length < 8) {
            toast.error(t('security.errors.passwordTooShort'));
            return;
        }
        try {
            if (hasPassword) {
                // Change existing password
                if (!passwordForm.current) {
                    toast.error(t('security.errors.currentPasswordRequired'));
                    return;
                }
                await changePassword(passwordForm.current, passwordForm.new);
                toast.success(t('security.toast.passwordChanged'));
            } else {
                // Create new password
                await createPassword(passwordForm.new);
                toast.success(t('security.toast.passwordCreated'));
            }
            setShowPasswordModal(false);
            setPasswordForm({ current: '', new: '', confirm: '' });
        } catch (error: any) {
            console.error('Password operation error:', error);
            if (error.code === 'auth/wrong-password') {
                toast.error(t('security.errors.wrongPassword'));
            } else if (error.code === 'auth/weak-password') {
                toast.error(t('security.errors.weakPassword'));
            } else {
                toast.error(hasPassword ? t('security.errors.changePasswordError') : t('security.errors.createPasswordError'));
            }
        }
    };

    const getPasswordStrength = (password: string): { label: string; color: string; score: number } => {
        if (password.length === 0) return { label: '', color: '', score: 0 };
        if (password.length < 8) return { label: t('security.passwordStrength.weak'), color: 'bg-red-500', score: 25 };

        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*]/.test(password);

        const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

        if (score === 3) return { label: t('security.passwordStrength.strong'), color: 'bg-green-500', score: 100 };
        if (score >= 1) return { label: t('security.passwordStrength.medium'), color: 'bg-orange-500', score: 60 };
        return { label: t('security.passwordStrength.weak'), color: 'bg-red-500', score: 25 };
    };

    const passwordStrength = getPasswordStrength(passwordForm.new);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white/50 dark:bg-neutral-800/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
            >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                    <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/10 dark:from-primary/20 dark:to-primary/20 rounded-lg border border-primary/20">
                        <Shield size={20} className="text-primary dark:text-primary-light" />
                    </div>
                    {t('security.title')}
                </h2>

                <div className="space-y-3">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-primary/20 dark:border-primary/30 bg-white/30 dark:bg-neutral-700/30 backdrop-blur-sm hover:bg-white/50 dark:hover:bg-neutral-700/50 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-300 shadow-lg shadow-primary/5 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/10 dark:from-primary/20 dark:to-primary/20 rounded-lg group-hover:from-primary/20 group-hover:to-primary/20 dark:group-hover:from-primary/30 dark:group-hover:to-primary/30 transition-all duration-300 border border-primary/20">
                                <Lock size={18} className="text-primary dark:text-primary-light" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    {hasPassword ? t('security.password.change') : t('security.password.create')}
                                </p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {hasPassword ? t('security.password.lastModified') : t('security.password.addAlternative')}
                                </p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-primary/50 group-hover:text-primary dark:group-hover:text-primary-light transition-colors duration-300" />
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
                                <p className="font-semibold text-red-700 dark:text-red-400">{t('security.logout.title')}</p>
                                <p className="text-sm text-red-600 dark:text-red-500">{t('security.logout.description')}</p>
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
                            className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full shadow-2xl border border-primary/20 dark:border-primary/30"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {hasPassword ? t('security.modal.changePassword') : t('security.modal.createPassword')}
                                </h3>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="p-2 hover:bg-neutral-100/50 dark:hover:bg-neutral-700/50 rounded-lg transition-colors duration-200"
                                >
                                    <X size={20} className="text-neutral-500 dark:text-neutral-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {hasPassword && (
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">{t('security.modal.currentPassword')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword.current ? "text" : "password"}
                                                value={passwordForm.current}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                                className="w-full px-4 py-3 pr-10 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-primary/30 dark:border-primary/40 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/40 dark:hover:border-primary/50"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/70 hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
                                            >
                                                {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">{t('security.modal.newPassword')}</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.new ? "text" : "password"}
                                            value={passwordForm.new}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                            className="w-full px-4 py-3 pr-10 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-primary/30 dark:border-primary/40 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/40 dark:hover:border-primary/50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/70 hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
                                        >
                                            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordForm.new && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                        style={{ width: `${passwordStrength.score}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{passwordStrength.label}</span>
                                            </div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {t('security.modal.passwordRequirements')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-neutral-700 dark:text-neutral-300">{t('security.modal.confirmPassword')}</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirm ? "text" : "password"}
                                            value={passwordForm.confirm}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                            className="w-full px-4 py-3 pr-10 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-primary/30 dark:border-primary/40 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/40 dark:hover:border-primary/50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/70 hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
                                        >
                                            {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordForm.confirm && passwordForm.new !== passwordForm.confirm && (
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{t('security.modal.passwordMismatchError')}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    {t('security.modal.cancel')}
                                </button>
                                <button
                                    onClick={handlePasswordSubmit}
                                    className="btn btn-primary flex-1"
                                >
                                    {hasPassword ? t('security.modal.change') : t('security.modal.create')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SecurityCard;
