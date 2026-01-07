# Data Models - Part: backend

> **Scan Level**: Quick (Pattern Matching Only)
> **Generated**: 2026-01-05

## Data Structure Analysis

No dedicated `models` directory was found in `functions/src/` during the quick scan.

### Inferred Strategy
1.  **Shared Types**: The backend likely shares type definitions with the frontend (common in TypeScript monorepos/workspaces) or defines them inline.
2.  **Direct Firestore**: Functions likely operate directly on Firestore collections matching the entities found in the Web part (`reports`, `users`, `templates`).

### Type Validation
- `validators.ts` was found in `functions/src/`, usage likely involves runtime validation of these data structures.

_(Note: To confirm shared usage or find inline type definitions, a Deep scan is required.)_
