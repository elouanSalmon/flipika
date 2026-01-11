# Story 8.2: Rendu Haute Définition & Fidélité Visuelle

Status: backlog

## Story

As a Admin User,
I want the PDF to be perfectly sharp and match exactly the colors and fonts of my theme,
so that the "Pre-flight" visual promise is kept.

## Acceptance Criteria

1. [ ] Text is sharp and searchable (vector text, not just a blurred image).
2. [ ] Colors perfectly match the theme Hex codes.
3. [ ] Charts (Recharts) are rendered clearly without aliasing issues.

## Tasks / Subtasks

- [ ] Configuration Optimization (AC: 1, 3)
  - [ ] Adjust `html2canvas` scale to 3 (or higher if needed) in `pdfGenerationService.ts`.
  - [ ] Ensure `letterRendering: true` is active.
- [ ] Font Management (AC: 1)
  - [ ] Verify that custom Google Fonts are correctly loaded in the PDF context.
- [ ] SVG Support (AC: 3)
  - [ ] Check if Recharts SVGs need specific treatment for `html2canvas` (sometimes setting `svg` elements width/height explicitly helps).

## Dev Notes

- Sharper images come with larger file sizes. Need to find the sweet spot.
- Use `scale: 2` as default and maybe `scale: 3` for "High Quality" mode.

### Project Structure Notes

- Files:
  - `src/services/pdfGenerationService.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 8.2]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
