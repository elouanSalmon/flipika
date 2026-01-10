import { Timestamp } from 'firebase/firestore';

export interface Client {
    id: string;
    name: string;
    email: string;
    logoUrl?: string;
    googleAdsCustomerId: string; // Validated unique ID (10 digits)

    // Preset configuration (optional)
    // Note: Client can have ONE default theme
    // Templates are linked separately (multiple templates can reference a client)
    // Period is managed at template level, not client level
    defaultTemplateId?: string; // Default template to use for this client
    defaultThemeId?: string; // Default theme for reports

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

    // Preset configuration (optional)
    defaultTemplateId?: string;
    defaultThemeId?: string;
}
