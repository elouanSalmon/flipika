# Story 14.1: Architecture Multi-Source (Data Model)

Status: ready-for-dev

## Story

As a **System Architect**,
I want to **refactor the data model to support multiple ad platforms per client**,
so that **the system can scale to Meta, LinkedIn, TikTok in the future**.

## Acceptance Criteria

### AC1: Migration Script for Existing Clients

**Given** I have an existing Flipika installation with Google Ads clients
**When** I run the migration script
**Then** Each existing client's `googleAdsCustomerId` is converted to a `dataSources` array entry
**And** The structure becomes: `{ type: "google_ads", accountId: "...", status: "active", connectedAt: timestamp }`
**And** All existing reports and presets continue to function without breaking

### AC2: New Client Creation with Multi-Source Support

**Given** I am creating a new client
**When** I save the client
**Then** The `dataSources` field is initialized as an empty array `[]`
**And** The client is ready to accept Google Ads OR Meta Ads bindings

### AC3: Backwards Compatibility

**Given** I have old code reading `client.googleAdsCustomerId`
**When** I access this field
**Then** The system provides backwards compatibility by returning the first Google Ads data source
**And** A deprecation warning is logged for future code cleanup

## Tasks / Subtasks

### Task 1: Update TypeScript Types (AC: #2)

- [ ] Create new `DataSource` type in `src/types/client.ts`
  - [ ] Add fields: `type`, `accountId`, `accountName`, `currency`, `status`, `connectedAt`
  - [ ] Add union type for `type`: `'google_ads' | 'meta_ads'`
- [ ] Update `ClientType` interface to include `dataSources: DataSource[]`
- [ ] Add backwards compatibility field: `googleAdsCustomerId?: string` (deprecated)
- [ ] Export new types for use across codebase

### Task 2: Update Firestore Service Layer (AC: #2)

- [ ] Update `src/services/clientService.ts`
  - [ ] Modify `createClient` to initialize `dataSources: []`
  - [ ] Update `updateClient` to handle dataSources array
  - [ ] Add helper: `addDataSource(clientId, dataSource)`
  - [ ] Add helper: `removeDataSource(clientId, sourceType, accountId)`
  - [ ] Add helper: `getDataSourceByType(client, type)` for backwards compat

### Task 3: Update Firestore Security Rules (AC: #1, #2)

- [ ] Modify `firestore.rules`
  - [ ] Allow read/write on `dataSources` field for authenticated user
  - [ ] Add validation: `dataSources` must be an array
  - [ ] Add validation: Each data source must have required fields
  - [ ] Deploy rules: `firebase deploy --only firestore:rules`

### Task 4: Create Migration Script (AC: #1)

- [ ] Create `functions/src/migrations/migrate-to-multi-source.ts`
  - [ ] Query all clients in `users/{userId}/clients` collections
  - [ ] For each client with `googleAdsCustomerId`:
    - [ ] Create `dataSources` array with Google Ads entry
    - [ ] Preserve `googleAdsCustomerId` for backwards compat (1 version)
    - [ ] Set `connectedAt` to creation date or current timestamp
  - [ ] Log migration progress and errors
  - [ ] Create rollback function if needed
- [ ] Add script runner: `npm run migrate:multi-source`

### Task 5: Update Frontend Components (AC: #2, #3)

- [ ] Update `src/components/clients/ClientForm.tsx`
  - [ ] Remove direct `googleAdsCustomerId` input field
  - [ ] Add "Data Sources" section (read-only for now)
  - [ ] Display connected sources with icons (Google, Meta)
- [ ] Update `src/pages/ClientDetailPage.tsx`
  - [ ] Show list of connected data sources
  - [ ] Add "Connect New Source" button (placeholder for future stories)

### Task 6: Add Backwards Compatibility Layer (AC: #3)

- [ ] Create `src/utils/dataSourceHelpers.ts`
  - [ ] `getGoogleAdsAccountId(client)` - returns first Google Ads source
  - [ ] `hasGoogleAds(client)` - checks if Google Ads is connected
  - [ ] `hasMetaAds(client)` - checks if Meta Ads is connected
  - [ ] `getDataSourcesByType(client, type)` - filters by type
- [ ] Update existing code using `client.googleAdsCustomerId`
  - [ ] `src/services/reportService.ts`
  - [ ] `src/services/googleAdsService.ts`
  - [ ] Any other files accessing this field directly

### Task 7: Testing (AC: #1, #2, #3)

- [ ] Unit tests for `clientService.ts` new methods
- [ ] Unit tests for `dataSourceHelpers.ts`
- [ ] Integration test: Create client with empty dataSources
- [ ] Integration test: Migration script on test data
- [ ] Manual test: Create new client and verify structure
- [ ] Manual test: Load existing client and verify migration

### Task 8: Documentation (AC: #1, #2)

- [ ] Update `docs/architecture-backend.md` with new data model
- [ ] Add migration guide in `docs/migrations/multi-source-migration.md`
- [ ] Update JSDoc comments in `clientService.ts`
- [ ] Add deprecation notice for `googleAdsCustomerId` field

## Dev Notes

### Critical Context from Architecture

**Data Model Evolution** (Source: architecture.md#Data Architecture):
- Original: Client has `googleAdsCustomerId` (string, 1:1 binding)
- New: Client has `dataSources` (array, 1:N bindings)
- Firestore path: `users/{userId}/clients/{clientId}`

**Security Requirements** (Source: architecture.md#Authentication & Security):
- Refresh tokens stored server-side only (Functions)
- Client-side NEVER sees actual tokens
- Multi-source pattern must maintain same security model

**Backwards Compatibility Strategy**:
- Keep `googleAdsCustomerId` field for 1 release cycle (deprecated)
- Provide helper functions to access data sources by type
- Log deprecation warnings for future cleanup

### Project Structure Notes

**Files to Create:**
- `src/types/client.ts` - Update ClientType and add DataSource type
- `src/utils/dataSourceHelpers.ts` - New utility file
- `functions/src/migrations/migrate-to-multi-source.ts` - Migration script

**Files to Modify:**
- `src/services/clientService.ts` - Add dataSources CRUD methods
- `src/components/clients/ClientForm.tsx` - Update UI
- `src/pages/ClientDetailPage.tsx` - Display data sources
- `firestore.rules` - Add dataSources validation
- Any file using `client.googleAdsCustomerId` directly

**Project Structure Alignment:**
- Services layer → `src/services/` (Business logic)
- Types → `src/types/` (TypeScript definitions)
- Utils → `src/utils/` (Pure helper functions)
- Components → `src/components/clients/` (UI reusable)

### Technical Requirements

**TypeScript Types to Define:**
```typescript
// src/types/client.ts

export type DataSourceType = 'google_ads' | 'meta_ads';

export interface DataSource {
  type: DataSourceType;
  accountId: string;
  accountName?: string;
  currency?: string;
  status: 'active' | 'disconnected' | 'error';
  connectedAt: Timestamp;
  lastSyncAt?: Timestamp;
}

export interface ClientType {
  id: string;
  name: string;
  email: string;
  logo?: string;
  dataSources: DataSource[]; // NEW
  googleAdsCustomerId?: string; // DEPRECATED - remove in v2.1
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Firestore Security Rules Update:**
```javascript
// firestore.rules

match /users/{userId}/clients/{clientId} {
  allow read, write: if request.auth.uid == userId;

  // Validate dataSources structure
  allow write: if request.resource.data.dataSources is list
    && request.resource.data.dataSources.size() >= 0;

  // Each dataSource must have required fields
  allow write: if request.resource.data.dataSources.hasAll(['type', 'accountId', 'status', 'connectedAt']);
}
```

**Migration Script Pattern:**
```typescript
// functions/src/migrations/migrate-to-multi-source.ts

import { getFirestore, Timestamp } from 'firebase-admin/firestore';

export async function migrateToMultiSource() {
  const db = getFirestore();
  const usersSnapshot = await db.collection('users').get();

  let migratedCount = 0;
  let errorCount = 0;

  for (const userDoc of usersSnapshot.docs) {
    const clientsSnapshot = await userDoc.ref.collection('clients').get();

    for (const clientDoc of clientsSnapshot.docs) {
      const clientData = clientDoc.data();

      // Skip if already migrated
      if (clientData.dataSources && Array.isArray(clientData.dataSources)) {
        console.log(`Client ${clientDoc.id} already migrated`);
        continue;
      }

      const dataSources = [];

      // Migrate googleAdsCustomerId if exists
      if (clientData.googleAdsCustomerId) {
        dataSources.push({
          type: 'google_ads',
          accountId: clientData.googleAdsCustomerId,
          accountName: clientData.name || 'Unknown',
          status: 'active',
          connectedAt: clientData.createdAt || Timestamp.now(),
        });
      }

      try {
        await clientDoc.ref.update({
          dataSources,
          // Keep googleAdsCustomerId for backwards compat (1 version)
          updatedAt: Timestamp.now(),
        });
        migratedCount++;
      } catch (error) {
        console.error(`Migration failed for client ${clientDoc.id}:`, error);
        errorCount++;
      }
    }
  }

  console.log(`Migration complete: ${migratedCount} migrated, ${errorCount} errors`);
}
```

### Naming Conventions (CRITICAL)

**From project-context.md:**
- Variables/Functions: `camelCase` → `dataSources`, `getDataSourceByType`
- Types: `PascalCase` → `DataSource`, `ClientType`
- Files: `PascalCase.tsx` for components, `camelCase.ts` for services
- Firestore collections: `camelCase` pluriel → `clients`, `dataSources`

### Error Handling Pattern

**Use react-hot-toast for ALL user feedback:**
```typescript
import toast from 'react-hot-toast';

// Success
toast.success(t('clients.dataSource.connected'));

// Error
toast.error(t('clients.dataSource.error'));
```

**Never use:**
- `alert()` for errors
- `console.log()` for user feedback
- Throwing errors without catching

### i18n Requirements

**Add new translation keys:**
```json
// src/locales/fr/translation.json
{
  "clients": {
    "dataSource": {
      "title": "Sources de données",
      "connected": "Source connectée avec succès",
      "error": "Erreur lors de la connexion",
      "googleAds": "Google Ads",
      "metaAds": "Meta Ads",
      "status": {
        "active": "Actif",
        "disconnected": "Déconnecté",
        "error": "Erreur"
      }
    }
  }
}
```

### Testing Requirements

**Unit Tests (Required):**
- `clientService.test.ts` - Test `addDataSource`, `removeDataSource`, `getDataSourceByType`
- `dataSourceHelpers.test.ts` - Test all helper functions
- `migrate-to-multi-source.test.ts` - Test migration logic with mock data

**Integration Tests:**
- Create client with empty `dataSources` array
- Add Google Ads data source to client
- Remove data source from client
- Verify backwards compatibility with `googleAdsCustomerId`

**Manual Testing Checklist:**
1. Run migration script on staging
2. Verify existing clients have dataSources populated
3. Create new client and verify dataSources is empty array
4. Verify existing reports still work (backwards compat)
5. Check Firestore rules don't block writes

### Dependencies & Prerequisites

**Before Starting:**
- [x] Epic 14 planning document created
- [x] Architecture doc updated with multi-source decision
- [ ] Backup production Firestore data (staging test first)

**Blocks Future Stories:**
- Story 14.2 (OAuth Meta) - depends on dataSources structure
- Story 14.3 (Account Linking) - depends on addDataSource method
- All subsequent Epic 14 stories depend on this foundation

### Performance Considerations

**Firestore Reads:**
- No impact - `dataSources` is embedded in client document
- No additional reads required

**Migration Performance:**
- Run during low-traffic period
- Process in batches of 500 clients
- Estimated time: ~1 second per 100 clients

### Security Checklist

- [ ] `dataSources` field has proper Firestore rules validation
- [ ] No tokens or sensitive data stored in `dataSources`
- [ ] Migration script has proper error handling
- [ ] Rollback plan exists if migration fails

### References

- [Source: architecture.md#Data Architecture] - Original data model
- [Source: architecture.md#Authentication & Security] - Security patterns
- [Source: project-context.md#Data Model Rules] - Current conventions
- [Source: epic-14-meta-ads-integration.md#Architecture Technique] - Multi-source spec

### Known Issues & Gotchas

**Backwards Compatibility:**
- Code reading `client.googleAdsCustomerId` will work for 1 release
- Must update all references before v2.1
- Add deprecation warnings to help identify usage

**Migration Risks:**
- Large installations may timeout - use batching
- Clients without googleAdsCustomerId get empty array (expected)
- Reports may break if they directly access googleAdsCustomerId field

**Firestore Rules:**
- Must deploy rules BEFORE migration
- Test rules in staging first
- Ensure user permissions preserved

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

**Created:**
- `src/types/client.ts` (updated)
- `src/utils/dataSourceHelpers.ts` (new)
- `functions/src/migrations/migrate-to-multi-source.ts` (new)
- `docs/migrations/multi-source-migration.md` (new)

**Modified:**
- `src/services/clientService.ts`
- `src/components/clients/ClientForm.tsx`
- `src/pages/ClientDetailPage.tsx`
- `firestore.rules`
- `src/locales/fr/translation.json`
- `src/locales/en/translation.json`

**Tests:**
- `src/services/__tests__/clientService.test.ts`
- `src/utils/__tests__/dataSourceHelpers.test.ts`
- `functions/src/migrations/__tests__/migrate-to-multi-source.test.ts`
