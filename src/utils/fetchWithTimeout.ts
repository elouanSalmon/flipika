import { API_TIMEOUT_MS, parseApiError } from '../types/errors';
import type { ApiError } from '../types/errors';

/**
 * Fetch wrapper with timeout support
 */
export async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = API_TIMEOUT_MS
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeoutMs}ms`);
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Execute an async operation with timeout
 */
export async function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = API_TIMEOUT_MS,
    timeoutError?: string
): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(timeoutError || `Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        clearTimeout(timeoutId!);
    }
}

/**
 * Execute an async operation with retry logic and exponential backoff
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    options: {
        maxAttempts?: number;
        shouldRetry?: (error: unknown, attempt: number) => boolean;
        onRetry?: (error: unknown, attempt: number) => void;
    } = {}
): Promise<T> {
    const { maxAttempts = 3, shouldRetry, onRetry } = options;

    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            // Check if we should retry
            const apiError = parseApiError(error);
            const canRetry = shouldRetry
                ? shouldRetry(error, attempt)
                : apiError.retryable && attempt < maxAttempts - 1;

            if (!canRetry) {
                throw error;
            }

            // Notify about retry
            onRetry?.(error, attempt);

            // Wait with exponential backoff before retrying
            const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

/**
 * Safe JSON fetch with error handling
 */
export async function safeFetch<T>(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = API_TIMEOUT_MS
): Promise<{ success: true; data: T } | { success: false; error: ApiError }> {
    try {
        const response = await fetchWithTimeout(url, options, timeoutMs);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        const apiError = parseApiError(error);
        return { success: false, error: apiError };
    }
}
