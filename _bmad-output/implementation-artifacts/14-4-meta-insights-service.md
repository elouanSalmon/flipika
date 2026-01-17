# Story 14.4: Meta Insights Service (Backend Proxy)

Status: ready-for-dev

## Story

As a **System**,
I want to **securely fetch Meta Ads insights on behalf of the user**,
so that **the frontend can display metrics without exposing tokens**.

## Acceptance Criteria

### AC1: Fetch Meta Insights via Backend Proxy
**Given** A client has a Meta Ads account linked
**When** The frontend calls `getMetaInsights({ clientId, dateRange, metrics })`
**Then** The Cloud Function retrieves the user's Meta token from Firestore
**And** Makes a request to Meta Marketing API: `GET /{ad_account_id}/insights`
**And** Returns the data in a normalized format matching Google Ads structure

### AC2: Handle API Errors Gracefully
**Given** The Meta API returns an error (expired token, rate limit, etc.)
**When** The function processes the response
**Then** It returns a structured error with code
**And** The frontend displays an appropriate toast message

## Tasks

- [ ] Create `functions/src/getMetaInsights.ts` - Backend function
- [ ] Normalize Meta metrics to Flipika format (spend→cost, etc.)
- [ ] Handle rate limits with retry logic
- [ ] Add caching layer (5 min TTL)
- [ ] Create `src/services/metaInsightsService.ts` - Frontend service
- [ ] Update error handling with specific error codes
- [ ] Add unit tests with mocked Meta API
- [ ] Integration test with real Meta test account

## Technical Notes

**Meta Insights API:**
- Endpoint: `https://graph.facebook.com/v21.0/{ad_account_id}/insights`
- Required params: `date_preset` or `time_range`, `fields`, `level`
- Rate limit: 200 calls/hour/user

**Metric Normalization:**
```typescript
{
  spend → cost,
  inline_link_clicks → clicks,
  impressions → impressions (same),
  actions[action_type=offsite_conversion] → conversions
}
```

**Dependencies:** Story 14.2 (OAuth), Story 14.3 (Account Linking)
