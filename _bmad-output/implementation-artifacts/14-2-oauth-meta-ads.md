# Story 14.2: OAuth Flow Meta Ads (Backend)

Status: ready-for-dev

## Story

As a **User**,
I want to **connect my Meta Business account securely**,
so that **Flipika can access my Facebook & Instagram ad data**.

## Acceptance Criteria

### AC1: Meta OAuth Consent Flow

**Given** I am on the "Connect Meta Ads" page
**When** I click "Connect with Meta"
**Then** I am redirected to Meta's consent screen
**And** The requested permissions are ONLY `ads_read` and `business_management`
**And** After approval, I am redirected to a callback URL with an authorization code

### AC2: Token Exchange & Secure Storage

**Given** The callback receives the authorization code
**When** The Cloud Function `metaOAuthCallback` processes it
**Then** The code is exchanged for a short-lived access token and a long-lived token (60 days)
**And** The long-lived token is stored encrypted in Firestore under `users/{userId}/tokens/meta`
**And** The token is NEVER exposed to the frontend

### AC3: Automatic Token Refresh

**Given** The token is about to expire (< 7 days)
**When** The system checks token validity
**Then** A background function automatically refreshes the token
**And** The user is notified if the refresh fails (re-authentication required)

## Tasks / Subtasks

### Task 1: Create Meta Developer App (AC: #1)

- [ ] Go to Meta for Developers (developers.facebook.com)
- [ ] Create new App for "Business" use case
- [ ] Add "Marketing API" product
- [ ] Configure OAuth settings:
  - [ ] Valid OAuth Redirect URIs: `https://flipika.com/auth/meta/callback`
  - [ ] App Domains: `flipika.com`
- [ ] Get App ID and App Secret
- [ ] Store App Secret in Firebase Secret Manager

### Task 2: Setup Firebase Secret Manager (AC: #2)

- [ ] Enable Secret Manager API in Google Cloud Console
- [ ] Create secret: `META_APP_SECRET`
  - [ ] Value: Meta App Secret from Developer Console
  - [ ] Grant access to Cloud Functions service account
- [ ] Create secret: `META_APP_ID`
  - [ ] Value: Meta App ID
- [ ] Update Firebase Functions to use secrets

### Task 3: Create TypeScript Types (AC: #2, #3)

- [ ] Create `src/types/meta.ts`
  - [ ] `MetaToken` interface (accessToken, expiresAt, refreshToken)
  - [ ] `MetaOAuthResponse` interface
  - [ ] `MetaAdAccount` interface
- [ ] Create `functions/src/types/meta.ts` (backend types)
  - [ ] Same types for backend
  - [ ] `MetaAPIResponse` generic interface

### Task 4: Frontend OAuth Initiation (AC: #1)

- [ ] Create `src/services/metaAuthService.ts`
  - [ ] `initiateMetaOAuth()` - Redirect to Meta consent screen
  - [ ] Build OAuth URL with required scopes
  - [ ] Include state parameter for CSRF protection
- [ ] Create `src/pages/AuthCallbackMetaPage.tsx`
  - [ ] Handle OAuth callback from Meta
  - [ ] Extract authorization code from URL params
  - [ ] Verify state parameter
  - [ ] Call backend function to exchange code for tokens
  - [ ] Show loading state during exchange
  - [ ] Redirect to client page on success

### Task 5: Backend OAuth Callback Function (AC: #2)

- [ ] Create `functions/src/metaOAuth.ts`
  - [ ] Export HTTPS callable function: `metaOAuthCallback`
  - [ ] Verify user is authenticated (request.auth.uid)
  - [ ] Exchange authorization code for tokens:
    - [ ] POST to `https://graph.facebook.com/v21.0/oauth/access_token`
    - [ ] Parameters: app_id, app_secret, code, redirect_uri
  - [ ] Exchange short-lived for long-lived token:
    - [ ] GET `https://graph.facebook.com/v21.0/oauth/access_token`
    - [ ] Parameters: grant_type=fb_exchange_token, client_id, client_secret, fb_exchange_token
  - [ ] Encrypt token before storage (use crypto module)
  - [ ] Store in Firestore: `users/{userId}/tokens/meta`
    - [ ] Fields: `encryptedToken`, `expiresAt`, `createdAt`, `lastRefreshAt`
  - [ ] Return success to frontend (no token exposed)

### Task 6: Token Encryption & Decryption Utilities (AC: #2)

- [ ] Create `functions/src/utils/encryption.ts`
  - [ ] `encryptToken(token: string): string` - AES-256 encryption
  - [ ] `decryptToken(encrypted: string): string` - AES-256 decryption
  - [ ] Use Firebase Secret Manager for encryption key
  - [ ] Add error handling for invalid encrypted data

### Task 7: Scheduled Token Refresh Function (AC: #3)

- [ ] Create `functions/src/scheduledMetaTokenRefresh.ts`
  - [ ] Export scheduled function: runs daily at 2 AM
  - [ ] Query all Meta tokens expiring in < 7 days
  - [ ] For each token:
    - [ ] Decrypt long-lived token
    - [ ] Request new long-lived token from Meta
    - [ ] Re-encrypt and update Firestore
  - [ ] Log success/failure for monitoring
  - [ ] Send notification email if refresh fails

### Task 8: User Notification on Token Expiry (AC: #3)

- [ ] Update `scheduledMetaTokenRefresh.ts`
  - [ ] If refresh fails, create notification document:
    - [ ] Collection: `users/{userId}/notifications`
    - [ ] Type: `meta_token_expired`
    - [ ] Message: "Your Meta Ads connection has expired. Please reconnect."
  - [ ] Frontend to poll notifications and show toast
- [ ] Create `src/services/notificationService.ts`
  - [ ] Listen to user notifications collection
  - [ ] Show toast on new notification
  - [ ] Mark notification as read

### Task 9: Update Firestore Security Rules (AC: #2)

- [ ] Modify `firestore.rules`
  - [ ] Add rule for `users/{userId}/tokens/meta`:
    - [ ] Read/Write: Only by authenticated user (userId)
    - [ ] Never expose encrypted token to frontend (server-side only via Functions)
  - [ ] Add rule for `users/{userId}/notifications`:
    - [ ] Read: Authenticated user
    - [ ] Write: Server-side only
  - [ ] Deploy rules: `firebase deploy --only firestore:rules`

### Task 10: Error Handling & Logging (AC: #1, #2, #3)

- [ ] Add error handling in `metaOAuthCallback`
  - [ ] Invalid authorization code → Return error
  - [ ] Meta API errors → Log to Crashlytics
  - [ ] Network timeout → Retry with exponential backoff
- [ ] Add structured logging:
  - [ ] Log OAuth initiation (user_id, timestamp)
  - [ ] Log successful token exchange
  - [ ] Log token refresh success/failure
  - [ ] Use Firebase Analytics for tracking

### Task 11: Testing (AC: #1, #2, #3)

- [ ] Unit tests for `metaOAuth.ts`
  - [ ] Mock Meta API responses
  - [ ] Test token exchange success
  - [ ] Test token exchange failure
- [ ] Unit tests for `encryption.ts`
  - [ ] Test encrypt/decrypt roundtrip
  - [ ] Test invalid encrypted data handling
- [ ] Integration test: Full OAuth flow
  - [ ] Use Meta test credentials
  - [ ] Verify token stored encrypted
  - [ ] Verify frontend never receives token
- [ ] Manual testing:
  - [ ] Complete OAuth flow in staging
  - [ ] Verify token refresh after 7 days (simulate expiry)
  - [ ] Test notification on refresh failure

### Task 12: Documentation (AC: #1, #2, #3)

- [ ] Update `docs/architecture-backend.md`
  - [ ] Document Meta OAuth architecture
  - [ ] Add sequence diagram for OAuth flow
- [ ] Create `docs/meta-ads-setup.md`
  - [ ] Instructions for setting up Meta Developer App
  - [ ] How to configure Firebase Secret Manager
- [ ] Add JSDoc comments to all functions

## Dev Notes

### Critical Context from Architecture

**OAuth Security Pattern** (Source: architecture.md#Authentication & Security):
- Frontend initiates OAuth but NEVER handles tokens
- Backend (Functions) exchanges code for tokens
- Tokens stored ENCRYPTED in Firestore
- Firestore rules prevent client access to tokens
- Same pattern as Google Ads OAuth (proven secure)

**Meta OAuth Endpoints**:
- Authorization: `https://www.facebook.com/v21.0/dialog/oauth`
- Token Exchange: `https://graph.facebook.com/v21.0/oauth/access_token`
- Long-lived Exchange: Same endpoint with `grant_type=fb_exchange_token`

**Token Lifecycle**:
- Short-lived token: 1 hour validity
- Long-lived token: 60 days validity
- Refresh: Automatic 7 days before expiry
- Re-authentication: Required if refresh fails

### Project Structure Notes

**Files to Create:**
- `src/services/metaAuthService.ts` - Frontend OAuth initiation
- `src/pages/AuthCallbackMetaPage.tsx` - OAuth callback handler
- `src/types/meta.ts` - Frontend Meta types
- `functions/src/metaOAuth.ts` - Backend OAuth function
- `functions/src/scheduledMetaTokenRefresh.ts` - Token refresh cron
- `functions/src/utils/encryption.ts` - Encryption utilities
- `functions/src/types/meta.ts` - Backend Meta types
- `docs/meta-ads-setup.md` - Setup documentation

**Files to Modify:**
- `firestore.rules` - Add token storage rules
- `src/App.tsx` - Add AuthCallbackMetaPage route
- `src/services/notificationService.ts` - Add Meta notifications

### Technical Requirements

**Meta OAuth URL Construction:**
```typescript
// src/services/metaAuthService.ts

export const initiateMetaOAuth = () => {
  const state = generateRandomState(); // CSRF protection
  sessionStorage.setItem('meta_oauth_state', state);

  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_META_APP_ID,
    redirect_uri: `${window.location.origin}/auth/meta/callback`,
    state,
    scope: 'ads_read,business_management', // ONLY required scopes
  });

  window.location.href = `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
};
```

**Backend Token Exchange:**
```typescript
// functions/src/metaOAuth.ts

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { encryptToken } from './utils/encryption';

export const metaOAuthCallback = onCall(async (request) => {
  // Verify authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { code, redirectUri } = request.data;

  // Exchange code for short-lived token
  const shortTokenResponse = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?` +
    `client_id=${process.env.META_APP_ID}&` +
    `client_secret=${process.env.META_APP_SECRET}&` +
    `code=${code}&` +
    `redirect_uri=${redirectUri}`
  );

  const shortTokenData = await shortTokenResponse.json();

  if (!shortTokenData.access_token) {
    throw new HttpsError('internal', 'Failed to exchange code for token');
  }

  // Exchange for long-lived token (60 days)
  const longTokenResponse = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${process.env.META_APP_ID}&` +
    `client_secret=${process.env.META_APP_SECRET}&` +
    `fb_exchange_token=${shortTokenData.access_token}`
  );

  const longTokenData = await longTokenResponse.json();

  // Encrypt token before storage
  const encryptedToken = encryptToken(longTokenData.access_token);

  // Store in Firestore
  const db = getFirestore();
  await db.collection('users').doc(request.auth.uid)
    .collection('tokens').doc('meta').set({
      encryptedToken,
      expiresAt: Timestamp.fromMillis(Date.now() + (60 * 24 * 60 * 60 * 1000)), // 60 days
      createdAt: Timestamp.now(),
      lastRefreshAt: Timestamp.now(),
    });

  return { success: true };
});
```

**Token Encryption:**
```typescript
// functions/src/utils/encryption.ts

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY; // 32 bytes from Secret Manager

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptToken(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

**Scheduled Token Refresh:**
```typescript
// functions/src/scheduledMetaTokenRefresh.ts

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { decryptToken, encryptToken } from './utils/encryption';

export const refreshMetaTokens = onSchedule('0 2 * * *', async () => { // Daily at 2 AM
  const db = getFirestore();
  const now = Timestamp.now();
  const sevenDaysFromNow = Timestamp.fromMillis(now.toMillis() + (7 * 24 * 60 * 60 * 1000));

  const usersSnapshot = await db.collection('users').get();

  for (const userDoc of usersSnapshot.docs) {
    const tokenDoc = await userDoc.ref.collection('tokens').doc('meta').get();

    if (!tokenDoc.exists) continue;

    const tokenData = tokenDoc.data();

    // Refresh if expiring in < 7 days
    if (tokenData.expiresAt.toMillis() < sevenDaysFromNow.toMillis()) {
      try {
        const currentToken = decryptToken(tokenData.encryptedToken);

        // Request new long-lived token
        const response = await fetch(
          `https://graph.facebook.com/v21.0/oauth/access_token?` +
          `grant_type=fb_exchange_token&` +
          `client_id=${process.env.META_APP_ID}&` +
          `client_secret=${process.env.META_APP_SECRET}&` +
          `fb_exchange_token=${currentToken}`
        );

        const newTokenData = await response.json();

        if (newTokenData.access_token) {
          const encryptedToken = encryptToken(newTokenData.access_token);

          await tokenDoc.ref.update({
            encryptedToken,
            expiresAt: Timestamp.fromMillis(Date.now() + (60 * 24 * 60 * 60 * 1000)),
            lastRefreshAt: Timestamp.now(),
          });

          console.log(`Token refreshed for user ${userDoc.id}`);
        } else {
          throw new Error('Failed to refresh token');
        }
      } catch (error) {
        console.error(`Token refresh failed for user ${userDoc.id}:`, error);

        // Create notification
        await userDoc.ref.collection('notifications').add({
          type: 'meta_token_expired',
          message: 'Your Meta Ads connection has expired. Please reconnect.',
          createdAt: Timestamp.now(),
          read: false,
        });
      }
    }
  }
});
```

### Firestore Security Rules

```javascript
// firestore.rules

// Meta tokens - Server-side only
match /users/{userId}/tokens/meta {
  // Only Cloud Functions can write
  allow read: if false; // Never allow direct client reads
  allow write: if false; // Never allow direct client writes
}

// User notifications
match /users/{userId}/notifications/{notificationId} {
  allow read: if request.auth.uid == userId;
  allow write: if false; // Only server can write
  allow update: if request.auth.uid == userId
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']);
}
```

### Naming Conventions (CRITICAL)

**From project-context.md:**
- Functions: `camelCase` → `metaOAuthCallback`, `refreshMetaTokens`
- Services: `camelCase.ts` → `metaAuthService.ts`
- Components: `PascalCase.tsx` → `AuthCallbackMetaPage.tsx`
- Types: `PascalCase` → `MetaToken`, `MetaOAuthResponse`

### Error Handling Pattern

**Use react-hot-toast for user feedback:**
```typescript
import toast from 'react-hot-toast';

// Success
toast.success('Meta Ads connecté avec succès');

// Error
toast.error('Échec de la connexion Meta Ads. Veuillez réessayer.');
```

**Backend error codes:**
```typescript
{
  success: false,
  error: "Meta OAuth failed: Invalid authorization code",
  code: "META_OAUTH_INVALID_CODE"
}
```

### i18n Requirements

```json
// src/locales/fr/translation.json
{
  "meta": {
    "oauth": {
      "connecting": "Connexion à Meta Ads...",
      "success": "Meta Ads connecté avec succès",
      "error": "Échec de la connexion Meta Ads",
      "expired": "Votre connexion Meta Ads a expiré",
      "reconnect": "Reconnecter Meta Ads"
    }
  }
}
```

### Testing Requirements

**Unit Tests:**
- `metaOAuth.test.ts` - Test token exchange with mocked Meta API
- `encryption.test.ts` - Test encrypt/decrypt roundtrip
- `scheduledMetaTokenRefresh.test.ts` - Test token refresh logic

**Integration Tests:**
- Full OAuth flow with Meta test credentials
- Verify encrypted token stored in Firestore
- Verify frontend never receives decrypted token

**Manual Tests:**
1. Complete OAuth flow in staging
2. Verify token stored encrypted in Firestore
3. Verify token refresh works (simulate expiry)
4. Verify notification sent on refresh failure

### Dependencies & Prerequisites

**Depends On:**
- Story 14.1 (Multi-Source Data Model) - Must be complete first

**Blocks:**
- Story 14.3 (Account Linking) - Needs OAuth to list accounts
- Story 14.4 (Meta Insights Service) - Needs token to call API

**External Dependencies:**
- Meta Developer App approved
- Firebase Secret Manager enabled
- Encryption key generated and stored

### Performance Considerations

**Token Refresh:**
- Scheduled function runs daily
- Processes all users in single run
- Estimated: ~1 second per 100 users
- Use batching if user count > 10,000

**OAuth Redirect:**
- Frontend redirect to Meta: instant
- Token exchange: 1-3 seconds
- Total OAuth flow: < 5 seconds

### Security Checklist

- [ ] App Secret stored in Secret Manager (never in code)
- [ ] Tokens encrypted with AES-256-GCM before Firestore storage
- [ ] Firestore rules prevent client access to tokens
- [ ] State parameter prevents CSRF attacks
- [ ] HTTPS only for all OAuth redirects
- [ ] Token refresh uses long-lived token (not access token)

### References

- [Source: epic-14-meta-ads-integration.md#Story 14.2] - Story definition
- [Source: architecture.md#Authentication & Security] - Security patterns
- [Meta Marketing API Docs](https://developers.facebook.com/docs/marketing-api)
- [OAuth for Business](https://developers.facebook.com/docs/facebook-login/guides/access-tokens/)

### Known Issues & Gotchas

**Meta Token Expiry:**
- Short-lived tokens: 1 hour (must exchange immediately)
- Long-lived tokens: 60 days (refresh at 7 days before expiry)
- No refresh token like Google - must exchange current token

**OAuth Redirect URIs:**
- Must be EXACTLY configured in Meta Developer Console
- HTTPS required (localhost exception for dev)
- Subdomain variations not allowed (must match exactly)

**Token Exchange Errors:**
- Invalid code: User abandoned OAuth flow
- Expired code: User took too long (10 min timeout)
- Invalid redirect_uri: Mismatch with Developer Console

**Encryption Key Management:**
- Key must be 32 bytes (256 bits) for AES-256
- Store in Firebase Secret Manager, never in code
- Rotate key annually (requires re-encryption migration)

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

**Created:**
- `src/services/metaAuthService.ts`
- `src/pages/AuthCallbackMetaPage.tsx`
- `src/types/meta.ts`
- `functions/src/metaOAuth.ts`
- `functions/src/scheduledMetaTokenRefresh.ts`
- `functions/src/utils/encryption.ts`
- `functions/src/types/meta.ts`
- `docs/meta-ads-setup.md`

**Modified:**
- `firestore.rules`
- `src/App.tsx` (add route)
- `src/locales/fr/translation.json`
- `src/locales/en/translation.json`
- `functions/src/index.ts` (export new functions)

**Tests:**
- `functions/src/__tests__/metaOAuth.test.ts`
- `functions/src/utils/__tests__/encryption.test.ts`
- `functions/src/__tests__/scheduledMetaTokenRefresh.test.ts`
