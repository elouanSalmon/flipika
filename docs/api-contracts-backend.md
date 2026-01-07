# API Contracts - Backend (Firebase Functions)
# API Contracts - Part: backend
**Généré le** : 2026-01-05
**Type** : Backend API (Firebase Functions)
**Mode de scan** : Quick (basé sur structure de fichiers)
> **Scan Level**: Quick (Pattern Matching Only)
> **Generated**: 2026-01-05
---
## Cloud Functions Detected
## Vue d'ensemble
The following files in `functions/src/` appear to export Firebase Cloud Functions or related logic.
Le backend Flipika expose plusieurs Firebase Functions (HTTP endpoints et triggers) pour gérer :
- **OAuth Google Ads** : Authentification et gestion des tokens
- **Stripe Webhooks** : Gestion des abonnements et paiements
- **Google Ads Data** : Récupération métriques et créatives publicitaires
- **Rapports programmés** : Génération automatique de rapports
- **Sitemap dynamique** : SEO et indexation
- **Backup Firestore** : Sauvegardes automatiques
| Function/Module | Purpose |
| :--- | :--- |
| `adCreatives.ts` | Handling Google Ads creatives |
| `oauth.ts` | Authentication flows (Google integrations) |
| `stripe.ts` | Stripe webhooks and payment processing |
| `widgetMetrics.ts` | Calculating or serving widget metrics |
| `generateScheduledReports.ts` | Background job for report generation |
| `generateSitemap.ts` | SEO sitemap generation |
| `serveSitemap.ts` | Serving the sitemap |
| `migrateReports.ts` | Data migration utilities |
| `backupFirestore.ts` | Database backup operations |
| `domainRedirect.ts` | Handling custom domain redirects |
---
## Entry Point
## 🔐 Endpoints d'authentification
- **`index.ts`**: Likely exports all the above functions to the Firebase runtime.
### OAuth Google Ads
_(Note: This is a quick scan based on filenames. For detailed trigger types (HTTP vs Event) and full signatures, run a Deep or Exhaustive scan.)_
**Fonction** : `handleOAuthCallback`
**Fichier** : `/functions/src/oauth.ts`
**Route** : `/oauth/callback`
**Méthode** : GET
**Description** : Gère le callback OAuth de Google Ads après autorisation utilisateur
**Flow estimé** :
1. L'utilisateur autorise l'accès Google Ads
2. Google redirige vers `/oauth/callback?code=xxx`
3. La function échange le code contre un access token
4. Stockage des tokens dans Firestore (user profile)
5. Redirection vers l'application
**Sécurité** :
- Rate limiting probable
- Validation du state parameter (CSRF protection)
---
## 💳 Endpoints Stripe
### Webhook Stripe
**Fonction** : `stripeWebhook`
**Fichier** : `/functions/src/stripe.ts`
**Route** : (configuré dans Stripe dashboard)
**Méthode** : POST
**Description** : Gère les événements Stripe (souscriptions, paiements, annulations)
**Événements probables** :
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
**Actions** :
- Mise à jour statut abonnement dans Firestore
- Activation/désactivation features selon plan
- Gestion des périodes d'essai
---
## 📊 Endpoints Google Ads Data
### Widget Metrics
**Fonction** : `getWidgetMetrics`
**Fichier** : `/functions/src/widgetMetrics.ts`
**Description** : Récupère les métriques Google Ads pour les widgets de rapports
**Métriques probables** :
- Impressions
- Clics
- Coût (Spend)
- Conversions
- CPC, CTR, CPA
- ROAS
**Paramètres estimés** :
- `accountId` : ID compte Google Ads
- `dateRange` : Période (today, last7days, last30days, custom)
- `metrics` : Liste des métriques demandées
- `dimensions` : Groupement (campaign, adgroup, keyword)
### Ad Creatives
**Fonction** : `getAdCreatives`
**Fichier** : `/functions/src/adCreatives.ts`
**Description** : Récupère les créatives publicitaires (images, textes, vidéos)
**Données retournées** :
- Titre de l'annonce
- Description
- URL d'image/vidéo
- Performance (CTR, conversions)
- Statut (active, paused)
---
## 📅 Rapports programmés
### Generate Scheduled Reports
**Fonction** : `generateScheduledReports`
**Fichier** : `/functions/src/generateScheduledReports.ts`
**Trigger** : Cloud Scheduler (Cron job)
**Description** : Génère et envoie automatiquement les rapports programmés
**Flow estimé** :
1. Trigger quotidien/hebdomadaire/mensuel
2. Récupération des rapports schedulés depuis Firestore
3. Collecte des données Google Ads
4. Génération du PDF
5. Envoi par email au client final
---
## 🗺️ Endpoints SEO
### Serve Sitemap
**Fonction** : `serveSitemap`
**Fichier** : `/functions/src/serveSitemap.ts`
**Route** : `/sitemap.xml`
**Méthode** : GET
**Description** : Sert le sitemap XML dynamiquement
### Generate Sitemap
**Fonction** : `generateSitemap`
**Fichier** : `/functions/src/generateSitemap.ts`
**Trigger** : Firestore onCreate/onUpdate (rapports publics)
**Description** : Régénère le sitemap quand de nouveaux rapports publics sont créés
---
## 🔧 Utilitaires & Maintenance
### Backup Firestore
**Fonction** : `backupFirestore`
**Fichier** : `/functions/src/backupFirestore.ts`
**Trigger** : Cloud Scheduler (quotidien)
**Description** : Sauvegarde complète de Firestore vers Cloud Storage
### Migrate Reports
**Fonction** : `migrateReports`
**Fichier** : `/functions/src/migrateReports.ts`
**Type** : Migration one-time
**Description** : Migration de données pour évolution du schema
### Domain Redirect
**Fonction** : `domainRedirect`
**Fichier** : `/functions/src/domainRedirect.ts`
**Description** : Gestion des redirections multi-domaines
---
## 🛡️ Sécurité & Middleware
### Rate Limiter
**Fichier** : `/functions/src/rateLimiter.ts`
**Description** : Limitation du taux de requêtes par IP/utilisateur
**Limites probables** :
- OAuth callback : 10 requêtes/heure
- Widget metrics : 100 requêtes/minute
- Ad creatives : 50 requêtes/minute
### Validators
**Fichier** : `/functions/src/validators.ts`
**Description** : Validation des paramètres d'entrée
---
## 📋 Firestore Triggers (inférés)
Basé sur la structure, triggers Firestore probables :
### On Report Created
```typescript
// Trigger lors de la création d'un rapport
exports.onReportCreated = functions.firestore
  .document('reports/{reportId}')
  .onCreate(async (snap, context) => {
    // Génération du sitemap si rapport public
    // Analytics event
  });
```
### On Subscription Updated
```typescript
// Trigger lors de la mise à jour d'abonnement
exports.onSubscriptionUpdated = functions.firestore
  .document('subscriptions/{userId}')
  .onUpdate(async (change, context) => {
    // Activation/désactivation features
  });
```
---
## 🔄 Intégrations externes
| Service | Usage | Authentification |
|---------|-------|------------------|
| Google Ads API | Récupération données campagnes | OAuth 2.0 |
| Google APIs | Sheets, etc. | Service Account |
| Stripe API | Paiements, webhooks | Secret Key |
| Firebase Admin | Firestore, Auth | Service Account |
| Cloud Storage | Backups, assets | Service Account |
---
## 📝 Notes
- **Mode scan** : Quick (structure de fichiers uniquement)
- **Pour détails complets** : Utiliser Deep Scan ou lire les fichiers sources
- **Authentication** : Toutes les fonctions probablement protégées par Firebase Auth sauf OAuth callback, sitemap, et webhooks
