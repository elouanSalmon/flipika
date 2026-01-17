# Story 14.7: Adaptation des Slides Existantes (Multi-Source Support)

Status: ready-for-dev

## Story

As a **Developer**,
I want **all existing slides (Performance, Chart, Metrics, Creative) to support Meta data**,
so that **users can analyze Meta campaigns using familiar widgets**.

## Acceptance Criteria

### AC1: Performance Overview Slide with Meta Data
**Given** I have a "Performance Overview" slide in a Meta Ads report
**When** The slide renders
**Then** It displays Meta-specific metrics (impressions, reach, frequency, etc.)
**And** The data is fetched from `metaInsightsService` instead of `googleAdsService`

### AC2: Campaign Chart with Multi-Source Support
**Given** I have a "Campaign Chart" slide in an "All Sources" report
**When** The slide renders
**Then** It shows two series on the chart: Google (blue line) + Meta (purple line)
**And** The legend clearly identifies each source

### AC3: Key Metrics Slide with Platform-Specific Metrics
**Given** I have a "Key Metrics" slide
**When** I configure it for Meta
**Then** I see Meta-specific metrics available: Reach, Frequency, CPM, Link Clicks, Post Engagement
**And** I can mix Google and Meta metrics on the same slide (if "All Sources")

### AC4: Ad Creative Slide with Meta Creatives
**Given** I have an "Ad Creative" slide
**When** I use it with Meta data
**Then** It fetches creative previews using Meta's `GET /{ad_id}/previews` endpoint
**And** Displays the image/video thumbnail correctly

## Tasks / Subtasks

### Task 1: Create Base Metrics Provider Interface (AC: #1, #2, #3)

- [ ] Create `src/services/metrics/BaseMetricsProvider.ts`
  - [ ] Define interface with common methods:
    - [ ] `getAccountMetrics(accountId, dateRange): Promise<Metrics>`
    - [ ] `getCampaignMetrics(accountId, campaignIds, dateRange): Promise<CampaignMetrics[]>`
    - [ ] `getAdMetrics(accountId, adIds, dateRange): Promise<AdMetrics[]>`
    - [ ] `getAvailableMetrics(): MetricDefinition[]` - List of available metrics per platform
  - [ ] Export base interface for implementations

### Task 2: Implement Google Ads Metrics Provider (AC: #1, #2)

- [ ] Create `src/services/metrics/GoogleAdsMetricsProvider.ts`
  - [ ] Implement `BaseMetricsProvider` interface
  - [ ] Wrap existing `googleAdsService` methods
  - [ ] Return data in standardized format
  - [ ] Define Google-specific metrics list:
    - [ ] Search Impressions, Display Impressions, Video Views
    - [ ] Quality Score, Ad Rank
    - [ ] Search Terms, Keywords

### Task 3: Implement Meta Ads Metrics Provider (AC: #1, #2, #3)

- [ ] Create `src/services/metrics/MetaAdsMetricsProvider.ts`
  - [ ] Implement `BaseMetricsProvider` interface
  - [ ] Wrap `metaInsightsService` methods
  - [ ] Map Meta metrics to standardized format
  - [ ] Define Meta-specific metrics list:
    - [ ] Reach, Frequency, CPM
    - [ ] Link Clicks, Post Engagement, Post Shares
    - [ ] Video Plays, Video Average Play Time
    - [ ] Relevance Score

### Task 4: Create Metrics Provider Factory (AC: #1, #2)

- [ ] Create `src/services/metrics/metricsProviderFactory.ts`
  - [ ] `getProvider(dataSourceType): BaseMetricsProvider`
  - [ ] Return `GoogleAdsMetricsProvider` for 'google_ads'
  - [ ] Return `MetaAdsMetricsProvider` for 'meta_ads'
  - [ ] Cache provider instances (singleton pattern)

### Task 5: Update Performance Overview Slide (AC: #1)

- [ ] Modify `src/components/slides/PerformanceOverviewSlide.tsx`
  - [ ] Accept `dataSource` prop from report config
  - [ ] Use `metricsProviderFactory.getProvider(dataSource.type)`
  - [ ] Fetch metrics using provider
  - [ ] Render with platform-specific metrics
  - [ ] Show platform badge (Google/Meta icon)

### Task 6: Update Campaign Chart Slide (AC: #2)

- [ ] Modify `src/components/slides/CampaignChartSlide.tsx`
  - [ ] Support multi-source mode:
    - [ ] If report.dataSource === 'all', fetch from both providers
    - [ ] Display two series with different colors
    - [ ] Google: Blue line (#4285F4)
    - [ ] Meta: Purple gradient line (#8B5CF6)
  - [ ] Update legend with platform labels
  - [ ] Add tooltip showing source per data point

### Task 7: Update Key Metrics Slide (AC: #3)

- [ ] Modify `src/components/slides/KeyMetricsSlide.tsx`
  - [ ] Load available metrics from provider: `provider.getAvailableMetrics()`
  - [ ] Show platform-specific metrics in metric selector
  - [ ] Group metrics by category (Engagement, Conversions, etc.)
  - [ ] Display platform icon next to platform-specific metrics
  - [ ] For "All Sources", show combined metrics + breakdown

### Task 8: Update Ad Creative Slide (AC: #4)

- [ ] Modify `src/components/slides/AdCreativeSlide.tsx`
  - [ ] Detect data source type
  - [ ] For Google Ads: Use existing creative preview logic
  - [ ] For Meta Ads:
    - [ ] Call `GET https://graph.facebook.com/v21.0/{ad_id}/previews`
    - [ ] Display image/video thumbnail
    - [ ] Show ad copy and call-to-action
  - [ ] Add fallback for missing creatives

### Task 9: Create Multi-Source Chart Component (AC: #2)

- [ ] Create `src/components/charts/MultiSourceChart.tsx`
  - [ ] Accept multiple data series with source labels
  - [ ] Render using Recharts with multiple LineChart series
  - [ ] Color coding per source
  - [ ] Legend with source icons
  - [ ] Tooltip showing all sources at hover point

### Task 10: Update Slide Configuration UI (AC: #3)

- [ ] Modify slide config modals to show available metrics per source
- [ ] Add platform badge next to metric names
- [ ] Disable metrics not available for selected source
- [ ] Show info tooltip explaining platform-specific metrics

### Task 11: Testing (AC: #1, #2, #3, #4)

- [ ] Unit tests for `BaseMetricsProvider` implementations
- [ ] Unit tests for `metricsProviderFactory`
- [ ] Component tests for updated slides
  - [ ] Test with Google data source
  - [ ] Test with Meta data source
  - [ ] Test with "All Sources" (multi-source)
- [ ] Integration test: Generate report with Meta data
- [ ] Manual test: Create report with each slide type

### Task 12: Documentation & i18n (AC: #1, #2, #3, #4)

- [ ] Add JSDoc comments to provider interfaces
- [ ] Update slide component documentation
- [ ] Add i18n keys for platform-specific metric names
- [ ] Create developer guide: "Adding New Data Sources"

## Dev Notes

### Critical Context from Architecture

**Strategy Pattern for Metrics Providers** (Source: epic-14):
- Define common interface (`BaseMetricsProvider`)
- Implement per platform (`GoogleAdsMetricsProvider`, `MetaAdsMetricsProvider`)
- Use factory to select provider based on `report.dataSource`
- All slides use provider abstraction (no direct service calls)

**Multi-Source Rendering:**
- Single source: Use one provider, one data series
- All sources: Use multiple providers, aggregate or separate series
- Chart colors: Google (blue), Meta (purple), Combined (gradient)

### Project Structure Notes

**Files to Create:**
- `src/services/metrics/BaseMetricsProvider.ts` - Interface
- `src/services/metrics/GoogleAdsMetricsProvider.ts` - Implementation
- `src/services/metrics/MetaAdsMetricsProvider.ts` - Implementation
- `src/services/metrics/metricsProviderFactory.ts` - Factory
- `src/components/charts/MultiSourceChart.tsx` - Multi-source chart

**Files to Modify:**
- `src/components/slides/PerformanceOverviewSlide.tsx`
- `src/components/slides/CampaignChartSlide.tsx`
- `src/components/slides/KeyMetricsSlide.tsx`
- `src/components/slides/AdCreativeSlide.tsx`

### Technical Requirements

**Base Metrics Provider Interface:**
```typescript
// src/services/metrics/BaseMetricsProvider.ts

export interface MetricDefinition {
  key: string;
  label: string;
  category: 'engagement' | 'conversions' | 'cost' | 'reach';
  platformSpecific: boolean; // true if not available on all platforms
}

export interface Metrics {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  // Platform-specific metrics (optional)
  reach?: number; // Meta only
  frequency?: number; // Meta only
  searchImpressions?: number; // Google only
  qualityScore?: number; // Google only
}

export interface BaseMetricsProvider {
  getAccountMetrics(accountId: string, dateRange: DateRange): Promise<Metrics>;
  getCampaignMetrics(accountId: string, campaignIds: string[], dateRange: DateRange): Promise<CampaignMetrics[]>;
  getAvailableMetrics(): MetricDefinition[];
  getProviderType(): 'google_ads' | 'meta_ads';
}
```

**Metrics Provider Factory:**
```typescript
// src/services/metrics/metricsProviderFactory.ts

import { BaseMetricsProvider } from './BaseMetricsProvider';
import { GoogleAdsMetricsProvider } from './GoogleAdsMetricsProvider';
import { MetaAdsMetricsProvider } from './MetaAdsMetricsProvider';

const providers: Map<string, BaseMetricsProvider> = new Map();

export function getMetricsProvider(type: 'google_ads' | 'meta_ads'): BaseMetricsProvider {
  if (!providers.has(type)) {
    if (type === 'google_ads') {
      providers.set(type, new GoogleAdsMetricsProvider());
    } else if (type === 'meta_ads') {
      providers.set(type, new MetaAdsMetricsProvider());
    } else {
      throw new Error(`Unknown provider type: ${type}`);
    }
  }

  return providers.get(type)!;
}
```

**Multi-Source Chart:**
```typescript
// src/components/charts/MultiSourceChart.tsx

interface Props {
  data: Array<{
    date: string;
    google?: number;
    meta?: number;
  }>;
  metric: string;
}

export function MultiSourceChart({ data, metric }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="google"
          stroke="#4285F4"
          name="Google Ads"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="meta"
          stroke="#8B5CF6"
          name="Meta Ads"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Naming Conventions (CRITICAL)

**From project-context.md:**
- Interfaces: `PascalCase` → `BaseMetricsProvider`, `MetricDefinition`
- Implementations: `PascalCase` → `GoogleAdsMetricsProvider`
- Factory functions: `camelCase` → `getMetricsProvider`
- Components: `PascalCase` → `MultiSourceChart`

### i18n Requirements

```json
// src/locales/fr/translation.json
{
  "metrics": {
    "common": {
      "impressions": "Impressions",
      "clicks": "Clics",
      "cost": "Coût",
      "conversions": "Conversions"
    },
    "google": {
      "searchImpressions": "Impressions recherche",
      "qualityScore": "Score de qualité"
    },
    "meta": {
      "reach": "Portée",
      "frequency": "Fréquence",
      "linkClicks": "Clics sur lien",
      "postEngagement": "Engagement publication"
    }
  }
}
```

### Testing Requirements

**Unit Tests:**
- `GoogleAdsMetricsProvider.test.ts`
- `MetaAdsMetricsProvider.test.ts`
- `metricsProviderFactory.test.ts`

**Component Tests:**
- Each slide component with different data sources
- Multi-source chart rendering

**Integration Tests:**
- Generate report with Meta data source
- Verify all slides render correctly

### Dependencies & Prerequisites

**Depends On:**
- Story 14.4 (Meta Insights Service) - Must be complete
- Story 14.5 (Source Selector UI) - Report has dataSource field

**Blocks:**
- None (enhancement story)

### Performance Considerations

**Provider Caching:**
- Factory caches provider instances (singleton)
- Prevents recreating providers on each call

**Data Fetching:**
- Slides fetch data independently
- Use unified caching layer (5 min TTL)
- Parallel fetching for multi-source

### Security Checklist

- [ ] No tokens exposed in provider implementations
- [ ] All API calls go through backend proxies
- [ ] Provider respects user permissions

### References

- [Source: epic-14-meta-ads-integration.md#Story 14.7]
- [Source: architecture.md#Slide Architecture]
- [Recharts Documentation](https://recharts.org/)

### Known Issues & Gotchas

**Metric Availability:**
- Not all metrics exist on all platforms
- Some metrics have different names but same meaning
- Platform-specific metrics should be clearly labeled

**Chart Rendering:**
- Multi-source charts need synchronized date ranges
- Missing data points should show gaps (not zero)
- Legend must clearly identify sources

**Backwards Compatibility:**
- Existing reports default to Google Ads (preserve behavior)
- New reports can choose any source
- Slides gracefully handle missing platform metrics

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

**Created:**
- `src/services/metrics/BaseMetricsProvider.ts`
- `src/services/metrics/GoogleAdsMetricsProvider.ts`
- `src/services/metrics/MetaAdsMetricsProvider.ts`
- `src/services/metrics/metricsProviderFactory.ts`
- `src/components/charts/MultiSourceChart.tsx`

**Modified:**
- `src/components/slides/PerformanceOverviewSlide.tsx`
- `src/components/slides/CampaignChartSlide.tsx`
- `src/components/slides/KeyMetricsSlide.tsx`
- `src/components/slides/AdCreativeSlide.tsx`
- `src/locales/fr/translation.json`
- `src/locales/en/translation.json`

**Tests:**
- `src/services/metrics/__tests__/GoogleAdsMetricsProvider.test.ts`
- `src/services/metrics/__tests__/MetaAdsMetricsProvider.test.ts`
- `src/services/metrics/__tests__/metricsProviderFactory.test.ts`
- `src/components/slides/__tests__/PerformanceOverviewSlide.test.tsx`
