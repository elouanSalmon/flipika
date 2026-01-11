# Story 6.7: New Slide - Top Performers

Status: ready-for-dev

## Story

As a Media Buyer,
I want to see a ranked list of my best assets (Keywords, Search Terms, Locations),
so that I can double down on what works.

## Acceptance Criteria

1. [ ] I can choose a Dimension: Keywords, Search Terms, Locations, or Ads.
2. [ ] I can choose a Metric to sort by: Cost, Conversions, or ROAS.
3. [ ] It displays the Top N (e.g., Top 5 or Top 10) items in a clear list or table format.

## Tasks / Subtasks

- [ ] Component Development (AC: 1, 2, 3)
  - [ ] Create `TopPerformersSlide.tsx`
  - [ ] Implement a configuration toggle for Dimensions and Metrics
  - [ ] Implement a ranked table or bar chart visualization
- [ ] Logic & Integration (AC: 3)
  - [ ] Add `TOP_PERFORMERS` to `SlideType`
  - [ ] Update `SlideLibrary` with the Top Performers slide
  - [ ] Fetch the relevant dimension data and sort on the frontend (or backend if data size is large)

## Dev Notes

- **Dimensions**: Use appropriate report types (e.g., `keyword_view`, `search_term_view`, `geographic_view`).
- **UI**: A horizontal bar chart or a clean table with sparklines would work well here.
- **Limit**: Allow the user to select the "Top N" in settings.

### Project Structure Notes

- Files to create:
  - `src/components/reports/slides/TopPerformersSlide.tsx`
  - `src/components/reports/slides/TopPerformersSlide.css`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.7]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
