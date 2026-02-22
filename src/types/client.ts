import { Timestamp } from 'firebase/firestore';

export type AdPlatform = 'google_ads' | 'meta_ads';

export interface DataSource {
    platform: AdPlatform;
    accountId: string;
    accountName?: string;
    addedAt: Timestamp;
}

export interface Client {
    id: string;
    name: string;
    email: string;
    logoUrl?: string;
    googleAdsCustomerId: string; // @deprecated Use dataSources instead. Kept for backwards compatibility.
    dataSources?: DataSource[];

    defaultTemplateId?: string;
    defaultThemeId?: string;
    linkedThemeIds?: string[];
    emailPreset?: EmailPreset;
    monthlyBudget?: number;
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    targetCpa?: number;
    targetRoas?: number;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface EmailPreset {
    subject: string;
    body: string;
}

export interface CreateClientInput {
    name: string;
    email: string;
    googleAdsCustomerId: string;
    metaAdsAccountId?: string;
    logoFile?: File;
    emailPreset?: EmailPreset;
    defaultTemplateId?: string;
    defaultThemeId?: string;
    linkedThemeIds?: string[];
    monthlyBudget?: number;
    startDate?: string;
    endDate?: string;
    targetCpa?: number;
    targetRoas?: number;
}

export interface UpdateClientInput {
    name?: string;
    email?: string;
    googleAdsCustomerId?: string;
    metaAdsAccountId?: string;
    logoFile?: File;

    // Preset configuration (optional)
    defaultTemplateId?: string;
    defaultThemeId?: string;
    linkedThemeIds?: string[];
    emailPreset?: EmailPreset;
    monthlyBudget?: number;
    startDate?: string;
    endDate?: string;
    targetCpa?: number;
    targetRoas?: number;
}
