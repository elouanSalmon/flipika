# Story 8.4: Métadonnées & Accessibilité PDF

Status: backlog

## Story

As a Recipient,
I want to see the report information in the file metadata and have a structured document,
so that I can easily find and archive the report.

## Acceptance Criteria

1. [ ] PDF Metadata (Title, Author, Subject) is correctly set.
2. [ ] Basic accessibility (Alt text for images, structured text).

## Tasks / Subtasks

- [ ] Metadata (AC: 1)
  - [ ] Use `pdf.setProperties()` in the `jsPDF` instance callback.
- [ ] Accessibility (AC: 2)
  - [ ] Ensure the prepared HTML for PDF has proper semantic tags (`h1`, `p`, etc.).
  - [ ] Add alt tags to images in the PDF cloned element.

## Dev Notes

- Metadata makes the file look professional in OS file explorers.

### Project Structure Notes

- Files:
  - `src/services/pdfGenerationService.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.4]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
