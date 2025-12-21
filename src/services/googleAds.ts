import { auth } from '../firebase/config';
// import { MOCK_CUSTOMERS, MOCK_CAMPAIGNS } from './mockData';

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
 * This function checks localStorage which is not the source of truth.
 * The actual OAuth token is stored in Firestore at users/{uid}/tokens/google_ads
 */
export const isGoogleAdsConnected = (): boolean => {
    // Check if user has connected (either has customer_id or connection flag)
    return !!(localStorage.getItem('google_ads_customer_id') || localStorage.getItem('google_ads_connected'));
};

/**
 * @deprecated Use GoogleAdsContext.customerId instead
 * Customer ID should be fetched from the backend after OAuth is complete
 */
export const getLinkedCustomerId = (): string | null => {
    return localStorage.getItem('google_ads_customer_id');
};

/**
 * Initiates the Google Ads OAuth flow
 * Opens a popup window for the user to authorize Google Ads access
 */
export const initiateGoogleAdsOAuth = async () => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User must be authenticated to connect Google Ads");
        }

        // Get the OAuth URL from the backend
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

        // Open OAuth popup
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

        // Listen for the OAuth callback by checking if token appears in Firestore
        return new Promise((resolve, reject) => {
            // The GoogleAdsContext will detect the token via onSnapshot
            // We just wait for the user to complete the flow or timeout

            // Timeout after 5 minutes
            const timeout = setTimeout(() => {
                reject(new Error('OAuth flow timed out'));
            }, 5 * 60 * 1000);

            // Resolve immediately - the actual connection status will be detected by GoogleAdsContext
            // This prevents COOP warnings from trying to access popup.closed
            setTimeout(() => {
                clearTimeout(timeout);
                resolve({ success: true });
            }, 2000); // Give the popup time to open
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
            method: 'POST', // or GET depending on preference, but POST is safer with body if needed later
            headers
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error("Failed to fetch customers:", error);
        // Fallback to mock data for development/testing ONLY if strictly needed, 
        // but now we want real data.
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
