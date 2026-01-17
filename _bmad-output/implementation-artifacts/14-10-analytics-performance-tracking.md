# Story 14.10: Analytics & Performance Tracking

Status: ready-for-dev

## Story

As a **Product Manager**,
I want **to track how users adopt and use Meta Ads integration**,
so that **I can measure success and identify improvement areas**.

## Acceptance Criteria

### AC1: Track Meta Account Connection Events
**Given** A user connects their first Meta account
**When** The connection succeeds
**Then** A GA4 event is fired: `meta_account_connected` with properties:
- `user_id`
- `client_id`
- `account_id` (hashed for privacy)
- `timestamp`

### AC2: Track Multi-Source Report Generation
**Given** A user generates a report with "All Sources"
**When** The PDF is created
**Then** A GA4 event is fired: `multi_source_report_generated` with properties:
- `sources`: ["google_ads", "meta_ads"]
- `total_metrics`: {...}

### AC3: Track Meta API Errors
**Given** A Meta API call fails
**When** The error occurs
**Then** A GA4 event is fired: `meta_api_error` with properties:
- `error_code`
- `endpoint`
- `retry_count`

## Tasks / Subtasks

### Task 1: Setup Google Analytics 4 (AC: #1, #2, #3)

- [ ] Verify GA4 is configured in Firebase
- [ ] Update measurement ID in `.env` files
- [ ] Install GA4 SDK if not already present
- [ ] Create `src/services/analytics.ts` wrapper

### Task 2: Define Analytics Events Schema (AC: #1, #2, #3)

- [ ] Create `src/types/analytics.ts`
  - [ ] `MetaAnalyticsEvent` enum:
    - [ ] `META_ACCOUNT_CONNECTED`
    - [ ] `META_ACCOUNT_DISCONNECTED`
    - [ ] `META_OAUTH_STARTED`
    - [ ] `META_OAUTH_COMPLETED`
    - [ ] `META_OAUTH_FAILED`
    - [ ] `MULTI_SOURCE_REPORT_GENERATED`
    - [ ] `META_API_ERROR`
    - [ ] `META_FEATURE_BANNER_SHOWN`
    - [ ] `META_FEATURE_BANNER_CLICKED`
  - [ ] Event property interfaces for type safety

### Task 3: Track OAuth Flow Events (AC: #1)

- [ ] Update `metaAuthService.ts`
  - [ ] Fire `META_OAUTH_STARTED` on OAuth initiation
  - [ ] Fire `META_OAUTH_COMPLETED` on successful token exchange
  - [ ] Fire `META_OAUTH_FAILED` on OAuth error
- [ ] Include properties: `timestamp`, `user_id`, `source` (manual/banner)

### Task 4: Track Account Connection Events (AC: #1)

- [ ] Update `clientService.ts`
  - [ ] Fire `META_ACCOUNT_CONNECTED` on successful link
    - [ ] Hash `account_id` for privacy: `SHA256(account_id)`
    - [ ] Include `client_id`, `timestamp`
  - [ ] Fire `META_ACCOUNT_DISCONNECTED` on unlink
- [ ] Ensure events fire AFTER Firestore write succeeds

### Task 5: Track Multi-Source Report Events (AC: #2)

- [ ] Update report generation flow
  - [ ] Fire `MULTI_SOURCE_REPORT_GENERATED` when report created
  - [ ] Properties:
    - [ ] `sources`: Array of source types used
    - [ ] `total_metrics`: Aggregated metrics (impressions, clicks, cost)
    - [ ] `report_id` (hashed)
    - [ ] `client_id` (hashed)
    - [ ] `slides_count`: Number of slides in report

### Task 6: Track Meta API Error Events (AC: #3)

- [ ] Update `metaErrorHandler.ts` (backend)
  - [ ] Fire `META_API_ERROR` on any Meta API error
  - [ ] Properties:
    - [ ] `error_code`: MetaErrorCode
    - [ ] `endpoint`: API endpoint called
    - [ ] `retry_count`: Number of retries attempted
    - [ ] `user_id`
    - [ ] `timestamp`
- [ ] Deduplicate events (don't fire for every retry)

### Task 7: Track Feature Discovery Events (AC: #1)

- [ ] Update `MetaAdsAnnouncementBanner.tsx`
  - [ ] Fire `META_FEATURE_BANNER_SHOWN` on banner display
  - [ ] Fire `META_FEATURE_BANNER_CLICKED` on CTA click
- [ ] Track dismissal vs engagement rate

### Task 8: Create Analytics Dashboard (AC: #1, #2, #3)

- [ ] Firebase Console → Analytics → Custom Dashboards
- [ ] Create "Meta Ads Integration" dashboard:
  - [ ] Adoption funnel: Banner Shown → Clicked → OAuth Started → Completed → Account Connected
  - [ ] Usage metrics: Multi-source reports per day
  - [ ] Error tracking: API errors by code, success rate
  - [ ] User segments: Users with/without Meta connected

### Task 9: Define Success Metrics (KPIs) (AC: #1, #2)

- [ ] Create metrics tracking document
  - [ ] **Adoption Rate**: % users who connected Meta (Target: 30% in Month 3)
  - [ ] **Multi-Source Adoption**: % reports using multi-source (Target: 15%)
  - [ ] **OAuth Success Rate**: % successful OAuth flows (Target: > 90%)
  - [ ] **API Success Rate**: % successful Meta API calls (Target: > 95%)
  - [ ] **Time to First Report**: Avg time from OAuth to first report (Target: < 5 min)
- [ ] Create BigQuery queries for each metric

### Task 10: Setup Automated Reporting (AC: #1, #2, #3)

- [ ] Create scheduled Cloud Function: `generateMetaAnalyticsReport`
  - [ ] Runs weekly (Monday 9 AM)
  - [ ] Queries GA4 data via BigQuery
  - [ ] Generates summary report
  - [ ] Sends email to stakeholders
- [ ] Include:
  - [ ] Adoption metrics (weekly change)
  - [ ] Top errors (if any)
  - [ ] User feedback summary

### Task 11: Privacy & Data Retention (AC: #1, #2)

- [ ] Ensure PII compliance:
  - [ ] Hash all user IDs before sending to GA4
  - [ ] Hash account IDs
  - [ ] Never send email addresses or names
- [ ] Configure GA4 data retention:
  - [ ] Event data: 14 months
  - [ ] User-level data: Anonymized after 2 months
- [ ] Update privacy policy to mention analytics

### Task 12: Testing & Validation (AC: #1, #2, #3)

- [ ] Test analytics in development:
  - [ ] Use GA4 Debug View
  - [ ] Verify all events fire correctly
  - [ ] Validate event properties
- [ ] Create analytics test checklist:
  - [ ] Complete OAuth flow → verify 3 events
  - [ ] Link account → verify 1 event
  - [ ] Generate multi-source report → verify 1 event
  - [ ] Trigger API error → verify 1 event
- [ ] Monitor first week after launch for data quality

## Dev Notes

### Critical Context from Architecture

**Analytics Architecture** (Source: architecture.md#Analytics):
- Use Firebase Analytics (GA4) for event tracking
- Events are batched and sent periodically
- User properties tracked: plan, registration_date, meta_connected
- Privacy: Hash all PII before sending

**Event Naming Convention:**
- Lowercase with underscores: `meta_account_connected`
- Prefix with domain: `meta_`, `report_`, `user_`
- Past tense for completed actions: `_connected`, `_generated`

### Project Structure Notes

**Files to Create:**
- `src/services/analytics.ts` - Analytics wrapper service
- `src/types/analytics.ts` - Event types and interfaces
- `functions/src/generateMetaAnalyticsReport.ts` - Weekly report function
- `docs/analytics/meta-ads-tracking-plan.md` - Tracking documentation

**Files to Modify:**
- `src/services/metaAuthService.ts` - Add OAuth events
- `src/services/clientService.ts` - Add connection events
- `src/services/reportService.ts` - Add report events
- `functions/src/utils/metaErrorHandler.ts` - Add error events

### Technical Requirements

**Analytics Service Wrapper:**
```typescript
// src/services/analytics.ts

import { getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics';
import { MetaAnalyticsEvent } from '../types/analytics';
import CryptoJS from 'crypto-js';

const analytics = getAnalytics();

function hashValue(value: string): string {
  return CryptoJS.SHA256(value).toString();
}

export function logMetaEvent(
  event: MetaAnalyticsEvent,
  params?: Record<string, any>
) {
  // Hash sensitive fields
  const sanitizedParams = { ...params };
  if (sanitizedParams.user_id) {
    sanitizedParams.user_id = hashValue(sanitizedParams.user_id);
  }
  if (sanitizedParams.account_id) {
    sanitizedParams.account_id = hashValue(sanitizedParams.account_id);
  }
  if (sanitizedParams.client_id) {
    sanitizedParams.client_id = hashValue(sanitizedParams.client_id);
  }

  firebaseLogEvent(analytics, event, {
    ...sanitizedParams,
    timestamp: new Date().toISOString(),
    app_version: import.meta.env.VITE_APP_VERSION,
  });
}

// Specific event helpers
export function trackMetaAccountConnected(clientId: string, accountId: string) {
  logMetaEvent(MetaAnalyticsEvent.META_ACCOUNT_CONNECTED, {
    client_id: clientId,
    account_id: accountId,
  });
}

export function trackMultiSourceReport(sources: string[], metrics: any) {
  logMetaEvent(MetaAnalyticsEvent.MULTI_SOURCE_REPORT_GENERATED, {
    sources,
    total_impressions: metrics.impressions,
    total_clicks: metrics.clicks,
    total_cost: metrics.cost,
  });
}
```

**Analytics Event Types:**
```typescript
// src/types/analytics.ts

export enum MetaAnalyticsEvent {
  META_OAUTH_STARTED = 'meta_oauth_started',
  META_OAUTH_COMPLETED = 'meta_oauth_completed',
  META_OAUTH_FAILED = 'meta_oauth_failed',
  META_ACCOUNT_CONNECTED = 'meta_account_connected',
  META_ACCOUNT_DISCONNECTED = 'meta_account_disconnected',
  MULTI_SOURCE_REPORT_GENERATED = 'multi_source_report_generated',
  META_API_ERROR = 'meta_api_error',
  META_FEATURE_BANNER_SHOWN = 'meta_feature_banner_shown',
  META_FEATURE_BANNER_CLICKED = 'meta_feature_banner_clicked',
}

export interface MetaOAuthEventParams {
  source?: 'manual' | 'banner' | 'onboarding';
  error_code?: string;
}

export interface MetaAccountConnectedParams {
  client_id: string; // hashed
  account_id: string; // hashed
}

export interface MultiSourceReportParams {
  sources: string[];
  total_impressions: number;
  total_clicks: number;
  total_cost: number;
  slides_count: number;
}

export interface MetaAPIErrorParams {
  error_code: string;
  endpoint: string;
  retry_count: number;
}
```

**BigQuery Metrics Query:**
```sql
-- Adoption Rate Query
SELECT
  COUNT(DISTINCT user_id) AS users_with_meta,
  (COUNT(DISTINCT user_id) / (SELECT COUNT(*) FROM users WHERE active = true)) * 100 AS adoption_rate_percent
FROM
  `firebase-project.analytics_XXXXX.events_*`
WHERE
  event_name = 'meta_account_connected'
  AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE());
```

**Weekly Analytics Report Function:**
```typescript
// functions/src/generateMetaAnalyticsReport.ts

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { BigQuery } from '@google-cloud/bigquery';
import * as nodemailer from 'nodemailer';

export const generateMetaAnalyticsReport = onSchedule('0 9 * * 1', async () => {
  const bigquery = new BigQuery();

  // Query adoption metrics
  const [adoptionRows] = await bigquery.query(`
    SELECT
      COUNT(DISTINCT user_id) as users_with_meta
    FROM \`analytics.events_*\`
    WHERE event_name = 'meta_account_connected'
    AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  `);

  const adoptionCount = adoptionRows[0]?.users_with_meta || 0;

  // Query error rate
  const [errorRows] = await bigquery.query(`
    SELECT
      COUNT(*) as error_count,
      COUNT(DISTINCT user_id) as affected_users
    FROM \`analytics.events_*\`
    WHERE event_name = 'meta_api_error'
    AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
  `);

  const errorCount = errorRows[0]?.error_count || 0;

  // Generate email report
  const report = `
    Meta Ads Integration - Weekly Report
    
    Adoption:
    - New users connected Meta: ${adoptionCount}
    
    Errors:
    - Total API errors: ${errorCount}
    - Affected users: ${errorRows[0]?.affected_users || 0}
    
    Next Actions:
    ${errorCount > 100 ? '⚠️ High error rate - investigate!' : '✅ Error rate within normal range'}
  `;

  // Send email (configure nodemailer)
  await sendEmail('team@flipika.com', 'Meta Ads Weekly Report', report);
});
```

### Success Metrics (KPIs)

| Metric | Target (Month 1) | Target (Month 3) | How to Measure |
|--------|------------------|------------------|----------------|
| % Users with Meta connected | 10% | 30% | GA4: `meta_account_connected` / Total active users |
| Multi-source reports / Total | 5% | 15% | GA4: `multi_source_report_generated` / Total reports |
| Meta API success rate | > 90% | > 95% | BigQuery: (Total calls - Errors) / Total calls |
| OAuth success rate | > 85% | > 90% | GA4: `meta_oauth_completed` / `meta_oauth_started` |
| Time to first Meta report | < 10 min | < 5 min | GA4: Time between `meta_oauth_completed` and first report |

### Testing Requirements

**Development Testing:**
- Use GA4 Debug View in Chrome DevTools
- Verify events appear in real-time
- Check event properties are correct

**QA Checklist:**
- [ ] Complete full OAuth flow → Verify 3 events (started, completed, connected)
- [ ] Generate multi-source report → Verify 1 event with correct sources
- [ ] Trigger API error → Verify error event with code
- [ ] Dismiss banner → Verify banner_shown but not banner_clicked
- [ ] Click banner → Verify both events

**Production Validation:**
- Monitor GA4 for first 48 hours after launch
- Check for missing events or incorrect properties
- Validate BigQuery export is working

### Dependencies & Prerequisites

**Depends On:**
- All previous stories (14.1-14.9)

**Blocks:**
- None (final story)

### Privacy Considerations

**PII Handling:**
- Never send email addresses
- Hash user IDs, client IDs, account IDs
- Aggregate metrics only in reports
- Comply with GDPR/CCPA

**Data Retention:**
- GA4 event data: 14 months
- BigQuery raw data: 2 years (for analysis)
- Delete user data on account deletion

### References

- [Source: epic-14-meta-ads-integration.md#Story 14.10]
- [GA4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [BigQuery for Firebase](https://firebase.google.com/docs/analytics/bigquery-export)

### Known Issues & Gotchas

**Event Batching:**
- GA4 batches events (not instant)
- Debug View shows events immediately
- Production events may take 24-48h to appear in reports

**User ID Hashing:**
- Must hash consistently (same user → same hash)
- Use SHA256 for security
- Never reverse hash to identify users

**BigQuery Costs:**
- Queries are billed per TB scanned
- Use partitioned tables (_TABLE_SUFFIX)
- Limit query range to reduce costs

## Dev Agent Record

### File List

**Created:**
- `src/services/analytics.ts`
- `src/types/analytics.ts`
- `functions/src/generateMetaAnalyticsReport.ts`
- `docs/analytics/meta-ads-tracking-plan.md`

**Modified:**
- `src/services/metaAuthService.ts`
- `src/services/clientService.ts`
- `src/services/reportService.ts`
- `functions/src/utils/metaErrorHandler.ts`
- `src/components/announcements/MetaAdsAnnouncementBanner.tsx`
