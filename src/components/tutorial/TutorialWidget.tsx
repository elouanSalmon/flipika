import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle,
    Circle,
    ChevronDown,
    X,
    Rocket,
    Calendar,
    FileText,
    Mail,
    Plus,
    Palette,
    LayoutTemplate,
    Info,
    Clock,
    Sparkles
} from 'lucide-react';
import { useTutorial } from '../../contexts/TutorialContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from '../common/ConfirmationModal';
import InfoModal from '../common/InfoModal';

export const TutorialWidget = () => {
    const { t } = useTranslation(['tutorial', 'clients', 'themes', 'templates', 'schedules', 'reports']);
    const { status, isLoading, dismissTutorial } = useTutorial();
    const { userProfile, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [isExpanded, setIsExpanded] = useState(true);
    const [showConfirmDismiss, setShowConfirmDismiss] = useState(false);
    const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);

    if (isLoading) return null;

    // Logic to determine visibility:
    // Show if profile allows it AND context agrees not dismissed
    // Safe check: ensure status exists
    const shouldShow = userProfile && !userProfile.hasCompletedTutorial && status && !status.isDismissed;

    if (!shouldShow) return null;

    // Type assertion or safe status access since we checked status above
    const currentStatus = status!;

    const steps = [
        {
            id: 'createClient',
            statusKey: 'hasClient',
            path: '/app/clients',
            icon: <Plus size={16} />,
            infoNamespace: 'clients',
            estimatedMinutes: 2
        },
        {
            id: 'createTheme',
            statusKey: 'hasTheme',
            path: '/app/themes',
            icon: <Palette size={16} />,
            infoNamespace: 'themes',
            estimatedMinutes: 3
        },
        {
            id: 'createTemplate',
            statusKey: 'hasTemplate',
            path: '/app/templates',
            icon: <LayoutTemplate size={16} />,
            infoNamespace: 'templates',
            estimatedMinutes: 2
        },
        {
            id: 'createSchedule',
            statusKey: 'hasSchedule',
            path: '/app/schedules',
            icon: <Calendar size={16} />,
            infoNamespace: 'schedules',
            estimatedMinutes: 2
        },
        {
            id: 'generateReport',
            statusKey: 'hasGeneratedReport',
            path: '/app/reports',
            icon: <FileText size={16} />,
            infoNamespace: 'reports',
            estimatedMinutes: 1
        },
        {
            id: 'sendReport',
            statusKey: 'hasSentReport',
            path: '/app/reports',
            icon: <Mail size={16} />,
            infoNamespace: 'reports',
            estimatedMinutes: 1
        }
    ];

    const completedSteps = steps.filter(s => currentStatus.steps[s.statusKey as keyof typeof currentStatus.steps]).length;
    const progress = Math.round((completedSteps / steps.length) * 100);
    const isComplete = completedSteps === steps.length;

    // Calculate estimated time remaining
    const remainingMinutes = steps
        .filter(s => !currentStatus.steps[s.statusKey as keyof typeof currentStatus.steps])
        .reduce((sum, step) => sum + step.estimatedMinutes, 0);

    const handleAction = (path: string) => {
        navigate(path);
        // On mobile, maybe minimize after navigate?
        if (window.innerWidth < 768) {
            setIsExpanded(false);
        }
    };

    const handleDismiss = async () => {
        try {
            await dismissTutorial();
            // Also update profile to ensure persistence
            if (userProfile) {
                await updateProfile({
                    hasCompletedTutorial: true
                });
            }
        } catch (error) {
            console.error('Error dismissing tutorial:', error);
        }
    };

    const getInfoModalContent = (namespace: string | null) => {
        if (!namespace) return null;
        return {
            title: t(`${namespace}:info.modalTitle`),
            content: t(`${namespace}:info.modalContent`)
        };
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className={`fixed right-4 bottom-24 z-40 flex flex-col items-end gap-2 transition-all duration-300 ${isExpanded ? 'w-[480px]' : 'w-auto'}`}
            >
                {/* Minimized State Button */}
                {!isExpanded && (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="bg-primary text-white w-[60px] h-[60px] rounded-full shadow-xl hover:bg-primary-dark transition-transform hover:scale-105 flex items-center justify-center relative"
                        title={t('tutorial:expand')}
                    >
                        <Rocket size={32} />
                        {progress > 0 && progress < 100 && (
                            <span className="absolute -top-1 -right-1 text-xs font-bold bg-white text-gray-900 px-1.5 py-0.5 rounded-full shadow-sm border border-gray-100">
                                {progress}%
                            </span>
                        )}
                    </button>
                )}

                {/* Expanded Card */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden w-full backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
                        >
                            {/* Header */}
                            <div className="px-4 py-3 bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                            <Rocket size={18} className="text-primary" />
                                            {t('tutorial:title')}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {completedSteps}/{steps.length} étapes complétées
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setIsExpanded(false)}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                                            title={t('tutorial:collapse')}
                                        >
                                            <ChevronDown size={18} />
                                        </button>
                                        <button
                                            onClick={() => isComplete && setShowConfirmDismiss(true)}
                                            disabled={!isComplete}
                                            className={`p-1 rounded-lg transition-colors ${isComplete
                                                ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500'
                                                : 'opacity-30 cursor-not-allowed text-gray-300 dark:text-gray-600'
                                                }`}
                                            title={isComplete ? t('tutorial:dismiss') : t('tutorial:cannotDismiss')}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Time Remaining Indicator */}
                                {remainingMinutes > 0 && !isComplete && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-1.5 rounded-lg shadow-sm border border-primary/20"
                                    >
                                        <Clock className="text-primary flex-shrink-0" size={14} />
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            Encore {remainingMinutes} min pour terminer
                                        </span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Progress Bar with Shimmer Effect */}
                            <div className="h-2 bg-gray-100 dark:bg-gray-700 w-full relative overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary to-primary-light relative overflow-hidden"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                >
                                    {/* Shimmer effect */}
                                    {progress > 0 && progress < 100 && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                            animate={{
                                                x: ['-100%', '100%']
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: 'linear'
                                            }}
                                        />
                                    )}
                                </motion.div>
                            </div>

                            {/* Steps List */}
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="p-2 space-y-1.5">
                                    {steps.map((step) => {
                                        const isCompleted = currentStatus.steps[step.statusKey as keyof typeof currentStatus.steps];
                                        return (
                                            <motion.div
                                                key={step.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${isCompleted
                                                    ? 'bg-green-50/50 dark:bg-green-900/10'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                    }`}
                                            >
                                                <div className="flex-shrink-0 relative">
                                                    <AnimatePresence mode="wait">
                                                        {isCompleted ? (
                                                            <motion.div
                                                                key="completed"
                                                                initial={{ scale: 0, rotate: -180 }}
                                                                animate={{ scale: 1, rotate: 0 }}
                                                                exit={{ scale: 0 }}
                                                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                                                className="text-green-500"
                                                            >
                                                                <CheckCircle size={20} />
                                                                {/* Confetti burst effect */}
                                                                <motion.div
                                                                    initial={{ scale: 1, opacity: 1 }}
                                                                    animate={{ scale: 2.5, opacity: 0 }}
                                                                    transition={{ duration: 0.6 }}
                                                                    className="absolute inset-0 rounded-full border-2 border-green-400"
                                                                />
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                key="incomplete"
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="text-gray-300 dark:text-gray-600"
                                                            >
                                                                <Circle size={20} />
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${isCompleted
                                                        ? 'text-gray-500 dark:text-gray-500 line-through decoration-gray-400'
                                                        : 'text-gray-700 dark:text-gray-200'
                                                        }`}>
                                                        {t(`tutorial:steps.${step.id}.label`)}
                                                    </p>

                                                    {!isCompleted && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleAction(step.path)}
                                                            className="text-xs text-primary font-medium mt-1 hover:underline flex items-center gap-1"
                                                        >
                                                            {step.icon}
                                                            {t(`tutorial:steps.${step.id}.action`)}
                                                        </motion.button>
                                                    )}
                                                    {isCompleted && (
                                                        <motion.p
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="text-xs text-green-600 dark:text-green-500 mt-1 font-medium"
                                                        >
                                                            ✓ Terminé
                                                        </motion.p>
                                                    )}
                                                </div>

                                                {/* Time Estimate Badge (only for incomplete steps) */}
                                                {!isCompleted && (
                                                    <div className="flex-shrink-0 flex items-center gap-1 bg-primary/10 dark:bg-primary/20 px-2.5 py-1.5 rounded-lg">
                                                        <Clock size={12} className="text-primary" />
                                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                            {step.estimatedMinutes} min
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Info Button */}
                                                {step.infoNamespace && (
                                                    <button
                                                        onClick={() => setActiveInfoModal(step.infoNamespace)}
                                                        className="flex-shrink-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-primary transition-colors"
                                                        title={t(`${step.infoNamespace}:info.buttonLabel`)}
                                                    >
                                                        <Info size={16} />
                                                    </button>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer - Success Message with Celebration */}
                            {isComplete && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 text-center border-t border-green-100 dark:border-green-900/20"
                                >
                                    <motion.div
                                        animate={{
                                            rotate: [0, 10, -10, 10, 0],
                                            scale: [1, 1.1, 1, 1.1, 1]
                                        }}
                                        transition={{
                                            duration: 0.6,
                                            repeat: 2,
                                            repeatDelay: 0.3
                                        }}
                                        className="inline-flex items-center gap-2"
                                    >
                                        <Sparkles className="text-yellow-500" size={20} />
                                        <p className="text-sm font-bold text-green-700 dark:text-green-400">
                                            🎉 {t('tutorial:completed')}
                                        </p>
                                        <Sparkles className="text-yellow-500" size={20} />
                                    </motion.div>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-xs text-gray-600 dark:text-gray-400 mt-1"
                                    >
                                        Vous êtes maintenant un expert Flipika! 🚀
                                    </motion.p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmDismiss}
                onClose={() => setShowConfirmDismiss(false)}
                onConfirm={handleDismiss}
                title={t('tutorial:confirmDismiss.title')}
                message={t('tutorial:confirmDismiss.message')}
                confirmLabel={t('tutorial:confirmDismiss.confirm')}
                cancelLabel={t('tutorial:confirmDismiss.cancel')}
            />

            {/* Info Modals */}
            {activeInfoModal && (
                <InfoModal
                    isOpen={true}
                    onClose={() => setActiveInfoModal(null)}
                    title={getInfoModalContent(activeInfoModal)?.title || ''}
                    content={getInfoModalContent(activeInfoModal)?.content || ''}
                />
            )}
        </>
    );
};
