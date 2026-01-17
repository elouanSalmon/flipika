# Story 14.9: Error Handling & User Feedback (Meta-Specific)

Status: ready-for-dev

## Story

As a **User**,
I want **clear error messages when Meta integration fails**,
so that **I know exactly what to do to fix it**.

## Acceptance Criteria

### AC1: Token Expiry Handling
**Given** My Meta token has expired
**When** I try to generate a report
**Then** I see an error toast: "Meta Ads connection expired. Please reconnect your account."
**And** A "Reconnect" button redirects me to the OAuth flow

### AC2: API Timeout Handling
**Given** Meta API is down or slow
**When** The Pre-Flight Check tries to load data
**Then** I see a warning after 5 seconds: "Meta Ads is taking longer than usual. Continue waiting or skip?"
**And** I can choose to generate the report with Google data only

### AC3: Permission Errors
**Given** I don't have permissions on a specific Meta Ad Account
**When** I try to link it
**Then** I see an error: "Access denied. Make sure you have Admin role on this account."
**And** The account is not added to the client

### AC4: Unknown API Errors
**Given** Meta changes their API and breaks compatibility
**When** The system detects an unknown API response
**Then** It logs the error to Firebase Crashlytics
**And** Shows a generic error to the user: "Meta Ads integration is experiencing issues. Our team has been notified."

## Tasks / Subtasks

### Task 1: Define Meta Error Code Enum (AC: #1, #2, #3, #4)

- [ ] Create `src/types/metaErrors.ts`
  - [ ] `MetaErrorCode` enum:
    - [ ] `META_AUTH_EXPIRED` - Token expired
    - [ ] `META_AUTH_INVALID` - Invalid token
    - [ ] `META_RATE_LIMIT` - Rate limit exceeded
    - [ ] `META_PERMISSION_DENIED` - No access to account
    - [ ] `META_ACCOUNT_NOT_FOUND` - Account doesn't exist
    - [ ] `META_API_TIMEOUT` - Request timeout
    - [ ] `META_API_ERROR` - Generic API error
    - [ ] `META_UNKNOWN_ERROR` - Unexpected error
  - [ ] `MetaError` class extending Error:
    - [ ] `code: MetaErrorCode`
    - [ ] `message: string`
    - [ ] `originalError?: Error`
    - [ ] `retryable: boolean`

### Task 2: Backend Error Mapping (AC: #1, #2, #3, #4)

- [ ] Create `functions/src/utils/metaErrorHandler.ts`
  - [ ] `mapMetaAPIError(error): MetaError`
    - [ ] Map HTTP 401/403 → `META_AUTH_EXPIRED`
    - [ ] Map HTTP 429 → `META_RATE_LIMIT`
    - [ ] Map HTTP 404 → `META_ACCOUNT_NOT_FOUND`
    - [ ] Map timeout → `META_API_TIMEOUT`
    - [ ] Map unknown → `META_UNKNOWN_ERROR`
  - [ ] Log errors to Firebase Crashlytics
  - [ ] Return structured error to frontend

### Task 3: Update Meta Backend Functions with Error Handling (AC: #1, #2, #3)

- [ ] Update `functions/src/metaOAuth.ts`
  - [ ] Wrap API calls in try-catch
  - [ ] Use `mapMetaAPIError()`
  - [ ] Return structured error response
- [ ] Update `functions/src/getMetaAdAccounts.ts`
  - [ ] Handle permission errors
  - [ ] Handle token expiry
- [ ] Update `functions/src/getMetaInsights.ts`
  - [ ] Handle rate limits with retry
  - [ ] Handle timeouts gracefully

### Task 4: Frontend Error Handler Service (AC: #1, #2, #3, #4)

- [ ] Create `src/services/metaErrorHandler.ts`
  - [ ] `handleMetaError(error: MetaError, context: string)`
    - [ ] Show appropriate toast based on error code
    - [ ] Log to console (dev mode) or analytics (prod)
    - [ ] Trigger recovery actions if applicable
  - [ ] `getErrorMessage(code: MetaErrorCode): string`
    - [ ] Return user-friendly i18n message per code
  - [ ] `isRetryable(error: MetaError): boolean`
    - [ ] Return true for timeouts, rate limits

### Task 5: Reconnect Flow for Expired Tokens (AC: #1)

- [ ] Create `src/components/meta/ReconnectMetaPrompt.tsx`
  - [ ] Modal with message: "Your Meta connection has expired"
  - [ ] "Reconnect" button → initiates OAuth flow
  - [ ] "Cancel" button → closes modal
- [ ] Auto-trigger modal when `META_AUTH_EXPIRED` error detected
- [ ] Save redirect URL to return to after OAuth

### Task 6: Timeout Handling with User Choice (AC: #2)

- [ ] Update Pre-Flight Check component
  - [ ] Show loading spinner immediately
  - [ ] After 5 seconds, show timeout warning
  - [ ] Options: "Keep Waiting" or "Skip Meta Ads"
  - [ ] If skip → generate report with Google data only
  - [ ] If keep waiting → continue loading (max 30 seconds)
- [ ] Add timeout config: `META_API_TIMEOUT = 30000ms`

### Task 7: Permission Error UI (AC: #3)

- [ ] Update `MetaAccountPicker.tsx`
  - [ ] Catch `META_PERMISSION_DENIED` error
  - [ ] Show inline error per account in list
  - [ ] Gray out accounts without permission
  - [ ] Show tooltip: "You need Admin access to link this account"
- [ ] Prevent linking accounts without permission

### Task 8: Generic Error Fallback (AC: #4)

- [ ] Create `src/components/errors/MetaErrorFallback.tsx`
  - [ ] Display generic error message
  - [ ] "Contact Support" button
  - [ ] "Try Again" button (if retryable)
  - [ ] Show error ID for support reference
- [ ] Use as fallback for unknown errors

### Task 9: Crashlytics Integration (AC: #4)

- [ ] Update `functions/src/utils/metaErrorHandler.ts`
  - [ ] Import Firebase Crashlytics
  - [ ] Log all Meta errors to Crashlytics
  - [ ] Include context: user ID, function name, timestamp
  - [ ] Tag errors with `meta_integration`
- [ ] Create Crashlytics dashboard for Meta errors

### Task 10: Retry Logic with Exponential Backoff (AC: #2)

- [ ] Create `functions/src/utils/retryWithBackoff.ts`
  - [ ] `retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000)`
  - [ ] Exponential backoff: 1s, 2s, 4s
  - [ ] Only retry if error is retryable
  - [ ] Return final error if all retries fail
- [ ] Use in Meta API calls for timeouts and rate limits

### Task 11: User Notification System (AC: #1, #4)

- [ ] Extend notification service for Meta errors
  - [ ] Create notification when token expires
  - [ ] Create notification when API has ongoing issues
  - [ ] Dismiss notification after user fixes issue
- [ ] Show notification bell icon in header
- [ ] Badge with count of unread notifications

### Task 12: Testing (AC: #1, #2, #3, #4)

- [ ] Unit tests for `metaErrorHandler.ts`
  - [ ] Test each error code mapping
  - [ ] Test retry logic
- [ ] Component tests for error UIs
  - [ ] ReconnectMetaPrompt
  - [ ] Timeout warning
  - [ ] Permission error display
- [ ] Integration tests:
  - [ ] Simulate token expiry → verify reconnect flow
  - [ ] Simulate API timeout → verify user choice
  - [ ] Simulate permission error → verify account grayed out
- [ ] Manual testing with mocked errors

## Dev Notes

### Critical Context from Architecture

**Error Handling Philosophy** (Source: architecture.md#Error Handling):
- Always show actionable error messages (not just "An error occurred")
- Provide recovery path when possible (e.g., Reconnect button)
- Log errors for debugging but don't expose technical details to user
- Use react-hot-toast for all user-facing errors

**Meta API Error Responses:**
```json
{
  "error": {
    "message": "Error validating access token",
    "type": "OAuthException",
    "code": 190,
    "error_subcode": 463
  }
}
```

### Project Structure Notes

**Files to Create:**
- `src/types/metaErrors.ts` - Error types and enum
- `src/services/metaErrorHandler.ts` - Frontend error handler
- `src/components/meta/ReconnectMetaPrompt.tsx` - Reconnect modal
- `src/components/errors/MetaErrorFallback.tsx` - Generic fallback
- `functions/src/utils/metaErrorHandler.ts` - Backend error mapper
- `functions/src/utils/retryWithBackoff.ts` - Retry utility

**Files to Modify:**
- `src/components/clients/MetaAccountPicker.tsx` - Permission errors
- `src/components/reports/PreFlightCheck.tsx` - Timeout handling
- All Meta service files - Add error handling

### Technical Requirements

**Meta Error Class:**
```typescript
// src/types/metaErrors.ts

export enum MetaErrorCode {
  META_AUTH_EXPIRED = 'META_AUTH_EXPIRED',
  META_AUTH_INVALID = 'META_AUTH_INVALID',
  META_RATE_LIMIT = 'META_RATE_LIMIT',
  META_PERMISSION_DENIED = 'META_PERMISSION_DENIED',
  META_ACCOUNT_NOT_FOUND = 'META_ACCOUNT_NOT_FOUND',
  META_API_TIMEOUT = 'META_API_TIMEOUT',
  META_API_ERROR = 'META_API_ERROR',
  META_UNKNOWN_ERROR = 'META_UNKNOWN_ERROR',
}

export class MetaError extends Error {
  constructor(
    public code: MetaErrorCode,
    message: string,
    public retryable: boolean = false,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'MetaError';
  }
}
```

**Backend Error Mapper:**
```typescript
// functions/src/utils/metaErrorHandler.ts

import { MetaError, MetaErrorCode } from '../types/metaErrors';
import * as crashlytics from 'firebase/crashlytics';

export function mapMetaAPIError(error: any, context: string): MetaError {
  const errorCode = error?.error?.code;
  const errorSubcode = error?.error?.error_subcode;

  let metaError: MetaError;

  // Map Meta error codes to our error types
  if (errorCode === 190 || errorSubcode === 463) {
    metaError = new MetaError(
      MetaErrorCode.META_AUTH_EXPIRED,
      'Meta authentication expired',
      false,
      error
    );
  } else if (errorCode === 80004 || error.code === 'ETIMEDOUT') {
    metaError = new MetaError(
      MetaErrorCode.META_API_TIMEOUT,
      'Meta API request timeout',
      true,
      error
    );
  } else if (errorCode === 200 || errorSubcode === 2635) {
    metaError = new MetaError(
      MetaErrorCode.META_PERMISSION_DENIED,
      'Permission denied to Meta account',
      false,
      error
    );
  } else if (error.status === 429) {
    metaError = new MetaError(
      MetaErrorCode.META_RATE_LIMIT,
      'Meta API rate limit exceeded',
      true,
      error
    );
  } else {
    metaError = new MetaError(
      MetaErrorCode.META_UNKNOWN_ERROR,
      'Unexpected Meta API error',
      false,
      error
    );
  }

  // Log to Crashlytics
  crashlytics().recordError(metaError, {
    context,
    userId: auth.currentUser?.uid,
    timestamp: new Date().toISOString(),
  });

  return metaError;
}
```

**Retry with Backoff:**
```typescript
// functions/src/utils/retryWithBackoff.ts

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Only retry if error is retryable
      if (!error.retryable || i === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

**Frontend Error Handler:**
```typescript
// src/services/metaErrorHandler.ts

import toast from 'react-hot-toast';
import { MetaError, MetaErrorCode } from '../types/metaErrors';
import { t } from 'i18next';

export function handleMetaError(error: MetaError, showToast: boolean = true) {
  const message = getErrorMessage(error.code);

  if (showToast) {
    if (error.code === MetaErrorCode.META_AUTH_EXPIRED) {
      toast.error(message, {
        duration: 10000,
        action: {
          label: t('meta.errors.reconnect'),
          onClick: () => redirectToOAuth(),
        },
      });
    } else {
      toast.error(message);
    }
  }

  // Log to analytics
  if (process.env.NODE_ENV === 'production') {
    logEvent('meta_error', {
      code: error.code,
      retryable: error.retryable,
    });
  }

  return message;
}

export function getErrorMessage(code: MetaErrorCode): string {
  const messages: Record<MetaErrorCode, string> = {
    [MetaErrorCode.META_AUTH_EXPIRED]: t('meta.errors.authExpired'),
    [MetaErrorCode.META_AUTH_INVALID]: t('meta.errors.authInvalid'),
    [MetaErrorCode.META_RATE_LIMIT]: t('meta.errors.rateLimit'),
    [MetaErrorCode.META_PERMISSION_DENIED]: t('meta.errors.permissionDenied'),
    [MetaErrorCode.META_ACCOUNT_NOT_FOUND]: t('meta.errors.accountNotFound'),
    [MetaErrorCode.META_API_TIMEOUT]: t('meta.errors.timeout'),
    [MetaErrorCode.META_API_ERROR]: t('meta.errors.apiError'),
    [MetaErrorCode.META_UNKNOWN_ERROR]: t('meta.errors.unknown'),
  };

  return messages[code] || t('meta.errors.generic');
}
```

### i18n Requirements

```json
// src/locales/fr/translation.json
{
  "meta": {
    "errors": {
      "authExpired": "Votre connexion Meta Ads a expiré. Veuillez vous reconnecter.",
      "authInvalid": "Connexion Meta Ads invalide. Veuillez vous reconnecter.",
      "rateLimit": "Limite de requêtes Meta dépassée. Veuillez réessayer dans quelques minutes.",
      "permissionDenied": "Accès refusé. Assurez-vous d'avoir le rôle Admin sur ce compte.",
      "accountNotFound": "Compte Meta Ads introuvable.",
      "timeout": "Meta Ads met plus de temps que d'habitude à répondre.",
      "apiError": "Erreur de l'API Meta Ads. Veuillez réessayer.",
      "unknown": "L'intégration Meta Ads rencontre des problèmes. Notre équipe a été notifiée.",
      "generic": "Une erreur est survenue avec Meta Ads.",
      "reconnect": "Reconnecter",
      "tryAgain": "Réessayer",
      "skipMeta": "Ignorer Meta Ads",
      "keepWaiting": "Continuer d'attendre"
    }
  }
}
```

### Testing Requirements

**Unit Tests:**
- `metaErrorHandler.test.ts` (backend) - Map all error codes
- `metaErrorHandler.test.ts` (frontend) - Get correct messages
- `retryWithBackoff.test.ts` - Test retry logic

**Component Tests:**
- `ReconnectMetaPrompt.test.tsx` - Render and actions
- Timeout warning - User choices

**Integration Tests:**
- Simulate expired token → verify reconnect prompt
- Simulate timeout → verify skip option
- Simulate permission error → verify UI response

### Dependencies & Prerequisites

**Depends On:**
- All previous stories (14.1-14.8)

**Blocks:**
- None (quality/polish story)

### Error Code Reference

| HTTP Status | Meta Code | Our Code | Retryable |
|-------------|-----------|----------|-----------|
| 401/403 | 190 | META_AUTH_EXPIRED | No |
| 403 | 200 | META_PERMISSION_DENIED | No |
| 429 | - | META_RATE_LIMIT | Yes |
| 504/Timeout | - | META_API_TIMEOUT | Yes |
| 404 | - | META_ACCOUNT_NOT_FOUND | No |
| Other | - | META_UNKNOWN_ERROR | No |

### References

- [Source: epic-14-meta-ads-integration.md#Story 14.9]
- [Meta Error Codes Documentation](https://developers.facebook.com/docs/graph-api/using-graph-api/error-handling/)

## Dev Agent Record

### File List

**Created:**
- `src/types/metaErrors.ts`
- `src/services/metaErrorHandler.ts`
- `src/components/meta/ReconnectMetaPrompt.tsx`
- `src/components/errors/MetaErrorFallback.tsx`
- `functions/src/utils/metaErrorHandler.ts`
- `functions/src/utils/retryWithBackoff.ts`

**Modified:**
- `src/components/clients/MetaAccountPicker.tsx`
- `src/components/reports/PreFlightCheck.tsx`
- `functions/src/metaOAuth.ts`
- `functions/src/getMetaAdAccounts.ts`
- `functions/src/getMetaInsights.ts`
- `src/locales/fr/translation.json`
- `src/locales/en/translation.json`
