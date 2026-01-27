import { useState, useEffect, useCallback, useRef } from 'react';
import { getFontByFamily, buildGoogleFontUrl, type GoogleFont } from '../data/googleFonts';

export type FontLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

interface FontLoadResult {
    family: string;
    state: FontLoadingState;
    error?: string;
}

// Global cache to track loaded fonts across all hook instances
const loadedFontsCache = new Map<string, FontLoadingState>();
const loadingPromises = new Map<string, Promise<void>>();

// Pre-loaded fonts from index.css (these are always available)
const PRELOADED_FONTS = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'];

/**
 * Hook for dynamically loading Google Fonts on demand
 *
 * Features:
 * - Lazy loading: Only loads fonts when requested
 * - Caching: Prevents duplicate loading of the same font
 * - FOIT prevention: Uses font-display: swap strategy
 * - Loading states: Tracks loading/loaded/error states
 *
 * @param fontFamilies - Array of font family names to load
 * @returns Object with loading state and utilities
 */
export function useFontLoader(fontFamilies: string[]) {
    const [fontStates, setFontStates] = useState<Record<string, FontLoadingState>>({});
    const mountedRef = useRef(true);

    // Initialize states from cache on mount
    useEffect(() => {
        const initialStates: Record<string, FontLoadingState> = {};
        fontFamilies.forEach(family => {
            const normalizedFamily = extractFontName(family);
            if (PRELOADED_FONTS.includes(normalizedFamily)) {
                initialStates[normalizedFamily] = 'loaded';
            } else if (loadedFontsCache.has(normalizedFamily)) {
                initialStates[normalizedFamily] = loadedFontsCache.get(normalizedFamily)!;
            } else {
                initialStates[normalizedFamily] = 'idle';
            }
        });
        setFontStates(initialStates);
    }, [fontFamilies.join(',')]);

    // Cleanup on unmount
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    /**
     * Load a single font
     */
    const loadFont = useCallback(async (fontFamily: string): Promise<FontLoadResult> => {
        const normalizedFamily = extractFontName(fontFamily);

        // Check if already loaded or preloaded
        if (PRELOADED_FONTS.includes(normalizedFamily)) {
            return { family: normalizedFamily, state: 'loaded' };
        }

        const cachedState = loadedFontsCache.get(normalizedFamily);
        if (cachedState === 'loaded') {
            return { family: normalizedFamily, state: 'loaded' };
        }

        // Check if already loading (return existing promise)
        if (loadingPromises.has(normalizedFamily)) {
            await loadingPromises.get(normalizedFamily);
            return {
                family: normalizedFamily,
                state: loadedFontsCache.get(normalizedFamily) || 'loaded'
            };
        }

        // Get font config
        const fontConfig = getFontByFamily(normalizedFamily);
        if (!fontConfig) {
            const error = `Font "${normalizedFamily}" not found in Google Fonts configuration`;
            loadedFontsCache.set(normalizedFamily, 'error');
            return { family: normalizedFamily, state: 'error', error };
        }

        // Start loading
        loadedFontsCache.set(normalizedFamily, 'loading');
        if (mountedRef.current) {
            setFontStates(prev => ({ ...prev, [normalizedFamily]: 'loading' }));
        }

        // Create loading promise
        const loadPromise = loadGoogleFont(fontConfig);
        loadingPromises.set(normalizedFamily, loadPromise);

        try {
            await loadPromise;
            loadedFontsCache.set(normalizedFamily, 'loaded');
            if (mountedRef.current) {
                setFontStates(prev => ({ ...prev, [normalizedFamily]: 'loaded' }));
            }
            return { family: normalizedFamily, state: 'loaded' };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load font';
            loadedFontsCache.set(normalizedFamily, 'error');
            if (mountedRef.current) {
                setFontStates(prev => ({ ...prev, [normalizedFamily]: 'error' }));
            }
            return { family: normalizedFamily, state: 'error', error: errorMessage };
        } finally {
            loadingPromises.delete(normalizedFamily);
        }
    }, []);

    /**
     * Load multiple fonts
     */
    const loadFonts = useCallback(async (families: string[]): Promise<FontLoadResult[]> => {
        return Promise.all(families.map(loadFont));
    }, [loadFont]);

    /**
     * Check if a font is loaded
     */
    const isFontLoaded = useCallback((fontFamily: string): boolean => {
        const normalizedFamily = extractFontName(fontFamily);
        if (PRELOADED_FONTS.includes(normalizedFamily)) return true;
        return loadedFontsCache.get(normalizedFamily) === 'loaded';
    }, []);

    /**
     * Get loading state for a font
     */
    const getFontState = useCallback((fontFamily: string): FontLoadingState => {
        const normalizedFamily = extractFontName(fontFamily);
        if (PRELOADED_FONTS.includes(normalizedFamily)) return 'loaded';
        return fontStates[normalizedFamily] || loadedFontsCache.get(normalizedFamily) || 'idle';
    }, [fontStates]);

    // Auto-load fonts on mount/change
    useEffect(() => {
        fontFamilies.forEach(family => {
            const normalizedFamily = extractFontName(family);
            if (!PRELOADED_FONTS.includes(normalizedFamily) && !loadedFontsCache.has(normalizedFamily)) {
                loadFont(family);
            }
        });
    }, [fontFamilies.join(','), loadFont]);

    const isLoading = Object.values(fontStates).some(state => state === 'loading');
    const isAllLoaded = fontFamilies.every(family => {
        const normalizedFamily = extractFontName(family);
        return PRELOADED_FONTS.includes(normalizedFamily) ||
            fontStates[normalizedFamily] === 'loaded' ||
            loadedFontsCache.get(normalizedFamily) === 'loaded';
    });

    return {
        fontStates,
        isLoading,
        isAllLoaded,
        loadFont,
        loadFonts,
        isFontLoaded,
        getFontState,
    };
}

/**
 * Load a single font using the loadSingleFont utility
 */
export async function loadSingleFont(fontFamily: string): Promise<boolean> {
    const normalizedFamily = extractFontName(fontFamily);

    // Check if preloaded
    if (PRELOADED_FONTS.includes(normalizedFamily)) {
        return true;
    }

    // Check cache
    if (loadedFontsCache.get(normalizedFamily) === 'loaded') {
        return true;
    }

    // Wait for existing load
    if (loadingPromises.has(normalizedFamily)) {
        await loadingPromises.get(normalizedFamily);
        return loadedFontsCache.get(normalizedFamily) === 'loaded';
    }

    // Get font config
    const fontConfig = getFontByFamily(normalizedFamily);
    if (!fontConfig) {
        console.warn(`Font "${normalizedFamily}" not found in Google Fonts configuration`);
        return false;
    }

    // Load the font
    loadedFontsCache.set(normalizedFamily, 'loading');
    const loadPromise = loadGoogleFont(fontConfig);
    loadingPromises.set(normalizedFamily, loadPromise);

    try {
        await loadPromise;
        loadedFontsCache.set(normalizedFamily, 'loaded');
        return true;
    } catch {
        loadedFontsCache.set(normalizedFamily, 'error');
        return false;
    } finally {
        loadingPromises.delete(normalizedFamily);
    }
}

/**
 * Internal function to load a Google Font via link injection
 */
async function loadGoogleFont(font: GoogleFont): Promise<void> {
    return new Promise((resolve, reject) => {
        // Check if link already exists
        const existingLink = document.querySelector(`link[data-font-family="${font.family}"]`);
        if (existingLink) {
            resolve();
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = buildGoogleFontUrl(font);
        link.setAttribute('data-font-family', font.family);
        link.setAttribute('data-dynamic-font', 'true');

        link.onload = () => {
            // Use FontFaceSet API if available for more precise loading detection
            if (document.fonts && document.fonts.load) {
                document.fonts.load(`16px "${font.family}"`).then(() => {
                    resolve();
                }).catch(() => {
                    // Font might still work even if this fails
                    resolve();
                });
            } else {
                // Fallback: assume loaded after stylesheet loads
                resolve();
            }
        };

        link.onerror = () => {
            reject(new Error(`Failed to load font: ${font.family}`));
        };

        document.head.appendChild(link);
    });
}

/**
 * Extract the font name from a font-family string
 * e.g., '"Inter", sans-serif' -> 'Inter'
 * e.g., 'Open Sans, sans-serif' -> 'Open Sans'
 */
function extractFontName(fontFamily: string): string {
    // Remove quotes and get the first font name
    const cleaned = fontFamily.trim();
    const match = cleaned.match(/^["']?([^"',]+)["']?/);
    return match ? match[1].trim() : cleaned;
}

/**
 * Hook to preload fonts for a report theme
 * Call this at the report/preview level to ensure fonts are ready
 */
export function useThemeFonts(
    fontFamily?: string,
    headingFontFamily?: string
) {
    // Deduplicate fonts - only include unique, non-empty values
    const uniqueFonts = [...new Set([fontFamily, headingFontFamily].filter(Boolean) as string[])];

    return useFontLoader(uniqueFonts);
}

/**
 * Check if a font is available (loaded or system font)
 */
export function isFontAvailable(fontFamily: string): boolean {
    const normalizedFamily = extractFontName(fontFamily);

    // Check preloaded
    if (PRELOADED_FONTS.includes(normalizedFamily)) return true;

    // Check cache
    if (loadedFontsCache.get(normalizedFamily) === 'loaded') return true;

    // Check if it's a system font using canvas trick
    if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
            const testString = 'mmmmmmmmmmlli';
            const baseFont = 'monospace';

            context.font = `72px ${baseFont}`;
            const baseWidth = context.measureText(testString).width;

            context.font = `72px "${normalizedFamily}", ${baseFont}`;
            const testWidth = context.measureText(testString).width;

            return baseWidth !== testWidth;
        }
    }

    return false;
}

export default useFontLoader;
