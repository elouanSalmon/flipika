/* eslint-disable no-console */
/**
 * Logger Service
 * 
 * Provides a wrapper around console.log, console.warn, console.error, etc.
 * Handles environment-based filtering and debug-mode overrides.
 */

type LogLevel = 'debug' | 'info' | 'log' | 'warn' | 'error';

const IS_DEV = import.meta.env.DEV;

// Check for debug=true in URL to force logs in production
const getForceDebug = () => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('debug') === 'true';
};

class LoggerService {
    private forceDebug: boolean = getForceDebug();

    /**
     * Check if a log level should be displayed
     */
    private shouldLog(level: LogLevel): boolean {
        // Always log if force debug is enabled via URL
        if (this.forceDebug) return true;

        // In development, log everything
        if (IS_DEV) return true;

        // In production, only log warnings and errors
        return level === 'warn' || level === 'error';
    }

    /**
     * Manually enable or disable debug mode
     */
    public setDebug(enabled: boolean) {
        this.forceDebug = enabled;
    }

    debug(message: any, ...args: any[]) {
        if (this.shouldLog('debug')) {
            console.debug(`[DEBUG]`, message, ...args);
        }
    }

    log(message: any, ...args: any[]) {
        if (this.shouldLog('log')) {
            console.log(`[LOG]`, message, ...args);
        }
    }

    info(message: any, ...args: any[]) {
        if (this.shouldLog('info')) {
            console.info(`[INFO]`, message, ...args);
        }
    }

    warn(message: any, ...args: any[]) {
        if (this.shouldLog('warn')) {
            console.warn(`[WARN]`, message, ...args);
        }
    }

    error(message: any, ...args: any[]) {
        if (this.shouldLog('error')) {
            // We always log errors, but we can potentially add remote monitoring here (e.g. Sentry)
            console.error(`[ERROR]`, message, ...args);
        }
    }
}

export const Logger = new LoggerService();
export default Logger;
