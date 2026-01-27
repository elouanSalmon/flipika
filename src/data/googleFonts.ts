/**
 * Google Fonts Configuration
 *
 * A curated list of ~80 popular Google Fonts organized by category.
 * These fonts cover a wide range of styles suitable for professional reports.
 */

export interface GoogleFont {
    family: string;
    category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
    weights: number[];
    fallback: string;
    popularity: number; // 1-100, higher = more popular
}

/**
 * Curated list of Google Fonts
 * Selected for readability, professional appearance, and popularity
 */
export const GOOGLE_FONTS: GoogleFont[] = [
    // === SANS-SERIF (Most Popular for UI/Reports) ===
    { family: 'Inter', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 100 },
    { family: 'Roboto', category: 'sans-serif', weights: [300, 400, 500, 700, 900], fallback: 'sans-serif', popularity: 99 },
    { family: 'Open Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], fallback: 'sans-serif', popularity: 98 },
    { family: 'Lato', category: 'sans-serif', weights: [300, 400, 700, 900], fallback: 'sans-serif', popularity: 97 },
    { family: 'Montserrat', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 96 },
    { family: 'Poppins', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 95 },
    { family: 'Nunito', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 94 },
    { family: 'Nunito Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 93 },
    { family: 'Source Sans 3', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 900], fallback: 'sans-serif', popularity: 92 },
    { family: 'Raleway', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 91 },
    { family: 'Work Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 90 },
    { family: 'Outfit', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 89 },
    { family: 'DM Sans', category: 'sans-serif', weights: [400, 500, 700], fallback: 'sans-serif', popularity: 88 },
    { family: 'Manrope', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], fallback: 'sans-serif', popularity: 87 },
    { family: 'Plus Jakarta Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], fallback: 'sans-serif', popularity: 86 },
    { family: 'Mulish', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 85 },
    { family: 'Rubik', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 84 },
    { family: 'Quicksand', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'sans-serif', popularity: 83 },
    { family: 'Barlow', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 82 },
    { family: 'Karla', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], fallback: 'sans-serif', popularity: 81 },
    { family: 'Lexend', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 80 },
    { family: 'IBM Plex Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'sans-serif', popularity: 79 },
    { family: 'Figtree', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 78 },
    { family: 'Sora', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], fallback: 'sans-serif', popularity: 77 },
    { family: 'Albert Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 76 },
    { family: 'Space Grotesk', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'sans-serif', popularity: 75 },
    { family: 'Public Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 74 },
    { family: 'Cabin', category: 'sans-serif', weights: [400, 500, 600, 700], fallback: 'sans-serif', popularity: 73 },
    { family: 'Josefin Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'sans-serif', popularity: 72 },
    { family: 'Archivo', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 71 },
    { family: 'Overpass', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 70 },
    { family: 'Exo 2', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 69 },
    { family: 'Ubuntu', category: 'sans-serif', weights: [300, 400, 500, 700], fallback: 'sans-serif', popularity: 68 },
    { family: 'Noto Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 67 },
    { family: 'Fira Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'sans-serif', popularity: 66 },
    { family: 'Oxygen', category: 'sans-serif', weights: [300, 400, 700], fallback: 'sans-serif', popularity: 65 },
    { family: 'Hind', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'sans-serif', popularity: 64 },
    { family: 'Assistant', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], fallback: 'sans-serif', popularity: 63 },
    { family: 'Asap', category: 'sans-serif', weights: [400, 500, 600, 700], fallback: 'sans-serif', popularity: 62 },

    // === SERIF (For Elegant/Traditional Reports) ===
    { family: 'Merriweather', category: 'serif', weights: [300, 400, 700, 900], fallback: 'serif', popularity: 90 },
    { family: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700, 800, 900], fallback: 'serif', popularity: 89 },
    { family: 'Lora', category: 'serif', weights: [400, 500, 600, 700], fallback: 'serif', popularity: 88 },
    { family: 'PT Serif', category: 'serif', weights: [400, 700], fallback: 'serif', popularity: 87 },
    { family: 'Libre Baskerville', category: 'serif', weights: [400, 700], fallback: 'serif', popularity: 86 },
    { family: 'Source Serif 4', category: 'serif', weights: [300, 400, 500, 600, 700, 900], fallback: 'serif', popularity: 85 },
    { family: 'Crimson Text', category: 'serif', weights: [400, 600, 700], fallback: 'serif', popularity: 84 },
    { family: 'Cormorant Garamond', category: 'serif', weights: [300, 400, 500, 600, 700], fallback: 'serif', popularity: 83 },
    { family: 'EB Garamond', category: 'serif', weights: [400, 500, 600, 700, 800], fallback: 'serif', popularity: 82 },
    { family: 'Bitter', category: 'serif', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'serif', popularity: 81 },
    { family: 'Noto Serif', category: 'serif', weights: [400, 700], fallback: 'serif', popularity: 80 },
    { family: 'IBM Plex Serif', category: 'serif', weights: [300, 400, 500, 600, 700], fallback: 'serif', popularity: 79 },
    { family: 'Libre Caslon Text', category: 'serif', weights: [400, 700], fallback: 'serif', popularity: 78 },
    { family: 'Spectral', category: 'serif', weights: [300, 400, 500, 600, 700, 800], fallback: 'serif', popularity: 77 },
    { family: 'Cardo', category: 'serif', weights: [400, 700], fallback: 'serif', popularity: 76 },

    // === DISPLAY (For Headlines/Titles) ===
    { family: 'Bebas Neue', category: 'display', weights: [400], fallback: 'sans-serif', popularity: 90 },
    { family: 'Oswald', category: 'display', weights: [300, 400, 500, 600, 700], fallback: 'sans-serif', popularity: 89 },
    { family: 'Anton', category: 'display', weights: [400], fallback: 'sans-serif', popularity: 88 },
    { family: 'Righteous', category: 'display', weights: [400], fallback: 'sans-serif', popularity: 87 },
    { family: 'Staatliches', category: 'display', weights: [400], fallback: 'sans-serif', popularity: 86 },
    { family: 'Alfa Slab One', category: 'display', weights: [400], fallback: 'serif', popularity: 85 },
    { family: 'Abril Fatface', category: 'display', weights: [400], fallback: 'serif', popularity: 84 },
    { family: 'Passion One', category: 'display', weights: [400, 700, 900], fallback: 'sans-serif', popularity: 83 },
    { family: 'Permanent Marker', category: 'display', weights: [400], fallback: 'cursive', popularity: 82 },
    { family: 'Comfortaa', category: 'display', weights: [300, 400, 500, 600, 700], fallback: 'sans-serif', popularity: 81 },

    // === MONOSPACE (For Code/Data) ===
    { family: 'Fira Code', category: 'monospace', weights: [300, 400, 500, 600, 700], fallback: 'monospace', popularity: 95 },
    { family: 'JetBrains Mono', category: 'monospace', weights: [300, 400, 500, 600, 700, 800], fallback: 'monospace', popularity: 94 },
    { family: 'Source Code Pro', category: 'monospace', weights: [300, 400, 500, 600, 700, 900], fallback: 'monospace', popularity: 93 },
    { family: 'Roboto Mono', category: 'monospace', weights: [300, 400, 500, 600, 700], fallback: 'monospace', popularity: 92 },
    { family: 'IBM Plex Mono', category: 'monospace', weights: [300, 400, 500, 600, 700], fallback: 'monospace', popularity: 91 },
    { family: 'Space Mono', category: 'monospace', weights: [400, 700], fallback: 'monospace', popularity: 90 },
    { family: 'Inconsolata', category: 'monospace', weights: [300, 400, 500, 600, 700, 800, 900], fallback: 'monospace', popularity: 89 },
];

/**
 * Get fonts sorted by popularity (default) or alphabetically
 */
export function getSortedFonts(sortBy: 'popularity' | 'alphabetical' = 'popularity'): GoogleFont[] {
    const fonts = [...GOOGLE_FONTS];
    if (sortBy === 'alphabetical') {
        return fonts.sort((a, b) => a.family.localeCompare(b.family));
    }
    return fonts.sort((a, b) => b.popularity - a.popularity);
}

/**
 * Get fonts filtered by category
 */
export function getFontsByCategory(category: GoogleFont['category']): GoogleFont[] {
    return GOOGLE_FONTS.filter(font => font.category === category)
        .sort((a, b) => b.popularity - a.popularity);
}

/**
 * Search fonts by name
 */
export function searchFonts(query: string): GoogleFont[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return getSortedFonts();

    return GOOGLE_FONTS.filter(font =>
        font.family.toLowerCase().includes(normalizedQuery) ||
        font.category.toLowerCase().includes(normalizedQuery)
    ).sort((a, b) => b.popularity - a.popularity);
}

/**
 * Get a font by family name
 */
export function getFontByFamily(family: string): GoogleFont | undefined {
    return GOOGLE_FONTS.find(font => font.family.toLowerCase() === family.toLowerCase());
}

/**
 * Build the Google Fonts CSS URL for a specific font
 */
export function buildGoogleFontUrl(font: GoogleFont): string {
    const weights = font.weights.join(';');
    const family = font.family.replace(/ /g, '+');
    return `https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap`;
}

/**
 * Build the Google Fonts CSS URL for multiple fonts
 */
export function buildGoogleFontsUrl(fonts: GoogleFont[]): string {
    if (fonts.length === 0) return '';

    const families = fonts.map(font => {
        const weights = font.weights.join(';');
        const family = font.family.replace(/ /g, '+');
        return `family=${family}:wght@${weights}`;
    }).join('&');

    return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/**
 * Get the CSS font-family string for a font
 */
export function getFontFamilyString(font: GoogleFont): string {
    // Wrap family name in quotes if it contains spaces
    const familyName = font.family.includes(' ') ? `"${font.family}"` : font.family;
    return `${familyName}, ${font.fallback}`;
}

/**
 * Extract the base font name from a font-family string like '"Inter", sans-serif'
 */
export function extractFontFamily(fontFamilyString: string): string {
    // Remove quotes and get the first font name
    const match = fontFamilyString.match(/^["']?([^"',]+)["']?/);
    return match ? match[1].trim() : fontFamilyString;
}

/**
 * Default/fallback fonts that are always available (system fonts)
 */
export const SYSTEM_FONTS = [
    { family: 'System Default', value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    { family: 'Arial', value: 'Arial, Helvetica, sans-serif' },
    { family: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
    { family: 'Times New Roman', value: '"Times New Roman", Times, serif' },
];
