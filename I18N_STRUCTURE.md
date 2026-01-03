# Structure i18n - Organisation par Pages/Composants

## 📋 Vue d'ensemble

Le système de traduction a été réorganisé pour séparer les fichiers de traduction par page/fonctionnalité au lieu d'avoir un seul fichier `common.json` monolithique.

## 🗂️ Structure des fichiers

```
/src/locales/
├── en/
│   └── common.json                  # Landing page + éléments globaux (EN)
└── fr/
    ├── common.json                  # Landing page + éléments globaux (FR)
    ├── dashboard.json               # Page Dashboard
    ├── reports.json                 # Pages Rapports (Liste, Nouveau, Éditeur)
    ├── templates.json               # Page Templates
    ├── schedules.json               # Page Rapports Programmés
    ├── settings.json                # Page Paramètres (Profil, Sécurité, Connexions)
    ├── billing.json                 # Page Facturation & Abonnement
    ├── copilot.json                 # Page Copilot
    └── audit.json                   # Page Audit
```

## 📝 Contenu des fichiers

### `common.json`
Contient :
- Landing page (hero, features, testimonials, etc.)
- Éléments globaux (header, footer, validation, onboarding, profile)
- Messages d'erreur génériques

### `dashboard.json`
Contient :
- Titres et descriptions de la page Dashboard
- Messages de connexion Google Ads
- Sélecteur de compte
- Table des campagnes
- Messages d'erreur spécifiques au Dashboard

### `reports.json`
Contient :
- Liste des rapports (tabs, filtres, recherche)
- Configuration de rapport (modal)
- Éditeur de rapport
- Sécurité du rapport (protection par mot de passe)
- Génération d'email

### `templates.json`
Contient :
- Page Templates
- Création/édition de templates
- Suppression et duplication
- Messages de succès/erreur

### `schedules.json`
Contient :
- Page Rapports Programmés
- Création/édition de schedules
- États (actif/pause)
- Messages de toast

### `settings.json`
Contient :
- Page Paramètres
- Profil utilisateur
- Sécurité (changement de mot de passe)
- Connexions (Google, Google Ads)

### `billing.json`
Contient :
- Page Facturation & Abonnement
- Statuts d'abonnement
- Tarification
- Informations de paiement
- Historique de facturation

### `copilot.json`
Contient :
- Page Copilot
- Recommandations IA
- Audit de performance

### `audit.json`
Contient :
- Page Audit de campagne
- Configuration de l'audit
- Export PDF
- Statistiques

## 🔧 Utilisation dans les composants

### Méthode 1 : Namespace spécifique (Recommandé)

```typescript
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { t } = useTranslation('dashboard');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('connect.description')}</p>
      <button>{t('connect.button')}</button>
    </div>
  );
};
```

### Méthode 2 : Multiple namespaces

```typescript
import { useTranslation } from 'react-i18next';

const ReportsList = () => {
  const { t } = useTranslation(['reports', 'common']);

  return (
    <div>
      <h1>{t('reports:list.title')}</h1>
      <button>{t('common:validation.cancel')}</button>
    </div>
  );
};
```

### Méthode 3 : Namespace par défaut (common)

```typescript
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation(); // Utilise 'common' par défaut

  return (
    <nav>
      <a>{t('header.home')}</a>
      <a>{t('header.features')}</a>
    </nav>
  );
};
```

## 🎯 Avantages de cette structure

1. **Meilleure organisation** : Facile de trouver les traductions d'une page spécifique
2. **Fichiers plus petits** : Plus rapides à charger et à éditer
3. **Moins de conflits** : Plusieurs développeurs peuvent travailler sur différentes pages
4. **Scalabilité** : Facile d'ajouter de nouvelles pages
5. **Maintenance** : Plus simple de maintenir et mettre à jour

## 📊 Statistiques

- **Ancien système** : 1 fichier de 32 KB (585 lignes)
- **Nouveau système** : 9 fichiers organisés par fonctionnalité
- **Total de clés de traduction** : 400+ strings extraites
- **Pages couvertes** : 10 pages authentifiées

## 🌐 Prochaines étapes

1. ✅ Créer les fichiers JSON français avec toutes les traductions
2. ✅ Mettre à jour la configuration i18n
3. ⏳ Créer les fichiers JSON anglais (copie de la structure française)
4. ⏳ Traduire le contenu en anglais
5. ⏳ Mettre à jour les composants pour utiliser les nouveaux namespaces

## 💡 Bonnes pratiques

1. **Nommage des clés** : Utilisez des noms descriptifs et hiérarchiques
   ```json
   {
     "list": {
       "title": "Mes Rapports",
       "empty": {
         "title": "Aucun rapport",
         "description": "Créez votre premier rapport"
       }
     }
   }
   ```

2. **Interpolation** : Utilisez `{variable}` pour les valeurs dynamiques
   ```json
   {
     "welcome": "Bienvenue, {name} !",
     "accountsCount": "{count} compte{s}"
   }
   ```

3. **Pluralisation** : Gérez les pluriels correctement
   ```typescript
   t('accountsCount', { count: 1 }) // "1 compte"
   t('accountsCount', { count: 5 }) // "5 comptes"
   ```

4. **Contexte** : Groupez les traductions liées ensemble
   ```json
   {
     "toast": {
       "success": "Opération réussie",
       "error": "Erreur survenue"
     }
   }
   ```

## 🔍 Commandes utiles

### Rechercher une clé de traduction
```bash
grep -r "mon texte" src/locales/fr/
```

### Vérifier les traductions manquantes
```bash
# Comparer la structure des fichiers EN et FR
diff -u src/locales/en/dashboard.json src/locales/fr/dashboard.json
```

### Linter les fichiers JSON
```bash
npm run lint:json
```

## 📞 Support

Pour toute question sur la structure i18n :
- Consultez la documentation i18next : https://www.i18next.com/
- Consultez la documentation react-i18next : https://react.i18next.com/

---

**Dernière mise à jour** : 2026-01-03
