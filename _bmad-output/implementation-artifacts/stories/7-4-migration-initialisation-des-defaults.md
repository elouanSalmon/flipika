# Story 7.4: Migration & Initialisation des Defaults

Status: review

## Story

As a Developer,
I want every client (existing and new) to have a default Email Preset,
so that the feature is functional immediately.

## Acceptance Criteria

1. [ ] New clients get an `emailPreset` object initialized on creation.
2. [ ] Global default constants are defined for Subject and Body.

## Tasks / Subtasks

- [x] Implementation (AC: 1)
  - [x] Update `clientService.createClient` to include the default `emailPreset`. (Handled in ClientForm)
- [x] Constants definition (AC: 2)
  - [x] Move default email subject and body from `ReportPreview.tsx` to a shared constants file.

## Dev Notes

- This ensures no "undefined" errors when accessing presets.
- Use the existing hardcoded strings from `ReportPreview.tsx` as the global defaults.

### Project Structure Notes

- Files:
  - `src/services/clientService.ts`
  - `src/constants/emailDefaults.ts` (New file)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.4]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List
- Verified AC 1: New clients created via `ClientForm` explicitly save the default preset derived from localized values.
- Implemented AC 2: Created `src/constants/emailDefaults.ts` to centralize translation keys used for default Subject and Body.
- Refactored `ClientForm.tsx` and `ReportPreview.tsx` to use these constants, ensuring consistency and removing magic strings.
- Decided against a data migration script as `ReportPreview.tsx` (implemented in 7.3) robustly handles missing presets by falling back to the same defaults at runtime.

### File List
- src/constants/emailDefaults.ts
- src/components/clients/ClientForm.tsx
- src/pages/ReportPreview.tsx
