# Deep Dive: Design System

This document provides a comprehensive analysis of the Design System used in **Flipika**. It details the configuration, foundational elements, and component patterns that ensure UI consistency.

## 1. Core Philosophy & Configuration

The design system is built on **Tailwind CSS** with a custom configuration that emphasizes a **Premium, Glassmorphic** aesthetic. It supports **Dark Mode** natively and uses a harmonized **Blue-centric** color palette.

### 1.1 Technology Stack
-   **Styling**: Tailwind CSS + Custom CSS Variables
-   **Icons**: `lucide-react`
-   **Fonts**: Google Fonts (Inter)
-   **Animations**: CSS Transitions + `framer-motion` (for complex components like Modals)

### 1.2 Configuration (`tailwind.config.js`)
The configuration extends the default theme with specific color aliases and utilities.

-   **Dark Mode**: Enabled via `class` strategy.
-   **Content Paths**: Scans `./index.html` and `./src/**/*.{js,ts,jsx,tsx}`.
-   **Custom Colors**:
    -   `primary`: Blue variations (`#3385ff`, `#66a3ff`, `#0066ff`)
    -   `secondary`: Currently mirrors primary (Needs review if distinct secondary needed).
    -   `accent`: Currently mirrors primary.
-   **Extend**:
    -   `backdropBlur`: Custom `xs` size (2px).

## 2. Global Styling (`src/index.css`)

The global stylesheet is the source of truth for design tokens, implementing them as CSS variables for runtime flexibility (especially for theme switching).

### 2.1 Typography
-   **Font Family**: `Inter` (sans-serif).
-   **Scale**: defined in variables from `2xs` to `7xl`, plus semantic sizes like `--font-size-hero`, `--font-size-card-title`.

### 2.2 Color System (CSS Variables)
The system uses semantic naming (e.g., `--color-bg-primary`) mapped to concrete values.

| Variable | Light Mode | Dark Mode | Note |
| :--- | :--- | :--- | :--- |
| **Primary** | `#0066ff` | `#3385ff` | Brighter in dark mode |
| **Background** | `#ffffff` | `#0a0e1a` | Deep blue/black for dark mode |
| **Surface** | `#f8fafc` | `#1f2937` | |
| **Glass BG** | `rgba(255,255,255,0.25)` | `rgba(17,24,39,0.3)` | |

### 2.3 Glassmorphism
A core visual trait is the `.glass` utility class:
```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop); /* blur(20px) */
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}
```

### 2.4 Shadows & Glows
Custom shadows are defined for depth and "glow" effects:
-   `--shadow-glow-blue`: Blue ambient glow.
-   `--shadow-glow-accent`: Green/Accent ambient glow.
-   `--shadow-2xl`: Deep drop shadow for modals/cards.

## 3. Component Classes (CSS)

Several complex components are defined directly in CSS using `@layer components` and `@apply`.

### 3.1 Buttons (`.btn`)
Base `.btn` class with standard padding/radius.
-   **Variants**:
    -   `.btn-primary`: Gradient background, light text, shadow.
    -   `.btn-secondary`: Glass background, border.
    -   `.btn-outline`: Transparent, colored border.
    -   `.btn-danger`: Red background (`#ef4444`).
-   **Sizes**: `.btn-sm`, `.btn-lg`, `.btn-xl`.
-   **Link**: `.btn-link` for text-only buttons.

### 3.2 Status Badges (`.status-badge`)
Used heavily in lists (campaigns, reports).
-   **Structure**: Rounded full, flex layout, gap.
-   **Variants**: `.success` (Green), `.warning`/`.paused` (Amber), `.error` (Red), `.neutral`/`.archived` (Gray).

### 3.3 Listing Cards (`.listing-card`)
A complex card component for displaying items (e.g., Reports, Subscriptions).
-   **Interactive**: Hover lift (`-translate-y-1`), border color change.
-   **Sections**:
    -   Header (`.listing-card-header`)
    -   Title Group (`.listing-card-title`, `.listing-card-subtitle`)
    -   Body (`.listing-card-body`)
    -   Footer (`.listing-card-footer`) with stats.
    -   Actions (`.listing-card-actions`): Floating action buttons that appear on hover.

## 4. React Component Patterns

Code patterns observed in `src/components/common`.

### 4.1 Modals (`ConfirmationModal.tsx`)
-   **Portal**: Rendered via `ReactDOM.createPortal` to `document.body`.
-   **Animation**: `framer-motion` implementation (`AnimatePresence`).
-   **Styling**: Inline styles sometimes used for dynamic variable usage (e.g., `background: 'var(--color-bg-card)'`).
-   **Backdrop**: Blur effect (`backdrop-blur-sm`).

### 4.2 Icons
-   **Library**: `lucide-react`.
-   **Usage**: Imported individually (e.g., `import { Filter, X } from 'lucide-react'`).
-   **Sizing**: Often hardcoded prop `size={20}` or controlled via CSS classes.

### 4.3 Filters (`FilterBar.tsx`)
-   **Layout**: Responsive flex container (Column on mobile, Row on desktop).
-   **Inputs**: Native `<select>` elements styled with Tailwind rings and borders.
-   **Theme Adaptation**: `dark:bg-gray-800`, `dark:text-gray-100` classes used extensively.

## 5. Migration & Maintenance Guidelines

To maintain design integrity:
1.  **Use CSS Variables**: Prefer `var(--color-primary)` over standard Tailwind colors if the specific shade is important for the theme.
2.  **Glass Effect**: Use the `.glass` utility instead of manually writing backdrop-filter rules.
3.  **Buttons**: Always use `.btn` classes instead of rebuilding buttons from scratch.
4.  **Cards**: For list items, use the `.listing-card` structure to ensure consistent hover states and layout.
