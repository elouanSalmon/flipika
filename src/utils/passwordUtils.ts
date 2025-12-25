/**
 * Password utilities for report protection
 * Uses SHA-256 hashing for client-side password verification
 */

const REPORT_ACCESS_PREFIX = 'report_access_';

/**
 * Hash a password using SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}

/**
 * Store report access in session storage
 */
export function storeReportAccess(reportId: string): void {
    sessionStorage.setItem(`${REPORT_ACCESS_PREFIX}${reportId}`, 'true');
}

/**
 * Check if user has access to a report in current session
 */
export function hasReportAccess(reportId: string): boolean {
    return sessionStorage.getItem(`${REPORT_ACCESS_PREFIX}${reportId}`) === 'true';
}

/**
 * Clear report access from session storage
 */
export function clearReportAccess(reportId: string): void {
    sessionStorage.removeItem(`${REPORT_ACCESS_PREFIX}${reportId}`);
}

/**
 * Clear all report accesses from session storage
 */
export function clearAllReportAccess(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
        if (key.startsWith(REPORT_ACCESS_PREFIX)) {
            sessionStorage.removeItem(key);
        }
    });
}
