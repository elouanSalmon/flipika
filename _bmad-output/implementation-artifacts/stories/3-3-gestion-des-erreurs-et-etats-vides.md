# Story 3.3: Gestion des Erreurs et États Vides

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **User**,
I want to **know clearly if the Google Ads API fails**,
so that **I don't generate a broken report or wait indefinitely**.

## Acceptance Criteria

### Error Detection
- [x] **Given** The Pre-Flight check is running
- [x] **When** The Google Ads API returns an error or times out
- [x] **Then** An explicit error message is displayed in the modal
- [x] **And** I can click "Retry" to attempt the fetch again
- [x] **And** I cannot proceed to generation until data is valid

### Error Messages
- [x] **Given** An error has occurred
- [x] **When** I view the error message
- [x] **Then** The message is clear and actionable
- [x] **And** Technical details are hidden but accessible
- [x] **And** Suggested actions are provided

### Empty States
- [x] **Given** No data is available for the selected period
- [x] **When** The Pre-Flight check completes
- [x] **Then** An empty state message is shown
- [x] **And** I am prompted to select a different period
- [x] **And** Generation buttons remain disabled

## Tasks / Subtasks

- [x] **1. Error Handling Infrastructure** (AC: Error Detection)
  - [x] Create error boundary component
  - [x] Implement error state in Pre-Flight state machine
  - [x] Add timeout handling (30 seconds max)
  - [x] Log errors for debugging

- [x] **2. Error UI Components** (AC: Error Messages)
  - [x] Design error message component
  - [x] Create user-friendly error messages
  - [x] Add "Retry" button functionality
  - [x] Include expandable technical details

- [x] **3. Empty State Handling** (AC: Empty States)
  - [x] Detect when no data is returned
  - [x] Create empty state UI component
  - [x] Provide helpful suggestions
  - [x] Disable generation actions

- [x] **4. Error Types & Messages** (AC: Error Messages)
  - [x] Map API error codes to user messages
  - [x] Handle network errors
  - [x] Handle authentication errors
  - [x] Handle rate limiting errors

## Dev Notes

### Error Types

**API Errors:**
- `AUTHENTICATION_ERROR`: "Your Google Ads connection has expired. Please reconnect."
- `PERMISSION_ERROR`: "You don't have permission to access this account."
- `RATE_LIMIT_ERROR`: "Too many requests. Please wait a moment and try again."
- `TIMEOUT_ERROR`: "The request took too long. Please try again."
- `NETWORK_ERROR`: "Network connection failed. Check your internet connection."

**Data Errors:**
- `NO_DATA`: "No data available for this period."
- `INVALID_PERIOD`: "The selected period is invalid."
- `ACCOUNT_NOT_FOUND`: "Google Ads account not found."

### UX Design Specifications

**Error Message Component:**
```tsx
<ErrorMessage
  type="error" // or "warning", "info"
  title="Connection Failed"
  message="Unable to fetch data from Google Ads."
  action={{
    label: "Retry",
    onClick: handleRetry
  }}
  details="Error code: 401 - Authentication failed"
/>
```

**Empty State Component:**
```tsx
<EmptyState
  icon={<ChartIcon />}
  title="No Data Available"
  message="There's no data for the selected period."
  suggestion="Try selecting a different date range."
/>
```

### Technical Implementation Notes

**Error Handling Pattern:**
```typescript
try {
  const data = await fetchGoogleAdsData(params);
  setState({ status: 'success', data });
} catch (error) {
  if (error instanceof AuthError) {
    setState({ 
      status: 'error', 
      error: 'AUTHENTICATION_ERROR',
      message: 'Your Google Ads connection has expired.'
    });
  } else if (error instanceof TimeoutError) {
    setState({ 
      status: 'error', 
      error: 'TIMEOUT_ERROR',
      message: 'Request timed out. Please try again.'
    });
  }
  // ... handle other error types
}
```

**Retry Logic:**
- Exponential backoff for retries
- Max 3 retry attempts
- Show retry count to user

### Testing Requirements

**Error Scenarios to Test:**
1. API returns 401 (authentication error)
2. API returns 429 (rate limit)
3. Network timeout (>30 seconds)
4. No data for period
5. Invalid account ID
6. Network disconnection

**User Experience Testing:**
- Error messages are clear and helpful
- Retry button works correctly
- Technical details are hidden by default
- Empty states provide actionable guidance

### References

- [PRD: FR-09](../planning-artifacts/prd.md) - Error handling requirement
- [PRD: NFR-02](../planning-artifacts/prd.md) - Reliability requirements
- [UX Design](../planning-artifacts/ux-design-specification.md) - Error patterns
- [Architecture](../planning-artifacts/architecture.md) - Error handling strategy

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

**Implementation completed on 2026-01-10:**

1. **Error Types System** (`src/types/errors.ts`):
   - Created comprehensive `ApiErrorCode` type with 9 error categories
   - Implemented `ERROR_MESSAGES` mapping with French user-friendly messages
   - Added `parseApiError()` function to classify errors from API responses
   - Defined constants: `API_TIMEOUT_MS` (30s), `MAX_RETRY_ATTEMPTS` (3)
   - Added `getRetryDelay()` for exponential backoff

2. **Error Boundary Component** (`src/components/common/ErrorBoundary.tsx`):
   - React class component for catching render errors
   - Graceful fallback UI with retry and home navigation
   - Technical details shown in development mode only
   - Optional error callback for logging

3. **Enhanced ErrorState Component** (`src/components/common/ErrorState.tsx`):
   - Extended props: suggestion, technicalDetails, errorCode, retryCount, isRetrying
   - Dynamic icons based on error type (WifiOff, Clock, ShieldOff, etc.)
   - Expandable technical details section
   - Retry counter with max attempts tracking
   - Loading spinner during retry

4. **Enhanced EmptyState Component** (`src/components/common/EmptyState.tsx`):
   - Added `suggestion` prop for actionable guidance
   - Added `variant` prop ('default', 'warning', 'info') for styling
   - Support for primary and secondary actions
   - Default icons based on variant

5. **Fetch Utilities** (`src/utils/fetchWithTimeout.ts`):
   - `fetchWithTimeout()` - fetch with AbortController timeout
   - `withTimeout()` - generic promise timeout wrapper
   - `withRetry()` - retry with exponential backoff
   - `safeFetch()` - combined fetch with error parsing

6. **ReportPreview Page Updates** (`src/pages/ReportPreview.tsx`):
   - Extended `PreviewState` type with 'empty' status
   - Added timeout handling with AbortController
   - Implemented retry mechanism with exponential backoff
   - Integrated ErrorState component for error display
   - Integrated EmptyState component for empty widget state
   - Wrapped content with ErrorBoundary
   - Generation buttons disabled when no widgets

### Change Log

- 2026-01-10: Initial implementation of error handling system (Story 3.3)
- 2026-01-10: Bug fix - PDF download "Report preview not found" error in post-send step (ReportCanvas was unmounted, now hidden with CSS to keep ref alive)

### File List

**New Files:**
- src/types/errors.ts
- src/components/common/ErrorBoundary.tsx
- src/utils/fetchWithTimeout.ts

**Modified Files:**
- src/components/common/ErrorState.tsx (enhanced with new props)
- src/components/common/EmptyState.tsx (enhanced with variants)
- src/pages/ReportPreview.tsx (integrated error handling + fixed PDF download bug by keeping ReportCanvas rendered but hidden)
