# Story 7.3: Application Automatique lors de l'envoi (Report Preview)

Status: backlog

## Story

As a User,
I want the "Send" action to use my custom Email Preset,
so that I don't have to copy-paste or re-type the message.

## Acceptance Criteria

1. [ ] The `mailto:` link in `ReportPreview.tsx` uses the customized Subject and Body.
2. [ ] Variables are correctly replaced by real values from the context.
3. [ ] Fallback to global default if client configuration is missing.

## Tasks / Subtasks

- [ ] Value Replacement Logic (AC: 2)
  - [ ] Create a utility `resolveEmailVariables(text, context)` that replaces `[key]` with values.
  - [ ] Provide context: `Client`, `Report`, `User Profile`.
- [ ] Preview Page Integration (AC: 1, 3)
  - [ ] Update `handleSendEmail` in `ReportPreview.tsx` to fetch the client and its email preset.
  - [ ] Replace hardcoded texts with resolved Preset content.

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

### File List
