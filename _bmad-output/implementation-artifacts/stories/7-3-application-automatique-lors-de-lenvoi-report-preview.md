# Story 7.3: Application Automatique lors de l'envoi (Report Preview)

Status: review

## Story

As a User,
I want the "Send" action to use my custom Email Preset,
so that I don't have to copy-paste or re-type the message.

## Acceptance Criteria

1. [ ] The `mailto:` link in `ReportPreview.tsx` uses the customized Subject and Body.
2. [ ] Variables are correctly replaced by real values from the context.
3. [ ] Fallback to global default if client configuration is missing.

## Tasks / Subtasks

- [x] Value Replacement Logic (AC: 2)
  - [x] Create a utility `resolveEmailVariables(text, context)` that replaces `[key]` with values.
  - [x] Provide context: `Client`, `Report`, `User Profile`.
- [x] Preview Page Integration (AC: 1, 3)
  - [x] Update `handleSendEmail` in `ReportPreview.tsx` to fetch the client and its email preset.
  - [x] Replace hardcoded texts with resolved Preset content.

## Dev Notes

- Test with empty presets to ensure fallbacks work.
- Handle encoding for the `mailto:` URL properly.

### Project Structure Notes

- Files:
  - `src/pages/ReportPreview.tsx`
  - `src/utils/emailResolver.ts` (New utility)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.3]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List
- Created `resolveEmailVariables` utility to handle tag replacement.
- Updated `ReportPreview.tsx` to:
    - Lazy load `clientService` and fetch client data using `getClient(userId, clientId)`.
    - Generate email context (Client name, Period, Campaigns, User name).
    - Resolve Subject and Body using the utility.
    - Fallback to localized defaults if no preset exists.
- Updated `clientService.ts` to export `getClient` and removed unused variable.
- Updated `reportTypes.ts` to include `clientId` in `EditableReport`.

### File List
- src/utils/emailResolver.ts
- src/pages/ReportPreview.tsx
- src/services/clientService.ts
- src/types/reportTypes.ts
