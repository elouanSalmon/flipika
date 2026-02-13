import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { loadSingleFont, isFontAvailable } from '../hooks/useFontLoader';
import { extractFontFamily } from '../data/googleFonts';

interface FontContextValue {
    /** Whether all required fonts are loaded and ready */
    fontsReady: boolean;
    /** Current body font family string */
    fontFamily: string;
    /** Current heading font family string */
    headingFontFamily: string;
    /** Loading state for fonts */
    isLoadingFonts: boolean;
    /** Force refresh charts after font load */
    fontVersion: number;
    /** Manually trigger font loading */
    loadFont: (family: string) => Promise<boolean>;
}

const FontContext = createContext<FontContextValue | null>(null);

interface FontProviderProps {
    fontFamily?: string;
    headingFontFamily?: string;
    children: React.ReactNode;
}

/**
 * FontProvider - Provides font loading and state management for a report/preview context
 *
 * Features:
 * - Automatically loads fonts when fontFamily or headingFontFamily changes
 * - Provides `fontsReady` flag for components to know when to render
 * - Provides `fontVersion` that increments when fonts are loaded (for forcing chart re-renders)
 * - Prevents FOIT by waiting for fonts to be ready
 */
export const FontProvider: React.FC<FontProviderProps> = ({
    fontFamily = 'DM Sans, sans-serif',
    headingFontFamily,
    children,
}) => {
    const [fontsReady, setFontsReady] = useState(false);
    const [isLoadingFonts, setIsLoadingFonts] = useState(false);
    const [fontVersion, setFontVersion] = useState(0);

    // Extract actual font names from font-family strings
    const bodyFontName = useMemo(() => extractFontFamily(fontFamily), [fontFamily]);
    const headingFontName = useMemo(
        () => extractFontFamily(headingFontFamily || fontFamily),
        [headingFontFamily, fontFamily]
    );

    // Check and load fonts when they change
    useEffect(() => {
        const loadFonts = async () => {
            const fontsToLoad: string[] = [];

            // Check if body font needs loading
            if (!isFontAvailable(bodyFontName)) {
                fontsToLoad.push(bodyFontName);
            }

            // Check if heading font needs loading (only if different from body)
            if (headingFontName !== bodyFontName && !isFontAvailable(headingFontName)) {
                fontsToLoad.push(headingFontName);
            }

            // If no fonts need loading, mark as ready
            if (fontsToLoad.length === 0) {
                setFontsReady(true);
                return;
            }

            // Start loading
            setIsLoadingFonts(true);
            setFontsReady(false);

            try {
                // Load all fonts in parallel
                const results = await Promise.all(fontsToLoad.map(loadSingleFont));

                // Check if all loaded successfully
                const allLoaded = results.every(Boolean);

                if (allLoaded) {
                    // Increment version to trigger chart re-renders
                    setFontVersion(prev => prev + 1);
                }

                setFontsReady(true);
            } catch (error) {
                console.error('Error loading fonts:', error);
                // Still mark as ready so we don't block rendering
                setFontsReady(true);
            } finally {
                setIsLoadingFonts(false);
            }
        };

        loadFonts();
    }, [bodyFontName, headingFontName]);

    // Manual font loading function
    const loadFont = useCallback(async (family: string): Promise<boolean> => {
        const fontName = extractFontFamily(family);
        if (isFontAvailable(fontName)) {
            return true;
        }

        const result = await loadSingleFont(fontName);
        if (result) {
            setFontVersion(prev => prev + 1);
        }
        return result;
    }, []);

    const value = useMemo<FontContextValue>(
        () => ({
            fontsReady,
            fontFamily,
            headingFontFamily: headingFontFamily || fontFamily,
            isLoadingFonts,
            fontVersion,
            loadFont,
        }),
        [fontsReady, fontFamily, headingFontFamily, isLoadingFonts, fontVersion, loadFont]
    );

    return <FontContext.Provider value={value}>{children}</FontContext.Provider>;
};

/**
 * Hook to access font context
 * Must be used within a FontProvider
 */
export function useFontContext(): FontContextValue {
    const context = useContext(FontContext);
    if (!context) {
        // Return default values if not in a FontProvider
        // This allows components to work outside of a report context
        return {
            fontsReady: true,
            fontFamily: 'DM Sans, sans-serif',
            headingFontFamily: 'DM Sans, sans-serif',
            isLoadingFonts: false,
            fontVersion: 0,
            loadFont: async () => true,
        };
    }
    return context;
}

/**
 * Hook to get font family string for charts
 * Returns the font family and a key that changes when fonts are loaded
 * Use the key as a React key to force chart re-renders when fonts become available
 */
export function useChartFont(): { fontFamily: string; chartKey: string } {
    const { fontFamily, fontVersion } = useFontContext();

    return useMemo(
        () => ({
            fontFamily: extractFontFamily(fontFamily),
            chartKey: `chart-font-${fontVersion}`,
        }),
        [fontFamily, fontVersion]
    );
}

export default FontContext;
