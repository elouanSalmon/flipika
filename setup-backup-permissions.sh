#!/bin/bash

# Script de configuration des permissions IAM pour les backups Firestore
# Assigne le rôle datastore.importExportAdmin au compte de service

set -e  # Arrêt en cas d'erreur

# Configuration
PROJECT_ID="flipika"

echo "🔐 Configuration des permissions IAM pour les backups Firestore"
echo "================================================================"
echo "Project ID: ${PROJECT_ID}"
echo ""

# 1. Récupérer l'email du compte de service par défaut
echo "🔍 Récupération du compte de service..."
SERVICE_ACCOUNT_EMAIL="${PROJECT_ID}@appspot.gserviceaccount.com"
echo "Service Account: ${SERVICE_ACCOUNT_EMAIL}"

# 2. Vérifier que le compte de service existe
echo ""
echo "✓ Vérification du compte de service..."
if gcloud iam service-accounts describe ${SERVICE_ACCOUNT_EMAIL} --project=${PROJECT_ID} &>/dev/null; then
  echo "✅ Compte de service trouvé"
else
  echo "❌ Erreur: Le compte de service n'existe pas"
  echo "   Assurez-vous que Firebase est initialisé dans ce projet"
  exit 1
fi

# 3. Assigner le rôle datastore.importExportAdmin
echo ""
echo "🔑 Attribution du rôle datastore.importExportAdmin..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/datastore.importExportAdmin" \
  --condition=None \
  --quiet

echo "✅ Rôle attribué avec succès"

# 4. Vérifier que les permissions sont correctement appliquées
echo ""
echo "🔍 Vérification des permissions..."
echo ""
echo "--- Rôles IAM du compte de service ---"
gcloud projects get-iam-policy ${PROJECT_ID} \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --format="table(bindings.role)" | grep -E "(ROLE|datastore)"

echo ""
echo "✅ Configuration des permissions terminée!"
echo ""
echo "📝 Le compte de service peut maintenant:"
echo "   ✓ Exporter les données Firestore vers GCS"
echo "   ✓ Importer les données depuis GCS vers Firestore"
echo ""
echo "⚠️  IMPORTANT: Ce rôle donne des privilèges élevés."
echo "   Assurez-vous que le bucket GCS est sécurisé."
echo ""
