import * as admin from 'firebase-admin';

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

/**
 * Check if a user has exceeded the rate limit for a specific action
 * @param userId - Firebase user ID
 * @param action - Action identifier (e.g., 'oauth_initiate')
 * @param config - Rate limit configuration
 * @returns true if request is allowed, false if rate limit exceeded
 */
export async function checkRateLimit(
    userId: string,
    action: string,
    config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const rateLimitRef = admin.firestore()
        .collection('rate_limits')
        .doc(`${userId}_${action}`);

    const doc = await rateLimitRef.get();

    if (!doc.exists) {
        await rateLimitRef.set({
            requests: [now],
            lastReset: now,
        });
        return true;
    }

    const data = doc.data()!;
    const recentRequests = data.requests.filter((t: number) => t > windowStart);

    if (recentRequests.length >= config.maxRequests) {
        return false; // Rate limit exceeded
    }

    await rateLimitRef.update({
        requests: [...recentRequests, now],
    });

    return true;
}
