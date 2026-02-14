import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getReportWithSlides } from '../../services/reportService';
import ReportCanvas from './ReportCanvas';
import type { EditableReport, SlideConfig } from '../../types/reportTypes';

type PreFlightState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; report: EditableReport; slides: SlideConfig[] }
    | { status: 'error'; error: string };

interface PreFlightModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSendEmail: () => void;
    reportId: string;
}

const PreFlightModal: React.FC<PreFlightModalProps> = ({
    isOpen,
    onClose,
    onSendEmail,
    reportId,
}) => {
    const { t, i18n } = useTranslation('reports');
    const [state, setState] = useState<PreFlightState>({ status: 'idle' });

    useEffect(() => {
        if (isOpen && state.status === 'idle') {
            loadReport();
        }
    }, [isOpen]);

    const loadReport = async () => {
        setState({ status: 'loading' });
        try {
            const result = await getReportWithSlides(reportId);

            if (!result) {
                setState({
                    status: 'error',
                    error: t('preFlight.error.noData'),
                });
                return;
            }

            setState({
                status: 'success',
                report: result.report,
                slides: result.slides
            });
        } catch (error: any) {
            setState({
                status: 'error',
                error: error.message || t('preFlight.error.generic'),
            });
        }
    };

    const handleSend = () => {
        if (state.status === 'success') {
            onSendEmail();
        }
    };

    const handleRetry = () => {
        loadReport();
    };

    const formatDate = (date?: Date): string => {
        if (!date) return t('editor.notAvailable') || 'N/A';
        return new Intl.DateTimeFormat(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    };

    if (typeof document === 'undefined') return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-3xl overflow-hidden glass rounded-2xl"
                        style={{
                            maxHeight: '90vh',
                            overflowY: 'auto',
                        }}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-neutral-100 dark:border-white/10">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold gradient-text">
                                        {t('preFlight.title')}
                                    </h2>
                                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                                        {state.status === 'success'
                                            ? `${state.report.title} • ${formatDate(state.report.startDate)} - ${formatDate(state.report.endDate)}`
                                            : t('preFlight.loading.subtitle')
                                        }
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-neutral-400 hover:text-neutral-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Loading State */}
                            {state.status === 'loading' && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 size={48} className="animate-spin text-primary dark:text-primary-light mb-4" />
                                    <p className="text-lg font-medium text-neutral-900 dark:text-neutral-200">
                                        {t('preFlight.loading.title')}
                                    </p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                                        {t('preFlight.loading.subtitle')}
                                    </p>
                                </div>
                            )}

                            {/* Error State */}
                            {state.status === 'error' && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20 mb-4">
                                        <AlertCircle size={48} className="text-red-600 dark:text-red-400" />
                                    </div>
                                    <p className="text-lg font-medium text-neutral-900 dark:text-neutral-200 mb-2">
                                        {t('preFlight.error.title')}
                                    </p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-md">
                                        {state.error}
                                    </p>
                                    <button
                                        onClick={handleRetry}
                                        className="mt-6 btn btn-primary"
                                    >
                                        {t('preFlight.error.retry')}
                                    </button>
                                </div>
                            )}

                            {/* Success State - Report Preview */}
                            {state.status === 'success' && (
                                <div className="report-preview-container">
                                    <ReportCanvas
                                        slides={state.slides}
                                        design={state.report.design}
                                        startDate={state.report.startDate}
                                        endDate={state.report.endDate}
                                        isPublicView={true}
                                        reportId={state.report.id}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-neutral-100 dark:border-white/10 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="btn btn-outline"
                            >
                                {t('preFlight.actions.cancel')}
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={state.status !== 'success'}
                                className="btn btn-primary"
                            >
                                {t('preFlight.actions.send')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default PreFlightModal;
