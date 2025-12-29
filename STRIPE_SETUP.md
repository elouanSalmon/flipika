# Configuration Stripe pour Flipika

Ce guide explique comment configurer l'intégration Stripe pay-per-seats pour Flipika.

## Prérequis

- Un compte Stripe (créez-en un sur [stripe.com](https://stripe.com))
- Accès au Firebase Project
- Node.js et npm installés

## Étape 1: Configuration Stripe Dashboard

### 1.1 Créer un Produit

1. Connectez-vous à votre [Stripe Dashboard](https://dashboard.stripe.com)
2. Allez dans **Products** → **Add product**
3. Configurez le produit :
   - **Name**: "Gestion de comptes Google Ads"
   - **Description**: "Abonnement mensuel par compte Google Ads géré"
   - **Pricing model**: Standard pricing
   - **Price**: 49 EUR (ou votre prix souhaité)
   - **Billing period**: Monthly
   - **Usage is metered**: Non
   - **Charge for metered usage**: Per unit

4. Cliquez sur **Save product**
5. **Copiez le Price ID** (commence par `price_...`)

### 1.2 Configurer le Webhook

1. Allez dans **Developers** → **Webhooks**
2. Cliquez sur **Add endpoint**
3. **Endpoint URL**: `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/stripeWebhook`
   - Remplacez par l'URL de votre Cloud Function
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Cliquez sur **Add endpoint**
6. **Copiez le Signing secret** (commence par `whsec_...`)

### 1.3 Récupérer les clés API

1. Allez dans **Developers** → **API keys**
2. **Copiez la Secret key** (commence par `sk_test_...` en mode test)

## Étape 2: Configuration Firebase Functions

### 2.1 Variables d'environnement

Éditez le fichier `functions/.env` :

```bash
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET
STRIPE_PRICE_ID=price_VOTRE_PRICE_ID
```

### 2.2 Configuration Firebase (Production)

Pour la production, utilisez Firebase Secrets :

```bash
cd functions
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

## Étape 3: Configuration Frontend

Éditez le fichier `.env` à la racine du projet :

```bash
VITE_STRIPE_PRICE_ID=price_VOTRE_PRICE_ID
```

## Étape 4: Déploiement

### 4.1 Build et déploiement

```bash
# Installer les dépendances
npm install
cd functions && npm install && cd ..

# Build
npm run build

# Déployer
firebase deploy
```

### 4.2 Vérifier le déploiement

1. Vérifiez que les Cloud Functions sont déployées :
   - `createStripeCheckout`
   - `createStripePortal`
   - `stripeWebhook`
   - `syncBillingManual`
   - `syncBillingScheduled`

2. Mettez à jour l'URL du webhook dans Stripe Dashboard avec l'URL de `stripeWebhook`

## Étape 5: Test

### 5.1 Test de l'abonnement

1. Connectez-vous à l'application
2. Allez sur `/app/billing`
3. Cliquez sur "Commencer l'essai gratuit"
4. Utilisez une carte de test Stripe :
   - **Numéro**: 4242 4242 4242 4242
   - **Date**: N'importe quelle date future
   - **CVC**: N'importe quel 3 chiffres

### 5.2 Test de la synchronisation

1. Connectez un compte Google Ads MCC avec plusieurs comptes enfants
2. Allez sur `/app/billing`
3. Cliquez sur "Synchroniser"
4. Vérifiez que le nombre de sièges est mis à jour dans Stripe Dashboard

### 5.3 Test du webhook

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks localement
stripe listen --forward-to http://localhost:5001/YOUR_PROJECT/us-central1/stripeWebhook

# Dans un autre terminal, déclencher des événements de test
stripe trigger checkout.session.completed
stripe trigger invoice.payment_succeeded
```

## Étape 6: Passage en Production

### 6.1 Activer le mode Live

1. Dans Stripe Dashboard, basculez en mode **Live**
2. Créez un nouveau produit (même configuration)
3. Créez un nouveau webhook endpoint
4. Récupérez les nouvelles clés API

### 6.2 Mettre à jour les variables

```bash
# Firebase Secrets (Production)
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET

# Frontend .env
VITE_STRIPE_PRICE_ID=price_VOTRE_PRICE_ID_LIVE
```

### 6.3 Déployer en production

```bash
npm run build
firebase deploy --only functions,hosting
```

## Fonctionnalités

### Synchronisation automatique

- **Quotidienne**: Tous les jours à 2h UTC via `syncBillingScheduled`
- **Manuelle**: Bouton "Synchroniser" sur la page de facturation
- **Automatique**: Après connexion d'un compte Google Ads

### Gestion des cas limites

- **0 comptes**: Facturation pour 1 siège minimum
- **Échec de paiement**: Statut `past_due`, accès maintenu avec avertissement
- **Annulation**: Accès maintenu jusqu'à la fin de la période payée

### Portail client Stripe

Les utilisateurs peuvent :
- Mettre à jour leur moyen de paiement
- Voir leur historique de facturation
- Télécharger les factures
- Annuler leur abonnement

## Dépannage

### Webhook ne fonctionne pas

1. Vérifiez l'URL du webhook dans Stripe Dashboard
2. Vérifiez les logs Firebase Functions
3. Testez avec Stripe CLI

### Synchronisation échoue

1. Vérifiez que l'utilisateur a un compte Google Ads connecté
2. Vérifiez les logs de `syncUserBilling`
3. Vérifiez que le Developer Token Google Ads est valide

### Erreur lors du checkout

1. Vérifiez que `STRIPE_PRICE_ID` est correct
2. Vérifiez les logs de `createStripeCheckout`
3. Vérifiez que le Customer Portal est activé dans Stripe

## Support

Pour toute question, consultez :
- [Documentation Stripe](https://stripe.com/docs)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation Google Ads API](https://developers.google.com/google-ads/api/docs/start)
