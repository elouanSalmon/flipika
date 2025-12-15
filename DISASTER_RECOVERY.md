# Guide de Restauration d'Urgence Firestore

## 🚨 Procédure de Disaster Recovery

Ce guide explique comment restaurer vos données Firestore depuis un backup en cas d'urgence (suppression accidentelle, corruption de données, etc.).

---

## 📋 Prérequis

- Accès au projet GCP `flipika` avec rôle `roles/datastore.importExportAdmin` ou `Owner`
- `gcloud` CLI installé et configuré
- Accès au bucket `gs://flipika-firestore-backups`

---

## 🔍 Étape 1: Identifier le Backup à Restaurer

### Via Console GCP

1. Ouvrir [Google Cloud Console](https://console.cloud.google.com)
2. Naviguer vers **Cloud Storage** > **Buckets**
3. Ouvrir le bucket `flipika-firestore-backups`
4. Lister les dossiers de backup (format: `backup-YYYY-MM-DD-HHmmss/`)
5. Noter le chemin complet du backup souhaité

### Via CLI

```bash
# Lister tous les backups disponibles
gsutil ls gs://flipika-firestore-backups/

# Exemple de sortie:
# gs://flipika-firestore-backups/backup-2025-12-15-020000/
# gs://flipika-firestore-backups/backup-2025-12-14-020000/
# gs://flipika-firestore-backups/backup-2025-12-13-020000/

# Voir les détails d'un backup spécifique
gsutil ls -r gs://flipika-firestore-backups/backup-2025-12-15-020000/
```

---

## 🔄 Étape 2: Restauration Complète de la Base

> [!CAUTION]
> **Cette opération ÉCRASE toutes les données existantes!**
> 
> Recommandations avant restauration:
> - Créer un backup de l'état actuel (même corrompu)
> - Informer tous les utilisateurs de la maintenance
> - Mettre l'application en mode maintenance si possible

### Via CLI (Méthode Recommandée)

```bash
# 1. Définir les variables
PROJECT_ID="flipika"
BACKUP_PATH="gs://flipika-firestore-backups/backup-2025-12-15-020000"

# 2. Lancer l'import (restauration complète)
gcloud firestore import ${BACKUP_PATH} \
  --project=${PROJECT_ID} \
  --async

# 3. Suivre la progression
gcloud firestore operations list --project=${PROJECT_ID}

# 4. Obtenir les détails d'une opération spécifique
gcloud firestore operations describe OPERATION_NAME --project=${PROJECT_ID}
```

### Via Console GCP

1. Ouvrir [Firestore Console](https://console.firebase.google.com/project/flipika/firestore)
2. Cliquer sur l'onglet **Import/Export**
3. Cliquer sur **Import data**
4. Saisir le chemin du backup: `gs://flipika-firestore-backups/backup-2025-12-15-020000`
5. Laisser **All collections** sélectionné
6. Cliquer sur **Import**
7. Surveiller la progression dans l'onglet **Operations**

**Durée estimée**: 5-30 minutes selon la taille de la base

---

## 📦 Étape 3: Restauration Partielle (Collection Spécifique)

Si vous souhaitez restaurer uniquement certaines collections (ex: après suppression accidentelle d'une collection `users`):

### Via CLI

```bash
# Restaurer uniquement la collection "users"
gcloud firestore import gs://flipika-firestore-backups/backup-2025-12-15-020000 \
  --collection-ids=users \
  --project=flipika \
  --async

# Restaurer plusieurs collections
gcloud firestore import gs://flipika-firestore-backups/backup-2025-12-15-020000 \
  --collection-ids=users,campaigns,reports \
  --project=flipika \
  --async
```

### Via Console GCP

1. Suivre les mêmes étapes que pour la restauration complète
2. Au lieu de **All collections**, sélectionner **Specific collections**
3. Saisir les noms des collections séparés par des virgules: `users,campaigns,reports`
4. Cliquer sur **Import**

---

## 🎯 Scénarios Courants

### Scénario 1: Suppression Accidentelle de Collection

**Symptôme**: Une collection entière a disparu (ex: `users`)

**Solution**:
```bash
# Restaurer uniquement la collection supprimée
gcloud firestore import gs://flipika-firestore-backups/backup-2025-12-15-020000 \
  --collection-ids=users \
  --project=flipika
```

**Temps de résolution**: 5-15 minutes

---

### Scénario 2: Script Défectueux a Corrompu des Données

**Symptôme**: Des documents ont été modifiés incorrectement mais la structure est intacte

**Solution**:
1. Identifier les collections affectées
2. Restaurer uniquement ces collections depuis le dernier backup sain
3. Vérifier que les données sont correctes

```bash
# Exemple: restaurer les collections affectées
gcloud firestore import gs://flipika-firestore-backups/backup-2025-12-14-020000 \
  --collection-ids=campaigns,reports \
  --project=flipika
```

---

### Scénario 3: Rollback Complet après Déploiement Problématique

**Symptôme**: Un déploiement a causé des problèmes majeurs, besoin de revenir à l'état d'hier

**Solution**:
```bash
# 1. Créer un backup de l'état actuel (au cas où)
gcloud firestore export gs://flipika-firestore-backups/backup-emergency-$(date +%Y%m%d-%H%M%S) \
  --project=flipika

# 2. Restaurer le backup d'hier
gcloud firestore import gs://flipika-firestore-backups/backup-2025-12-14-020000 \
  --project=flipika
```

---

## ✅ Étape 4: Vérification Post-Restauration

### Checklist de Validation

- [ ] **Vérifier le nombre de documents**
  ```bash
  # Via Firebase Console > Firestore > Data
  # Comparer avec les métriques avant incident
  ```

- [ ] **Tester les fonctionnalités critiques**
  - [ ] Authentification utilisateur
  - [ ] Chargement du dashboard
  - [ ] Connexion Google Ads
  - [ ] Génération de rapports

- [ ] **Vérifier les logs d'application**
  ```bash
  firebase functions:log --only listCampaigns,getAccessibleCustomers
  ```

- [ ] **Valider l'intégrité des données**
  - [ ] Ouvrir quelques documents aléatoires
  - [ ] Vérifier que les champs sont corrects
  - [ ] Tester les requêtes complexes

- [ ] **Informer les utilisateurs**
  - [ ] Envoyer un email de notification
  - [ ] Retirer le mode maintenance
  - [ ] Surveiller les métriques pendant 24h

---

## 🔧 Commandes Utiles

### Créer un Backup Manuel Immédiat

```bash
# Avant une opération risquée
gcloud firestore export gs://flipika-firestore-backups/backup-manual-$(date +%Y%m%d-%H%M%S) \
  --project=flipika \
  --async
```

### Lister les Opérations en Cours

```bash
# Voir toutes les opérations (import/export)
gcloud firestore operations list --project=flipika

# Filtrer uniquement les imports
gcloud firestore operations list --project=flipika --filter="metadata.operationType:IMPORT"
```

### Annuler une Opération en Cours

```bash
# Si vous avez lancé la mauvaise restauration
gcloud firestore operations cancel OPERATION_NAME --project=flipika
```

### Vérifier l'Espace Utilisé par les Backups

```bash
# Taille totale du bucket
gsutil du -sh gs://flipika-firestore-backups/

# Taille par backup
gsutil du -sh gs://flipika-firestore-backups/backup-*/
```

---

## 📞 Support d'Urgence

### En cas de problème lors de la restauration:

1. **Vérifier les permissions IAM**
   ```bash
   gcloud projects get-iam-policy flipika \
     --flatten="bindings[].members" \
     --filter="bindings.role:roles/datastore.importExportAdmin"
   ```

2. **Consulter les logs d'erreur**
   ```bash
   gcloud logging read "resource.type=cloud_firestore_database" \
     --project=flipika \
     --limit=50 \
     --format=json
   ```

3. **Contacter Google Cloud Support**
   - Console GCP > Support > Create Case
   - Priorité: P1 (Production Down)
   - Fournir: Project ID, Operation ID, Timestamp de l'incident

---

## 🎓 Bonnes Pratiques

### Avant toute Opération Risquée

```bash
# Toujours créer un backup manuel avant:
# - Migration de données
# - Script de modification en masse
# - Mise à jour majeure de l'application
# - Changement de structure de données

gcloud firestore export gs://flipika-firestore-backups/backup-before-migration-$(date +%Y%m%d) \
  --project=flipika
```

### Tester la Restauration Régulièrement

> [!TIP]
> **Testez vos backups tous les trimestres!**
> 
> Un backup non testé est un backup qui n'existe pas. Créez un projet Firebase de test et restaurez-y un backup pour valider le processus.

```bash
# Exemple: restaurer dans un projet de test
gcloud firestore import gs://flipika-firestore-backups/backup-2025-12-15-020000 \
  --project=flipika-test
```

---

## 📊 Métriques de Restauration

| Taille de la Base | Temps de Restauration Estimé |
|-------------------|------------------------------|
| < 1 GB            | 5-10 minutes                 |
| 1-10 GB           | 10-30 minutes                |
| 10-50 GB          | 30-90 minutes                |
| > 50 GB           | 1-3 heures                   |

**Note**: Les temps peuvent varier selon la charge du service Firestore.

---

## 🔐 Sécurité

> [!WARNING]
> **Accès aux Backups**
> 
> Les backups contiennent TOUTES vos données de production, y compris les informations sensibles. Assurez-vous que:
> - Le bucket GCS a des permissions restrictives
> - Seuls les administrateurs ont accès au bucket
> - Les logs d'accès au bucket sont activés
> - Le versioning est activé (protection contre suppression accidentelle)

```bash
# Vérifier les permissions du bucket
gsutil iam get gs://flipika-firestore-backups

# Activer les logs d'accès
gsutil logging set on -b gs://flipika-firestore-backups-logs gs://flipika-firestore-backups
```

---

## 📝 Historique des Restaurations

Documentez chaque restauration pour référence future:

| Date | Raison | Backup Utilisé | Durée | Résultat |
|------|--------|----------------|-------|----------|
| YYYY-MM-DD | Description | backup-YYYY-MM-DD-HHmmss | XX min | ✅ Succès |

---

**Dernière mise à jour**: 2025-12-15  
**Version**: 1.0  
**Contact**: DevOps Team
