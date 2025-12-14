import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Une erreur est survenue',
    message,
    onRetry,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <AlertTriangle size={48} className="text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="btn btn-primary flex items-center gap-2">
                    <RefreshCw size={18} />
                    Réessayer
                </button>
            )}
        </div>
    );
};

export default ErrorState;
