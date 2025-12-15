# PWA Icon Assets Guide for Flipika

This document provides specifications for all icon assets required for the Flipika PWA implementation.

## Required Icon Files

All icons should be placed in the `public/` directory.

### 1. Standard PWA Icons

#### icon-192.png
- **Size:** 192x192 pixels
- **Format:** PNG with transparency
- **Purpose:** Standard PWA icon for Android home screen and app drawer
- **Design:** Full Flipika logo with blue gradient background (#0066ff)

#### icon-512.png
- **Size:** 512x512 pixels
- **Format:** PNG with transparency
- **Purpose:** Large PWA icon for splash screens and high-resolution displays
- **Design:** Same as 192px version, just larger

### 2. Maskable Icons (Android Adaptive Icons)

Maskable icons are required for Android adaptive icons that can be shaped differently on different devices.

#### icon-maskable-192.png
- **Size:** 192x192 pixels
- **Format:** PNG with transparency
- **Purpose:** Adaptive icon for Android (small)
- **Safe Zone:** Keep important content within central 80% (154x154px)
- **Design:** Flipika logo centered with padding, solid background

#### icon-maskable-512.png
- **Size:** 512x512 pixels
- **Format:** PNG with transparency
- **Purpose:** Adaptive icon for Android (large)
- **Safe Zone:** Keep important content within central 80% (410x410px)
- **Design:** Same as 192px maskable version, just larger

**Important:** Maskable icons should have a solid background color (blue #0066ff recommended) because they will be clipped into various shapes (circle, squircle, rounded square) on different Android devices.

### 3. iOS Icons

#### apple-touch-icon.png
- **Size:** 180x180 pixels
- **Format:** PNG (no transparency needed, iOS adds its own effects)
- **Purpose:** iOS home screen icon
- **Design:** Full Flipika logo with solid background
- **Note:** iOS automatically adds rounded corners and shadow

### 4. Favicon (Already exists)

#### favicon.svg
- **Current file:** Already present in your project
- **Purpose:** Browser tab icon
- **No changes needed**

## Design Recommendations

### Color Palette
- **Primary Blue:** #0066ff (Flipika brand color)
- **Background:** White (#ffffff) or Blue (#0066ff)
- **Logo:** Ensure high contrast against background

### Logo Placement
- **Standard Icons (192, 512):** Logo can fill most of the canvas (leave ~10% padding)
- **Maskable Icons:** Logo must be within the central 80% safe zone
- **Apple Touch Icon:** Logo can fill most of the canvas (iOS adds its own padding)

## Quick Generation Tools

You can use these online tools to generate PWA icons:

1. **PWA Asset Generator:** https://www.pwabuilder.com/imageGenerator
   - Upload a single 512x512 source image
   - Automatically generates all required sizes

2. **Favicon.io:** https://favicon.io/
   - Generate icons from text, image, or emoji

3. **RealFaviconGenerator:** https://realfavicongenerator.net/
   - Comprehensive favicon and PWA icon generator

## Verification Checklist

After generating icons, verify:
- [ ] All 5 icon files are in the `public/` directory
- [ ] Icons display correctly in browser DevTools → Application → Manifest
- [ ] Maskable icons have content within safe zone (use maskable.app to test)
- [ ] Icons look good on both light and dark backgrounds
- [ ] File sizes are optimized (each should be < 50KB)

## Testing Maskable Icons

Visit https://maskable.app/ and upload your maskable icons to preview how they'll look on different Android devices with various icon shapes.
