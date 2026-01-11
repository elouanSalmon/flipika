# Story 8.1: Gestion Intelligente des Sauts de Page (Page Breaks)

Status: backlog

## Story

As a User,
I want my report slides to not be cut in half across two pages,
so that the report looks professional and is easy to read.

## Acceptance Criteria

1. [ ] Slides are never split across pages in the generated PDF.
2. [ ] Automatic page breaks occur between slides if they don't fit.
3. [ ] Ability to force a page break before a specific slide in the editor.

## Tasks / Subtasks

- [ ] CSS Implementation (AC: 1, 2)
  - [ ] Add `page-break-inside: avoid` to slide containers in PDF CSS.
  - [ ] Use `html2pdf.js` page-break features (`avoid-all` or specific selectors).
- [ ] Editor Feature (AC: 3)
  - [ ] Add `hasPageBreakBefore` property to `SlideConfig`.
  - [ ] Add toggle in Slide settings to force a page break.
- [ ] Render Logic
  - [ ] Inject `html2pdf__page-break` class when the property is true.

## Dev Notes

- `html2pdf.js` uses specific class names or selectors for page break control.
- Ensure the preview still looks good (maybe show a dotted line where breaks occur).

### Project Structure Notes

- Files:
  - `src/services/pdfGenerationService.ts`
  - `src/types/reportTypes.ts`
  - `src/components/reports/ReportCanvas.tsx`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.1]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
