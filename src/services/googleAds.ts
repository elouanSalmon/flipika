
export const isGoogleAdsConnected = (): boolean => {
    // MVP Check: Just check if we exist in localStorage
    // Real implementation: Check user document in Firestore for 'ads_connected: true'
    return !!localStorage.getItem('google_ads_token');
};

export const getLinkedCustomerId = (): string | null => {
    return localStorage.getItem('google_ads_customer_id');
};
