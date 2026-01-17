# Epic 14: Intégration Meta Ads ("L'Expansion Multi-Source")

**Date:** 2026-01-17
**Auteur:** Elou
**Statut:** Draft - Planning

---

## Vue d'ensemble

Permettre à Flipika de récupérer et afficher les données publicitaires de Meta (Facebook & Instagram Ads) en complément de Google Ads, offrant ainsi une vision unifiée des performances cross-platform aux Media Buyers.

**FRs covered:** New FRs (Multi-Source Data, Meta OAuth, Account Binding Extension)
**NFRs impactés:** NFR-03 (Sécurité tokens), NFR-06 (Error handling), NFR-02 (Performance)

**Notes:**
- Évolution majeure vers une architecture **multi-source**
- Implique la refonte du modèle de binding (1 Client → N Sources)
- Nécessite un nouveau flux OAuth pour Meta Business
- Les rapports doivent pouvoir combiner ou isoler les données par source

---

## Contexte & Motivation

### Problème Utilisateur

Les Media Buyers gèrent souvent des campagnes sur **plusieurs plateformes** (Google Ads, Meta Ads, LinkedIn, TikTok). Aujourd'hui, Flipika ne supporte que Google Ads, forçant l'utilisateur à :
- Utiliser plusieurs outils pour le reporting
- Compiler manuellement les données cross-platform
- Perdre du temps sur des tâches répétitives

### Objectif

**Permettre aux utilisateurs de connecter leurs comptes Meta Ads et de générer des rapports unifiés ou spécifiques à la plateforme, tout en conservant l'expérience "Safety First" de Flipika.**

### Valeur Ajoutée

1. **Vision Holistique** : Comparer Google vs Meta sur un même rapport
2. **Gain de Temps** : Un seul outil pour toutes les sources
3. **Flexibilité** : Rapports mono-source OU multi-source selon le besoin
4. **Avantage Concurrentiel** : Se différencier des outils mono-plateforme

---

## Architecture Technique

### Modèle de Données

#### Before (Google Ads Only)
```
Client
  ├── googleAdsCustomerId (string)
  └── preset
      └── reportSettings
```

#### After (Multi-Source)
```
Client
  ├── dataSources (array)
  │   ├── [0] type: "google_ads", accountId: "123-456-7890", status: "active"
  │   └── [1] type: "meta_ads", accountId: "act_987654321", status: "active"
  └── preset
      └── reportSettings
          └── defaultSource: "all" | "google_ads" | "meta_ads"
```

### Meta API Requirements

| Aspect | Détail |
|--------|--------|
| **API** | Meta Marketing API v21.0+ |
| **OAuth** | Facebook Login for Business |
| **Scopes** | `ads_read`, `business_management` |
| **Token Storage** | Refresh token côté Functions (comme Google Ads) |
| **Rate Limits** | 200 calls/hour/user (Tier 1) |

### Services Backend

**Nouveaux Cloud Functions nécessaires :**

1. `metaOAuthCallback` - Gestion du flow OAuth Meta
2. `getMetaAdAccounts` - Liste des comptes publicitaires accessibles
3. `getMetaInsights` - Récupération des métriques (équivalent `widgetMetrics`)
4. `refreshMetaToken` - Renouvellement token (longue durée 60j)

### Services Frontend

**Nouveaux Services :**

1. `metaAdsService.ts` - Abstraction API Meta (proxy vers Functions)
2. `dataSourceService.ts` - Gestion multi-sources (CRUD bindings)
3. `unifiedMetricsService.ts` - Agrégation Google + Meta

---

## Stories

### Story 14.1: Architecture Multi-Source (Data Model)

**As a** System Architect,
**I want** to refactor the data model to support multiple ad platforms per client,
**So that** the system can scale to Meta, LinkedIn, TikTok in the future.

#### Acceptance Criteria

**Given** I have an existing Flipika installation with Google Ads clients
**When** I run the migration script
**Then** Each existing client's `googleAdsCustomerId` is converted to a `dataSources` array entry
**And** The structure becomes: `{ type: "google_ads", accountId: "...", status: "active", connectedAt: timestamp }`
**And** All existing reports and presets continue to function without breaking

**Given** I am creating a new client
**When** I save the client
**Then** The `dataSources` field is initialized as an empty array `[]`
**And** The client is ready to accept Google Ads OR Meta Ads bindings

#### Technical Notes

- Migration Firestore : script one-time dans `/functions/src/migrations/`
- Backwards compatibility : lectures doivent supporter ancien ET nouveau format pendant 1 version
- Validation : `dataSources` doit être un array (vide acceptable)

---

### Story 14.2: OAuth Flow Meta Ads (Backend)

**As a** User,
**I want** to connect my Meta Business account securely,
**So that** Flipika can access my Facebook & Instagram ad data.

#### Acceptance Criteria

**Given** I am on the "Connect Meta Ads" page
**When** I click "Connect with Meta"
**Then** I am redirected to Meta's consent screen
**And** The requested permissions are ONLY `ads_read` and `business_management`
**And** After approval, I am redirected to a callback URL with an authorization code

**Given** The callback receives the authorization code
**When** The Cloud Function `metaOAuthCallback` processes it
**Then** The code is exchanged for a short-lived access token and a long-lived token (60 days)
**And** The long-lived token is stored encrypted in Firestore under `users/{userId}/tokens/meta`
**And** The token is NEVER exposed to the frontend

**Given** The token is about to expire (< 7 days)
**When** The system checks token validity
**Then** A background function automatically refreshes the token
**And** The user is notified if the refresh fails (re-authentication required)

#### Technical Notes

- Endpoint: `https://www.facebook.com/v21.0/dialog/oauth`
- Token Exchange: `https://graph.facebook.com/v21.0/oauth/access_token`
- Security: Utiliser Firebase Secret Manager pour stocker App Secret
- Refresh: Cron job quotidien vérifiant l'expiration

---

### Story 14.3: Listing & Binding Meta Ad Accounts

**As a** User,
**I want** to see all my Meta Ad Accounts and link one (or several) to a Flipika Client,
**So that** the system knows which data to fetch for this client.

#### Acceptance Criteria

**Given** I have successfully authenticated with Meta
**When** I open the "Link Meta Account" interface for a Client
**Then** I see a list of all Ad Accounts I can access (fetched via `GET /me/adaccounts`)
**And** Each account displays: Name, ID, Currency, Status (Active/Disabled)

**Given** I select an Ad Account from the list
**When** I click "Link Account"
**Then** The binding is saved in the Client's `dataSources` array
**And** The structure is: `{ type: "meta_ads", accountId: "act_123", accountName: "Acme Campaign", currency: "EUR", status: "active", connectedAt: timestamp }`
**And** I see a success toast: "Meta Ads account linked successfully"

**Given** A client already has a Meta account linked
**When** I try to link the same account again
**Then** I see an error: "This account is already linked to this client"
**And** The duplicate is prevented

**Given** I want to unlink a Meta account
**When** I click "Remove" next to the Meta binding
**Then** A confirmation modal appears: "Remove Meta Ads link? Reports using this source will fail."
**And** Upon confirmation, the entry is removed from `dataSources`

#### UI Mockup Notes

- Similar interface to Google Ads account picker
- Show icon/logo to distinguish Google vs Meta visually
- Support multiple sources per client (Google + Meta together)

---

### Story 14.4: Meta Insights Service (Backend Proxy)

**As a** System,
**I want** to securely fetch Meta Ads insights on behalf of the user,
**So that** the frontend can display metrics without exposing tokens.

#### Acceptance Criteria

**Given** A client has a Meta Ads account linked
**When** The frontend calls `getMetaInsights({ clientId, dateRange, metrics })`
**Then** The Cloud Function retrieves the user's Meta token from Firestore
**And** Makes a request to Meta Marketing API: `GET /{ad_account_id}/insights`
**And** Returns the data in a normalized format matching Google Ads structure:

```typescript
{
  success: true,
  data: {
    metrics: {
      impressions: 12500,
      clicks: 340,
      spend: 456.78,
      conversions: 23,
      ctr: 2.72,
      cpc: 1.34,
      cpa: 19.86
    },
    campaigns: [ /* array of campaign-level data */ ]
  }
}
```

**Given** The Meta API returns an error (expired token, rate limit, etc.)
**When** The function processes the response
**Then** It returns a structured error:

```typescript
{
  success: false,
  error: "Meta API error: Token expired. Please reconnect your account.",
  code: "META_AUTH_EXPIRED"
}
```

**And** The frontend displays an appropriate toast message

#### Technical Notes

- Endpoint Meta: `https://graph.facebook.com/v21.0/{ad_account_id}/insights`
- Paramètres requis: `date_preset` ou `time_range`, `fields`, `level` (account/campaign/adset/ad)
- Normalisation: Mapper les noms de métriques Meta → Format unifié Flipika
  - `spend` → `cost`
  - `inline_link_clicks` → `clicks`
  - Etc.

---

### Story 14.5: Source Selector (Frontend UI)

**As a** User,
**I want** to choose which data source to use when creating or viewing a report,
**So that** I can analyze Google, Meta, or both together.

#### Acceptance Criteria

**Given** I am creating a new report for a Client with both Google and Meta connected
**When** I reach the "Data Source" step
**Then** I see three radio options:
  1. **All Sources** - Combine Google + Meta data
  2. **Google Ads Only** - Show only Google data
  3. **Meta Ads Only** - Show only Meta data

**Given** I select "Meta Ads Only"
**When** I proceed to the report builder
**Then** All widgets/slides fetch data exclusively from the Meta source
**And** The Pre-Flight Check displays Meta metrics

**Given** I select "All Sources"
**When** I generate the report
**Then** Metrics are aggregated (summed where applicable: impressions, clicks, cost)
**And** A breakdown section shows performance by source (Google vs Meta comparison)

**Given** A client has only Google Ads connected
**When** I create a report
**Then** The source selector is hidden (default to Google Ads)
**And** A banner suggests: "Connect Meta Ads to unlock multi-platform reporting"

#### UI/UX Notes

- Use icons: Google "G" logo + Meta infinity logo
- Color coding: Blue (Google), Blue gradient (Meta), Purple (All)
- Persist selection in report config for future edits

---

### Story 14.6: Unified Metrics Aggregation Logic

**As a** System,
**I want** to correctly aggregate metrics from multiple sources,
**So that** "All Sources" reports show accurate combined data.

#### Acceptance Criteria

**Given** I have a report set to "All Sources"
**When** I fetch metrics for a date range
**Then** The system makes parallel requests to Google Ads AND Meta Ads services
**And** Metrics are aggregated using these rules:

| Metric | Aggregation Method |
|--------|-------------------|
| Impressions | SUM |
| Clicks | SUM |
| Cost/Spend | SUM |
| Conversions | SUM |
| CTR | RECALCULATED (Total Clicks / Total Impressions) |
| CPC | RECALCULATED (Total Cost / Total Clicks) |
| CPA | RECALCULATED (Total Cost / Total Conversions) |

**Given** One source fails to load (e.g., Meta API timeout)
**When** The aggregation runs
**Then** The system shows partial data with a warning banner: "Meta Ads data unavailable. Showing Google Ads only."
**And** The report is still generated (degraded mode)

**Given** I want to see the breakdown
**When** I view the combined report
**Then** A summary table shows:

| Source | Impressions | Clicks | Cost | Conversions |
|--------|------------|--------|------|-------------|
| Google Ads | 10,000 | 250 | €350 | 15 |
| Meta Ads | 8,500 | 180 | €280 | 12 |
| **Total** | **18,500** | **430** | **€630** | **27** |

#### Technical Notes

- Service: `unifiedMetricsService.ts`
- Use `Promise.allSettled()` pour fetch parallèle avec resilience
- Cache: Stocker résultats partiels en cas d'échec d'une source

---

### Story 14.7: Adaptation des Slides Existantes (Multi-Source Support)

**As a** Developer,
**I want** all existing slides (Performance, Chart, Metrics, Creative) to support Meta data,
**So that** users can analyze Meta campaigns using familiar widgets.

#### Acceptance Criteria

**Given** I have a "Performance Overview" slide in a Meta Ads report
**When** The slide renders
**Then** It displays Meta-specific metrics (impressions, reach, frequency, etc.)
**And** The data is fetched from `metaAdsService` instead of `googleAdsService`

**Given** I have a "Campaign Chart" slide in an "All Sources" report
**When** The slide renders
**Then** It shows two series on the chart: Google (blue line) + Meta (purple line)
**And** The legend clearly identifies each source

**Given** I have a "Key Metrics" slide
**When** I configure it for Meta
**Then** I see Meta-specific metrics available: Reach, Frequency, CPM, Link Clicks, Post Engagement
**And** I can mix Google and Meta metrics on the same slide (if "All Sources")

**Given** I have an "Ad Creative" slide
**When** I use it with Meta data
**Then** It fetches creative previews using Meta's `GET /{ad_id}/previews` endpoint
**And** Displays the image/video thumbnail correctly

#### Technical Notes

- Abstraction layer: Créer `BaseMetricsProvider` interface
- Implementations: `GoogleAdsMetricsProvider`, `MetaAdsMetricsProvider`
- Strategy pattern pour sélectionner le provider selon `report.dataSource`

---

### Story 14.8: Migration & Rollout Strategy

**As a** Product Manager,
**I want** a safe migration path for existing users,
**So that** they can adopt Meta Ads incrementally without disruption.

#### Acceptance Criteria

**Given** I am an existing Flipika user
**When** The Meta Ads feature is released
**Then** I see a new banner on my Dashboard: "New: Connect Meta Ads and unify your reporting!"
**And** My existing Google Ads setup continues to work exactly as before
**And** I can ignore the Meta feature entirely if I want

**Given** I want to try Meta Ads
**When** I click "Connect Meta Ads" from the Client detail page
**Then** I am guided through the OAuth flow
**And** I can link Meta accounts to NEW or EXISTING clients

**Given** I have linked a Meta account
**When** I create a new report
**Then** The source selector appears automatically
**And** I can choose Google, Meta, or Both

**Given** I have old reports (pre-Meta feature)
**When** I view them
**Then** They display correctly using Google Ads data (backwards compatibility)
**And** I can optionally "upgrade" them to multi-source by editing the report config

#### Feature Flag

- `FEATURE_META_ADS_ENABLED` - Toggle in Firebase Remote Config
- Beta rollout: 10% users → 50% → 100% over 2 weeks
- Monitoring: Track connection errors, API failures, user adoption rate

---

### Story 14.9: Error Handling & User Feedback (Meta-Specific)

**As a** User,
**I want** clear error messages when Meta integration fails,
**So that** I know exactly what to do to fix it.

#### Acceptance Criteria

**Given** My Meta token has expired
**When** I try to generate a report
**Then** I see an error toast: "Meta Ads connection expired. Please reconnect your account."
**And** A "Reconnect" button redirects me to the OAuth flow

**Given** Meta API is down or slow
**When** The Pre-Flight Check tries to load data
**Then** I see a warning after 5 seconds: "Meta Ads is taking longer than usual. Continue waiting or skip?"
**And** I can choose to generate the report with Google data only

**Given** I don't have permissions on a specific Meta Ad Account
**When** I try to link it
**Then** I see an error: "Access denied. Make sure you have Admin role on this account."
**And** The account is not added to the client

**Given** Meta changes their API and breaks compatibility
**When** The system detects an unknown API response
**Then** It logs the error to Firebase Crashlytics
**And** Shows a generic error to the user: "Meta Ads integration is experiencing issues. Our team has been notified."

#### Technical Notes

- Error codes mapping: `META_AUTH_EXPIRED`, `META_RATE_LIMIT`, `META_PERMISSION_DENIED`, `META_UNKNOWN_ERROR`
- Monitoring: Sentry ou Firebase Crashlytics pour tracking
- Fallback: Toujours permettre la génération avec données partielles

---

### Story 14.10: Analytics & Performance Tracking

**As a** Product Manager,
**I want** to track how users adopt and use Meta Ads integration,
**So that** I can measure success and identify improvement areas.

#### Acceptance Criteria

**Given** A user connects their first Meta account
**When** The connection succeeds
**Then** A GA4 event is fired: `meta_account_connected` with properties:
  - `user_id`
  - `client_id`
  - `account_id` (hashed for privacy)
  - `timestamp`

**Given** A user generates a report with "All Sources"
**When** The PDF is created
**Then** A GA4 event is fired: `multi_source_report_generated` with properties:
  - `sources`: ["google_ads", "meta_ads"]
  - `total_metrics`: {...}

**Given** A Meta API call fails
**When** The error occurs
**Then** A GA4 event is fired: `meta_api_error` with properties:
  - `error_code`
  - `endpoint`
  - `retry_count`

#### Success Metrics (KPIs)

| Metric | Target (Month 3) |
|--------|------------------|
| % Users with Meta connected | 30% |
| Multi-source reports / Total reports | 15% |
| Meta API success rate | > 95% |
| Time to first Meta report | < 5 min (from OAuth start) |

---

## Dépendances & Séquencement

### Ordre d'Implémentation Recommandé

1. **Story 14.1** (Data Model) - BLOCKER pour tout le reste
2. **Story 14.2** (OAuth Backend) - Critique pour authentification
3. **Story 14.3** (Account Linking) - Dépend de 14.2
4. **Story 14.4** (Meta Insights Service) - Dépend de 14.2
5. **Story 14.5** (Source Selector UI) - Dépend de 14.1
6. **Story 14.6** (Unified Metrics) - Dépend de 14.4
7. **Story 14.7** (Slide Adaptation) - Dépend de 14.4 et 14.6
8. **Story 14.8** (Migration) - Final rollout
9. **Story 14.9** (Error Handling) - Parallèle avec 14.2-14.7
10. **Story 14.10** (Analytics) - Dernière étape

### Dépendances Externes

- Meta Developer App créée et approuvée (Meta Business Verification)
- Firestore indexes pour `dataSources` queries
- Firebase Secret Manager configuré (Meta App Secret)
- Rate limits Meta API connus et documentés

---

## Risques & Mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Meta API rate limits trop restrictifs | High | Medium | Implémenter cache agressif, batch requests |
| Complexité de la normalisation des métriques | Medium | High | Créer mapping table exhaustif, tests unitaires |
| OAuth flow Meta complexe (Business Manager) | Medium | Medium | Documentation claire, support utilisateur renforcé |
| Coût API Meta élevé | Low | Low | Estimer coût par user, optimiser appels |
| Régression sur Google Ads existant | High | Low | Tests de non-régression complets |

---

## Critères de Succès

### Technique
- ✅ 100% des rapports Google Ads existants fonctionnent sans modification
- ✅ Connexion Meta réussie en < 2 minutes (OAuth flow)
- ✅ API Meta response time < 3s (95th percentile)
- ✅ Zéro exposition de tokens Meta côté client (audit sécurité)

### Utilisateur
- ✅ 30% des utilisateurs actifs connectent Meta dans les 30 jours après release
- ✅ NPS score maintenu ou amélioré
- ✅ < 5% de support tickets liés à Meta integration
- ✅ Temps moyen de création d'un rapport multi-source < 5 min

### Business
- ✅ Différenciation compétitive (feature absente chez concurrents)
- ✅ Argument de vente pour acquisition de nouveaux clients
- ✅ Préparation pour futures intégrations (LinkedIn, TikTok)

---

## Post-MVP / Future Enhancements

### V2 Features
- **Scheduled Sync** : Refresh automatique des données Meta toutes les heures
- **Custom Dimensions** : Analyser par âge, genre, localisation (Meta specific)
- **A/B Testing Comparison** : Comparer performance de différentes créatives Meta
- **Budget Optimizer** : Recommandations de réallocation Google ↔ Meta

### V3 Features
- **LinkedIn Ads** integration (même pattern que Meta)
- **TikTok Ads** integration
- **Microsoft Advertising** integration
- **Unified Dashboard** : Vue consolidée toutes plateformes sur un seul écran

---

## Checklist de Définition of Done

- [ ] Toutes les 10 stories implémentées et testées
- [ ] Migration script testé sur données de production (staging)
- [ ] Documentation utilisateur mise à jour (guide "Connect Meta Ads")
- [ ] Documentation développeur (API Meta integration guide)
- [ ] Tests E2E couvrant le flow complet OAuth → Report generation
- [ ] Performance testing (charge 100 users simultanés)
- [ ] Security audit (tokens, OAuth, API exposure)
- [ ] Feature flag configuré et rollout plan validé
- [ ] Analytics events implémentés et testés
- [ ] Support team formé sur troubleshooting Meta issues

---

**Epic Owner:** Équipe Backend + Frontend (cross-functional)
**Estimation Globale:** 8-10 sprints (16-20 semaines) pour une équipe de 2-3 devs
**Priorité:** Medium-High (V2 Roadmap item)
