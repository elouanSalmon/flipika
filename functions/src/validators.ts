/**
 * Validation utilities for Cloud Functions
 */

/**
 * Validate OAuth state parameter
 * @param state - State parameter to validate
 * @returns true if valid
 */
export function isValidState(state: unknown): state is string {
    return typeof state === 'string'
        && state.length >= 8
        && state.length <= 128
        && /^[a-z0-9]+$/.test(state);
}

/**
 * Validate OAuth code parameter
 * @param code - OAuth code to validate
 * @returns true if valid
 */
export function isValidOAuthCode(code: unknown): code is string {
    return typeof code === 'string'
        && code.length > 10
        && code.length < 4096;
}

/**
 * Validate Firebase UID format
 * @param uid - User ID to validate
 * @returns true if valid
 */
export function isValidUserId(uid: unknown): uid is string {
    return typeof uid === 'string'
        && uid.length >= 5
        && uid.length <= 256
        && /^[a-zA-Z0-9]+$/.test(uid);
}
