# Story 6.2: Slide Scoping Logic (Granular Control)

Status: review

## Story

As a Power User,
I want to define precisely which data a specific slide displays (Account vs Campaigns vs Single Campaign),
so that I can tell a specific story (e.g., "Performance of the Summer Sale Campaign" vs "Global Account Performance").

## Acceptance Criteria

1. [ ] I can see a "Data Scope" section when configuring a Slide.
2. [ ] I can choose between: Report Default, Specific Account, Specific Campaigns, Single Campaign.
3. [ ] Changing the Scope updates the data visualized immediately in the editor.
4. [ ] The specific scope is saved with the Slide configuration.

## Tasks / Subtasks

- [x] Data Model Implementation (AC: 4)
  - [x] Add `scope` field to `SlideConfig` (or `WidgetConfig`)
  - [x] Define `SlideScope` type with `type`, `accountId`, `campaignIds`
- [x] UI Implementation (AC: 1, 2)
  - [x] Create `ScopeSelector` component (Reuse `AccountSelect` and `CampaignSelect`)
  - [x] Integrate `ScopeSelector` into the Slide Settings panel
- [x] Logic Implementation (AC: 3)
  - [x] Update `handleAddSlide` to initialize with default scope
  - [x] Update data fetching logic to prioritize Slide Scope over Report Scope
  - [x] Implement "Report Default" fallback logic

## Dev Notes

- **Existing Work**: `ReportEditor.tsx` currently has `handleAddWidget` that sets `accountId` and `campaignIds` from report. This must be refactored.
- **Components**: Use `src/components/common/AccountSelect.tsx` and `src/components/common/CampaignSelect.tsx` if they exist, or similar logic.
- **Context**: The `Slide` component should receive its `effectiveScope` (either own or report's).

### Project Structure Notes

- Source Tree:
  - `src/types/reportTypes.ts` (Types)
  - `src/pages/ReportEditor.tsx` (Logic & State)
  - `src/components/reports/slides/` (Individual slides)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.2]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

**Implementation Summary:**

Successfully implemented granular slide scoping feature allowing users to override report-level account/campaign selection on a per-slide basis.

**Key Changes:**
1. **Data Model**: Added optional `SlideScope` type and `scope` field to `SlideConfig` for backward compatibility
2. **UI Component**: Created `ScopeSelector` component with 4 scope types (Report Default, Specific Account, Specific Campaigns, Single Campaign)
3. **Integration**: Wired scope selector through component tree (ReportEditor → ReportCanvas → SlideItem)
4. **Slide Updates**: Updated all slide components to compute and use effective scope (PerformanceOverviewSlide, KeyMetricsSlide, CampaignChartSlide)

**Technical Approach:**
- Effective scope computed as: `config.scope?.accountId || accountId` (slide scope overrides report scope)
- Scope selector integrated into slide settings panel (accessible via Settings button)
- Campaign loading handled dynamically when account changes

**Build Status:**
- Build completed with 4 pre-existing TypeScript errors unrelated to this feature
- All slide scoping code compiles successfully
- No new TypeScript errors introduced

**Testing Notes:**
- Manual testing required (no automated test infrastructure in project)
- Verify scope selector UI appears when clicking Settings on a slide
- Verify data updates when changing scope type/account/campaigns
- Verify backward compatibility with existing slides (no scope field)

### File List

**Modified Files:**
- `src/types/reportTypes.ts` - Added SlideScope type and scope field to SlideConfig
- `src/components/reports/SlideItem.tsx` - Integrated ScopeSelector into slide settings
- `src/components/reports/ReportCanvas.tsx` - Added accounts and report scope props
- `src/pages/ReportEditor.tsx` - Wired up scope props to ReportCanvas
- `src/components/reports/slides/PerformanceOverviewSlide.tsx` - Added effective scope computation
- `src/components/reports/slides/KeyMetricsSlide.tsx` - Added effective scope computation
- `src/components/reports/slides/CampaignChartSlide.tsx` - Added effective scope computation

**New Files:**
- `src/components/reports/ScopeSelector.tsx` - New component for slide scope configuration
