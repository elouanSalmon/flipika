# Story 7.1: Configuration des "Email Presets" par Client

Status: backlog

## Story

As a User,
I want to define a custom Email Subject and Body for each client,
so that the automated email matches my communication style with them.

## Acceptance Criteria

1. [ ] I can see a "Config Email" section in the Client edition page.
2. [ ] I can edit "Email Subject" and "Email Message" fields.
3. [ ] These fields have default values if not already set.
4. [ ] Saving the client persists these email settings.

## Tasks / Subtasks

- [ ] Data Model (AC: 4)
  - [ ] Update `Client` interface in `src/types/client.ts` to include `emailPreset` object.
- [ ] UI Implementation (AC: 1, 2)
  - [ ] Add Email section to `ClientForm.tsx` (or equivalent).
  - [ ] Add Subject (input) and Body (textarea) fields.
- [ ] Integration (AC: 3, 4)
  - [ ] Update `clientService.ts` to handle these new fields.
  - [ ] Add logic to provide default content if the fields are empty.

## Dev Notes

- Avoid "Template" terminology in code/UI as it's reserved for reports.
- Use `EmailPreset` as the name for the configuration object.

### Project Structure Notes

- Files:
  - `src/types/client.ts`
  - `src/services/clientService.ts`
  - `src/components/clients/ClientModal.tsx` (or from where clients are edited)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.1]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
