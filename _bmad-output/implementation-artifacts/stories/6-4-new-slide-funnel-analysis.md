# Story 6.4: New Slide - Funnel Analysis

Status: ready-for-dev

## Story

As a Media Buyer,
I want to visualize the conversion funnel (Impressions -> Clicks -> Conversions),
so that I can identify where I am losing potential customers.

## Acceptance Criteria

1. [ ] A funnel chart is displayed showing the drop-off rates between steps.
2. [ ] Performance ratios (CTR, Conversion Rate) are displayed between steps.
3. [ ] I can configure the funnel steps or metrics if needed.

## Tasks / Subtasks

- [ ] Component Development (AC: 1, 2)
  - [ ] Create `FunnelAnalysisSlide.tsx`
  - [ ] Implement funnel visualization (using Recharts or custom CSS)
  - [ ] Add calculation logic for ratios
- [ ] Integration (AC: 3)
  - [ ] Add `FUNNEL_ANALYSIS` to `SlideType`
  - [ ] Update `SlideLibrary` to include the Funnel Analysis slide
  - [ ] Add configuration settings for funnel metrics in the settings panel

## Dev Notes

- **Visualization**: A funnel can be represented as a series of trapezoids or a modified bar chart. Ensure it looks premium.
- **Data**: Fetch "Impressions", "Clicks", and "Conversions" for the selected scope.
- **Logic**: 
  - CTR = Clicks / Impressions
  - Conv. Rate = Conversions / Clicks

### Project Structure Notes

- Files to create:
  - `src/components/reports/slides/FunnelAnalysisSlide.tsx`
  - `src/components/reports/slides/FunnelAnalysisSlide.css`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.4]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
