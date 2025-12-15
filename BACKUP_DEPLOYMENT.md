# Guide de Déploiement - Système de Backup Firestore

Ce guide vous accompagne pas à pas pour déployer le système de backup automatisé.

---

## 📋 Prérequis

- [ ] Accès au projet GCP `flipika` avec rôle `Owner` ou `Editor`
- [ ] `gcloud` CLI installé et authentifié
- [ ] `firebase` CLI installé
- [ ] Node.js 22 installé

---

## 🚀 Étape 1: Configuration du Bucket GCS

### Exécuter le script de configuration

```bash
cd /Users/elouan.salmon@ekwateur.fr/Documents/GitHub/flipika

# Rendre le script exécutable (déjà fait)
chmod +x setup-backup-bucket.sh

# Exécuter la configuration du bucket
./setup-backup-bucket.sh
```

### Vérifications attendues

✅ Le script doit afficher:
- Création du bucket `flipika-firestore-backups`
- Classe de stockage: `COLDLINE`
- Versioning: `Enabled`
- Lifecycle rule: Suppression après 30 jours
- Labels: `environment:production`, `purpose:firestore-backup`

### En cas d'erreur

**Erreur: "You do not have permission"**
```bash
# Vérifier vos permissions
gcloud projects get-iam-policy flipika --flatten="bindings[].members" \
  --filter="bindings.members:user:$(gcloud config get-value account)"

# Vous devez avoir au minimum le rôle "roles/storage.admin"
```

**Erreur: "Bucket already exists"**
```bash
# Le bucket existe déjà, vérifier sa configuration
gsutil ls -L -b gs://flipika-firestore-backups
```

---

## 🔐 Étape 2: Configuration des Permissions IAM

### Exécuter le script de permissions

```bash
# Rendre le script exécutable (déjà fait)
chmod +x setup-backup-permissions.sh

# Configurer les permissions
./setup-backup-permissions.sh
```

### Vérifications attendues

✅ Le script doit afficher:
- Service Account: `flipika@appspot.gserviceaccount.com`
- Rôle attribué: `roles/datastore.importExportAdmin`

### Vérification manuelle

```bash
# Confirmer que le rôle est bien assigné
gcloud projects get-iam-policy flipika \
  --flatten="bindings[].members" \
  --filter="bindings.role:roles/datastore.importExportAdmin"
```

---

## 🛠️ Étape 3: Build et Déploiement de la Cloud Function

### Build de la fonction

```bash
cd functions

# Installer les dépendances (si pas déjà fait)
npm install

# Build TypeScript
npm run build
```

### Vérifications attendues

✅ Pas d'erreurs TypeScript
✅ Dossier `lib/` créé avec les fichiers compilés
✅ Fichier `lib/backupFirestore.js` présent

### Déploiement

```bash
# Déployer toutes les fonctions (incluant backupFirestore)
npm run deploy

# OU déployer uniquement la fonction de backup
firebase deploy --only functions:backupFirestore
```

### Durée estimée

⏱️ 2-5 minutes pour le déploiement

### Vérifications post-déploiement

```bash
# Lister les fonctions déployées
firebase functions:list

# Vérifier que backupFirestore apparaît dans la liste
# Type: Scheduled
# Schedule: 0 2 * * *
# Region: us-central1 (ou votre région configurée)
```

---

## ✅ Étape 4: Vérification du Système

### Option A: Test Manuel Immédiat (Recommandé)

Déclencher manuellement la fonction pour tester sans attendre 2h du matin:

```bash
# Via gcloud CLI
gcloud functions call backupFirestore \
  --project=flipika \
  --region=us-central1

# OU via Firebase Console
# 1. Ouvrir https://console.firebase.google.com/project/flipika/functions
# 2. Trouver "backupFirestore"
# 3. Cliquer sur les 3 points > "Test function"
```

### Option B: Attendre l'Exécution Planifiée

La fonction s'exécutera automatiquement à 2h00 du matin (Europe/Paris).

### Vérifier les Logs

```bash
# Voir les logs en temps réel
firebase functions:log --only backupFirestore

# Logs attendus:
# ✅ "🚀 Démarrage du backup Firestore"
# ✅ "✅ Export Firestore démarré avec succès"
```

### Vérifier le Backup dans GCS

```bash
# Lister les backups créés
gsutil ls gs://flipika-firestore-backups/

# Vous devriez voir un dossier: backup-YYYY-MM-DD-HHmmss/

# Voir le contenu du backup
gsutil ls -r gs://flipika-firestore-backups/backup-YYYY-MM-DD-HHmmss/
```

---

## 🎯 Étape 5: Configuration des Alertes (Optionnel mais Recommandé)

### Créer une alerte en cas d'échec de backup

1. Ouvrir [Cloud Monitoring](https://console.cloud.google.com/monitoring)
2. Aller dans **Alerting** > **Create Policy**
3. Configurer:
   - **Resource type**: Cloud Function
   - **Metric**: `Executions` with status `error`
   - **Filter**: `function_name = "backupFirestore"`
   - **Condition**: Any time series violates (> 0 errors)
   - **Notification**: Email à votre équipe DevOps

### Créer un Dashboard de Monitoring

```bash
# Créer un dashboard personnalisé pour suivre les backups
# Via Console: Monitoring > Dashboards > Create Dashboard
# Ajouter les widgets:
# - Execution count (backupFirestore)
# - Execution time
# - Error rate
# - GCS bucket size
```

---

## 📊 Métriques de Succès

Après 24-48h, vérifier que:

- [ ] Au moins 1 backup a été créé automatiquement
- [ ] Les logs ne montrent aucune erreur
- [ ] La taille du bucket augmente progressivement
- [ ] Les anciens backups (> 30 jours) sont supprimés automatiquement

---

## 🔧 Dépannage

### La fonction ne se déclenche pas automatiquement

**Vérifier le schedule:**
```bash
gcloud scheduler jobs list --project=flipika

# Chercher: firebase-schedule-backupFirestore-...
# Status doit être: ENABLED
```

**Forcer une exécution:**
```bash
gcloud scheduler jobs run JOB_NAME --project=flipika
```

### Erreur "Permission denied" dans les logs

**Vérifier les permissions:**
```bash
# Le compte de service doit avoir datastore.importExportAdmin
./setup-backup-permissions.sh
```

### Le backup est vide ou incomplet

**Vérifier que Firestore contient des données:**
```bash
# Via Firebase Console
# Firestore Database > Data
# Compter le nombre de documents
```

**Vérifier les quotas:**
```bash
# Firestore a des limites d'export
# Console GCP > IAM & Admin > Quotas
# Chercher: "Firestore Admin API"
```

---

## 📝 Checklist Finale

- [ ] Bucket GCS créé avec classe Coldline
- [ ] Lifecycle rule configurée (30 jours)
- [ ] Permissions IAM assignées
- [ ] Cloud Function déployée
- [ ] Premier backup créé avec succès
- [ ] Logs sans erreur
- [ ] Alertes configurées (optionnel)
- [ ] Documentation disaster recovery lue et comprise
- [ ] Test de restauration planifié (dans 1 mois)

---

## 🎓 Prochaines Étapes

1. **Tester la restauration** (dans un projet de test)
2. **Documenter les procédures** dans votre runbook
3. **Former l'équipe** sur la procédure de disaster recovery
4. **Planifier un drill** de restauration tous les 3 mois

---

## 📞 Support

En cas de problème:
1. Consulter les logs: `firebase functions:log --only backupFirestore`
2. Vérifier [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md)
3. Contacter Google Cloud Support si nécessaire

---

**Dernière mise à jour**: 2025-12-15  
**Version**: 1.0
