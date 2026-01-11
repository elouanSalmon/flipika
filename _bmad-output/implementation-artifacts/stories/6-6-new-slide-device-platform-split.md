# Story 6.6: New Slide - Device & Platform Split

Status: ready-for-dev

## Story

As a Media Buyer,
I want to compare performance across Devices (Mobile/Desktop) and Platforms (Search/Display/YouTube),
so that I can adjust my bid adjustments.

## Acceptance Criteria

1. [ ] Breakdown charts (Pie or Bar) comparing performance across Devices.
2. [ ] Breakdown charts (Pie or Bar) comparing performance across Platforms/Networks.
3. [ ] Display Cost/Conversion per device/platform for comparison.

## Tasks / Subtasks

- [ ] Component Development (AC: 1, 2)
  - [ ] Create `DevicePlatformSplitSlide.tsx`
  - [ ] Implement pie charts using Recharts for Device and Platform breakdown
- [ ] Logic & Integration (AC: 3)
  - [ ] Add `DEVICE_PLATFORM_SPLIT` to `SlideType`
  - [ ] Update `SlideLibrary` with the Device/Platform split slide
  - [ ] Fetch data with `segments.device` and `segments.ad_network_type`

## Dev Notes

- **Device Segments**: Mobile, Desktop, Tablet.
- **Network Segments**: Search, Display, YouTube, Partners.
- **UI**: Present charts side-by-side or stacked. Add a table summary below the charts for precise metrics.

### Project Structure Notes

- Files to create:
  - `src/components/reports/slides/DevicePlatformSplitSlide.tsx`
  - `src/components/reports/slides/DevicePlatformSplitSlide.css`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.6]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
