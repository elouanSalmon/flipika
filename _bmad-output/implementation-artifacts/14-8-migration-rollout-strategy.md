# Story 14.8: Migration & Rollout Strategy

Status: ready-for-dev

## Story

As a **Product Manager**,
I want **a safe migration path for existing users**,
so that **they can adopt Meta Ads incrementally without disruption**.

## Acceptance Criteria

### AC1: Backwards Compatibility for Existing Users
**Given** I am an existing Flipika user
**When** The Meta Ads feature is released
**Then** My existing Google Ads setup continues to work exactly as before
**And** I can ignore the Meta feature entirely if I want

### AC2: Incremental Adoption Path
**Given** I want to try Meta Ads
**When** I click "Connect Meta Ads" from the Client detail page
**Then** I am guided through the OAuth flow
**And** I can link Meta accounts to NEW or EXISTING clients

### AC3: Old Reports Remain Functional
**Given** I have old reports (pre-Meta feature)
**When** I view them
**Then** They display correctly using Google Ads data (backwards compatibility)
**And** I can optionally "upgrade" them to multi-source by editing the report config

## Tasks / Subtasks

### Task 1: Feature Flag Configuration (AC: #1, #2)

- [ ] Create Feature Flag in Firebase Remote Config
  - [ ] Key: `FEATURE_META_ADS_ENABLED`
  - [ ] Default: `false` (disabled by default)
  - [ ] Conditions: Percentage rollout (10% → 50% → 100%)
- [ ] Add feature flag check in frontend:
  - [ ] `src/utils/featureFlags.ts` - Helper to read flag
  - [ ] Hide Meta UI elements if flag is disabled
- [ ] Add feature flag check in backend:
  - [ ] Meta OAuth functions return error if disabled

### Task 2: Dashboard Banner for Feature Discovery (AC: #2)

- [ ] Create `MetaAdsAnnouncementBanner.tsx`
  - [ ] Show on Dashboard for users without Meta connected
  - [ ] Message: "New: Connect Meta Ads and unify your reporting!"
  - [ ] "Learn More" button → Opens info modal
  - [ ] "Connect Now" button → Redirects to Client page
  - [ ] Dismissible (saves preference in localStorage)
- [ ] Add to `Dashboard.tsx` component

### Task 3: Default Report Data Source (AC: #3)

- [ ] Update Report creation logic:
  - [ ] If client has only Google Ads → default to 'google_ads'
  - [ ] If client has only Meta Ads → default to 'meta_ads'
  - [ ] If client has both → default to 'all' (user can change)
- [ ] Existing reports without `dataSource` field → default to 'google_ads'
- [ ] Add migration script to populate missing `dataSource` fields

### Task 4: Upgrade Old Reports Modal (AC: #3)

- [ ] Create `UpgradeReportModal.tsx`
  - [ ] Detect reports created before Meta feature
  - [ ] Show suggestion: "This report uses Google Ads only. Add Meta Ads?"
  - [ ] "Upgrade to Multi-Source" button
  - [ ] "Keep as Google Ads Only" button
  - [ ] Don't show again option
- [ ] Trigger on report open if report is old format

### Task 5: Onboarding Flow Enhancement (AC: #2)

- [ ] Update onboarding checklist:
  - [ ] Add optional step: "Connect Meta Ads"
  - [ ] Show step only if feature flag enabled
  - [ ] Mark as "Optional" (not required for completion)
- [ ] Add tooltip explaining Meta Ads benefits

### Task 6: Beta User Selection (AC: #1, #2)

- [ ] Define beta user criteria:
  - [ ] Active users (logged in last 7 days)
  - [ ] Created at least 3 reports
  - [ ] Email verified
- [ ] Create beta user list in Firestore
- [ ] Feature flag targets beta users first (10%)

### Task 7: Rollout Plan Documentation (AC: #1, #2, #3)

- [ ] Create `docs/meta-ads-rollout-plan.md`
  - [ ] Phase 1: Beta (10% users, 1 week)
  - [ ] Phase 2: Gradual (50% users, 1 week)
  - [ ] Phase 3: Full (100% users)
  - [ ] Rollback plan if issues detected
- [ ] Define success metrics per phase:
  - [ ] Connection success rate > 90%
  - [ ] Error rate < 5%
  - [ ] No increase in support tickets

### Task 8: Monitoring & Observability (AC: #1, #2)

- [ ] Add Firebase Analytics events:
  - [ ] `meta_feature_banner_shown`
  - [ ] `meta_feature_banner_clicked`
  - [ ] `meta_oauth_started`
  - [ ] `meta_oauth_completed`
  - [ ] `meta_oauth_failed`
  - [ ] `report_upgraded_to_multi_source`
- [ ] Create monitoring dashboard in Firebase Console
- [ ] Set up alerts for error rate > 10%

### Task 9: User Communication (AC: #2)

- [ ] Create in-app announcement:
  - [ ] Modal on first login after feature release
  - [ ] Highlights Meta Ads integration
  - [ ] "Try it now" CTA
- [ ] Send email to beta users:
  - [ ] Subject: "You're invited to try Meta Ads integration"
  - [ ] Instructions and benefits
  - [ ] Feedback form link

### Task 10: Rollback Mechanism (AC: #1)

- [ ] Implement instant feature flag disable:
  - [ ] Remote Config update propagates in < 5 min
  - [ ] Frontend hides Meta UI immediately
  - [ ] Backend returns "Feature disabled" error
- [ ] Document rollback procedure:
  - [ ] Step 1: Disable feature flag
  - [ ] Step 2: Monitor existing reports (should work)
  - [ ] Step 3: Investigate and fix issue
  - [ ] Step 4: Re-enable when ready

### Task 11: Support Team Training (AC: #1, #2)

- [ ] Create support documentation:
  - [ ] "How to Connect Meta Ads" guide
  - [ ] Common troubleshooting steps
  - [ ] When to escalate to engineering
- [ ] Train support team before launch
- [ ] Create FAQ for users

### Task 12: Success Metrics Tracking (AC: #1, #2, #3)

- [ ] Track adoption metrics:
  - [ ] % users who connected Meta Ads
  - [ ] % reports using multi-source
  - [ ] Average time to first Meta report
- [ ] Track quality metrics:
  - [ ] OAuth success rate
  - [ ] API error rate
  - [ ] Report generation success rate
- [ ] Create weekly report for stakeholders

## Dev Notes

### Critical Context from Architecture

**Feature Flag Pattern** (Source: architecture.md#Feature Management):
- Use Firebase Remote Config for server-side flags
- Client polls every 12 hours for updates
- Allows instant disable without deployment

**Backwards Compatibility Requirements:**
- All existing functionality must work unchanged
- New fields optional (default values provided)
- Old reports read-only (no breaking changes)

### Project Structure Notes

**Files to Create:**
- `src/components/announcements/MetaAdsAnnouncementBanner.tsx`
- `src/components/reports/UpgradeReportModal.tsx`
- `src/utils/featureFlags.ts`
- `docs/meta-ads-rollout-plan.md`
- `docs/support/meta-ads-troubleshooting.md`

**Files to Modify:**
- `src/pages/Dashboard.tsx` (add banner)
- `src/services/reportService.ts` (default dataSource)
- Firebase Remote Config (add feature flag)

### Technical Requirements

**Feature Flag Helper:**
```typescript
// src/utils/featureFlags.ts

import { getRemoteConfig, getValue } from 'firebase/remote-config';

const remoteConfig = getRemoteConfig();
remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour

export async function isMetaAdsEnabled(): Promise<boolean> {
  await fetchAndActivate(remoteConfig);
  const value = getValue(remoteConfig, 'FEATURE_META_ADS_ENABLED');
  return value.asBoolean();
}

// Hook for components
export function useFeatureFlag(flagName: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    async function checkFlag() {
      const value = await isFeatureFlagEnabled(flagName);
      setEnabled(value);
    }
    checkFlag();
  }, [flagName]);

  return enabled;
}
```

**Default Report Data Source:**
```typescript
// src/services/reportService.ts (updated)

export async function createReport(clientId: string): Promise<Report> {
  const client = await getClient(clientId);

  // Determine default data source based on available sources
  let defaultSource: DataSource = 'google_ads';

  if (client.dataSources.length === 0) {
    throw new Error('Client has no data sources connected');
  }

  const hasGoogle = client.dataSources.some(s => s.type === 'google_ads');
  const hasMeta = client.dataSources.some(s => s.type === 'meta_ads');

  if (hasGoogle && hasMeta) {
    defaultSource = 'all'; // Default to combined if both available
  } else if (hasMeta && !hasGoogle) {
    defaultSource = 'meta_ads';
  }

  const report: Report = {
    id: generateId(),
    clientId,
    dataSource: defaultSource,
    createdAt: Timestamp.now(),
    // ... other fields
  };

  await saveReport(report);
  return report;
}
```

**Announcement Banner:**
```typescript
// src/components/announcements/MetaAdsAnnouncementBanner.tsx

export function MetaAdsAnnouncementBanner() {
  const [dismissed, setDismissed] = useState(
    localStorage.getItem('meta_banner_dismissed') === 'true'
  );
  const metaEnabled = useFeatureFlag('FEATURE_META_ADS_ENABLED');

  if (!metaEnabled || dismissed) return null;

  function handleDismiss() {
    localStorage.setItem('meta_banner_dismissed', 'true');
    setDismissed(true);
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">New: Meta Ads Integration</h3>
          <p className="text-sm">Unify your Google and Meta reporting in one place.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary-white" onClick={handleDismiss}>
            Later
          </button>
          <button className="btn-primary-white" onClick={() => navigate('/clients')}>
            Connect Now
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Rollout Phases

**Phase 1: Beta (Week 1)**
- 10% of active users
- Daily monitoring
- Support team on standby
- Quick rollback if error rate > 10%

**Phase 2: Gradual (Week 2)**
- 50% of users
- Monitor adoption metrics
- Collect user feedback
- Fix minor issues

**Phase 3: Full Rollout (Week 3+)**
- 100% of users
- Feature flag remains for instant disable if needed
- Monitor long-term adoption

### i18n Requirements

```json
// src/locales/fr/translation.json
{
  "announcements": {
    "metaAds": {
      "title": "Nouveau : Intégration Meta Ads",
      "message": "Unifiez vos rapports Google et Meta en un seul endroit.",
      "connectNow": "Connecter maintenant",
      "later": "Plus tard"
    }
  },
  "reports": {
    "upgrade": {
      "title": "Améliorer ce rapport",
      "message": "Ce rapport utilise uniquement Google Ads. Ajouter Meta Ads ?",
      "upgradeButton": "Passer au multi-source",
      "keepButton": "Garder Google Ads uniquement"
    }
  }
}
```

### Testing Requirements

**Feature Flag Tests:**
- Test feature enabled/disabled states
- Test UI hiding when disabled
- Test backend error when disabled

**Migration Tests:**
- Test old reports still load correctly
- Test default dataSource assignment
- Test upgrade modal appearance

**Rollout Simulation:**
- Test with 10%, 50%, 100% flags
- Verify user experience at each phase

### Dependencies & Prerequisites

**Depends On:**
- All previous stories (14.1-14.7) must be complete

**Blocks:**
- Production release (final story before launch)

### Success Metrics

**Week 1 (Beta):**
- ✅ 10% users have feature flag enabled
- ✅ OAuth success rate > 90%
- ✅ Error rate < 5%
- ✅ No critical bugs

**Week 2 (Gradual):**
- ✅ 50% users have feature flag enabled
- ✅ 15% of enabled users connect Meta
- ✅ 5% of reports use multi-source

**Week 3+ (Full):**
- ✅ 100% users have feature flag enabled
- ✅ 30% of active users connect Meta
- ✅ 10% of reports use multi-source

### References

- [Source: epic-14-meta-ads-integration.md#Story 14.8]
- [Firebase Remote Config Docs](https://firebase.google.com/docs/remote-config)

### Known Issues & Gotchas

**Remote Config Propagation:**
- Changes take up to 12 hours to reach all clients
- Use shorter interval (1 hour) during rollout
- Force fetch on app start for critical updates

**Rollback Impact:**
- Disabling feature hides UI but doesn't delete data
- Users who connected Meta Ads will see "Feature disabled" temporarily
- Re-enable seamlessly restores functionality

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### File List

**Created:**
- `src/components/announcements/MetaAdsAnnouncementBanner.tsx`
- `src/components/reports/UpgradeReportModal.tsx`
- `src/utils/featureFlags.ts`
- `docs/meta-ads-rollout-plan.md`
- `docs/support/meta-ads-troubleshooting.md`

**Modified:**
- `src/pages/Dashboard.tsx`
- `src/services/reportService.ts`
- Firebase Remote Config
- `src/locales/fr/translation.json`
- `src/locales/en/translation.json`
