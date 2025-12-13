import { auth } from '../firebase/config';
import { MOCK_CUSTOMERS, MOCK_CAMPAIGNS } from './mockData';

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
    // We can't know for sure without asking backend, but we can check if customer ID is selected
    // For a better UX, we should fetch this status on load. 
    // For now, let's return false if no customer ID is linked locally,
    // assuming the flow is: Connect -> Store Customer ID
    return !!localStorage.getItem('google_ads_customer_id');
};

export const getLinkedCustomerId = (): string | null => {
    return localStorage.getItem('google_ads_customer_id');
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
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        // Fallback to mock data for development/testing ONLY if strictly needed, 
        // but now we want real data.
        return { success: false, error: 'Failed to fetch customers' };
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
