import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Loader2, Settings, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ReportDesign } from '../../../types/reportTypes';

interface ReportBlockProps {
    title: string;
    design: ReportDesign;
    children: React.ReactNode;
    loading?: boolean;
    error?: string | null;
    className?: string;

    // Header Actions
    onEdit?: () => void;
    onDelete?: () => void;
    editable?: boolean;
    selected?: boolean;
    headerContent?: React.ReactNode; // Extra content in header (e.g. selectors)

    // Narrative Layer
    description?: string;
    descriptionIsStale?: boolean;
    onRegenerateAnalysis?: () => void;
    isGeneratingAnalysis?: boolean;

    // Layout
    height?: string | number;
    minHeight?: string | number;
}

const ReportBlock: React.FC<ReportBlockProps> = ({
    title,
    design,
    children,
    loading,
    error,
    className = '',
    onEdit,
    onDelete,
    editable,
    selected: _selected, // Not used but kept for prop consistency
    headerContent,
    description,
    descriptionIsStale,
    onRegenerateAnalysis,
    isGeneratingAnalysis,
    height = '100%',
    minHeight = 350,
}) => {
    const { t } = useTranslation('reports');

    // AI Generation overlay
    const AiGenerationOverlay = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl overflow-hidden"
            style={{
                backgroundColor: design?.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
            }}
        >
            <motion.div
                className="relative flex flex-col items-center gap-3 px-8 py-5 rounded-2xl"
                style={{
                    backgroundColor: design?.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
                    border: design?.mode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: design?.mode === 'dark'
                        ? '0 8px 32px rgba(0,0,0,0.3)'
                        : '0 8px 32px rgba(0,0,0,0.1)',
                }}
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Loader2
                        size={24}
                        style={{ color: design?.colorScheme?.primary || 'var(--color-primary)' }}
                    />
                </motion.div>
                <span
                    className="text-sm font-medium"
                    style={{ color: design?.colorScheme?.text || 'var(--color-text-primary)' }}
                >
                    {t('flexibleBlock.ai.generating', 'Génération IA...')}
                </span>
            </motion.div>
        </motion.div>
    );

    return (
        <div
            className={`report-block relative group h-full flex flex-col ${className}`}
            style={{
                backgroundColor: design?.colorScheme?.background || '#ffffff',
                color: design?.colorScheme?.text || '#111827',
                borderRadius: '16px',
                boxShadow: design?.mode === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                border: design?.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
                height: height,
                overflow: 'hidden' // Ensure rounded corners clip content
            }}
        >
            {/* Loading / Generating Overlay */}
            <AnimatePresence>
                {(loading || isGeneratingAnalysis) && (
                    <AiGenerationOverlay />
                )}
            </AnimatePresence>

            {/* Header */}
            <div
                className="px-5 py-3 border-b flex justify-between items-center flex-shrink-0"
                style={{
                    borderColor: design?.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                    backgroundColor: design?.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
                }}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <h3 className="font-bold text-base truncate" style={{ color: design?.colorScheme?.text || 'var(--color-text-primary)' }}>
                        {title}
                    </h3>
                    {headerContent}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    {editable && onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-1.5 hover:bg-[var(--color-bg-secondary)] rounded-xl transition-all text-[var(--color-text-muted)] hover:text-primary border border-transparent hover:border-[var(--color-border)] shadow-sm"
                            title="Configurer"
                            style={{ color: design?.colorScheme?.text }}
                        >
                            <Settings size={14} />
                        </button>
                    )}

                    {editable && onDelete && (
                        <button
                            onClick={onDelete}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all text-red-500/70 hover:text-red-600 border border-transparent hover:border-red-200 dark:hover:border-red-800/50 shadow-sm"
                            title="Supprimer"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 relative flex flex-col p-4">
                {error ? (
                    <div className="flex items-center justify-center h-full text-red-500 text-sm p-4 text-center">
                        <AlertTriangle size={20} className="mb-2" />
                        <p>{error}</p>
                    </div>
                ) : (
                    children
                )}
            </div>

            {/* Narrative Layer (Footer) */}
            {description && (
                <div className="px-4 pb-4 pt-0 flex-shrink-0">
                    <div
                        className="p-3 rounded-lg relative overflow-hidden group/desc"
                        style={{
                            backgroundColor: design?.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            border: design?.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                            backdropFilter: 'blur(12px)',
                        }}
                    >
                        <div>
                            <p
                                className="text-xs leading-relaxed line-clamp-3"
                                style={{ color: design?.colorScheme?.text || '#111827' }}
                            >
                                {description}
                            </p>

                            {/* Stale indicator */}
                            {descriptionIsStale && editable && onRegenerateAnalysis && (
                                <div className="flex items-center gap-1 mt-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded w-fit">
                                    <AlertTriangle size={8} />
                                    <span className="text-[9px] font-medium">{t('flexibleBlock.ai.staleHint', 'Données mises à jour')}</span>
                                    <button
                                        onClick={onRegenerateAnalysis}
                                        className="ml-1 flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide hover:underline cursor-pointer"
                                    >
                                        <RefreshCw size={8} />
                                        {t('flexibleBlock.ai.regenerate', 'Régénérer')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportBlock;
