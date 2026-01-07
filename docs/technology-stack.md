# Stack Technologique - Flipika

**Généré le** : 2026-01-05
**Type de projet** : SaaS multi-part (Frontend Web + Backend Serverless)
**Contexte métier** : Plateforme de génération automatique de rapports Google Ads pour media buyers

---

## Vue d'ensemble

Flipika est une application web moderne construite sur une architecture **multi-part** :
- **Frontend** : Application React PWA
- **Backend** : Firebase Functions (Serverless)

---

## 🎨 Frontend (Application Web)

### Framework & Langage
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| Framework UI | React | 19.1.1 | Framework moderne avec performance optimale |
| Build Tool | Vite | 7.1.7 | Build ultra-rapide, HMR performant |
| Langage | TypeScript | 5.9.3 | Type safety, meilleure DX |
| Styling | TailwindCSS | 3.4.19 | Utility-first CSS, dark mode natif |

### Bibliothèques UI & UX
| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| Icônes | Lucide React | 0.548.0 | Icônes modernes et consistantes |
| Éditeur de texte | TipTap | 3.13.0 | Éditeur WYSIWYG pour templates de rapports |
| Graphiques | Recharts | 3.5.1 | Visualisation de données Google Ads |
| Animations | Framer Motion | 12.23.24 | Animations fluides et micro-interactions |
| Drag & Drop | @dnd-kit | 6.3.1, 10.0.0 | Organisation des rapports/templates |
| Color Picker | react-colorful | 5.6.1 | Personnalisation des rapports |
| Toasts | react-hot-toast | 2.6.0 | Notifications utilisateur |

### Internationalisation
| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| i18n | i18next | 25.6.2 | Multi-langue (FR/EN) |
| React Integration | react-i18next | 16.3.3 | Hooks React pour i18n |
| Détection | i18next-browser-languagedetector | 8.2.0 | Auto-détection langue navigateur |

### PWA & Performance
| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| PWA | vite-plugin-pwa | 1.2.0 | Progressive Web App |
| Service Worker | Workbox | (via vite-pwa) | Caching stratégies (NetworkFirst/CacheFirst) |
| Offline Support | - | - | Cache Firestore, APIs, static assets |

### Routing & Navigation
| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| Router | React Router DOM | 7.10.1 | Client-side routing SPA |

### Backend Services & APIs
| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| BaaS | Firebase SDK | 12.4.0 | Auth, Firestore, Analytics, Functions |
| Paiements | Stripe | (client-side) | Gestion abonnements SaaS |
| Analytics | react-ga4 | 2.1.0 | Google Analytics 4 tracking |
| Cookie Consent | vanilla-cookieconsent | 3.1.0 | RGPD compliance |

### Génération de documents
| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| PDF | jsPDF | 3.0.4 | Génération PDF rapports |
| PDF Tables | jspdf-autotable | 5.0.2 | Tables dans PDFs |
| HTML to PDF | html2pdf.js | 0.12.1 | Conversion HTML vers PDF |
| Screenshots | html2canvas | 1.4.1 | Capture visuels pour rapports |

### Sécurité & Sanitization
| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| HTML Sanitization | DOMPurify | 3.3.1 | Protection XSS éditeur TipTap |

### Outils de développement
| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| Linter | ESLint | 9.36.0 | Quality code |
| Post-processing CSS | PostCSS | 8.5.6 | Autoprefixer |
| Autoprefixer | autoprefixer | 10.4.23 | Compatibilité navigateurs |

---

## ⚙️ Backend (Firebase Functions)

### Runtime & Langage
| Catégorie | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| Runtime | Node.js | 22 | LTS moderne, performance |
| Langage | TypeScript | 4.9.0 | Type safety côté serveur |
| Platform | Firebase Functions | 6.0.0 | Serverless, auto-scaling |

### Services Firebase
| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| Admin SDK | firebase-admin | 13.6.0 | Firestore, Auth admin operations |
| Functions | firebase-functions | 6.0.0 | HTTP functions, triggers |

### APIs & Intégrations externes
| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| Google Ads | google-ads-api | 21.0.1 | **Récupération données campagnes** |
| Google APIs | googleapis | 168.0.0 | Services Google (Sheets, etc.) |
| Paiements | Stripe | 20.1.0 | Webhooks, gestion abonnements |
| Sitemap | sitemap | 9.0.0 | Génération sitemap.xml dynamique |

### Middleware & Utilitaires
| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| CORS | cors | 2.8.5 | Cross-origin requests frontend |

### Outils de développement
| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| Linter | ESLint | 8.9.0 | Quality code backend |
| Testing | firebase-functions-test | 3.1.0 | Unit tests functions |

---

## 🏗️ Patterns d'Architecture

### Frontend
- **Pattern** : Single Page Application (SPA)
- **Architecture** : Component-based (React)
- **State Management** : React Context API (inféré)
- **Routing** : Client-side routing avec React Router
- **Data Fetching** : Firebase SDK (real-time listeners)
- **Caching** : Service Worker avec Workbox
  - NetworkFirst pour Firestore & APIs
  - CacheFirst pour assets statiques

### Backend
- **Pattern** : Serverless / Functions as a Service (FaaS)
- **Architecture** : Event-driven
- **Functions** :
  - HTTP endpoints (OAuth callback, sitemap)
  - Firestore triggers (probables)
  - Scheduled functions (probables pour sync Google Ads)
- **Authentication** : Firebase Auth
- **Database** : Firestore (NoSQL)

### Communication Frontend ↔ Backend
- **Firebase SDK** : Real-time Firestore listeners
- **HTTPS Functions** : REST-like endpoints
- **OAuth** : Google OAuth callback via function

---

## 📦 Déploiement & Infrastructure

| Catégorie | Service | Configuration |
|-----------|---------|---------------|
| Hosting Frontend | Firebase Hosting | SPA avec rewrites vers index.html |
| Functions Backend | Firebase Functions | Région par défaut Firebase |
| Database | Firestore | NoSQL temps réel |
| Authentication | Firebase Auth | Google OAuth, probablement email/password |
| Storage | Firebase Storage | (probable pour assets rapports) |
| CDN | Firebase Hosting CDN | Distribution globale |

### Sécurité Headers (firebase.json)
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection
- ✅ Strict-Transport-Security (HSTS)
- ✅ Content-Security-Policy (Report-Only mode)
- ✅ Permissions-Policy

---

## 🔄 Workflow de Build & Déploiement

### Frontend
```bash
npm run build:dev    # Build développement
npm run build:prod   # Build production
npm run deploy:dev   # Deploy Firebase dev
npm run deploy:prod  # Deploy Firebase prod
```

### Backend
```bash
cd functions
npm run build        # Compile TypeScript
firebase deploy --only functions
```

### Optimisations Build Frontend
- **Code splitting** : react-vendor, firebase-vendor, animation-vendor, icons-vendor
- **Target** : esnext
- **Minification** : esbuild (ultra-rapide)
- **Sourcemaps** : désactivés en prod
- **Chunk size warning** : 1000 KB

---

## 🎯 Fonctionnalités Clés Activées par la Stack

### Génération de Rapports Google Ads
- **google-ads-api** (backend) : Récupération données campagnes
- **Recharts** (frontend) : Visualisation graphiques
- **TipTap** (frontend) : Édition templates rapports
- **jsPDF + html2pdf** (frontend) : Export PDF personnalisés

### Multi-tenancy SaaS
- **Firebase Auth** : Authentification utilisateurs (media buyers)
- **Firestore** : Isolation données par client
- **Stripe** : Gestion abonnements & paiements

### Performance & Offline
- **PWA** : Installation application, notifications
- **Workbox** : Cache intelligent (NetworkFirst pour données fraîches)
- **Vite** : Build ultra-rapide, HMR instantané

### Internationalisation
- **i18next** : Support FR/EN (extensible)
- **Auto-détection** : Langue navigateur

### Analytics & Tracking
- **GA4** : Tracking comportement utilisateurs
- **Cookie Consent** : RGPD compliance

---

## 📊 Résumé

**Frontend** : React 19 + Vite + TypeScript + TailwindCSS + Firebase + PWA
**Backend** : Node.js 22 + TypeScript + Firebase Functions + Google Ads API + Stripe
**Architecture** : SPA + Serverless (JAMstack-like)
**Base de données** : Firestore (NoSQL temps réel)
**Déploiement** : Firebase Hosting + Functions
