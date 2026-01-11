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
    LayoutTemplate
} from 'lucide-react';
import { useTutorial } from '../../contexts/TutorialContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from '../common/ConfirmationModal';

export const TutorialWidget = () => {
    const { t } = useTranslation(['tutorial']);
    const { status, isLoading, dismissTutorial } = useTutorial();
    const { userProfile, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [isExpanded, setIsExpanded] = useState(true);
    const [showConfirmDismiss, setShowConfirmDismiss] = useState(false);

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
            icon: <Plus size={16} />
        },
        {
            id: 'createTheme',
            statusKey: 'hasTheme',
            path: '/app/themes',
            icon: <Palette size={16} />
        },
        {
            id: 'createTemplate',
            statusKey: 'hasTemplate',
            path: '/app/templates',
            icon: <LayoutTemplate size={16} />
        },
        {
            id: 'createSchedule',
            statusKey: 'hasSchedule',
            path: '/app/schedules',
            icon: <Calendar size={16} />
        },
        {
            id: 'generateReport',
            statusKey: 'hasGeneratedReport',
            path: '/app/reports',
            icon: <FileText size={16} />
        },
        {
            id: 'sendReport',
            statusKey: 'hasSentReport',
            path: '/app/reports',
            icon: <Mail size={16} />
        }
    ];

    const completedSteps = steps.filter(s => currentStatus.steps[s.statusKey as keyof typeof currentStatus.steps]).length;
    const progress = Math.round((completedSteps / steps.length) * 100);
    const isComplete = completedSteps === steps.length;

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

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className={`fixed right-4 bottom-24 z-40 flex flex-col items-end gap-2 transition-all duration-300 ${isExpanded ? 'w-80' : 'w-auto'}`}
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
                            <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <Rocket size={18} className="text-primary" />
                                        {t('tutorial:title')}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {t('tutorial:description')}
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

                            {/* Progress Bar */}
                            <div className="h-1 bg-gray-100 dark:bg-gray-700 w-full">
                                <div
                                    className="h-full bg-primary transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            {/* Steps List */}
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="p-2 space-y-1">
                                    {steps.map((step) => {
                                        const isCompleted = currentStatus.steps[step.statusKey as keyof typeof currentStatus.steps];
                                        return (
                                            <div
                                                key={step.id}
                                                className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${isCompleted
                                                    ? 'bg-green-50/50 dark:bg-green-900/10'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                    }`}
                                            >
                                                <div className={`flex-shrink-0 ${isCompleted ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'
                                                    }`}>
                                                    {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${isCompleted
                                                        ? 'text-gray-500 dark:text-gray-500 line-through decoration-gray-400'
                                                        : 'text-gray-700 dark:text-gray-200'
                                                        }`}>
                                                        {t(`tutorial:steps.${step.id}.label`)}
                                                    </p>

                                                    {!isCompleted && (
                                                        <button
                                                            onClick={() => handleAction(step.path)}
                                                            className="text-xs text-primary font-medium mt-0.5 hover:underline flex items-center gap-1"
                                                        >
                                                            {step.icon}
                                                            {t(`tutorial:steps.${step.id}.action`)}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer - Success Message */}
                            {isComplete && (
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 text-center border-t border-green-100 dark:border-green-900/20">
                                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                                        🎉 {t('tutorial:completed')}
                                    </p>
                                </div>
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
        </>
    );
};
