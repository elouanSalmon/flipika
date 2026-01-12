import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler',
    isDestructive = false,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    if (typeof document === 'undefined') return null;

    const handleConfirm = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const result = onConfirm();
            if (result instanceof Promise) {
                setIsLoading(true);
                await result;
            }
            onClose();
        } catch (error) {
            console.error('Error in confirmation modal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoading) onClose();
    };

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[12000] flex items-center justify-center p-4"
                    onClick={(e) => e.stopPropagation()} // Stop propagation from the portal wrapper
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
                        onClick={(e) => e.stopPropagation()} // Stop propagation on the modal itself
                        className="relative w-full max-w-md overflow-hidden"
                        style={{
                            background: 'var(--color-bg-card, #ffffff)',
                            borderRadius: '20px',
                            boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04))',
                            border: '1px solid var(--color-border, #e5e7eb)',
                        }}
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                {isDestructive ? (
                                    <div className="p-3 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                        <AlertCircle size={24} />
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <AlertCircle size={24} />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary, #111827)' }}>
                                        {title}
                                    </h3>
                                    <p className="mt-2 text-sm whitespace-pre-line" style={{ color: 'var(--color-text-secondary, #6b7280)' }}>
                                        {message}
                                    </p>
                                </div>

                                <button
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="p-2 -mr-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                                <button
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
                                    style={{
                                        background: 'transparent',
                                        color: 'var(--color-text-secondary, #6b7280)',
                                        border: '2px solid var(--color-border, #e5e7eb)',
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.target as HTMLButtonElement).style.borderColor = 'var(--color-primary, #2563eb)';
                                        (e.target as HTMLButtonElement).style.color = 'var(--color-primary, #2563eb)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.target as HTMLButtonElement).style.borderColor = 'var(--color-border, #e5e7eb)';
                                        (e.target as HTMLButtonElement).style.color = 'var(--color-text-secondary, #6b7280)';
                                    }}
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={isLoading}
                                    className={`px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-200 shadow-lg flex items-center gap-2`}
                                    style={{
                                        background: isDestructive ? '#dc2626' : 'var(--gradient-primary, linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%))',
                                        boxShadow: isDestructive ? '0 4px 6px -1px rgba(220, 38, 38, 0.3)' : 'var(--shadow-md)',
                                    }}
                                >
                                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                                    {confirmLabel}
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

export default ConfirmationModal;
