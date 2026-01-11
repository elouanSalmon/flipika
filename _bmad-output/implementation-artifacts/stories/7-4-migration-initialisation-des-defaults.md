# Story 7.4: Migration & Initialisation des Defaults

Status: backlog

## Story

As a Developer,
I want every client (existing and new) to have a default Email Preset,
so that the feature is functional immediately.

## Acceptance Criteria

1. [ ] New clients get an `emailPreset` object initialized on creation.
2. [ ] Global default constants are defined for Subject and Body.

## Tasks / Subtasks

- [ ] Implementation (AC: 1)
  - [ ] Update `clientService.createClient` to include the default `emailPreset`.
- [ ] Constants definition (AC: 2)
  - [ ] Move default email subject and body from `ReportPreview.tsx` to a shared constants file.

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

### File List
