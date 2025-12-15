# Guide d'Utilisation - Google Analytics 4

## 📋 Configuration Requise

Avant de pouvoir utiliser GA4 en production, vous devez configurer votre **Measurement ID**.

### Étape 1 : Obtenir votre Measurement ID

1. Allez sur [Google Analytics](https://analytics.google.com/)
2. Créez une propriété GA4 (ou utilisez une existante)
3. Naviguez vers **Admin** → **Data Streams**
4. Sélectionnez votre stream web (ou créez-en un nouveau)
5. Copiez le **Measurement ID** (format: `G-XXXXXXXXXX`)

### Étape 2 : Configurer les Variables d'Environnement

Remplacez `G-XXXXXXXXXX` par votre vrai Measurement ID dans les fichiers suivants :

**Fichier `.env` (développement local) :**
```bash
VITE_GA4_MEASUREMENT_ID=G-VOTRE-ID-ICI
```

**Fichier `.env.production` (production) :**
```bash
VITE_GA4_MEASUREMENT_ID=G-VOTRE-ID-ICI
```

> **Note :** En développement local (localhost), GA4 est automatiquement désactivé pour éviter de polluer vos données analytics.

---

## 🚀 Fonctionnalités Implémentées

### ✅ Tracking Automatique

L'implémentation actuelle track automatiquement :

1. **Page Views (SPA)** : Chaque changement de route est tracké comme une page view
2. **User-ID** : L'UID Firebase est automatiquement envoyé à GA4 lors de la connexion
3. **Exclusion Localhost** : Aucune donnée n'est envoyée en développement local

### 📊 Événements Personnalisés Disponibles

Vous pouvez utiliser les fonctions helper pour tracker des événements métier :

```typescript
import { 
  trackSignup, 
  trackLogin, 
  trackGoogleAdsConnection,
  trackReportGeneration,
  trackAuditCompletion,
  trackSubscription 
} from './utils/analyticsEvents';

// Exemple : Tracker une connexion Google Ads
trackGoogleAdsConnection(accountId);

// Exemple : Tracker la génération d'un rapport
trackReportGeneration('performance_report');

// Exemple : Tracker un abonnement
trackSubscription('Premium Plan', 29.99);
```

---

## 🧪 Tests & Vérification

### Test 1 : Vérifier l'Exclusion Localhost

```bash
npm run dev
```

Ouvrez la console du navigateur, vous devriez voir :
```
GA4 disabled in development (localhost)
```

✅ **Résultat attendu :** Aucun événement envoyé à GA4

---

### Test 2 : Vérifier le Tracking en Production

```bash
npm run build
npm run preview
```

1. Ouvrez Google Analytics → **Admin** → **DebugView**
2. Naviguez entre les pages de l'application
3. Vérifiez que les événements `page_view` apparaissent dans DebugView

✅ **Résultat attendu :** Chaque changement de route génère un `page_view`

---

### Test 3 : Vérifier le User-ID Tracking

1. En mode preview/production, connectez-vous avec Firebase Auth
2. Dans GA4 DebugView, vérifiez l'événement `login`
3. Vérifiez que le paramètre `user_id` contient l'UID Firebase

✅ **Résultat attendu :** Tous les événements suivants sont associés à cet User-ID

---

## 📦 Déploiement

Pour déployer en production avec GA4 configuré :

```bash
# Assurez-vous que .env.production contient le bon Measurement ID
npm run deploy:hosting
```

Après déploiement, vérifiez dans GA4 :
- **Realtime** → Utilisateurs actifs
- **Realtime** → Event count by Event name
- **Reports** → User attributes → User-ID

---

## 🔧 Intégration dans Votre Code

### Exemple : Tracker un événement personnalisé

```typescript
import { trackEvent } from './utils/ga4';

// Dans votre composant
const handleAction = () => {
  // Votre logique métier
  
  // Tracker l'événement
  trackEvent('custom_action', {
    category: 'engagement',
    label: 'button_click',
    value: 1
  });
};
```

### Exemple : Tracker une conversion

```typescript
import { trackConversion } from './utils/analyticsEvents';

const handlePurchase = (planName: string, amount: number) => {
  // Logique d'achat
  
  // Tracker la conversion
  trackConversion('subscription_purchase', {
    plan: planName,
    value: amount,
    currency: 'EUR'
  });
};
```

---

## 📚 Ressources

- [Documentation GA4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Documentation react-ga4](https://github.com/codler/react-ga4)
- [Guide User-ID GA4](https://support.google.com/analytics/answer/9213390)
