#!/bin/bash

# Script de configuration du bucket GCS pour les backups Firestore
# Ce script crée un bucket optimisé pour le stockage à long terme avec coûts réduits

set -e  # Arrêt en cas d'erreur

# Configuration
PROJECT_ID="flipika"
BUCKET_NAME="${PROJECT_ID}-firestore-backups"
REGION="europe-west1"
STORAGE_CLASS="COLDLINE"  # Optimisé pour accès rare, coût minimal
LIFECYCLE_AGE_DAYS=30

echo "🚀 Configuration du bucket de backup Firestore"
echo "================================================"
echo "Project ID: ${PROJECT_ID}"
echo "Bucket: gs://${BUCKET_NAME}"
echo "Region: ${REGION}"
echo "Storage Class: ${STORAGE_CLASS}"
echo "Lifecycle: Suppression après ${LIFECYCLE_AGE_DAYS} jours"
echo ""

# 1. Créer le bucket avec classe de stockage Coldline
echo "📦 Création du bucket..."
if gsutil ls -b gs://${BUCKET_NAME} 2>/dev/null; then
  echo "⚠️  Le bucket existe déjà. Mise à jour de la configuration..."
else
  gsutil mb -c ${STORAGE_CLASS} -l ${REGION} gs://${BUCKET_NAME}
  echo "✅ Bucket créé avec succès"
fi

# 2. Activer le versioning pour protection supplémentaire
echo ""
echo "🔄 Activation du versioning..."
gsutil versioning set on gs://${BUCKET_NAME}
echo "✅ Versioning activé"

# 3. Configurer la règle de lifecycle (suppression après 30 jours)
echo ""
echo "⏰ Configuration de la règle de lifecycle..."
cat > /tmp/lifecycle.json <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": ${LIFECYCLE_AGE_DAYS},
          "matchesPrefix": ["backup-"]
        }
      }
    ]
  }
}
EOF

gsutil lifecycle set /tmp/lifecycle.json gs://${BUCKET_NAME}
rm /tmp/lifecycle.json
echo "✅ Règle de lifecycle configurée (suppression après ${LIFECYCLE_AGE_DAYS} jours)"

# 4. Configurer les labels pour organisation
echo ""
echo "🏷️  Ajout des labels..."
gsutil label ch -l environment:production gs://${BUCKET_NAME}
gsutil label ch -l purpose:firestore-backup gs://${BUCKET_NAME}
gsutil label ch -l retention:30-days gs://${BUCKET_NAME}
echo "✅ Labels ajoutés"

# 5. Vérifier la configuration
echo ""
echo "🔍 Vérification de la configuration..."
echo ""
echo "--- Informations du bucket ---"
gsutil ls -L -b gs://${BUCKET_NAME} | grep -E "(Storage class|Location|Versioning|Labels)"

echo ""
echo "--- Règle de lifecycle ---"
gsutil lifecycle get gs://${BUCKET_NAME}

echo ""
echo "✅ Configuration terminée avec succès!"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Exécuter ./setup-backup-permissions.sh pour configurer les permissions IAM"
echo "   2. Déployer la Cloud Function: cd functions && npm run deploy"
echo ""
