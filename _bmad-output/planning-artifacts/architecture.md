---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-01-09'
inputDocuments:
  - 'planning-artifacts/prd.md'
  - 'planning-artifacts/product-brief-flipika-2026-01-05.md'
  - 'analysis/brainstorming-session-2026-01-05.md'
  - 'docs/index.md'
  - 'docs/technology-stack.md'
  - 'docs/architecture-web.md'
  - 'docs/architecture-backend.md'
workflowType: 'architecture'
project_name: 'flipika'
user_name: 'Elou'
date: '2026-01-09'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

Le PRD définit **11 exigences fonctionnelles** organisées autour de 4 piliers :

1. **Authentication & Account Binding (FR-01 → FR-03)**
   - Google Sign-In comme unique méthode d'authentification
   - API Google Ads Customer Service pour lister les comptes accessibles
   - Binding explicite entre Customer ID et entité Client Flipika
   - *Implication architecturale :* OAuth flow complexe avec refresh token côté serveur

2. **Client & Preset Management (FR-04 → FR-06)**
   - CRUD complet pour entités Client (Nom, Email, Logo)
   - Configuration Preset par client (Template, Thème, Période)
   - Thèmes personnalisables (Couleurs hex + Logo)
   - *Implication architecturale :* Modèle de données relationnel Client ↔ Preset ↔ Template ↔ Theme

3. **Report Generation Engine (FR-07 → FR-09)**
   - Dashboard listant les rapports prêts
   - Pre-Flight Check obligatoire avant génération
   - Validation visuelle explicite des KPIs et métadonnées
   - *Implication architecturale :* State machine pour le flow de génération, UX modale bloquante

4. **Export & Delivery (FR-10 → FR-11)**
   - Génération PDF 100% client-side
   - Lien mailto pré-rempli (destinataire + objet + corps)
   - *Implication architecturale :* Pas de serveur mail, contrôle final utilisateur

**Non-Functional Requirements:**

| NFR | Contrainte | Implication Architecturale |
|-----|------------|---------------------------|
| NFR-01 | PDF < 5s | Optimisation jsPDF, chunking si nécessaire |
| NFR-02 | Pre-Flight < 2s | Optimistic UI, cache données récentes |
| NFR-03 | Token OAuth sécurisé | Refresh token uniquement côté Functions |
| NFR-04 | Scopes minimaux | Principle of least privilege |
| NFR-05 | Smart Persistence | Snapshot post-validation, Live pré-validation |
| NFR-06 | Error handling gracieux | Messages explicites, pas de crash/infinite loading |
| NFR-07 | Résilience binding | Détection incohérence si compte Ads renommé |

**Scale & Complexity:**

- Primary domain: **Full-stack SaaS (Web + Serverless Backend)**
- Complexity level: **Medium**
- Estimated architectural components: **~15 modules** (Auth, Clients, Presets, Templates, Themes, Reports, Pre-Flight, PDF, Mailto, Dashboard, Google Ads Service, Billing, Storage, Analytics, i18n)

### Technical Constraints & Dependencies

**Stack Imposée (Brownfield):**
- Frontend: React 19, Vite, TailwindCSS, Firebase SDK
- Backend: Node.js 22, Firebase Functions, Firebase Admin
- Database: Firestore (NoSQL)
- Auth: Firebase Auth (Google provider)
- Hosting: Firebase Hosting + CDN

**Intégrations Externes Critiques:**
- **Google Ads API** (v21) - Récupération données campagnes via refresh token
- **Stripe** (v20) - Gestion abonnements et webhooks
- **Google OAuth** - Scopes `adwords` + `email` + `profile`

**Contraintes Performance:**
- Latence Google Ads API variable (loading states obligatoires)
- PDF generation client-side (limitation taille/complexité)
- PWA offline : cache Firestore + APIs avec Workbox

### Cross-Cutting Concerns Identified

1. **Security** - OAuth token management, XSS protection (DOMPurify pour TipTap)
2. **Error Handling** - Gestion gracieuse des échecs API, messages utilisateur explicites
3. **Loading States** - UX cohérente pendant les appels API lents
4. **Persistence Strategy** - Live data pour Pre-Flight vs Snapshot pour historique
5. **Internationalization** - FR/EN via i18next (déjà en place)
6. **Analytics** - GA4 tracking, RGPD compliance (cookie consent)

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack SaaS (Web + Serverless Backend)** - Projet brownfield avec architecture établie.

### Existing Architecture Assessment

Ce projet n'utilise pas un starter template standard mais une architecture custom établie. Les décisions technologiques sont déjà prises et en production.

### Current Stack: Custom React + Firebase Architecture

**Rationale:** Architecture existante optimisée pour le cas d'usage SaaS B2B avec intégration Google Ads API.

**Architectural Decisions Already Made:**

**Language & Runtime:**
- TypeScript 5.9.3 (strict mode)
- Node.js 22 LTS pour backend
- ES Modules natifs

**Styling Solution:**
- TailwindCSS 3.4.19 utility-first
- Dark mode support natif
- Responsive design built-in

**Build Tooling:**
- Vite 7.1.7 avec code splitting optimisé
- Chunks: react-vendor, firebase-vendor, animation-vendor, icons-vendor
- PWA via vite-plugin-pwa + Workbox

**Testing Framework:**
- firebase-functions-test (backend)
- Testing frontend à renforcer (recommendation)

**Code Organization:**
- Component-based SPA pattern
- Service layer abstraction (`src/services/`)
- Context API pour state global (Theme, DemoMode)
- Hooks personnalisés (`src/hooks/`)

**Development Experience:**
- Vite HMR (< 100ms reload)
- Firebase emulators pour dev local
- ESLint 9.36.0 pour quality

**Note:** Étant un projet brownfield, les nouvelles features doivent s'intégrer dans cette architecture existante. Aucune initialisation de starter n'est requise.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Data Model: Client ↔ Customer ID binding (1:1)
2. OAuth Token: Server-side only, refresh token chiffré Firestore
3. Pre-Flight: State machine avec snapshot post-validation uniquement

**Important Decisions (Shape Architecture):**
1. Templates par client (non partagés)
2. PDF via html2pdf.js sans fallback
3. Historique rapports indéfini

**Deferred Decisions (Post-MVP):**
1. Multi-source (Meta Ads, etc.) - V2
2. Team sharing de presets - V2
3. IA Co-pilote pour analyse - V3

### Data Architecture

**Database:** Firestore (NoSQL) - existant

**Data Model:**

| Collection | Structure | Notes |
|------------|-----------|-------|
| `users/{userId}/clients/{clientId}` | name, email, logo, googleAdsCustomerId | Binding 1:1 strict |
| `users/{userId}/templates/{templateId}` | name, structure, widgets[], clientId | Templates par client |
| `users/{userId}/themes/{themeId}` | colors{}, logoUrl | Réutilisables |
| `users/{userId}/presets/{presetId}` | clientId, templateId, themeId, emailSettings | Configuration complète |
| `users/{userId}/reports/{reportId}` | clientId, presetId, status, snapshotData, pdfUrl | Historique indéfini |

**Rationale:** Structure user-scoped pour isolation données. Binding 1:1 Client/CustomerID garantit zéro erreur d'inversion.

### Authentication & Security

**OAuth Google Ads Architecture:**

| Composant | Responsabilité |
|-----------|----------------|
| Frontend | Initie OAuth flow, reçoit code authorization |
| Function `oauth.ts` | Échange code → tokens, stocke refresh token chiffré |
| Function `widgetMetrics.ts` | Proxy sécurisé vers Google Ads API |
| Firestore | Stockage refresh token (champ chiffré, accès Functions only) |

**Security Rules:**
- Refresh token JAMAIS exposé côté client
- Access token généré à la demande côté serveur
- Scopes minimaux: `adwords`, `email`, `profile`

**Rationale:** NFR-03 impose stockage sécurisé. Architecture proxy garantit que les credentials sensibles restent côté serveur.

### Pre-Flight Flow Architecture

**State Machine:**

```
SELECT_CLIENT → LOADING_DATA → PRE_FLIGHT_CHECK → GENERATING_PDF → SENT
                                      ↓
                                   ABORTED
```

| État | Description | Actions Disponibles |
|------|-------------|---------------------|
| SELECT_CLIENT | Dashboard, sélection client | Click client |
| LOADING_DATA | Fetch live Google Ads data | Cancel |
| PRE_FLIGHT_CHECK | Modale validation visuelle | Validate, Edit, Cancel |
| GENERATING_PDF | Génération en cours | - |
| SENT | PDF généré + mailto ouvert | New report |
| ABORTED | Annulation utilisateur | Retry |

**UX Decisions:**
- Modale pop-up standard (overlay sur page)
- Lecture seule dans Pre-Flight
- Lien vers page d'édition depuis Pre-Flight
- Timeout 30s pour fetch données

**Persistence Strategy:**
- Pre-Flight: Données LIVE (jamais cachées)
- Post-validation: Snapshot créé et stocké
- Historique: Conservation indéfinie

### PDF Generation

**Technology:** html2pdf.js (HTML → Canvas → PDF)

| Aspect | Décision |
|--------|----------|
| Méthode unique | html2pdf.js |
| Fallback | Aucun - si échec, export down |
| Images | Pré-chargées avant génération |
| Graphiques | Recharts → Canvas via html2canvas |
| Chunking | Progress bar si > 10 pages |
| Limite | ~20 pages max recommandé |

**Performance Target:** < 5 secondes (NFR-01)

**Rationale:** html2pdf.js offre la meilleure fidélité visuelle pour templates riches. Pas de fallback = simplicité code + debugging facilité.

### Infrastructure & Deployment

**Décisions existantes (inchangées):**
- Hosting: Firebase Hosting + CDN
- Functions: Firebase Functions (Node.js 22)
- Storage: Firebase Storage (PDFs générés)
- CI/CD: Scripts npm (`deploy:dev`, `deploy:prod`)

### Decision Impact Analysis

**Implementation Sequence:**
1. Data Model (Firestore collections) - Fondation
2. OAuth Flow enhancement - Critique pour fetch données
3. Pre-Flight State Machine - Core UX
4. PDF Generation optimization - Delivery

**Cross-Component Dependencies:**
- Pre-Flight dépend de OAuth (fetch données)
- PDF Generation dépend de Pre-Flight (snapshot data)
- Reports dépend de Storage (PDF upload)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 12 zones où les agents AI pourraient diverger

### Naming Patterns

**Firestore Collections:**

| Pattern | Convention | Exemple |
|---------|------------|---------|
| Collections | camelCase pluriel | `clients`, `templates`, `reports` |
| Documents | Auto-generated ID ou slug | `abc123`, `client-greenburger` |
| Fields | camelCase | `googleAdsCustomerId`, `createdAt` |

**Code Naming:**

| Élément | Convention | Exemple |
|---------|------------|---------|
| Variables | camelCase | `clientData`, `isLoading` |
| Fonctions | camelCase verbe | `getClientById`, `updatePreset` |
| Composants | PascalCase | `PreFlightModal`, `ClientCard` |
| Fichiers composants | PascalCase.tsx | `PreFlightModal.tsx` |
| Hooks | use + PascalCase | `useClientData`, `usePreFlight` |
| Types/Interfaces | PascalCase + suffixe | `ClientType`, `PresetConfig` |
| Constants | SCREAMING_SNAKE | `MAX_REPORT_PAGES`, `API_TIMEOUT` |

**API Endpoints (Functions):**

| Pattern | Convention | Exemple |
|---------|------------|---------|
| HTTP Functions | camelCase | `getWidgetMetrics`, `handleOAuthCallback` |
| Route params | camelCase | `clientId`, `reportId` |

### Structure Patterns

**Project Organization (Existant - À Respecter):**

```
src/
├── components/        # Composants UI réutilisables
│   ├── common/        # Boutons, inputs, modales génériques
│   ├── dashboard/     # Composants spécifiques dashboard
│   ├── reports/       # Composants génération rapports
│   └── preflight/     # Composants Pre-Flight Check
├── pages/             # Pages/Routes (1 fichier = 1 route)
├── services/          # Abstraction Firebase/API
│   ├── clientService.ts
│   ├── presetService.ts
│   └── googleAdsService.ts
├── hooks/             # Custom hooks
├── contexts/          # React Context providers
├── types/             # TypeScript definitions
├── utils/             # Helpers purs (pas d'effet de bord)
└── locales/           # Traductions i18n
```

**Règles de Placement:**
- Composant utilisé 1x → Dans le dossier de la page
- Composant utilisé 2x+ → Dans `/components/`
- Logique métier → Dans `/services/`
- State global → Dans `/contexts/`
- Pas de fichier > 300 lignes (split si nécessaire)

### Format Patterns

**API Response Format (Firebase Functions):**

```typescript
// SUCCESS
{
  success: true,
  data: { /* payload */ }
}

// ERROR
{
  success: false,
  error: "Message d'erreur lisible"
}
```

**Firestore Listeners:**
- Données directes (pas de wrapper)
- Gestion erreur via `onError` callback

**Date Format:**

| Contexte | Format |
|----------|--------|
| Firestore | `Timestamp` (Firebase native) |
| API JSON | ISO 8601 string (`2026-01-09T14:30:00Z`) |
| UI Display | Formaté via i18n (`9 janvier 2026`) |

**JSON Fields:**
- camelCase systématique
- Pas de valeurs `undefined` (utiliser `null`)
- Booléens : `true/false` (jamais `1/0`)

### Communication Patterns

**State Management:**

| Scope | Solution | Exemple |
|-------|----------|---------|
| Local (1 composant) | `useState` | Form inputs |
| Shared (feature) | `useReducer` + Context | Pre-Flight flow |
| Global (app) | Context API existant | Theme, Auth |

**Loading States:**

```typescript
// Booléen simple
const [isLoading, setIsLoading] = useState(false);

// États multiples
type Status = 'idle' | 'loading' | 'success' | 'error';
const [status, setStatus] = useState<Status>('idle');
```

**Naming Loading States:**
- `isLoading` → Opération en cours
- `isFetching` → Fetch données
- `isSubmitting` → Soumission formulaire
- `isGenerating` → Génération PDF

### Process Patterns

**Error Handling:**

```typescript
// TOUTES les erreurs utilisateur via react-hot-toast
import toast from 'react-hot-toast';

// Erreur API
toast.error("Impossible de charger les données Google Ads");

// Erreur validation
toast.error("Veuillez sélectionner un client");

// Succès
toast.success("Rapport généré avec succès");
```

**Règles Error Handling:**
- `toast.error()` pour TOUTES erreurs visibles utilisateur
- `console.error()` pour debug uniquement
- Jamais de `alert()` ou modal d'erreur
- Messages en français (via i18n)

**Async Operations Pattern:**

```typescript
const handleAction = async () => {
  setIsLoading(true);
  try {
    const result = await someService.doSomething();
    // Handle success
  } catch (error) {
    toast.error(getErrorMessage(error));
  } finally {
    setIsLoading(false);
  }
};
```

**Validation Pattern:**
- Validation côté client AVANT soumission
- Validation côté serveur (Functions) pour sécurité
- Messages d'erreur via i18n

### Enforcement Guidelines

**Tous les Agents AI DOIVENT:**
1. Suivre les conventions de nommage camelCase/PascalCase
2. Placer les composants selon les règles de structure
3. Utiliser `react-hot-toast` pour toute erreur utilisateur
4. Wrapper les responses Functions avec `{ success, data?, error? }`
5. Utiliser `isLoading` ou `status` pour les loading states
6. Écrire les messages utilisateur en français

**Anti-Patterns (À Éviter):**

```typescript
// ❌ MAUVAIS - snake_case
const client_id = "123";

// ✅ BON - camelCase
const clientId = "123";

// ❌ MAUVAIS - alert pour erreur
alert("Erreur!");

// ✅ BON - toast
toast.error("Une erreur est survenue");

// ❌ MAUVAIS - console.log pour user
console.log("Opération réussie");

// ✅ BON - toast pour user
toast.success("Opération réussie");
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
flipika/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── firebase.json
├── firestore.rules
├── storage.rules
├── .env.local                    # Variables locales (non versionnées)
├── .env.example                  # Template variables
├── .gitignore
│
├── src/
│   ├── main.tsx                  # Entry point React
│   ├── App.tsx                   # Root component + Routes
│   ├── App.css
│   ├── index.css                 # Tailwind base
│   ├── i18n.ts                   # Config i18next
│   │
│   ├── components/
│   │   ├── common/               # UI réutilisables
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── Card.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── ClientList.tsx
│   │   │   └── ReportQueue.tsx
│   │   ├── clients/              # [MVP] Gestion clients
│   │   │   ├── ClientCard.tsx
│   │   │   ├── ClientForm.tsx
│   │   │   └── GoogleAdsAccountPicker.tsx
│   │   ├── presets/              # [MVP] Gestion presets
│   │   │   ├── PresetEditor.tsx
│   │   │   ├── TemplateSelector.tsx
│   │   │   └── ThemePicker.tsx
│   │   ├── preflight/            # [MVP] Pre-Flight Check
│   │   │   ├── PreFlightModal.tsx
│   │   │   ├── PreFlightKPIDisplay.tsx
│   │   │   ├── PreFlightActions.tsx
│   │   │   └── PreFlightValidation.tsx
│   │   ├── reports/
│   │   │   ├── ReportEditor.tsx
│   │   │   ├── ReportCanvas.tsx
│   │   │   ├── WidgetSelector.tsx
│   │   │   └── PDFPreview.tsx
│   │   └── themes/
│   │       ├── ThemeEditor.tsx
│   │       └── ColorPicker.tsx
│   │
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── ClientsPage.tsx       # [MVP] Liste/CRUD clients
│   │   ├── ClientDetailPage.tsx  # [MVP] Détail + Preset config
│   │   ├── ReportEditorPage.tsx
│   │   ├── TemplatesPage.tsx
│   │   ├── ThemesPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── AuthCallbackPage.tsx
│   │
│   ├── services/
│   │   ├── authService.ts        # Firebase Auth wrapper
│   │   ├── clientService.ts      # [MVP] CRUD clients Firestore
│   │   ├── presetService.ts      # [MVP] CRUD presets
│   │   ├── templateService.ts
│   │   ├── themeService.ts
│   │   ├── reportService.ts
│   │   ├── googleAdsService.ts   # [MVP] Proxy vers Functions
│   │   └── pdfService.ts         # [MVP] Génération PDF
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useClients.ts         # [MVP] Hook clients
│   │   ├── usePresets.ts         # [MVP] Hook presets
│   │   ├── usePreFlight.ts       # [MVP] State machine Pre-Flight
│   │   ├── useGoogleAdsData.ts   # [MVP] Fetch données Ads
│   │   └── usePdfGeneration.ts   # [MVP] Hook génération PDF
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── DemoModeContext.tsx
│   │   └── PreFlightContext.tsx  # [MVP] State Pre-Flight flow
│   │
│   ├── types/
│   │   ├── client.ts             # [MVP] ClientType, CreateClientInput
│   │   ├── preset.ts             # [MVP] PresetConfig, PresetType
│   │   ├── template.ts
│   │   ├── theme.ts
│   │   ├── report.ts
│   │   ├── googleAds.ts          # [MVP] GoogleAdsMetrics, Campaign
│   │   └── preflight.ts          # [MVP] PreFlightState, PreFlightData
│   │
│   ├── utils/
│   │   ├── formatters.ts         # Date, number formatting
│   │   ├── validators.ts         # Input validation
│   │   ├── mailtoGenerator.ts    # [MVP] Génération lien mailto
│   │   └── errorHandler.ts       # Centralized error handling
│   │
│   ├── locales/
│   │   ├── fr/
│   │   │   └── translation.json
│   │   └── en/
│   │       └── translation.json
│   │
│   ├── config/
│   │   └── firebase.ts           # Firebase config
│   │
│   └── firebase/
│       └── index.ts              # Firebase init
│
├── functions/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts              # Export toutes les functions
│   │   ├── oauth.ts              # [MVP] OAuth Google Ads callback
│   │   ├── widgetMetrics.ts      # [MVP] Proxy Google Ads API
│   │   ├── stripe.ts             # Webhooks Stripe
│   │   ├── sitemap.ts
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── googleAdsClient.ts # [MVP] Client Google Ads API
│   │   └── types/
│   │       └── index.ts
│   └── lib/
│
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── assets/
│       └── images/
│
└── docs/                         # Documentation générée
    ├── index.md
    ├── architecture-web.md
    └── ...
```

### Architectural Boundaries

**API Boundaries:**

| Boundary | Pattern | Responsabilité |
|----------|---------|----------------|
| Frontend → Firestore | SDK Direct | CRUD données utilisateur |
| Frontend → Functions | HTTPS Callable | Opérations sécurisées (OAuth, Google Ads) |
| Functions → Google Ads | REST API | Fetch métriques (refresh token serveur) |
| Functions → Stripe | Webhooks | Sync abonnements |

**Component Boundaries:**

```
┌─────────────────────────────────────────────────────────────┐
│                         PAGES                                │
│  (Orchestration, routing, layout)                           │
├─────────────────────────────────────────────────────────────┤
│                       COMPONENTS                             │
│  (UI, user interactions, display logic)                     │
├─────────────────────────────────────────────────────────────┤
│                         HOOKS                                │
│  (State logic, side effects, data fetching)                 │
├─────────────────────────────────────────────────────────────┤
│                       SERVICES                               │
│  (API abstraction, Firebase operations)                     │
├─────────────────────────────────────────────────────────────┤
│                       CONTEXTS                               │
│  (Global state, cross-component communication)              │
└─────────────────────────────────────────────────────────────┘
```

**Data Boundaries:**

| Collection | Accès | Règle Firestore |
|------------|-------|-----------------|
| `users/{userId}/*` | Owner only | `request.auth.uid == userId` |
| `users/{userId}/clients/*` | Owner only | Hérite parent |
| `users/{userId}/reports/*` | Owner only | Hérite parent |

### Requirements to Structure Mapping

**FR-01→03 (Auth & Binding):**
- `src/services/authService.ts` - Firebase Auth
- `src/contexts/AuthContext.tsx` - State auth global
- `functions/src/oauth.ts` - OAuth callback Google Ads
- `src/components/clients/GoogleAdsAccountPicker.tsx` - UI sélection compte

**FR-04→06 (Client & Preset Management):**
- `src/services/clientService.ts` - CRUD Firestore clients
- `src/services/presetService.ts` - CRUD Firestore presets
- `src/pages/ClientsPage.tsx` - Liste clients
- `src/pages/ClientDetailPage.tsx` - Détail + config preset
- `src/components/presets/` - UI configuration preset

**FR-07→09 (Pre-Flight Check):**
- `src/hooks/usePreFlight.ts` - State machine
- `src/contexts/PreFlightContext.tsx` - State partagé
- `src/components/preflight/PreFlightModal.tsx` - Modale principale
- `src/services/googleAdsService.ts` - Fetch données live

**FR-10→11 (Export):**
- `src/services/pdfService.ts` - Génération html2pdf.js
- `src/utils/mailtoGenerator.ts` - Construction lien mailto
- `src/hooks/usePdfGeneration.ts` - Hook avec progress

### Integration Points

**Internal Communication:**

```
PreFlightModal
    │
    ├── usePreFlight() ──────► PreFlightContext
    │                              │
    ├── useGoogleAdsData() ───► googleAdsService ──► Functions/widgetMetrics
    │
    └── usePdfGeneration() ───► pdfService ──► html2pdf.js
```

**External Integrations:**

| Service | Point d'entrée | Authentification |
|---------|----------------|------------------|
| Google Ads API | `functions/widgetMetrics.ts` | OAuth refresh token |
| Stripe | `functions/stripe.ts` | Webhook signature |
| Firebase Auth | `src/services/authService.ts` | Google provider |

**Data Flow (Pre-Flight → PDF):**

```
1. User click client → Dashboard
2. Fetch live data → googleAdsService → Functions → Google Ads API
3. Display Pre-Flight → PreFlightModal (données live)
4. User validates → Create snapshot → reportService
5. Generate PDF → pdfService → html2pdf.js
6. Open mailto → mailtoGenerator
7. Save report → reportService (status: sent)
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
Toutes les technologies choisies fonctionnent ensemble sans conflit. L'écosystème Firebase (Auth, Firestore, Functions, Hosting) est cohérent. React 19 + Vite + TailwindCSS est un stack éprouvé.

**Pattern Consistency:**
Les patterns d'implémentation (naming, error handling, loading states) sont cohérents avec les conventions React/TypeScript modernes et appliqués uniformément.

**Structure Alignment:**
La structure projet respecte les boundaries définis (Pages → Components → Hooks → Services → Contexts) et permet une implémentation claire des features.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
- 11/11 FRs couverts architecturalement
- Chaque FR mappé à des fichiers/composants spécifiques
- Flow Pre-Flight → PDF → Mailto entièrement supporté

**Non-Functional Requirements Coverage:**
- 7/7 NFRs adressés par des décisions architecturales
- Performance PDF via html2pdf.js sans fallback
- Sécurité OAuth via server-side token management

### Implementation Readiness Validation ✅

**Decision Completeness:**
- Stack technologique entièrement spécifiée (brownfield)
- Patterns avec exemples de code concrets
- Anti-patterns documentés pour prévenir erreurs

**Structure Completeness:**
- Arborescence complète avec fichiers MVP marqués
- Integration points définis
- Data flow documenté

**Pattern Completeness:**
- Naming: ✅ camelCase/PascalCase/SCREAMING_SNAKE
- Errors: ✅ react-hot-toast unifié
- Loading: ✅ isLoading / status pattern
- API: ✅ { success, data?, error? } wrapper

### Gap Analysis Results

**Critical Gaps:** Aucun

**Important Gaps (Post-MVP):**
1. Tests frontend (Vitest + Testing Library)
2. Types partagés frontend/backend

**Nice-to-Have:**
- Storybook
- E2E Playwright
- API docs auto

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Medium)
- [x] Technical constraints identified (Brownfield)
- [x] Cross-cutting concerns mapped (Security, i18n, Error handling)

**✅ Architectural Decisions**
- [x] Critical decisions documented (Data model, OAuth, Pre-Flight, PDF)
- [x] Technology stack fully specified (React 19, Firebase, etc.)
- [x] Integration patterns defined (Firestore, Functions, Google Ads)
- [x] Performance considerations addressed (NFR-01, NFR-02)

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented (Error, Loading, Async)

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
1. Architecture brownfield cohérente avec l'existant
2. Core feature (Pre-Flight) entièrement architecturé
3. Sécurité OAuth robuste (server-side only)
4. Patterns clairs pour éviter conflits agents AI

**Areas for Future Enhancement:**
1. Testing infrastructure (post-MVP)
2. Observability/monitoring
3. Multi-source data (V2)

### Implementation Handoff

**AI Agent Guidelines:**
- Suivre toutes les décisions architecturales documentées
- Utiliser les patterns d'implémentation de manière cohérente
- Respecter la structure projet et les boundaries
- Référer à ce document pour toute question architecturale

**First Implementation Priority:**
1. Data Model (Collections Firestore: clients, presets, templates)
2. OAuth Enhancement (Google Ads scopes)
3. Pre-Flight State Machine (usePreFlight hook)
4. PDF Service (pdfService.ts)

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-09
**Document Location:** `_bmad-output/planning-artifacts/architecture.md`

### Final Architecture Deliverables

**📋 Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**
- 15+ architectural decisions made
- 12+ implementation patterns defined
- 6 architectural boundaries specified
- 11 FRs + 7 NFRs fully supported

**📚 AI Agent Implementation Guide**
- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**
- [x] All functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.

