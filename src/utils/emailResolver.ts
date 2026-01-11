import type { Client } from '../types/client';

interface EmailContext {
    client: Client;
    period: string;
    campaigns: string;
    userName: string;
    companyName?: string;
}

/**
 * Resolves variables in a text string using the provided context.
 * Supported variables:
 * - [client_name]
 * - [period]
 * - [campaigns]
 * - [user_name]
 * - [company]
 */
export const resolveEmailVariables = (text: string, context: EmailContext): string => {
    let resolved = text;

    const replacements: Record<string, string> = {
        '[client_name]': context.client.name,
        '[period]': context.period,
        '[campaigns]': context.campaigns,
        '[user_name]': context.userName,
        '[company]': context.companyName || '',
    };

    Object.entries(replacements).forEach(([key, value]) => {
        // Replace all occurrences
        resolved = resolved.split(key).join(value);
    });

    return resolved;
};
