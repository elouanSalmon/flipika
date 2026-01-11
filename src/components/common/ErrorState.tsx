import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, WifiOff, Clock, ShieldOff } from 'lucide-react';
import type { ApiErrorCode } from '../../types/errors';

interface ErrorStateProps {
    title?: string;
    message: string;
    suggestion?: string;
    technicalDetails?: string;
    errorCode?: ApiErrorCode;
    onRetry?: () => void;
    retryCount?: number;
    maxRetries?: number;
    isRetrying?: boolean;
    translations?: {
        retry: string;
        retrying: string;
        attemptCount: string;
        maxAttempts: string;
        technicalDetails: string;
    };
}

const ERROR_ICONS: Partial<Record<ApiErrorCode, React.ReactNode>> = {
    NETWORK_ERROR: <WifiOff size={48} className="text-red-600 dark:text-red-400" />,
    TIMEOUT_ERROR: <Clock size={48} className="text-orange-600 dark:text-orange-400" />,
    AUTHENTICATION_ERROR: <ShieldOff size={48} className="text-red-600 dark:text-red-400" />,
    PERMISSION_ERROR: <ShieldOff size={48} className="text-red-600 dark:text-red-400" />,
};

const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Une erreur est survenue',
    message,
    suggestion,
    technicalDetails,
    errorCode,
    onRetry,
    retryCount = 0,
    maxRetries = 3,
    isRetrying = false,
    translations,
}) => {
    const [showDetails, setShowDetails] = useState(false);

    const icon = errorCode && ERROR_ICONS[errorCode]
        ? ERROR_ICONS[errorCode]
        : <AlertTriangle size={48} className="text-red-600 dark:text-red-400" />;

    const canRetry = onRetry && retryCount < maxRetries;

    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                {icon}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-md">
                {message}
            </p>

            {suggestion && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-6 max-w-md">
                    {suggestion}
                </p>
            )}

            {canRetry && (
                <div className="mb-4">
                    <button
                        onClick={onRetry}
                        disabled={isRetrying}
                        className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw size={18} className={isRetrying ? 'animate-spin' : ''} />
                        {isRetrying
                            ? (translations?.retrying || 'Retrying...')
                            : (translations?.retry || 'Retry')}
                    </button>
                    {retryCount > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {translations?.attemptCount || `Attempt ${retryCount}/${maxRetries}`}
                        </p>
                    )}
                </div>
            )}

            {!canRetry && onRetry && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {translations?.maxAttempts || 'Maximum retry attempts reached'}
                </p>
            )}

            {technicalDetails && (
                <div className="w-full max-w-md">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mx-auto"
                    >
                        {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {translations?.technicalDetails || 'Technical details'}
                    </button>

                    {showDetails && (
                        <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
                            <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words font-mono">
                                {technicalDetails}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ErrorState;
