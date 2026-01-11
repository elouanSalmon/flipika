# Story 7.2: Éditeur Dynamique avec Variables (Tags)

Status: review

## Story

As a User,
I want to insert dynamic variables in my email content,
so that the information is automatically updated for each report.

## Acceptance Criteria

1. [ ] Variable insertion buttons are available in the editor.
2. [ ] Clicking a button inserts a tag like `[client_name]` or `[report_period]`.
3. [ ] I can see a list of available variables.

## Tasks / Subtasks

- [x] UI Component (AC: 1, 3)
  - [x] Create a `VariablePicker` or similar small component.
  - [x] List supported keys: `[client_name]`, `[period]`, `[campaigns]`, `[user_name]`, `[company]`.
- [x] Editor Integration (AC: 2)
  - [x] Add "Click to insert" buttons above or below the Subject/Body fields.
  - [x] Implement cursor-aware insertion logic.

## Dev Notes

- Variables should be enclosed in brackets `[]`.
- Ensure the keys are consistent across the system.

### Project Structure Notes

- Files:
  - `src/components/clients/EmailPresetEditor.tsx` (New recommended component)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.2]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List
- Created `EmailPresetEditor` component with variable picker toolbar.
- Implemented cursor-aware insertion logic.
- Integrated `EmailPresetEditor` into `ClientForm`.
- Added localized tooltips for variables.

### File List
- src/components/clients/EmailPresetEditor.tsx
- src/components/clients/ClientForm.tsx
- src/locales/fr/clients.json
- src/locales/en/clients.json
