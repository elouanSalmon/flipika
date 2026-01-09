import { Timestamp } from 'firebase/firestore';

export interface Client {
    id: string;
    name: string;
    email: string;
    logoUrl?: string;
    googleAdsCustomerId: string; // Validated unique ID (10 digits)
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CreateClientInput {
    name: string;
    email: string;
    googleAdsCustomerId: string;
    logoFile?: File;
}

export interface UpdateClientInput {
    name?: string;
    email?: string;
    googleAdsCustomerId?: string;
    logoFile?: File;
}
