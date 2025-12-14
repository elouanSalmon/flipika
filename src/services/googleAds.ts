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

export const isGoogleAdsConnected = (): boolean => {
    // Check if user has connected (either has customer_id or connection flag)
    return !!(localStorage.getItem('google_ads_customer_id') || localStorage.getItem('google_ads_connected'));
};

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

        // Listen for the OAuth callback by checking URL changes
        return new Promise((resolve, reject) => {
            const checkPopup = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkPopup);
                    // Check if connection was successful
                    if (isGoogleAdsConnected()) {
                        resolve({ success: true });
                    } else {
                        reject(new Error('OAuth flow was cancelled or failed'));
                    }
                }

                // Try to detect if the popup has been redirected back to our app
                try {
                    if (popup.location.href.includes('/app/dashboard')) {
                        const url = new URL(popup.location.href);
                        if (url.searchParams.get('oauth') === 'success') {
                            popup.close();
                            clearInterval(checkPopup);
                            resolve({ success: true });
                        } else if (url.searchParams.get('error')) {
                            popup.close();
                            clearInterval(checkPopup);
                            reject(new Error(url.searchParams.get('message') || 'OAuth failed'));
                        }
                    }
                } catch (e) {
                    // Cross-origin error - popup is still on Google's domain, which is expected
                }
            }, 500);

            // Timeout after 5 minutes
            setTimeout(() => {
                clearInterval(checkPopup);
                if (!popup.closed) {
                    popup.close();
                }
                reject(new Error('OAuth flow timed out'));
            }, 5 * 60 * 1000);
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

export const fetchCampaigns = async () => {
    try {
        const customerId = getLinkedCustomerId();
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
