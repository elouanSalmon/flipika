# Story 8.3: Optimisation de la Taille & Performance

Status: backlog

## Story

As a User,
I want the PDF generation to be fast and the resulting file to be reasonably small,
so that I can send it via email without issues.

## Acceptance Criteria

1. [ ] Generation process does not freeze the UI.
2. [ ] Final PDF size is optimized using compression.
3. [ ] Progress bar accurately reflects the generation steps.

## Tasks / Subtasks

- [ ] Performance (AC: 1)
  - [ ] Use `Web Workers` or ensure the generation runs in a way that allows the UI thread to breathe (if possible with html2pdf).
- [ ] Compression (AC: 2)
  - [ ] Enable `compress: true` in `jsPDF` config.
  - [ ] Tune image quality settings in `pdfGenerationService.ts`.
- [ ] UI Feedback (AC: 3)
  - [ ] Refine the `onProgress` callbacks in `pdfGenerationService.ts`.

## Dev Notes

- Large reports can lead to "Out of Memory" errors. Test with 20+ slides.

### Project Structure Notes

- Files:
  - `src/services/pdfGenerationService.ts`
  - `src/pages/ReportPreview.tsx`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.3]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
