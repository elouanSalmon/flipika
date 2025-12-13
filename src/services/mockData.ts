// Temporary workaround: Mock data for testing the UI flow
// This will be replaced once we properly implement server-side OAuth for refresh tokens

export const MOCK_CUSTOMERS = [
    "customers/1234567890",
    "customers/9876543210"
];

export const MOCK_CAMPAIGNS = [
    {
        id: "12345",
        name: "Summer Sale Campaign",
        status: "ENABLED",
        cost: 1250.50,
        impressions: 45000,
        clicks: 1200
    },
    {
        id: "67890",
        name: "Brand Awareness",
        status: "ENABLED",
        cost: 890.25,
        impressions: 32000,
        clicks: 850
    },
    {
        id: "11111",
        name: "Product Launch",
        status: "PAUSED",
        cost: 0,
        impressions: 0,
        clicks: 0
    }
];
