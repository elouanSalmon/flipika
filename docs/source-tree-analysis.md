# Analyse de l'arborescence source - Flipika

**Généré le** : 2026-01-05
**Type de projet** : Multi-part (Frontend + Backend)

---

## 📂 Structure globale du projet

```
flipika/
├── src/                          # 🎨 Frontend React (Application Web)
├── functions/                    # ⚙️ Backend Firebase Functions
├── public/                       # 🌐 Assets publics (PWA icons, etc.)
├── dist/                         # 📦 Build frontend (généré)
├── docs/                         # 📚 Documentation projet (ce dossier)
├── .firebase/                    # 🔧 Config Firebase locale
├── _bmad/                        # 🤖 BMAD workflows/agents
├── _bmad-output/                 # 📄 Outputs BMAD planning
├── *.md                          # 📖 Documentation racine
├── package.json                  # 📋 Dépendances frontend
├── vite.config.ts                # ⚡ Configuration Vite
├── tailwind.config.js            # 🎨 Configuration TailwindCSS
├── firebase.json                 # 🔥 Configuration Firebase
└── firestore.rules               # 🔒 Règles de sécurité Firestore
```

---

## 🎨 Frontend (src/)

### Structure détaillée

```
src/
├── main.tsx                      # ⚡ Entry point application React
├── App.tsx                       # 🏠 Composant racine (probable)
│
├── components/                   # 🧩 Composants React
│   ├── app/                      # 📱 Composants spécifiques à l'app
│   ├── audit/                    # 🔍 Audit de compte Google Ads
│   │   ├── AuditCategory.tsx
│   │   ├── RecommendationCard.tsx
│   │   └── HealthScore.tsx
│   ├── billing/                  # 💳 Facturation & abonnements
│   │   ├── PricingInfoModal.tsx
│   │   └── CanceledSubscriptionNotice.tsx
│   ├── common/                   # 🔧 Composants réutilisables
│   │   ├── DateRangePicker.tsx
│   │   ├── ErrorState.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Spinner.tsx
│   │   └── LoadingState.tsx
│   ├── dashboard/                # 📊 Tableau de bord
│   │   ├── KPICard.tsx
│   │   ├── MetricsGrid.tsx
│   │   ├── AlertsPanel.tsx
│   │   ├── AccountsList.tsx
│   │   ├── EmptyDashboardState.tsx
│   │   ├── SpendingChart.tsx
│   │   ├── ConversionTrendChart.tsx
│   │   ├── BudgetDistributionChart.tsx
│   │   └── CampaignPerformanceChart.tsx
│   ├── onboarding/               # 🚀 Onboarding utilisateur
│   ├── reports/                  # 📄 Éditeur de rapports
│   │   ├── ReportEditor.tsx      # ✏️ Éditeur principal
│   │   ├── ReportCanvas.tsx      # 🎨 Canvas drag & drop
│   │   ├── ReportEditorHeader.tsx
│   │   ├── EditorToolbar.tsx
│   │   ├── SectionLibrary.tsx
│   │   ├── SectionItem.tsx
│   │   ├── DesignPanel.tsx
│   │   ├── AutoSaveIndicator.tsx
│   │   ├── PasswordPrompt.tsx    # 🔒 Protection rapports
│   │   ├── ReportSecurityModal.tsx
│   │   ├── WidgetItem.tsx
│   │   ├── ReportCard/
│   │   └── widgets/              # 📊 Widgets de données
│   │       ├── PerformanceOverviewWidget.tsx
│   │       ├── KeyMetricsWidget.tsx
│   │       ├── CampaignChartWidget.tsx
│   │       ├── AdCreativeWidget.tsx
│   │       ├── AdCreativeCard.tsx
│   │       └── AdCreativeCardDemo.tsx
│   ├── schedules/                # ⏰ Planification rapports
│   ├── settings/                 # ⚙️ Paramètres utilisateur
│   ├── templates/                # 📋 Templates de rapports
│   │   └── WidgetSelector.tsx
│   ├── theme/                    # 🎨 Thème application
│   ├── themes/                   # 🎨 Thèmes de rapports
│   │   ├── ThemeSelector.tsx
│   │   └── ThemePreview.tsx
│   ├── widgets/                  # 🧩 Widgets génériques
│   ├── CookieConsent.tsx         # 🍪 RGPD cookie consent
│   ├── EmailCapture.tsx          # ✉️ Capture email landing
│   ├── ErrorCard.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── SimpleHeader.tsx
│   ├── Hero.tsx
│   ├── HubSpotChat.tsx           # 💬 Widget HubSpot
│   ├── InstallPWA.tsx            # 📱 Prompt installation PWA
│   ├── LanguageSwitcher.tsx      # 🌍 Sélecteur langue
│   ├── LanguageRedirect.tsx
│   ├── Problem.tsx
│   ├── SafeHTML.tsx              # 🛡️ Sanitization HTML
│   ├── SubscriptionGuard.tsx     # 🔒 Protection features payantes
│   ├── Testimonials.tsx
│   └── ThemeToggle.tsx           # 🌓 Dark/Light mode
│
├── pages/                        # 📄 Pages/Routes
│   ├── Landing.tsx               # 🏠 Landing page
│   ├── LandingFull.tsx
│   ├── Login.tsx                 # 🔐 Page de connexion
│   ├── AuditPage.tsx             # 🔍 Page d'audit
│   ├── Copilot.tsx               # 🤖 Page Copilot (probablement dashboard)
│   ├── PublicReportView.tsx      # 👁️ Vue publique rapport
│   ├── LegalNotices.tsx          # ⚖️ Mentions légales
│   ├── ReportsList.tsx           # (modifié, dans git status)
│   ├── ScheduledReports.tsx      # (modifié, dans git status)
│   └── Templates.tsx             # (modifié, dans git status)
│
├── contexts/                     # 🔄 React Context API (State management)
│   ├── ThemeContext.tsx          # 🎨 Thème global app
│   ├── ThemeContextDef.ts
│   ├── DemoModeContext.tsx       # 🎭 Mode démo
│   └── FeatureFlagsContext.tsx   # 🚩 Feature flags
│
├── hooks/                        # 🪝 Custom React Hooks
│   ├── useTheme.ts
│   ├── usePageTracking.ts        # 📊 GA4 page tracking
│   ├── useUserTracking.ts        # 👤 GA4 user tracking
│   ├── useGoogleAdsToken.ts      # 🔑 Gestion tokens OAuth
│   └── useHubSpotChat.ts         # 💬 HubSpot integration
│
├── services/                     # 🛠️ Couche de services / Business logic
│   ├── dataService.ts            # 📊 Service données général
│   ├── liveDataService.ts        # 🔴 Données temps réel
│   ├── demoDataService.ts        # 🎭 Données de démo
│   ├── demoDataGenerator.ts      # 🎲 Génération données fake
│   ├── mockData.ts               # 🎭 Données mock
│   ├── reportGenerator.ts        # 📄 Génération de rapports
│   ├── sectionGenerator.ts       # 📝 Génération sections rapport
│   ├── sectionTemplates.ts       # 📋 Templates sections
│   ├── scheduledReportService.ts # ⏰ Service rapports programmés
│   ├── themeService.ts           # 🎨 Service thèmes
│   ├── widgetService.ts          # 🧩 Service widgets
│   ├── testGoogleAds.ts          # 🧪 Test Google Ads API
│   └── connectors/               # 🔌 Connecteurs externes
│
├── firebase/                     # 🔥 Configuration Firebase
│   ├── config.ts                 # ⚙️ Firebase init
│   └── emailService.ts           # ✉️ Service email
│
├── types/                        # 📐 Types TypeScript
│   ├── api.ts                    # 🌐 Types API
│   ├── business.ts               # 💼 Types métier
│   ├── demo.ts                   # 🎭 Types démo
│   ├── reports.ts                # 📄 Types rapports
│   ├── reportThemes.ts           # 🎨 Types thèmes rapports
│   ├── scheduledReportTypes.ts   # ⏰ Types rapports programmés
│   ├── subscriptionTypes.ts      # 💳 Types abonnements
│   └── userProfile.ts            # 👤 Types profil utilisateur
│
├── utils/                        # 🔧 Utilitaires
│   ├── analyticsEvents.ts        # 📊 Événements GA4
│   ├── ga4.ts                    # 📊 GA4 helper
│   └── passwordUtils.ts          # 🔒 Hashage mots de passe
│
├── config/                       # ⚙️ Configuration
│   └── consent-config.ts         # 🍪 Config cookie consent
│
├── data/                         # 📊 Données statiques
│   └── defaultThemes.ts          # 🎨 Thèmes par défaut
│
├── locales/                      # 🌍 Internationalisation (i18n)
│   ├── en/                       # 🇬🇧 Anglais
│   └── fr/                       # 🇫🇷 Français
│       ├── reports.json          # (modifié)
│       ├── schedules.json        # (modifié)
│       └── templates.json        # (modifié)
│
├── layouts/                      # 📐 Layouts de pages
└── assets/                       # 🖼️ Assets (images, fonts, etc.)
```

---

## ⚙️ Backend (functions/)

### Structure détaillée

```
functions/
├── src/
│   ├── index.ts                  # ⚡ Entry point - Exports toutes les functions
│   ├── oauth.ts                  # 🔐 OAuth Google Ads (callback handler)
│   ├── stripe.ts                 # 💳 Webhooks Stripe + gestion abonnements
│   ├── widgetMetrics.ts          # 📊 Récupération métriques Google Ads
│   ├── adCreatives.ts            # 🎨 Récupération créatives publicitaires
│   ├── generateScheduledReports.ts # ⏰ Génération rapports programmés (cron)
│   ├── serveSitemap.ts           # 🗺️ Servir sitemap.xml
│   ├── generateSitemap.ts        # 🗺️ Générer sitemap dynamique
│   ├── backupFirestore.ts        # 💾 Backup Firestore vers Cloud Storage
│   ├── migrateReports.ts         # 🔄 Migration données (one-time)
│   ├── domainRedirect.ts         # 🔀 Redirections multi-domaines
│   ├── rateLimiter.ts            # 🛡️ Rate limiting
│   └── validators.ts             # ✅ Validation inputs
│
├── lib/                          # 📦 Build TypeScript compilé (généré)
├── node_modules/                 # 📚 Dépendances
├── package.json                  # 📋 Dépendances backend
└── tsconfig.json                 # 📐 Config TypeScript backend
```

---

## 🔗 Points d'intégration Frontend ↔ Backend

### 1. OAuth Flow
```
Frontend (useGoogleAdsToken)
  → Redirect vers Google OAuth
  → Backend (/oauth/callback)
  → Stockage tokens Firestore
  → Frontend récupère tokens via Firestore listener
```

### 2. Métriques Widgets
```
Frontend (widgetService)
  → Appel HTTP function (widgetMetrics)
  → Backend → Google Ads API
  → Retour données métriques
  → Frontend affiche dans widgets
```

### 3. Rapports programmés
```
Cron job quotidien
  → Backend (generateScheduledReports)
  → Lecture Firestore (scheduled reports)
  → Google Ads API (données)
  → Génération PDF
  → Email au client
```

### 4. Gestion abonnements
```
Frontend (Stripe Checkout)
  → Stripe hosted page
  → Webhook → Backend (stripe.ts)
  → Mise à jour Firestore subscription
  → Frontend lit via Firestore listener
  → SubscriptionGuard active/désactive features
```

---

## 📊 Patterns architecturaux observés

### Frontend
- **Component-based** : Architecture React modulaire
- **Feature folders** : Organisation par domaine (reports, dashboard, billing, etc.)
- **Shared components** : `common/` pour composants réutilisables
- **Context API** : State management léger (ThemeContext, DemoModeContext, FeatureFlagsContext)
- **Custom Hooks** : Logique réutilisable (useGoogleAdsToken, usePageTracking, etc.)
- **Service Layer** : Séparation business logic dans `services/`
- **Type Safety** : Types TypeScript centralisés dans `types/`

### Backend
- **Single entry point** : `index.ts` exporte toutes les functions
- **Function per feature** : Une function = une responsabilité
- **Middleware** : Rate limiting, validation
- **Cron jobs** : Scheduled functions pour tâches récurrentes

### Communication
- **Real-time** : Firestore listeners pour données temps réel
- **HTTP Functions** : Endpoints pour opérations complexes
- **Event-driven** : Firestore triggers pour réactions automatiques

---

## 🎯 Dossiers critiques par fonctionnalité

| Fonctionnalité | Frontend | Backend |
|----------------|----------|---------|
| **Rapports** | `src/components/reports/`, `src/pages/`, `src/services/reportGenerator.ts` | `functions/src/generateScheduledReports.ts` |
| **Google Ads OAuth** | `src/hooks/useGoogleAdsToken.ts`, `src/services/connectors/` | `functions/src/oauth.ts` |
| **Widgets/Métriques** | `src/components/reports/widgets/`, `src/services/widgetService.ts` | `functions/src/widgetMetrics.ts`, `functions/src/adCreatives.ts` |
| **Abonnements** | `src/components/billing/`, `src/components/SubscriptionGuard.tsx` | `functions/src/stripe.ts` |
| **Dashboard** | `src/components/dashboard/`, `src/pages/Copilot.tsx` | `functions/src/widgetMetrics.ts` |
| **Thèmes** | `src/components/themes/`, `src/services/themeService.ts`, `src/data/defaultThemes.ts` | - |
| **i18n** | `src/locales/`, `src/components/LanguageSwitcher.tsx` | - |
| **SEO** | - | `functions/src/serveSitemap.ts`, `functions/src/generateSitemap.ts` |
| **Backup** | - | `functions/src/backupFirestore.ts` |

---

## 📁 Fichiers de configuration

| Fichier | Usage |
|---------|-------|
| `package.json` | Dépendances frontend, scripts npm |
| `functions/package.json` | Dépendances backend |
| `vite.config.ts` | Build Vite, PWA, optimisations |
| `tailwind.config.js` | Thème TailwindCSS, dark mode |
| `tsconfig.json` | Config TypeScript projet |
| `firebase.json` | Hosting, Functions, rewrites, headers sécurité |
| `firestore.rules` | Règles de sécurité base de données |
| `firestore.indexes.json` | Index Firestore pour requêtes |
| `.firebaserc` | Projets Firebase (dev/prod) |

---

## 🚀 Points d'entrée

### Frontend
- **Entry Point** : `src/main.tsx`
- **Router** : React Router (probablement dans App.tsx)
- **Routes principales** :
  - `/` - Landing page
  - `/login` - Authentification
  - `/app/dashboard` - Tableau de bord
  - `/app/reports` - Liste rapports
  - `/app/templates` - Templates
  - `/app/schedules` - Rapports programmés
  - `/app/settings` - Paramètres
  - `/public-report/:id` - Vue publique rapport

### Backend
- **Entry Point** : `functions/src/index.ts`
- **Exported Functions** : ~10+ HTTP functions + triggers
