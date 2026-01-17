# Story 14.6: Unified Metrics Aggregation Logic

Status: ready-for-dev

## Story

As a **System**,
I want to **correctly aggregate metrics from multiple sources**,
so that **"All Sources" reports show accurate combined data**.

## Acceptance Criteria

### AC1: Parallel Data Fetching
**Given** I have a report set to "All Sources"
**When** I fetch metrics for a date range
**Then** The system makes parallel requests to Google Ads AND Meta Ads services
**And** Metrics are aggregated using correct rules (SUM for counts, RECALCULATE for ratios)

### AC2: Graceful Degradation
**Given** One source fails to load (e.g., Meta API timeout)
**When** The aggregation runs
**Then** The system shows partial data with a warning banner
**And** The report is still generated (degraded mode)

### AC3: Source Breakdown Display
**Given** I want to see the breakdown
**When** I view the combined report
**Then** A summary table shows metrics per source (Google vs Meta)

## Tasks

- [ ] Create `src/services/unifiedMetricsService.ts`
- [ ] Implement parallel fetching with `Promise.allSettled()`
- [ ] Add aggregation logic:
  - SUM: impressions, clicks, cost, conversions
  - RECALC: CTR = clicks/impressions, CPC = cost/clicks, CPA = cost/conversions
- [ ] Handle partial failures with warning banners
- [ ] Create breakdown table component
- [ ] Add caching for aggregated results (5 min)
- [ ] Unit tests for aggregation rules
- [ ] Integration test with both sources

## Technical Notes

**Aggregation Rules:**
```typescript
const aggregated = {
  impressions: google.impressions + meta.impressions,
  clicks: google.clicks + meta.clicks,
  cost: google.cost + meta.cost,
  conversions: google.conversions + meta.conversions,
  // Recalculated ratios
  ctr: (google.clicks + meta.clicks) / (google.impressions + meta.impressions),
  cpc: (google.cost + meta.cost) / (google.clicks + meta.clicks),
  cpa: (google.cost + meta.cost) / (google.conversions + meta.conversions),
};
```

**Parallel Fetching:**
```typescript
const [googleResult, metaResult] = await Promise.allSettled([
  getGoogleInsights(params),
  getMetaInsights(params),
]);
```

**Dependencies:** Story 14.4 (Meta Insights Service), Story 14.5 (Source Selector)
