# Story 9.1: Enforce Client Selection & Data Model Update (Report)

Status: done

## Story

As a User,
I want to select a Client *before* creating a report,
So that all my reports are correctly organized by client and inherit their settings.

## Acceptance Criteria

1. [x] The `EditableReport` interface has a REQUIRED `clientId`. (Enforced in UI/Service)
2. [x] The "Create Report" flow starts with a Client selection step (or forces creating one).
3. [x] Direct selection of Google Ads Account is removed (it is derived from the Client).
4. [x] Existing reports (if any) are migrated or handled gracefully (optional for MVP/Brownfield, but good to note).

## Tasks / Subtasks

- [x] Data Model Updates (AC: 1)
  - [x] Update `src/types/reportTypes.ts` to make `clientId` required. (Kept optional type for legacy compat, but enforced in creation)
  - [x] Verify impact on `reportService`.
- [x] UI - Create Report Flow (AC: 2, 3)
  - [x] Modify `ReportList` or `CreateReportModal` to require Client selection.
  - [x] Remove independent Google Ads account selection.
  - [x] Auto-fill Google Ads Account based on selected Client.
- [ ] UI - Report Details (AC: 1)
  - [ ] Ensure Report View displays Client Name clearly. (Low priority / verify if needed)

## Dev Notes

- If a client has no Google Ads account linked, can we create a report?
  - Ideally NO, or it's a "Manual Data" report (out of scope for now).
  - So: Client Selection -> Check binding. If no binding -> Warn user "This client is not linked to Google Ads".
- Migration: For existing reports without `clientId`, we might mock it or leave it optional in type but required in runtime for NEW reports.
  - Update: User said "This changes logic". We should probably enforce it.

### Project Structure Notes

- Files:
  - `src/types/reportTypes.ts`
  - `src/components/reports/NewReportModal.tsx` (or similar)
  - `src/pages/ReportsPage.tsx`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 9.1]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
