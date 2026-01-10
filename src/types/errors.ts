/**
 * Error types for Google Ads API and application errors
 */

export type ApiErrorCode =
    | 'AUTHENTICATION_ERROR'
    | 'PERMISSION_ERROR'
    | 'RATE_LIMIT_ERROR'
    | 'TIMEOUT_ERROR'
    | 'NETWORK_ERROR'
    | 'NO_DATA'
    | 'INVALID_PERIOD'
    | 'ACCOUNT_NOT_FOUND'
    | 'UNKNOWN_ERROR';

export interface ApiError {
    code: ApiErrorCode;
    message: string;
    userMessage: string;
    suggestion: string;
    technicalDetails?: string;
    retryable: boolean;
}

/**
 * Map of error codes to user-friendly messages
 */
export const ERROR_MESSAGES: Record<ApiErrorCode, Omit<ApiError, 'technicalDetails'>> = {
    AUTHENTICATION_ERROR: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed',
        userMessage: 'Your Google Ads connection has expired.',
        suggestion: 'Please reconnect to Google Ads.',
        retryable: false,
    },
    PERMISSION_ERROR: {
        code: 'PERMISSION_ERROR',
        message: 'Permission denied',
        userMessage: "You don't have permission to access this account.",
        suggestion: 'Check your access rights to the Google Ads account.',
        retryable: false,
    },
    RATE_LIMIT_ERROR: {
        code: 'RATE_LIMIT_ERROR',
        message: 'Rate limit exceeded',
        userMessage: 'Too many requests sent.',
        suggestion: 'Please wait a moment and try again.',
        retryable: true,
    },
    TIMEOUT_ERROR: {
        code: 'TIMEOUT_ERROR',
        message: 'Request timeout',
        userMessage: 'The request took too long.',
        suggestion: 'Please try again. If the problem persists, try a shorter date range.',
        retryable: true,
    },
    NETWORK_ERROR: {
        code: 'NETWORK_ERROR',
        message: 'Network error',
        userMessage: 'Network connection interrupted.',
        suggestion: 'Check your internet connection and try again.',
        retryable: true,
    },
    NO_DATA: {
        code: 'NO_DATA',
        message: 'No data available',
        userMessage: 'No data available for this period.',
        suggestion: 'Try selecting a different date range.',
        retryable: false,
    },
    INVALID_PERIOD: {
        code: 'INVALID_PERIOD',
        message: 'Invalid date range',
        userMessage: 'The selected date range is invalid.',
        suggestion: 'Please select valid dates.',
        retryable: false,
    },
    ACCOUNT_NOT_FOUND: {
        code: 'ACCOUNT_NOT_FOUND',
        message: 'Account not found',
        userMessage: 'Google Ads account not found.',
        suggestion: 'Verify that the account is properly linked to Flipika.',
        retryable: false,
    },
    UNKNOWN_ERROR: {
        code: 'UNKNOWN_ERROR',
        message: 'Unknown error',
        userMessage: 'An unexpected error occurred.',
        suggestion: 'Please try again. If the problem persists, contact support.',
        retryable: true,
    },
};

/**
 * Parse an error into a structured ApiError
 */
export function parseApiError(error: unknown, technicalDetails?: string): ApiError {
    // Handle Error objects
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        // Check for specific error patterns
        if (message.includes('401') || message.includes('unauthorized') || message.includes('authentication')) {
            return {
                ...ERROR_MESSAGES.AUTHENTICATION_ERROR,
                technicalDetails: technicalDetails || error.message,
            };
        }

        if (message.includes('403') || message.includes('permission') || message.includes('forbidden')) {
            return {
                ...ERROR_MESSAGES.PERMISSION_ERROR,
                technicalDetails: technicalDetails || error.message,
            };
        }

        if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
            return {
                ...ERROR_MESSAGES.RATE_LIMIT_ERROR,
                technicalDetails: technicalDetails || error.message,
            };
        }

        if (message.includes('timeout') || message.includes('timed out') || message.includes('aborted')) {
            return {
                ...ERROR_MESSAGES.TIMEOUT_ERROR,
                technicalDetails: technicalDetails || error.message,
            };
        }

        if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
            return {
                ...ERROR_MESSAGES.NETWORK_ERROR,
                technicalDetails: technicalDetails || error.message,
            };
        }

        if (message.includes('no data') || message.includes('empty')) {
            return {
                ...ERROR_MESSAGES.NO_DATA,
                technicalDetails: technicalDetails || error.message,
            };
        }

        if (message.includes('not found') || message.includes('404')) {
            return {
                ...ERROR_MESSAGES.ACCOUNT_NOT_FOUND,
                technicalDetails: technicalDetails || error.message,
            };
        }
    }

    // Default to unknown error
    return {
        ...ERROR_MESSAGES.UNKNOWN_ERROR,
        technicalDetails: technicalDetails || (error instanceof Error ? error.message : String(error)),
    };
}

/**
 * Check if error response indicates no data
 */
export function isNoDataError(response: { success: boolean; data?: unknown }): boolean {
    if (!response.success) return false;

    const data = response.data;

    // Check for empty arrays
    if (Array.isArray(data) && data.length === 0) return true;

    // Check for empty objects with specific properties
    if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>;

        // Check common data properties
        if (Array.isArray(obj.campaigns) && obj.campaigns.length === 0) return true;
        if (Array.isArray(obj.metrics) && obj.metrics.length === 0) return true;
        if (Array.isArray(obj.rows) && obj.rows.length === 0) return true;
    }

    return false;
}

/**
 * Default timeout for API requests (30 seconds)
 */
export const API_TIMEOUT_MS = 30000;

/**
 * Maximum retry attempts
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Calculate exponential backoff delay
 */
export function getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s...
    return Math.min(1000 * Math.pow(2, attempt), 10000);
}
