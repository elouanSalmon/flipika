import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

const InfoModal: React.FC<InfoModalProps> = ({
    isOpen,
    onClose,
    title,
    content,
}) => {
    if (typeof document === 'undefined') return null;

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
    };

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
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-2xl overflow-hidden"
                        style={{
                            background: 'var(--color-bg-card, #ffffff)',
                            borderRadius: '20px',
                            boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04))',
                            border: '1px solid var(--color-border, #dcdde0)',
                        }}
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-primary-50 text-primary dark:bg-primary-900/20 dark:text-primary-light">
                                    <Info size={24} />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary, #050505)' }}>
                                        {title}
                                    </h3>
                                    <div
                                        className="mt-3 text-sm whitespace-pre-line leading-relaxed"
                                        style={{ color: 'var(--color-text-secondary, #6b6e77)' }}
                                    >
                                        {content}
                                    </div>
                                </div>

                                <button
                                    onClick={handleClose}
                                    className="p-2 -mr-2 text-neutral-400 hover:text-neutral-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mt-6 flex justify-end border-t border-neutral-100 dark:border-white/10 pt-4">
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-200 shadow-lg"
                                    style={{
                                        background: 'var(--gradient-primary, linear-gradient(135deg, #0741e0 0%, #0541ae 100%))',
                                        boxShadow: 'var(--shadow-md)',
                                    }}
                                >
                                    OK
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

export default InfoModal;
