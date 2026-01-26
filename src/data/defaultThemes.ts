import type { ThemePreset } from '../types/reportThemes';
import { defaultReportDesign } from '../types/reportTypes';

/**
 * System-provided default theme presets
 * Users can create themes based on these presets
 */
export const defaultThemePresets: ThemePreset[] = [
    {
        id: 'professional-blue',
        name: 'Professional Blue',
        description: 'Thème professionnel avec des tons bleus élégants',
        isSystemDefault: true,
        design: {
            ...defaultReportDesign,
            colorScheme: {
                primary: '#0066ff',
                secondary: '#2563eb',
                accent: '#0369a1',    // Darkened to Sky 700 (> 4.5:1 on white)
                background: '#ffffff',
                text: '#0f172a',
            },
        },
        defaultModules: {
            executiveSummary: true,
            metrics: true,
            campaignAnalysis: true,
            recommendations: true,
        },
    },
    {
        id: 'modern-dark',
        name: 'Modern Dark',
        description: 'Thème sombre moderne et élégant',
        isSystemDefault: true,
        design: {
            mode: 'dark',
            colorScheme: {
                primary: '#a78bfa',
                secondary: '#c4b5fd',
                accent: '#ddd6fe',
                background: '#0f172a',
                text: '#f1f5f9',
            },
            typography: {
                fontFamily: 'Inter, sans-serif',
                headingFontFamily: 'Inter, sans-serif',
                fontSize: 16,
                lineHeight: 1.6,
            },
            layout: {
                margins: 40,
                spacing: 24,
                maxWidth: 800,
            },
        },
        defaultModules: {
            executiveSummary: true,
            metrics: true,
            campaignAnalysis: true,
            recommendations: true,
        },
    },
    {
        id: 'vibrant-gradient',
        name: 'Vibrant Dark', // Renamed slightly to reflect change, or keep name
        description: 'Couleurs vives avec dégradés dynamiques (Mode Sombre)',
        isSystemDefault: true,
        design: {
            mode: 'dark',
            colorScheme: {
                primary: '#f472b6',   // Pink 400 (Lightened for contrast)
                secondary: '#fb923c', // Orange 400
                accent: '#facc15',    // Yellow 400
                background: '#1e293b', // Slate 800
                text: '#f8fafc',
            },
            typography: {
                fontFamily: 'Inter, sans-serif',
                headingFontFamily: 'Outfit, sans-serif',
                fontSize: 16,
                lineHeight: 1.7,
            },
            layout: {
                margins: 48,
                spacing: 28,
                maxWidth: 800,
            },
        },
        defaultModules: {
            executiveSummary: true,
            metrics: true,
            campaignAnalysis: true,
            recommendations: false,
        },
    },
    {
        id: 'minimal-clean',
        name: 'Minimal Clean',
        description: 'Design minimaliste et épuré',
        isSystemDefault: true,
        design: {
            mode: 'light',
            colorScheme: {
                primary: '#18181b',
                secondary: '#52525b',
                accent: '#71717a',
                background: '#fafafa',
                text: '#09090b',
            },
            typography: {
                fontFamily: 'system-ui, sans-serif',
                headingFontFamily: 'system-ui, sans-serif',
                fontSize: 15,
                lineHeight: 1.8,
            },
            layout: {
                margins: 60,
                spacing: 32,
                maxWidth: 720,
            },
        },
        defaultModules: {
            executiveSummary: true,
            metrics: true,
            campaignAnalysis: false,
            recommendations: true,
        },
    },
    {
        id: 'corporate-grey',
        name: 'Corporate Grey',
        description: 'Thème corporate sobre et professionnel',
        isSystemDefault: true,
        design: {
            mode: 'light',
            colorScheme: {
                primary: '#475569',
                secondary: '#64748b',
                accent: '#64748b',   // Darkened (was #94a3b8)
                background: '#ffffff',
                text: '#1e293b',
            },
            typography: {
                fontFamily: 'Roboto, sans-serif',
                headingFontFamily: 'Roboto, sans-serif',
                fontSize: 16,
                lineHeight: 1.6,
            },
            layout: {
                margins: 40,
                spacing: 24,
                maxWidth: 800,
            },
        },
        defaultModules: {
            executiveSummary: true,
            metrics: true,
            campaignAnalysis: true,
            recommendations: true,
        },
    },
];

/**
 * Get a theme preset by ID
 */
export const getThemePresetById = (id: string): ThemePreset | undefined => {
    return defaultThemePresets.find(preset => preset.id === id);
};

/**
 * Get all available theme presets
 */
export const getAllThemePresets = (): ThemePreset[] => {
    return defaultThemePresets;
};
