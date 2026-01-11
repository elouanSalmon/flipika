# Story 6.5: New Slide - Day/Hour Heatmap

Status: ready-for-dev

## Story

As a Media Buyer,
I want to see *when* my ads perform best (Day of Week & Hour of Day),
so that I can optimize my ad scheduling.

## Acceptance Criteria

1. [ ] A grid (7 days x 24 hours) is displayed visualizing performance by time.
2. [ ] Cells are colored using a gradient based on the selected metric (e.g., Clicks, Conversions, Cost).
3. [ ] I can switch between different metrics for heatmap visualization.

## Tasks / Subtasks

- [ ] Component Development (AC: 1, 2)
  - [ ] Create `HeatmapSlide.tsx`
  - [ ] Implement a grid-based visualization for 7x24 data points
  - [ ] Implement color scaling logic (e.g., using `d3-scale` or custom interpolation)
- [ ] Logic & Integration (AC: 3)
  - [ ] Add `HEATMAP` to `SlideType`
  - [ ] Update `SlideLibrary` with the Heatmap slide
  - [ ] Implement data aggregation by day-of-week and hour-of-day in the slide's data fetching logic

## Dev Notes

- **Data Aggregation**: Google Ads API provides `segments.day_of_week` and `segments.hour`. This needs to be fetched and grouped.
- **UI**: Ensure the grid is responsive and provides tooltips for each cell showing the exact value.
- **Library**: Recharts `ScatterChart` can sometimes be used for heatmaps, but a direct table/flexbox grid might be simpler and more performant for 168 cells.

### Project Structure Notes

- Files to create:
  - `src/components/reports/slides/HeatmapSlide.tsx`
  - `src/components/reports/slides/HeatmapSlide.css`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.5]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
