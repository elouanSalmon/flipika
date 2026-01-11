# Story 7.2: Éditeur Dynamique avec Variables (Tags)

Status: backlog

## Story

As a User,
I want to insert dynamic variables in my email content,
so that the information is automatically updated for each report.

## Acceptance Criteria

1. [ ] Variable insertion buttons are available in the editor.
2. [ ] Clicking a button inserts a tag like `[client_name]` or `[report_period]`.
3. [ ] I can see a list of available variables.

## Tasks / Subtasks

- [ ] UI Component (AC: 1, 3)
  - [ ] Create a `VariablePicker` or similar small component.
  - [ ] List supported keys: `[client_name]`, `[period]`, `[campaigns]`, `[user_name]`, `[company]`.
- [ ] Editor Integration (AC: 2)
  - [ ] Add "Click to insert" buttons above or below the Subject/Body fields.
  - [ ] Implement cursor-aware insertion logic.

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

### File List
