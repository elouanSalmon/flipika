# GEMINI.md - Memory & Guidelines

## ⚠️ Critical Rules (NEVER IGNORE)

1.  **Firebase Security Rules**:
    - ALWAYS update `firestore.rules` when creating new collections or modifying access patterns.
    - NEVER assume a collection exists or is accessible without checking rules.
    - When adding a new feature that stores data, ask yourself: *"Does the current user have write access to this path in firestore.rules?"*
    - **Action**: Run `firebase deploy --only firestore:rules` if you have access, or notify user to do it.

2.  **Tailwind & Styling**:
    - ALWAYS import necessary Tailwind/CSS files for styles to apply.
    - DO NOT rely on implicit imports.
    - Check global `index.css` or `App.css` to see available utility classes.
    - Ensure your component files are covered by `tailwind.config.js`.

3.  **Deployment & Environments**:
    - NEVER run `firebase deploy` directly for hosting.
    - ALWAYS use `npm run deploy:dev` or `npm run deploy:prod`.
    - This ensures Vite builds with the correct `--mode` and uses the correct `.env` files.
    - **Action**: Use `npm run deploy:hosting:dev` if you only need to update the frontend.

4.  **Z-Index Hierarchy**:
    - **Header**: `z-40`
    - **Modals**: `z-50`+ (MUST be higher than Header). **Tip**: Use `createPortal` to render at `document.body`.
    - **Toasts**: `z-60`+

3.  **Internationalization (i18n)**:
    - ALWAYS add new keys to BOTH French (`src/locales/fr/`) AND English (`src/locales/en/`) files.
    - NEVER hardcode text in components; use `t('namespace:key')`.

    - Check `src/i18n.ts` if adding a new namespace is required.

5.  **Design System**:
    - **NO EMOJIS**: Do NOT use emojis in the UI (buttons, labels, text). Use Lucide icons instead.
    - **Consistent Card Styles**: Use `.listing-card` framework in `src/index.css`.

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

6.  **Firestore Indexes**:
    - ALWAYS checking `firestore.indexes.json` when writing complex queries (filtering by multiple fields or sorting).
    - **Action**: Run `firebase deploy --only firestore:indexes` (for both dev/prod) if you add a new composite index.
