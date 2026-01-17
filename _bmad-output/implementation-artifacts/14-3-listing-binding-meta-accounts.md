# Story 14.3: Listing & Binding Meta Ad Accounts

Status: ready-for-dev

## Story

As a **User**,
I want to **see all my Meta Ad Accounts and link one (or several) to a Flipika Client**,
so that **the system knows which data to fetch for this client**.

## Acceptance Criteria

### AC1: List Available Meta Ad Accounts

**Given** I have successfully authenticated with Meta
**When** I open the "Link Meta Account" interface for a Client
**Then** I see a list of all Ad Accounts I can access (fetched via `GET /me/adaccounts`)
**And** Each account displays: Name, ID, Currency, Status (Active/Disabled)

### AC2: Link Meta Account to Client

**Given** I select an Ad Account from the list
**When** I click "Link Account"
**Then** The binding is saved in the Client's `dataSources` array
**And** The structure is: `{ type: "meta_ads", accountId: "act_123", accountName: "Acme Campaign", currency: "EUR", status: "active", connectedAt: timestamp }`
**And** I see a success toast: "Meta Ads account linked successfully"

### AC3: Prevent Duplicate Bindings

**Given** A client already has a Meta account linked
**When** I try to link the same account again
**Then** I see an error: "This account is already linked to this client"
**And** The duplicate is prevented

### AC4: Unlink Meta Account

**Given** I want to unlink a Meta account
**When** I click "Remove" next to the Meta binding
**Then** A confirmation modal appears: "Remove Meta Ads link? Reports using this source will fail."
**And** Upon confirmation, the entry is removed from `dataSources`

## Tasks / Subtasks

### Task 1: Backend Function - Get Meta Ad Accounts (AC: #1)

- [ ] Create `functions/src/getMetaAdAccounts.ts`
  - [ ] Export HTTPS callable function: `getMetaAdAccounts`
  - [ ] Verify user is authenticated
  - [ ] Retrieve Meta token from Firestore: `users/{userId}/tokens/meta`
  - [ ] Decrypt token using `decryptToken()`
  - [ ] Call Meta API: `GET https://graph.facebook.com/v21.0/me/adaccounts`
    - [ ] Fields: `id,name,currency,account_status,business`
    - [ ] Access token in Authorization header
  - [ ] Map Meta response to standardized format
  - [ ] Return array of ad accounts
  - [ ] Handle errors (expired token, no accounts, API errors)

### Task 2: TypeScript Types for Ad Accounts (AC: #1, #2)

- [ ] Update `src/types/meta.ts`
  - [ ] Add `MetaAdAccount` interface:
    - [ ] `id: string` (account ID like "act_123456")
    - [ ] `name: string`
    - [ ] `currency: string`
    - [ ] `status: 'active' | 'disabled'`
    - [ ] `business?: { id: string, name: string }`
- [ ] Update `src/types/client.ts`
  - [ ] Ensure `DataSource` interface supports Meta fields

### Task 3: Frontend Service - Meta Ad Accounts (AC: #1)

- [ ] Create `src/services/metaAdAccountsService.ts`
  - [ ] `getMetaAdAccounts()` - Call backend function
    - [ ] Use Firebase Functions callable
    - [ ] Handle loading state
    - [ ] Return typed `MetaAdAccount[]`
    - [ ] Handle errors (token expired, no accounts)
  - [ ] Add error mapping for user-friendly messages

### Task 4: Update Client Service - Add/Remove Data Sources (AC: #2, #4)

- [ ] Update `src/services/clientService.ts`
  - [ ] `addMetaDataSource(clientId, metaAccount)`:
    - [ ] Check for duplicates (same accountId)
    - [ ] Add to `dataSources` array
    - [ ] Return updated client
  - [ ] `removeDataSource(clientId, type, accountId)`:
    - [ ] Filter out matching data source
    - [ ] Update Firestore
    - [ ] Return updated client

### Task 5: Meta Account Picker Component (AC: #1, #2, #3)

- [ ] Create `src/components/clients/MetaAccountPicker.tsx`
  - [ ] Props: `clientId`, `onSuccess`, `onCancel`
  - [ ] State: `accounts`, `loading`, `error`, `selectedAccountId`
  - [ ] useEffect: Fetch Meta ad accounts on mount
  - [ ] Render:
    - [ ] Loading spinner while fetching
    - [ ] Error message if fetch fails (with "Reconnect" button)
    - [ ] List of accounts with radio buttons
    - [ ] Each account shows: Name, ID, Currency, Status badge
    - [ ] "Link Account" button (disabled if none selected)
    - [ ] "Cancel" button
  - [ ] onClick "Link Account":
    - [ ] Call `addMetaDataSource()`
    - [ ] Show success toast
    - [ ] Call `onSuccess()` to close modal/refresh

### Task 6: Client Detail Page - Data Sources Section (AC: #1, #2, #4)

- [ ] Update `src/pages/ClientDetailPage.tsx`
  - [ ] Add "Data Sources" section after basic info
  - [ ] Display list of connected data sources:
    - [ ] Icon (Google "G" or Meta infinity symbol)
    - [ ] Account name and ID
    - [ ] Status badge (Active/Disconnected/Error)
    - [ ] "Remove" button (trash icon)
  - [ ] Add "Connect Data Source" dropdown button:
    - [ ] Option: "Connect Google Ads" (existing flow)
    - [ ] Option: "Connect Meta Ads" (new)
  - [ ] onClick "Connect Meta Ads":
    - [ ] Check if Meta token exists
    - [ ] If no token → redirect to OAuth flow
    - [ ] If token exists → open MetaAccountPicker modal
  - [ ] onClick "Remove":
    - [ ] Show confirmation modal
    - [ ] Call `removeDataSource()`
    - [ ] Refresh data sources list

### Task 7: Confirmation Modal for Unlinking (AC: #4)

- [ ] Create `src/components/common/ConfirmDialog.tsx` (reusable)
  - [ ] Props: `title`, `message`, `onConfirm`, `onCancel`, `confirmText`, `cancelText`, `variant` (danger/warning/info)
  - [ ] Render modal with title, message, and action buttons
  - [ ] Use Tailwind for styling (glassmorphism theme)
- [ ] Use ConfirmDialog in ClientDetailPage for unlinking

### Task 8: Error Handling & Edge Cases (AC: #1, #3)

- [ ] Handle "Meta token expired" error:
  - [ ] Show error toast with "Reconnect" button
  - [ ] Redirect to Meta OAuth flow on reconnect
- [ ] Handle "No ad accounts found":
  - [ ] Show empty state message
  - [ ] Suggest checking Meta Business Manager
- [ ] Handle duplicate binding attempt (AC: #3):
  - [ ] Check before calling backend
  - [ ] Show error toast: "This account is already linked"
- [ ] Handle network errors:
  - [ ] Retry button on fetch failure
  - [ ] Clear error message

### Task 9: UI/UX Enhancements (AC: #1, #2)

- [ ] Add icons for data sources:
  - [ ] Google Ads: Blue "G" logo
  - [ ] Meta Ads: Blue gradient infinity symbol
- [ ] Status badges with colors:
  - [ ] Active: Green
  - [ ] Disconnected: Gray
  - [ ] Error: Red
- [ ] Hover states and transitions
- [ ] Loading skeletons for account list
- [ ] Empty state when no sources connected

### Task 10: Update Firestore Rules (AC: #2, #4)

- [ ] Verify `firestore.rules` allows `dataSources` array updates
  - [ ] User can add/remove own data sources
  - [ ] Validate structure on write
- [ ] Test rules in Firestore emulator

### Task 11: Testing (AC: #1, #2, #3, #4)

- [ ] Unit tests for `metaAdAccountsService.ts`
  - [ ] Mock backend function response
  - [ ] Test success case
  - [ ] Test error cases
- [ ] Unit tests for `clientService.ts`
  - [ ] Test `addMetaDataSource()`
  - [ ] Test duplicate prevention
  - [ ] Test `removeDataSource()`
- [ ] Component tests for `MetaAccountPicker.tsx`
  - [ ] Render with mock accounts
  - [ ] Test account selection
  - [ ] Test link button click
- [ ] Integration test: Full link/unlink flow
- [ ] Manual testing:
  - [ ] Link Meta account to client
  - [ ] Try linking same account again (should fail)
  - [ ] Unlink Meta account
  - [ ] Link multiple sources (Google + Meta)

### Task 12: i18n & Documentation (AC: #1, #2, #4)

- [ ] Add French translations for all new UI strings
- [ ] Add English translations
- [ ] Update component JSDoc comments
- [ ] Add user guide: "How to connect Meta Ads"

## Dev Notes

### Critical Context from Architecture

**Multi-Source Architecture** (Source: architecture.md#Data Architecture):
- Client can have multiple data sources: `dataSources: DataSource[]`
- Each source has: `type`, `accountId`, `accountName`, `currency`, `status`, `connectedAt`
- Firestore path: `users/{userId}/clients/{clientId}`

**Meta API Endpoint** (Source: epic-14):
- List accounts: `GET /me/adaccounts?fields=id,name,currency,account_status`
- Requires valid Meta access token
- Token retrieved from `users/{userId}/tokens/meta` (encrypted)

### Project Structure Notes

**Files to Create:**
- `functions/src/getMetaAdAccounts.ts` - Backend function
- `src/services/metaAdAccountsService.ts` - Frontend service
- `src/components/clients/MetaAccountPicker.tsx` - Account picker UI
- `src/components/common/ConfirmDialog.tsx` - Reusable confirmation modal

**Files to Modify:**
- `src/services/clientService.ts` - Add `addMetaDataSource()`, `removeDataSource()`
- `src/pages/ClientDetailPage.tsx` - Add data sources section
- `src/types/meta.ts` - Add `MetaAdAccount` type
- `functions/src/index.ts` - Export `getMetaAdAccounts`

**Project Structure Alignment:**
- Backend Functions → `functions/src/`
- Frontend Services → `src/services/`
- Reusable Components → `src/components/common/`
- Domain Components → `src/components/clients/`

### Technical Requirements

**Backend Function - Get Meta Ad Accounts:**
```typescript
// functions/src/getMetaAdAccounts.ts

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { decryptToken } from './utils/encryption';

export const getMetaAdAccounts = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const db = getFirestore();
  const userId = request.auth.uid;

  // Retrieve encrypted Meta token
  const tokenDoc = await db.collection('users').doc(userId)
    .collection('tokens').doc('meta').get();

  if (!tokenDoc.exists) {
    throw new HttpsError('not-found', 'Meta token not found. Please authenticate first.');
  }

  const tokenData = tokenDoc.data();
  const accessToken = decryptToken(tokenData.encryptedToken);

  // Call Meta API
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/me/adaccounts?` +
      `fields=id,name,currency,account_status,business&` +
      `access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Meta API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Map to standardized format
    const accounts = data.data.map((account: any) => ({
      id: account.id,
      name: account.name,
      currency: account.currency,
      status: account.account_status === 1 ? 'active' : 'disabled',
      business: account.business ? {
        id: account.business.id,
        name: account.business.name,
      } : undefined,
    }));

    return { success: true, data: accounts };
  } catch (error) {
    console.error('Error fetching Meta ad accounts:', error);
    throw new HttpsError('internal', 'Failed to fetch Meta ad accounts');
  }
});
```

**Frontend Service - Meta Ad Accounts:**
```typescript
// src/services/metaAdAccountsService.ts

import { getFunctions, httpsCallable } from 'firebase/functions';
import { MetaAdAccount } from '../types/meta';

const functions = getFunctions();

export async function getMetaAdAccounts(): Promise<MetaAdAccount[]> {
  const callable = httpsCallable<void, { success: boolean; data: MetaAdAccount[] }>(
    functions,
    'getMetaAdAccounts'
  );

  try {
    const result = await callable();

    if (!result.data.success) {
      throw new Error('Failed to fetch Meta ad accounts');
    }

    return result.data.data;
  } catch (error: any) {
    if (error.code === 'not-found') {
      throw new Error('META_TOKEN_NOT_FOUND');
    } else if (error.code === 'unauthenticated') {
      throw new Error('UNAUTHENTICATED');
    } else {
      throw new Error('META_API_ERROR');
    }
  }
}
```

**Update Client Service:**
```typescript
// src/services/clientService.ts (additions)

import { DataSource } from '../types/client';
import { MetaAdAccount } from '../types/meta';
import { Timestamp } from 'firebase/firestore';

export async function addMetaDataSource(
  clientId: string,
  metaAccount: MetaAdAccount
): Promise<void> {
  const clientRef = doc(db, 'users', auth.currentUser!.uid, 'clients', clientId);
  const clientSnap = await getDoc(clientRef);

  if (!clientSnap.exists()) {
    throw new Error('Client not found');
  }

  const clientData = clientSnap.data();
  const dataSources = clientData.dataSources || [];

  // Check for duplicate
  const isDuplicate = dataSources.some(
    (source: DataSource) =>
      source.type === 'meta_ads' && source.accountId === metaAccount.id
  );

  if (isDuplicate) {
    throw new Error('DUPLICATE_DATA_SOURCE');
  }

  // Add new Meta data source
  const newSource: DataSource = {
    type: 'meta_ads',
    accountId: metaAccount.id,
    accountName: metaAccount.name,
    currency: metaAccount.currency,
    status: metaAccount.status,
    connectedAt: Timestamp.now(),
  };

  await updateDoc(clientRef, {
    dataSources: [...dataSources, newSource],
    updatedAt: Timestamp.now(),
  });
}

export async function removeDataSource(
  clientId: string,
  type: string,
  accountId: string
): Promise<void> {
  const clientRef = doc(db, 'users', auth.currentUser!.uid, 'clients', clientId);
  const clientSnap = await getDoc(clientRef);

  if (!clientSnap.exists()) {
    throw new Error('Client not found');
  }

  const clientData = clientSnap.data();
  const dataSources = clientData.dataSources || [];

  // Filter out the data source
  const updatedSources = dataSources.filter(
    (source: DataSource) =>
      !(source.type === type && source.accountId === accountId)
  );

  await updateDoc(clientRef, {
    dataSources: updatedSources,
    updatedAt: Timestamp.now(),
  });
}
```

**Meta Account Picker Component:**
```typescript
// src/components/clients/MetaAccountPicker.tsx

import React, { useState, useEffect } from 'react';
import { MetaAdAccount } from '../../types/meta';
import { getMetaAdAccounts } from '../../services/metaAdAccountsService';
import { addMetaDataSource } from '../../services/clientService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Props {
  clientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MetaAccountPicker({ clientId, onSuccess, onCancel }: Props) {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<MetaAdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    setError(null);

    try {
      const data = await getMetaAdAccounts();
      setAccounts(data);
    } catch (err: any) {
      if (err.message === 'META_TOKEN_NOT_FOUND') {
        setError(t('meta.errors.tokenNotFound'));
      } else {
        setError(t('meta.errors.loadAccounts'));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLink() {
    if (!selectedAccountId) return;

    const selectedAccount = accounts.find(a => a.id === selectedAccountId);
    if (!selectedAccount) return;

    setLinking(true);

    try {
      await addMetaDataSource(clientId, selectedAccount);
      toast.success(t('meta.linkSuccess'));
      onSuccess();
    } catch (err: any) {
      if (err.message === 'DUPLICATE_DATA_SOURCE') {
        toast.error(t('meta.errors.duplicate'));
      } else {
        toast.error(t('meta.errors.linkFailed'));
      }
    } finally {
      setLinking(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
        <button
          onClick={loadAccounts}
          className="mt-4 btn-primary"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="p-6 text-center">
        <p>{t('meta.noAccounts')}</p>
        <button onClick={onCancel} className="mt-4 btn-secondary">
          {t('common.close')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t('meta.selectAccount')}</h3>

      <div className="space-y-2 mb-6">
        {accounts.map((account) => (
          <label
            key={account.id}
            className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50"
          >
            <input
              type="radio"
              name="metaAccount"
              value={account.id}
              checked={selectedAccountId === account.id}
              onChange={() => setSelectedAccountId(account.id)}
              className="mr-3"
            />
            <div className="flex-1">
              <div className="font-medium">{account.name}</div>
              <div className="text-sm text-gray-500">
                {account.id} • {account.currency}
              </div>
            </div>
            <span
              className={`px-2 py-1 text-xs rounded ${
                account.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {t(`meta.status.${account.status}`)}
            </span>
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="btn-secondary">
          {t('common.cancel')}
        </button>
        <button
          onClick={handleLink}
          disabled={!selectedAccountId || linking}
          className="btn-primary"
        >
          {linking ? t('meta.linking') : t('meta.linkAccount')}
        </button>
      </div>
    </div>
  );
}
```

### Naming Conventions (CRITICAL)

**From project-context.md:**
- Components: `PascalCase` → `MetaAccountPicker.tsx`
- Services: `camelCase` → `metaAdAccountsService.ts`
- Functions: `camelCase` → `getMetaAdAccounts`, `addMetaDataSource`
- Types: `PascalCase` → `MetaAdAccount`, `DataSource`

### Error Handling Pattern

**Use react-hot-toast for user feedback:**
```typescript
// Success
toast.success(t('meta.linkSuccess'));

// Errors
toast.error(t('meta.errors.duplicate')); // Duplicate account
toast.error(t('meta.errors.tokenNotFound')); // Token expired
toast.error(t('meta.errors.linkFailed')); // Generic error
```

### i18n Requirements

```json
// src/locales/fr/translation.json
{
  "meta": {
    "selectAccount": "Sélectionner un compte Meta Ads",
    "linkAccount": "Lier le compte",
    "linking": "Liaison en cours...",
    "linkSuccess": "Compte Meta Ads lié avec succès",
    "noAccounts": "Aucun compte publicitaire trouvé",
    "status": {
      "active": "Actif",
      "disabled": "Désactivé"
    },
    "errors": {
      "loadAccounts": "Erreur lors du chargement des comptes",
      "tokenNotFound": "Connexion Meta expirée. Veuillez vous reconnecter.",
      "duplicate": "Ce compte est déjà lié à ce client",
      "linkFailed": "Échec de la liaison du compte"
    }
  },
  "dataSources": {
    "title": "Sources de données",
    "connect": "Connecter une source",
    "remove": "Retirer",
    "confirmRemove": "Retirer la source de données ?",
    "confirmRemoveMessage": "Les rapports utilisant cette source ne fonctionneront plus."
  }
}
```

### Testing Requirements

**Unit Tests:**
- `metaAdAccountsService.test.ts` - Mock Functions callable
- `clientService.test.ts` - Test addMetaDataSource, removeDataSource
- `MetaAccountPicker.test.tsx` - Component rendering and interactions

**Integration Tests:**
- Full flow: Fetch accounts → Select → Link → Verify in Firestore
- Duplicate prevention test
- Unlink flow

**Manual Tests:**
1. Link Meta account to client (verify success toast)
2. Try linking same account again (verify error)
3. Link multiple sources (Google + Meta)
4. Unlink Meta account (verify confirmation modal)
5. Test with expired token (verify error handling)

### Dependencies & Prerequisites

**Depends On:**
- Story 14.1 (Multi-Source Data Model) - Complete
- Story 14.2 (OAuth Flow) - Complete (need Meta token)

**Blocks:**
- Story 14.5 (Source Selector UI) - Needs linked accounts to display
- Story 14.6 (Unified Metrics) - Needs accounts to fetch data

### Performance Considerations

**Meta API Call:**
- `/me/adaccounts` typically returns < 100 accounts
- Response time: 500ms - 2s
- Cache on frontend for 5 minutes to avoid repeated calls

**Firestore Updates:**
- Adding data source: Single document update
- No additional reads required
- Instant UI update via optimistic rendering

### Security Checklist

- [ ] Meta token never exposed to frontend
- [ ] Backend verifies user authentication before API calls
- [ ] Firestore rules allow user to update own clients only
- [ ] Duplicate prevention enforced on backend (not just frontend)

### References

- [Source: epic-14-meta-ads-integration.md#Story 14.3] - Story definition
- [Source: architecture.md#Data Architecture] - Multi-source data model
- [Meta Marketing API - Ad Accounts](https://developers.facebook.com/docs/marketing-api/reference/ad-account)

### Known Issues & Gotchas

**Meta Ad Account IDs:**
- Format: `act_1234567890`
- "act_" prefix is REQUIRED for API calls
- Must store full ID including prefix

**Account Status:**
- Meta returns: 1 (active), 2 (disabled), others (various states)
- Map to simple 'active' | 'disabled' for consistency

**Empty Accounts List:**
- User may have Meta login but no ad accounts
- Show helpful message: "No ad accounts found. Create one in Meta Business Manager."

**Duplicate Check:**
- Must check both `type` AND `accountId`
- Same account ID but different type is allowed (though unlikely)

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

**Created:**
- `functions/src/getMetaAdAccounts.ts`
- `src/services/metaAdAccountsService.ts`
- `src/components/clients/MetaAccountPicker.tsx`
- `src/components/common/ConfirmDialog.tsx`

**Modified:**
- `src/services/clientService.ts` (addMetaDataSource, removeDataSource)
- `src/pages/ClientDetailPage.tsx` (data sources section)
- `src/types/meta.ts` (MetaAdAccount type)
- `functions/src/index.ts` (export getMetaAdAccounts)
- `src/locales/fr/translation.json`
- `src/locales/en/translation.json`

**Tests:**
- `src/services/__tests__/metaAdAccountsService.test.ts`
- `src/services/__tests__/clientService.test.ts`
- `src/components/clients/__tests__/MetaAccountPicker.test.tsx`
