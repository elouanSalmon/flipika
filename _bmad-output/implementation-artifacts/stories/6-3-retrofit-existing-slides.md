# Story 6.3: Retrofit Existing Slides

Status: ready-for-dev

## Story

As a Product Manager,
I want the 4 existing slides (Performance, Chart, Metrics, Creative) to support this new Scoping logic,
so that we don't lose functionality during the transition.

## Acceptance Criteria

1. [ ] Existing widgets (Performance Overview, Campaign Chart, Key Metrics, Ad Creative) default to "Report Default" scope.
2. [ ] I can override their scope individually using the new settings panel.
3. [ ] The data fetching logic within each slide correctly respects the local override.

## Tasks / Subtasks

- [ ] Component Prop Refactoring (AC: 1, 3)
  - [ ] Update `PerformanceOverviewSlide`, `CampaignChartSlide`, `KeyMetricsSlide`, `AdCreativeSlide` to accept `accountId` and `campaignIds` as explicit props.
  - [ ] Ensure they use these props instead of falling back to report-level state if provided.
- [ ] Integration in Canvas (AC: 2)
  - [ ] Update `ReportCanvas` to compute the `effectiveScope` for each slide.
  - [ ] Pass the computed `accountId` and `campaignIds` to the Slide components.

## Dev Notes

- **Legacy Support**: Keep the old `accountId` and `campaignIds` fields in `SlideConfig` for now to avoid data loss, but mark them as deprecated in favor of `scope`.
- **Testing**: Test with a report having 2 slides of the same type but different scopes (e.g., 2 charts, one for Account, one for Single Campaign).

### Project Structure Notes

- Files to touch:
  - `src/components/reports/slides/PerformanceOverviewSlide.tsx`
  - `src/components/reports/slides/CampaignChartSlide.tsx`
  - `src/components/reports/slides/KeyMetricsSlide.tsx`
  - `src/components/reports/slides/AdCreativeSlide.tsx`
  - `src/components/reports/ReportCanvas.tsx`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.3]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
