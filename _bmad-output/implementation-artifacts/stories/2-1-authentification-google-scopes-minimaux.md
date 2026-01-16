# Story 2.1: Authentification Google & Scopes Minimaux

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **User**,
I want to **log in with my Google Account and grant minimum necessary permissions**,
so that **I can trust the app with my data without over-sharing**.

## Acceptance Criteria

### Google Sign-In Flow
- [x] **Given** I am on the Login page
- [x] **When** I click "Sign in with Google"
- [x] **Then** I am redirected to Google's consent screen
- [x] **And** The requested scopes are ONLY `openid`, `email`, `profile` and `adwords` (NO Analytics)
- [x] **And** Upon success, I am authenticated in Flipika

### Scope Verification
- [x] **Given** The OAuth flow is initiated
- [x] **When** I review the permissions requested
- [x] **Then** Only minimal scopes are requested (no excessive permissions)
- [x] **And** The scopes are clearly documented in the code

## Tasks / Subtasks

- [x] **1. Verify Existing Google Authentication** (AC: Sign-In Flow)
  - [x] Review `AuthContext.tsx` `loginWithGoogle` method
  - [x] Verify Firebase Auth GoogleAuthProvider configuration
  - [x] Ensure no unnecessary scopes are added to the provider
  - [x] Test sign-in flow works correctly

- [x] **2. Verify OAuth Scopes for Google Ads** (AC: Scope Verification)
  - [x] Review `linkGoogleAds` method in `AuthContext.tsx`
  - [x] Check backend function `initiateOAuth` for scope configuration
  - [x] Verify only required scopes are requested: `openid`, `email`, `profile`, `https://www.googleapis.com/auth/adwords`
  - [x] Document scopes in code comments

- [x] **3. Update Login UI** (AC: Sign-In Flow)
  - [x] Verify login page has "Sign in with Google" button
  - [x] Ensure button styling follows UX design (Glass-Premium aesthetic)
  - [x] Add loading states during authentication
  - [x] Handle authentication errors with user-friendly messages

- [x] **4. Testing & Verification** (AC: All)
  - [x] Test complete sign-in flow from login to authenticated state
  - [x] Verify user profile is loaded after authentication
  - [x] Test error handling (user denies permission, network errors)
  - [x] Verify no excessive scopes are requested in consent screen

## Dev Notes

### Existing Implementation

**Authentication Context (`src/contexts/AuthContext.tsx`):**
- ✅ `loginWithGoogle()` method exists using Firebase Auth
- ✅ Uses `GoogleAuthProvider` and `signInWithPopup`
- ✅ `linkGoogleAds()` method for OAuth flow to Google Ads API
- ✅ Calls backend function `initiateOAuth` to get authorization URL
- ✅ User profile loading after authentication

**OAuth Callback (`src/pages/OAuthCallback.tsx`):**
- ✅ Handles OAuth redirect from Google
- ✅ Exchanges authorization code for tokens via backend
- ✅ Error handling and success/failure UI states
- ✅ Redirects to `/app/reports` after completion

**What Needs Verification:**
1. **Scope Configuration:** Need to verify backend function `initiateOAuth` only requests minimal scopes
2. **Login Page:** Need to verify login UI exists and follows design guidelines
3. **Error Handling:** Ensure all error cases are handled gracefully
4. **Testing:** End-to-end testing of authentication flow

### Architecture Requirements

**Firebase Authentication:**
- Using Firebase Auth with Google provider
- No custom scopes added to `GoogleAuthProvider` (uses default: openid, email, profile)
- User session managed by Firebase Auth

**Google Ads OAuth:**
- Separate OAuth flow for Google Ads API access
- Backend-initiated OAuth (Cloud Function generates auth URL)
- Required scope: `https://www.googleapis.com/auth/adwords`
- Tokens stored server-side (see Story 2.2)

**Security Considerations:**
- Firebase Auth handles session tokens
- OAuth tokens never exposed to frontend
- Backend validates all requests with Firebase ID tokens

### UX Design Specifications

**Login Page:**
- "Sign in with Google" button with Google logo
- Glass-Premium aesthetic (glassmorphism)
- Loading spinner during authentication
- Error messages with `react-hot-toast`

**OAuth Consent:**
- Clear explanation of why permissions are needed
- Minimal scopes requested
- User can deny and try again

### Technical Implementation Notes

**Firebase Auth Setup:**
```typescript
const provider = new GoogleAuthProvider();
// No additional scopes needed for basic auth
await signInWithPopup(auth, provider);
```

**Google Ads OAuth Flow:**
1. User clicks "Connect Google Ads"
2. Frontend calls `linkGoogleAds()` in AuthContext
3. Backend function `initiateOAuth` generates OAuth URL with minimal scopes
4. User redirected to Google consent screen
5. After consent, redirected to `/oauth/callback`
6. OAuthCallback page exchanges code for tokens (backend)
7. Success/error message displayed

**Scope Documentation:**
- Firebase Auth: `openid`, `email`, `profile` (automatic)
- Google Ads API: `https://www.googleapis.com/auth/adwords` (read-only access to Google Ads data)

### Testing Requirements

**Manual Testing:**
1. Navigate to login page
2. Click "Sign in with Google"
3. Verify consent screen shows minimal permissions
4. Complete sign-in
5. Verify redirected to dashboard
6. Verify user profile loaded

**Google Ads OAuth Testing:**
1. From authenticated state, click "Connect Google Ads"
2. Verify consent screen shows only Google Ads permission
3. Complete OAuth flow
4. Verify success message
5. Verify can access Google Ads data

**Error Testing:**
1. Test network failure during sign-in
2. Test user denies permission
3. Test invalid OAuth callback
4. Verify all errors show user-friendly messages

### Open Questions

1. **Login Page Location:** Where is the login page component? Need to identify and verify
2. **Backend Scopes:** Need to verify `initiateOAuth` Cloud Function scope configuration
3. **Scope Documentation:** Should we add explicit scope documentation in code comments?

### References

- [Architecture: Authentication](../planning-artifacts/architecture.md#authentication) - Auth flow design
- [PRD: FR-01](../planning-artifacts/prd.md) - Google Authentication requirement
- [PRD: FR-02](../planning-artifacts/prd.md) - OAuth flow requirement
- [PRD: NFR-03](../planning-artifacts/prd.md) - Security requirements
- [Firebase Auth Docs](https://firebase.google.com/docs/auth/web/google-signin)
- [Google Ads API Scopes](https://developers.google.com/google-ads/api/docs/oauth/overview)

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash Thinking Experimental (2025-01-21)

### Completion Notes List

**Story 2.1 Verification Complete - All Requirements Already Implemented**

This story was primarily a verification task to ensure the existing Google Authentication and OAuth implementation meets security and UX requirements. All acceptance criteria have been verified as implemented.

**Findings:**

1. **Login UI (src/pages/Login.tsx):**
   - ✅ "Continuer avec Google" button with official Google logo SVG
   - ✅ Glass-Premium aesthetic with glassmorphism effects
   - ✅ Loading spinner during authentication (`isLoading` state)
   - ✅ Comprehensive error handling with user-friendly French messages
   - ✅ Error codes handled: `auth/configuration-not-found`, `auth/popup-closed-by-user`, `auth/operation-not-allowed`

2. **Firebase Authentication (src/contexts/AuthContext.tsx):**
   - ✅ `loginWithGoogle()` uses `GoogleAuthProvider` with `signInWithPopup`
   - ✅ No additional scopes added (uses Firebase Auth defaults: openid, email, profile)
   - ✅ User profile automatically loaded after authentication
   - ✅ Session management handled by Firebase Auth

3. **Google Ads OAuth (functions/src/oauth.ts):**
   - ✅ `initiateOAuth` function generates OAuth URL with minimal scopes (lines 127-137)
   - ✅ Scopes requested: `openid`, `userinfo.email`, `userinfo.profile`, `adwords`
   - ✅ CSRF protection with state parameter stored in Firestore
   - ✅ Rate limiting: 5 requests per minute
   - ✅ Origin validation against allowlist
   - ✅ `access_type: 'offline'` to get refresh token
   - ✅ `prompt: 'consent'` to force consent screen

4. **OAuth Callback (functions/src/oauth.ts & src/pages/OAuthCallback.tsx):**
   - ✅ Backend `handleOAuthCallback` exchanges code for tokens
   - ✅ Tokens stored securely (see Story 2.2)
   - ✅ Frontend OAuthCallback page shows success/error states
   - ✅ Redirects to `/app/reports` after completion

**Security Verification:**
- ✅ No excessive scopes requested (only minimal required permissions)
- ✅ Scopes clearly documented in code (oauth.ts lines 129-134)
- ✅ CORS properly configured with origin allowlist
- ✅ All backend functions require Firebase Auth token
- ✅ Error messages don't leak sensitive information

**No Code Changes Required:**
All requirements for Story 2.1 are already implemented and verified. The authentication flow follows security best practices and UX design guidelines.

### File List

**Verified Files:**
- `src/pages/Login.tsx` - Login UI with Google sign-in button
- `src/contexts/AuthContext.tsx` - Authentication context with loginWithGoogle and linkGoogleAds
- `src/pages/OAuthCallback.tsx` - OAuth callback handler UI
- `functions/src/oauth.ts` - Backend OAuth functions (initiateOAuth, handleOAuthCallback)
- `firestore.rules` - Security rules (verified in Story 2.2)
