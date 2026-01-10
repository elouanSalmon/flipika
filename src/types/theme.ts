import { Timestamp } from 'firebase/firestore';

export interface ThemeColors {
    primary: string; // Hex color
    secondary?: string; // Hex color
    accent?: string; // Hex color
}

export interface Theme {
    id: string;
    name: string;
    colors: ThemeColors;
    logoUrl?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CreateThemeInput {
    name: string;
    colors: ThemeColors;
    logoFile?: File;
}

export interface UpdateThemeInput {
    name?: string;
    colors?: ThemeColors;
    logoFile?: File;
}
