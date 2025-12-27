import { auth } from '../firebase/config';

const FUNCTIONS_BASE_URL = 'https://us-central1-flipika.cloudfunctions.net';

// Helper to get authenticated headers
const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");
    const token = await user.getIdToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * @deprecated Use GoogleAdsContext.isConnected instead
 */
export const isGoogleAdsConnected = (): boolean => {
    return !!(localStorage.getItem('google_ads_customer_id') || localStorage.getItem('google_ads_connected'));
};

/**
 * @deprecated Use GoogleAdsContext.customerId instead
 */
export const getLinkedCustomerId = (): string | null => {
    return localStorage.getItem('google_ads_customer_id');
};

/**
 * Initiates the Google Ads OAuth flow
 */
export const initiateGoogleAdsOAuth = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User must be authenticated to connect Google Ads");
        }

        const headers = await getAuthHeaders();
        const response = await fetch(`${FUNCTIONS_BASE_URL}/initiateOAuth`, {
            method: 'POST',
            headers
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (!data.success || !data.authUrl) {
            throw new Error(data.error || 'Failed to get authorization URL');
        }

        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            data.authUrl,
            'Google Ads Authorization',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        if (!popup) {
            throw new Error('Popup was blocked. Please allow popups for this site.');
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('OAuth flow timed out'));
            }, 5 * 60 * 1000);

            setTimeout(() => {
                clearTimeout(timeout);
                resolve({ success: true });
            }, 2000);
        });
    } catch (error: any) {
        console.error("Failed to initiate Google Ads OAuth:", error);
        throw error;
    }
};

export const fetchAccessibleCustomers = async () => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${FUNCTIONS_BASE_URL}/getAccessibleCustomers`, {
            method: 'POST',
            headers
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error("Failed to fetch customers:", error);
        return { success: false, error: error.message || 'Failed to fetch customers' };
    }
};

export const fetchCampaigns = async (customerIdParam?: string) => {
    try {
        const customerId = customerIdParam || getLinkedCustomerId();
        if (!customerId) {
            throw new Error("No Customer ID selected");
        }

        const headers = await getAuthHeaders();
        const response = await fetch(`${FUNCTIONS_BASE_URL}/listCampaigns`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ customerId })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch campaigns:", error);
        return { success: false, error: 'Failed to fetch campaigns' };
    }
};

/**
 * Fetch widget metrics for specific campaigns and date range
 */
export const fetchWidgetMetrics = async (
    customerId: string,
    campaignIds: string[],
    startDate: Date,
    endDate: Date,
    widgetType: 'performance_overview' | 'campaign_chart' | 'key_metrics'
) => {
    try {
        const headers = await getAuthHeaders();

        // Format dates as YYYY-MM-DD
        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const response = await fetch(`${FUNCTIONS_BASE_URL}/getWidgetMetrics`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                customerId,
                campaignIds,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                widgetType
            })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch widget metrics:", error);
        return { success: false, error: 'Failed to fetch widget metrics' };
    }
};
