import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Monitor, Smartphone, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TroubleshootModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TroubleshootModal: React.FC<TroubleshootModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation('reports');

    if (typeof document === 'undefined') return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
    };

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleBackdropClick}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-2xl bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden"
                    >
                        <div className="p-0">
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 dark:border-white/10 flex items-center justify-between bg-white/20 dark:bg-black/40">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-500/10 dark:bg-primary-500/20 text-primary dark:text-primary-light rounded-xl border border-primary/20">
                                        <HelpCircle size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-200">
                                        {t('preFlight.postSend.troubleshoot.title')}
                                    </h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-white/40 dark:hover:bg-white/5 rounded-xl transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {t('preFlight.postSend.troubleshoot.description')}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Desktop Section */}
                                    <div className="p-5 rounded-2xl bg-white/40 dark:bg-black/40 border border-white/20 dark:border-white/10">
                                        <div className="flex items-center gap-2 mb-4 text-primary dark:text-primary-light font-bold">
                                            <Monitor size={20} />
                                            <span>{t('preFlight.postSend.troubleshoot.steps.desktop.title')}</span>
                                        </div>
                                        <ul className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                                            <li className="flex gap-2">
                                                <span className="font-bold text-neutral-900 dark:text-neutral-200 whitespace-nowrap">macOS :</span>
                                                <span>{t('preFlight.postSend.troubleshoot.steps.desktop.mac')}</span>
                                            </li>
                                            <li className="flex gap-2 border-t border-white/10 dark:border-white/10 pt-4">
                                                <span className="font-bold text-neutral-900 dark:text-neutral-200 whitespace-nowrap">Windows :</span>
                                                <span>{t('preFlight.postSend.troubleshoot.steps.desktop.windows')}</span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Mobile Section */}
                                    <div className="p-5 rounded-2xl bg-white/40 dark:bg-black/40 border border-white/20 dark:border-white/10">
                                        <div className="flex items-center gap-2 mb-4 text-purple-600 dark:text-purple-400 font-bold">
                                            <Smartphone size={20} />
                                            <span>{t('preFlight.postSend.troubleshoot.steps.mobile.title')}</span>
                                        </div>
                                        <ul className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
                                            <li className="flex gap-2">
                                                <span className="font-bold text-neutral-900 dark:text-neutral-200 whitespace-nowrap">iOS :</span>
                                                <span>{t('preFlight.postSend.troubleshoot.steps.mobile.ios')}</span>
                                            </li>
                                            <li className="flex gap-2 border-t border-white/10 dark:border-white/10 pt-4">
                                                <span className="font-bold text-neutral-900 dark:text-neutral-200 whitespace-nowrap">Android :</span>
                                                <span>{t('preFlight.postSend.troubleshoot.steps.mobile.android')}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-500/10 dark:bg-amber-900/20 border border-amber-500/20 dark:border-amber-900/30 rounded-2xl flex gap-3 text-amber-800 dark:text-amber-200 text-sm">
                                    <MessageSquare size={20} className="shrink-0" />
                                    <p className="uppercase tracking-wide">{t('preFlight.postSend.troubleshoot.fallback')}</p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/10 dark:border-white/10 flex justify-end bg-white/20 dark:bg-black/40">
                                <button
                                    onClick={onClose}
                                    className="btn btn-primary px-8"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default TroubleshootModal;
