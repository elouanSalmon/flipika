import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building, FileText, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createUserProfile, checkUsernameAvailability } from '../../services/userProfileService';
import { validateUsername, normalizeUsername } from '../../types/userProfile';
import toast from 'react-hot-toast';

interface OnboardingModalProps {
    onComplete: () => void;
}

type Step = 'welcome' | 'username' | 'details' | 'complete';

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
    const { currentUser, refreshProfile } = useAuth();
    const [currentStep, setCurrentStep] = useState<Step>('welcome');
    const [loading, setLoading] = useState(false);

    // Form data
    const [username, setUsername] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [usernameChecking, setUsernameChecking] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [company, setCompany] = useState('');
    const [description, setDescription] = useState('');

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Check username availability with debounce
    const checkUsername = async (value: string) => {
        const normalized = normalizeUsername(value);
        const validation = validateUsername(normalized);

        if (!validation.valid) {
            setUsernameAvailable(false);
            setErrors({ ...errors, username: validation.error || 'Invalid username' });
            return;
        }

        setUsernameChecking(true);
        setErrors({ ...errors, username: '' });

        try {
            const available = await checkUsernameAvailability(normalized);
            setUsernameAvailable(available);
            if (!available) {
                setErrors({ ...errors, username: 'Username is already taken' });
            }
        } catch (error) {
            console.error('Error checking username:', error);
            setUsernameAvailable(false);
        } finally {
            setUsernameChecking(false);
        }
    };

    const handleUsernameChange = (value: string) => {
        setUsername(value);
        setUsernameAvailable(null);

        // Debounce check
        const timeoutId = setTimeout(() => {
            if (value.length >= 3) {
                checkUsername(value);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    };

    const validateDetailsForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!currentUser || !currentUser.email) {
            toast.error('User not authenticated');
            return;
        }

        if (!validateDetailsForm()) {
            return;
        }

        setLoading(true);

        try {
            await createUserProfile(currentUser.uid, {
                email: currentUser.email,
                username: normalizeUsername(username),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                company: company.trim() || undefined,
                description: description.trim() || undefined,
                photoURL: currentUser.photoURL || undefined,
            });

            await refreshProfile();
            setCurrentStep('complete');

            setTimeout(() => {
                onComplete();
            }, 2000);
        } catch (error: any) {
            console.error('Error creating profile:', error);
            toast.error(error.message || 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 'welcome':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center py-8"
                    >
                        <div className="mb-6">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <User size={40} className="text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                            Bienvenue sur Flipika !
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            Configurons votre profil en quelques étapes rapides pour commencer à créer des rapports Google Ads professionnels.
                        </p>
                        <button
                            onClick={() => setCurrentStep('username')}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30"
                        >
                            Commencer
                        </button>
                    </motion.div>
                );

            case 'username':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="py-6"
                    >
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                            Choisissez votre identifiant
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Votre identifiant unique sera utilisé pour partager vos rapports via des URLs personnalisées.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Identifiant unique
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => handleUsernameChange(e.target.value)}
                                    placeholder="mon-identifiant"
                                    className={`w-full px-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 ${errors.username
                                        ? 'border-red-500'
                                        : usernameAvailable === true
                                            ? 'border-green-500'
                                            : 'border-blue-500/30 dark:border-blue-500/40'
                                        } rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300`}
                                />
                                {usernameChecking && (
                                    <Loader2 size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />
                                )}
                                {!usernameChecking && usernameAvailable === true && (
                                    <Check size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                                )}
                            </div>
                            {errors.username && (
                                <p className="mt-2 text-sm text-red-500">{errors.username}</p>
                            )}
                            {usernameAvailable === true && (
                                <p className="mt-2 text-sm text-green-500">✓ Identifiant disponible</p>
                            )}
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                3-30 caractères, lettres minuscules, chiffres, tirets et underscores uniquement
                            </p>
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Vos rapports seront partagés via :<br />
                                    <span className="font-mono text-blue-600 dark:text-blue-400">
                                        flipika.com/report/{username || 'votre-identifiant'}/...
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setCurrentStep('welcome')}
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                            >
                                Retour
                            </button>
                            <button
                                onClick={() => setCurrentStep('details')}
                                disabled={!usernameAvailable || usernameChecking}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/30"
                            >
                                Continuer
                            </button>
                        </div>
                    </motion.div>
                );

            case 'details':
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="py-6"
                    >
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                            Complétez votre profil
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Ces informations apparaîtront sur vos rapports partagés.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Prénom <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Jean"
                                    className={`w-full px-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 ${errors.firstName ? 'border-red-500' : 'border-blue-500/30 dark:border-blue-500/40'
                                        } rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300`}
                                />
                                {errors.firstName && (
                                    <p className="mt-2 text-sm text-red-500">{errors.firstName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Nom <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Dupont"
                                    className={`w-full px-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 ${errors.lastName ? 'border-red-500' : 'border-blue-500/30 dark:border-blue-500/40'
                                        } rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300`}
                                />
                                {errors.lastName && (
                                    <p className="mt-2 text-sm text-red-500">{errors.lastName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Entreprise <span className="text-gray-400 text-xs">(optionnel)</span>
                                </label>
                                <div className="relative">
                                    <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/70 dark:text-blue-400/70 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="Mon Agence"
                                        className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-blue-500/30 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Description <span className="text-gray-400 text-xs">(optionnel)</span>
                                </label>
                                <div className="relative">
                                    <FileText size={18} className="absolute left-4 top-4 text-blue-500/70 dark:text-blue-400/70 pointer-events-none" />
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Media Buyer spécialisé en e-commerce..."
                                        rows={3}
                                        maxLength={500}
                                        className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-blue-500/30 dark:border-blue-500/40 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 resize-none"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                                    {description.length}/500
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setCurrentStep('username')}
                                disabled={loading}
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-all duration-200"
                            >
                                Retour
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Création...
                                    </>
                                ) : (
                                    'Terminer'
                                )}
                            </button>
                        </div>
                    </motion.div>
                );

            case 'complete':
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                    >
                        <div className="mb-6">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                <Check size={40} className="text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                            Profil créé avec succès !
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Vous allez être redirigé vers l'application...
                        </p>
                    </motion.div>
                );
        }
    };

    // Progress indicator
    const steps = ['welcome', 'username', 'details', 'complete'];
    const currentStepIndex = steps.indexOf(currentStep);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Progress bar */}
                <div className="h-1 bg-gray-200 dark:bg-gray-700">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingModal;
