import React from 'react';
import { Info, BarChart3 } from 'lucide-react';

interface EmptyStateAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    message: string;
    suggestion?: string;
    action?: EmptyStateAction;
    secondaryAction?: EmptyStateAction;
    variant?: 'default' | 'warning' | 'info';
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    message,
    suggestion,
    action,
    secondaryAction,
    variant = 'default',
}) => {
    const defaultIcon = variant === 'warning'
        ? <Info size={48} className="text-orange-500" />
        : variant === 'info'
            ? <Info size={48} className="text-blue-500" />
            : <BarChart3 size={48} className="text-neutral-400" />;

    const bgColorClass = variant === 'warning'
        ? 'bg-orange-50 dark:bg-orange-900/10'
        : variant === 'info'
            ? 'bg-blue-50 dark:bg-blue-900/10'
            : 'bg-neutral-50 dark:bg-neutral-800/50';

    return (
        <div className={`flex flex-col items-center justify-center py-12 text-center rounded-xl ${bgColorClass}`}>
            <div className="mb-4">
                {icon || defaultIcon}
            </div>

            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                {title}
            </h3>

            <p className="text-neutral-600 dark:text-neutral-400 mb-2 max-w-md">
                {message}
            </p>

            {suggestion && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-6 max-w-md">
                    {suggestion}
                </p>
            )}

            {(action || secondaryAction) && (
                <div className="flex gap-3 mt-4">
                    {action && (
                        <button
                            onClick={action.onClick}
                            className={action.variant === 'secondary'
                                ? 'px-4 py-2 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors'
                                : 'btn btn-primary'
                            }
                        >
                            {action.label}
                        </button>
                    )}
                    {secondaryAction && (
                        <button
                            onClick={secondaryAction.onClick}
                            className="px-4 py-2 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                        >
                            {secondaryAction.label}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
