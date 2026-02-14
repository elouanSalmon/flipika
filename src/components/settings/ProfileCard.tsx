import { User, Mail, Building, FileText, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { checkUsernameAvailability } from '../../services/userProfileService';
import { validateUsername, normalizeUsername } from '../../types/userProfile';
import toast from 'react-hot-toast';

const ProfileCard = () => {
    const { t } = useTranslation('settings');
    const { currentUser, userProfile, updateProfile, profileLoading } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        company: '',
        description: '',
        email: ''
    });

    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [usernameChecking, setUsernameChecking] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load profile data when available
    useEffect(() => {
        if (userProfile) {
            setFormData({
                username: userProfile.username || '',
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
                company: userProfile.company || '',
                description: userProfile.description || '',
                email: userProfile.email || currentUser?.email || ''
            });
        } else if (currentUser?.email) {
            setFormData(prev => ({ ...prev, email: currentUser.email || '' }));
        }
    }, [userProfile, currentUser]);

    // Check username availability
    const checkUsername = async (value: string) => {
        if (!userProfile || value === userProfile.username) {
            setUsernameAvailable(true);
            return;
        }

        const normalized = normalizeUsername(value);
        const validation = validateUsername(normalized);

        if (!validation.valid) {
            setUsernameAvailable(false);
            setErrors({ ...errors, username: validation.error || t('profile.errors.invalidUsername') });
            return;
        }

        setUsernameChecking(true);
        setErrors({ ...errors, username: '' });

        try {
            const available = await checkUsernameAvailability(normalized);
            setUsernameAvailable(available);
            if (!available) {
                setErrors({ ...errors, username: t('profile.errors.usernameTaken') });
            }
        } catch (error) {
            console.error('Error checking username:', error);
            setUsernameAvailable(false);
        } finally {
            setUsernameChecking(false);
        }
    };

    const handleUsernameChange = (value: string) => {
        setFormData({ ...formData, username: value });
        setUsernameAvailable(null);

        // Debounce check
        const timeoutId = setTimeout(() => {
            if (value.length >= 3) {
                checkUsername(value);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = t('profile.errors.firstNameRequired');
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = t('profile.errors.lastNameRequired');
        }
        if (!formData.username.trim()) {
            newErrors.username = t('profile.errors.usernameRequired');
        } else if (usernameAvailable === false) {
            newErrors.username = t('profile.errors.usernameNotAvailable');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await updateProfile({
                username: normalizeUsername(formData.username),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                company: formData.company.trim() || undefined,
                description: formData.description.trim() || undefined,
            });

            toast.success(t('profile.toast.updated'));
            setIsEditing(false);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.message || t('profile.toast.updateError'));
        } finally {
            setLoading(false);
        }
    };

    if (profileLoading) {
        return (
            <div className="bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 shadow-lg">
                <div className="flex items-center justify-center py-8">
                    <Loader2 size={32} className="text-primary animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-2xl border border-primary/10 dark:border-primary/20 p-6 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
        >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-neutral-900 dark:text-neutral-200">
                <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/10 dark:from-primary/20 dark:to-primary/20 rounded-lg border border-primary/20">
                    <User size={20} className="text-primary dark:text-primary-light" />
                </div>
                {t('profile.title')}
            </h2>

            <div className="space-y-4">
                {/* Username */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        {t('profile.labels.username')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 dark:text-primary-light/70 pointer-events-none transition-all duration-300" />
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            disabled={!isEditing}
                            className={`w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 ${errors.username
                                ? 'border-red-500'
                                : usernameAvailable === true && isEditing
                                    ? 'border-green-500'
                                    : 'border-primary/30 dark:border-primary/40'
                                } rounded-xl text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/40 dark:hover:border-primary/50 disabled:opacity-60 disabled:cursor-not-allowed`}
                        />
                        {usernameChecking && (
                            <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin" />
                        )}
                        {!usernameChecking && usernameAvailable === true && isEditing && (
                            <Check size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                        )}
                    </div>
                    {errors.username && (
                        <p className="mt-2 text-sm text-red-500">{errors.username}</p>
                    )}
                    {!errors.username && formData.username && (
                        <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                            {t('profile.shareLink', { username: formData.username })}
                        </p>
                    )}
                </div>

                {/* First Name */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        {t('profile.labels.firstName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 ${errors.firstName ? 'border-red-500' : 'border-primary/30 dark:border-primary/40'
                            } rounded-xl text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/40 dark:hover:border-primary/50 disabled:opacity-60 disabled:cursor-not-allowed`}
                    />
                    {errors.firstName && (
                        <p className="mt-2 text-sm text-red-500">{errors.firstName}</p>
                    )}
                </div>

                {/* Last Name */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        {t('profile.labels.lastName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 ${errors.lastName ? 'border-red-500' : 'border-primary/30 dark:border-primary/40'
                            } rounded-xl text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/40 dark:hover:border-primary/50 disabled:opacity-60 disabled:cursor-not-allowed`}
                    />
                    {errors.lastName && (
                        <p className="mt-2 text-sm text-red-500">{errors.lastName}</p>
                    )}
                </div>

                {/* Email (read-only) */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        {t('profile.labels.email')}
                    </label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 dark:text-primary-light/70 pointer-events-none transition-all duration-300" />
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-primary/30 dark:border-primary/40 rounded-xl text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 dark:placeholder-neutral-400 opacity-60 cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Company (optional) */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        {t('profile.labels.company')} <span className="text-neutral-400 text-xs">({t('profile.optional')})</span>
                    </label>
                    <div className="relative">
                        <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70 dark:text-primary-light/70 pointer-events-none transition-all duration-300" />
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            disabled={!isEditing}
                            className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-primary/30 dark:border-primary/40 rounded-xl text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/40 dark:hover:border-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Description (optional) */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        {t('profile.labels.description')} <span className="text-neutral-400 text-xs">({t('profile.optional')})</span>
                    </label>
                    <div className="relative">
                        <FileText size={18} className="absolute left-4 top-4 text-primary/70 dark:text-primary-light/70 pointer-events-none transition-all duration-300" />
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            disabled={!isEditing}
                            rows={3}
                            maxLength={500}
                            className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-primary/30 dark:border-primary/40 rounded-xl text-neutral-900 dark:text-neutral-200 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/40 dark:hover:border-primary/50 disabled:opacity-60 disabled:cursor-not-allowed resize-none"
                        />
                    </div>
                    {isEditing && (
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 text-right">
                            {t('profile.characterCount', { count: formData.description.length, max: 500 })}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    {!isEditing ? (
                        <motion.button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary w-full"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {t('profile.buttons.edit')}
                        </motion.button>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setErrors({});
                                    // Reset form data
                                    if (userProfile) {
                                        setFormData({
                                            username: userProfile.username || '',
                                            firstName: userProfile.firstName || '',
                                            lastName: userProfile.lastName || '',
                                            company: userProfile.company || '',
                                            description: userProfile.description || '',
                                            email: userProfile.email || currentUser?.email || ''
                                        });
                                    }
                                }}
                                disabled={loading}
                                className="btn btn-secondary flex-1"
                            >
                                {t('profile.buttons.cancel')}
                            </button>
                            <motion.button
                                onClick={handleSave}
                                disabled={loading || usernameChecking || usernameAvailable === false}
                                className="btn btn-primary flex-1"
                                whileHover={{ scale: loading ? 1 : 1.01 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        {t('profile.buttons.saving')}
                                    </>
                                ) : (
                                    t('profile.buttons.save')
                                )}
                            </motion.button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileCard;
