import { auth } from '../firebase/config';

const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || 'https://us-central1-flipika.cloudfunctions.net';

// Helper to get authenticated headers
const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    const token = await user.getIdToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

/**
 * Initiates the Meta Ads OAuth flow.
 * Redirects the browser to Facebook Login.
 */
export const initiateMetaAdsOAuth = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User must be authenticated to connect Meta Ads");
        }

        const headers = await getAuthHeaders();
        const response = await fetch(`${FUNCTIONS_BASE_URL}/initiateMetaOAuth`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                origin: window.location.origin,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (!data.success || !data.authUrl) {
            throw new Error(data.error || 'Failed to get Meta authorization URL');
        }

        // Redirect to Facebook OAuth
        window.location.href = data.authUrl;
    } catch (error: any) {
        console.error("Failed to initiate Meta Ads OAuth:", error);
        throw error;
    }
};

/**
 * Fetch accessible Meta Ad Accounts for the current user.
 */
export const fetchMetaAdAccounts = async () => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${FUNCTIONS_BASE_URL}/getMetaAdAccounts`, {
            method: 'POST',
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Handle expired token specifically
            if (response.status === 401 && errorData.code === 'TOKEN_EXPIRED') {
                return {
                    success: false,
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED',
                };
            }

            throw new Error(`Error ${response.status}: ${errorData.error || await response.text()}`);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error("Failed to fetch Meta ad accounts:", error);
        return { success: false, error: error.message || 'Failed to fetch Meta ad accounts' };
    }
};

/**
 * Fetch Meta Ads insights for a given ad account.
 */
export const fetchMetaInsights = async (
    accountId: string,
    startDate: string, // YYYY-MM-DD
    endDate: string,   // YYYY-MM-DD
    options?: {
        level?: 'campaign' | 'adset' | 'ad' | 'account';
        fields?: string[];
        timeIncrement?: string | number;
        breakdowns?: string[];
    }
) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${FUNCTIONS_BASE_URL}/getMetaInsights`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                accountId,
                startDate,
                endDate,
                level: options?.level || 'campaign',
                fields: options?.fields,
                timeIncrement: options?.timeIncrement,
                breakdowns: options?.breakdowns,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 401 && errorData.code === 'TOKEN_EXPIRED') {
                return {
                    success: false,
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED',
                };
            }

            throw new Error(`Error ${response.status}: ${errorData.error || 'Failed to fetch insights'}`);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error("Failed to fetch Meta insights:", error);
        return { success: false, error: error.message || 'Failed to fetch Meta insights' };
    }
};

/**
 * Revoke Meta Ads OAuth connection.
 */
export const revokeMetaOAuth = async () => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${FUNCTIONS_BASE_URL}/revokeMetaOAuth`, {
            method: 'POST',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Failed to revoke Meta OAuth:", error);
        throw error;
    }
};

/**
 * Fetch Meta Ads campaigns for a given ad account.
 */
export const fetchMetaCampaigns = async (accountId: string) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${FUNCTIONS_BASE_URL}/getMetaCampaigns`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                accountId,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 401 && errorData.code === 'TOKEN_EXPIRED') {
                return {
                    success: false,
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED',
                };
            }

            throw new Error(`Error ${response.status}: ${errorData.error || 'Failed to fetch campaigns'}`);
        }

        const data = await response.json();
        return data; // { success: true, campaigns: [...] }
    } catch (error: any) {
        console.error("Failed to fetch Meta campaigns:", error);
        return { success: false, error: error.message || 'Failed to fetch Meta campaigns' };
    }
};
