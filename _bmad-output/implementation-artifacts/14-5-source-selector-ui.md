# Story 14.5: Source Selector (Frontend UI)

Status: ready-for-dev

## Story

As a **User**,
I want to **choose which data source to use when creating or viewing a report**,
so that **I can analyze Google, Meta, or both together**.

## Acceptance Criteria

### AC1: Source Selection for Multi-Source Clients
**Given** I am creating a new report for a Client with both Google and Meta connected
**When** I reach the "Data Source" step
**Then** I see three radio options: All Sources, Google Ads Only, Meta Ads Only

### AC2: Single Source Auto-Select
**Given** A client has only Google Ads connected
**When** I create a report
**Then** The source selector is hidden (default to Google Ads)
**And** A banner suggests: "Connect Meta Ads to unlock multi-platform reporting"

### AC3: Source Selection Persistence
**Given** I select "Meta Ads Only"
**When** I save and reopen the report
**Then** The selection is persisted in report configuration

## Tasks

- [ ] Create `SourceSelector.tsx` component (radio buttons with icons)
- [ ] Update `ReportEditor.tsx` to include source selector
- [ ] Add `dataSource` field to Report type
- [ ] Persist selection in Firestore
- [ ] Show/hide selector based on available sources
- [ ] Add suggestion banner for single-source clients
- [ ] i18n for all source options
- [ ] Component tests

## Technical Notes

**UI Design:**
- Icons: Google "G" (blue), Meta infinity (gradient), Combined (purple)
- Radio buttons with icon + label
- Disabled state if source not connected

**Report Data Model Update:**
```typescript
interface Report {
  ...
  dataSource: 'all' | 'google_ads' | 'meta_ads';
}
```

**Dependencies:** Story 14.3 (Account Linking)
