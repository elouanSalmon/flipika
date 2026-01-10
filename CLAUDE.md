# CLAUDE.md - Memory & Guidelines

## ⚠️ Critical Rules (NEVER IGNORE)

1.  **Firebase Security Rules**:
    - ALWAYS update `firestore.rules` when creating new collections or modifying access patterns.
    - NEVER assume a collection exists or is accessible without checking rules.
    - When adding a new feature that stores data, ask yourself: *"Does the current user have write access to this path in firestore.rules?"*

2.  **Tailwind & Styling**:
    - ALWAYS import necessary Tailwind/CSS files for styles to apply.
    - DO NOT rely on implicit imports.
    - Check global `index.css` or `App.css` to see available utility classes.
    - If a style isn't applying, verify the component is included in `tailwind.config.js` `content` array.

4.  **Z-Index Hierarchy**:
    - **Header**: `z-40` (Sticky/Fixed elements)
    - **Modals/Overlays**: `z-50` or higher (Must overlap header)
    - **Toasts/Notifications**: `z-60` or higher
    - ALWAYS ensure modals use a higher z-index than the header to prevent clipping.
    - **Portal**: Always use `createPortal` (rendering to `document.body`) for modals to avoid stacking context issues with sticky headers.

3.  **Internationalization (i18n)**:
    - ALWAYS add new keys to BOTH French (`src/locales/fr/`) AND English (`src/locales/en/`) files.
    - NEVER hardcode text.

## 📄 Project Context

- **Main Context**: `_bmad-output/project-context.md` (Read this first!)
- **Architecture**: `_bmad-output/planning-artifacts/architecture.md`
- **Epics**: `_bmad-output/planning-artifacts/epics.md`

## 🛠 Tech Stack & Patterns

- **Framework**: React + Vite + TypeScript
- **Styling**: TailwindCSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **State**: React Context (Auth, Theme, etc.)
- **Navigation**: React Router DOM

## 🏗 Architecture Shortcuts

- **Pages**: `src/pages/` (One file per route)
- **Components**: `src/components/` (Reusable UI)
- **Services**: `src/services/` (Firestore abstractions)
- **Contexts**: `src/contexts/` (Global state)
- **Types**: `src/types/` (Shared interfaces)

## 🚀 Common Commands

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `firebase deploy --only firestore:rules` - **Deploy rules (Do this after editing rules!)**
- `firebase deploy --only functions` - Deploy functions
