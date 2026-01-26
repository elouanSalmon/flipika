export interface RGB {
    r: number;
    g: number;
    b: number;
}

/**
 * Converts a hex string to an RGB object.
 * Supports #RGB and #RRGGBB formats.
 */
export const hexToRgb = (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        };
    }
    const shortResult = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (shortResult) {
        return {
            r: parseInt(shortResult[1] + shortResult[1], 16),
            g: parseInt(shortResult[2] + shortResult[2], 16),
            b: parseInt(shortResult[3] + shortResult[3], 16)
        };
    }
    return null;
};

/**
 * Converts an RGB object to a hex string.
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Calculates the relative luminance of a color.
 * Implementation from WCAG 2.0 guidelines.
 */
export const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

/**
 * Calculates the contrast ratio between two colors.
 * Returns a value between 1 (no contrast) and 21 (max contrast).
 */
export const getContrastRatio = (color1: string, color2: string): number => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return 1;

    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Checks if the contrast ratio meets the WCAG 2.0 AA standard (4.5:1 for normal text).
 */
export const isAccessible = (textColor: string, backgroundColor: string): boolean => {
    return getContrastRatio(textColor, backgroundColor) >= 4.5;
};

/**
 * Checks if the contrast ratio meets the WCAG 2.0 AAA standard (7:1 for normal text).
 */
export const isAccessibleAAA = (textColor: string, backgroundColor: string): boolean => {
    return getContrastRatio(textColor, backgroundColor) >= 7;
};

/**
 * Adjusts the brightness of a color to meet the target contrast ratio against a background.
 * This is a naive implementation that simple darkens or lightens the color heavily until it passes.
 */
export const getAccessibleColor = (color: string, background: string, minContrast: number = 4.5): string => {
    if (getContrastRatio(color, background) >= minContrast) return color;

    const bgRgb = hexToRgb(background);
    if (!bgRgb) return color;

    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const targetLuminanceIsLighter = bgLuminance < 0.5; // If bg is dark, we need lighter color

    let currentHex = color;
    let rgb = hexToRgb(currentHex);
    if (!rgb) return color;

    // Safety break
    let iterations = 0;
    while (getContrastRatio(currentHex, background) < minContrast && iterations < 100) {
        if (targetLuminanceIsLighter) {
            // Lighten
            rgb.r = Math.min(255, rgb.r + 5);
            rgb.g = Math.min(255, rgb.g + 5);
            rgb.b = Math.min(255, rgb.b + 5);
        } else {
            // Darken
            rgb.r = Math.max(0, rgb.r - 5);
            rgb.g = Math.max(0, rgb.g - 5);
            rgb.b = Math.max(0, rgb.b - 5);
        }
        currentHex = rgbToHex(rgb.r, rgb.g, rgb.b);
        iterations++;
    }

    return currentHex;
};
