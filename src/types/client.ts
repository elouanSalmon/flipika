import { Timestamp } from 'firebase/firestore';

export interface Client {
    id: string;
    name: string;
    email: string;
    logoUrl?: string;
    googleAdsCustomerId: string; // Validated unique ID (10 digits)

    // Preset configuration (optional)
    // Note: Client can have ONE default theme
    // But can be linked to MULTIPLE themes (Many-to-Many)
    // Templates are linked separately (multiple templates can reference a client)
    // Period is managed at template level, not client level
    defaultTemplateId?: string; // Default template to use for this client
    defaultThemeId?: string; // Default theme for reports (preferred)
    linkedThemeIds?: string[]; // All themes available to this client
    emailPreset?: EmailPreset; // Custom email preset for this client

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
    logoFile?: File;
    emailPreset?: EmailPreset;
    defaultTemplateId?: string;
    defaultThemeId?: string;
    linkedThemeIds?: string[];
}

export interface UpdateClientInput {
    name?: string;
    email?: string;
    googleAdsCustomerId?: string;
    logoFile?: File;

    // Preset configuration (optional)
    defaultTemplateId?: string;
    defaultThemeId?: string;
    linkedThemeIds?: string[];
    emailPreset?: EmailPreset;
}
