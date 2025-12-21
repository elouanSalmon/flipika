# Guide d'utilisation des Feature Flags

Ce document explique comment utiliser le système de feature flags dans Flipika pour activer ou désactiver des fonctionnalités de l'application.

## Vue d'ensemble

Le système de feature flags permet de contrôler la visibilité et l'accessibilité de certaines fonctionnalités sans modifier le code source. Il est basé sur des variables d'environnement Vite et un contexte React.

## Features disponibles

| Feature | Variable d'environnement | Description |
|---------|-------------------------|-------------|
| Dashboard | `VITE_FEATURE_DASHBOARD` | Affiche/masque la page Dashboard et ses liens de navigation |
| Audit | `VITE_FEATURE_AUDIT` | Affiche/masque la page Audit et ses liens de navigation |
| Reports | `VITE_FEATURE_REPORTS` | Affiche/masque la page Rapports et ses liens de navigation |
| Copilot | `VITE_FEATURE_COPILOT` | Affiche/masque la page Copilot et ses liens de navigation |

## Configuration

### Fichier `.env`

Les feature flags sont configurés dans le fichier `.env` à la racine du projet :

```bash
# Feature Flags
# Set to 'false' to disable a feature, 'true' to enable it
VITE_FEATURE_DASHBOARD=false
VITE_FEATURE_AUDIT=false
VITE_FEATURE_REPORTS=true
VITE_FEATURE_COPILOT=true
```

### Valeurs acceptées

- `true` : Active la fonctionnalité
- `false` : Désactive la fonctionnalité
- Non défini : Par défaut, la fonctionnalité est **activée** (comportement par défaut pour la rétrocompatibilité)

## Comment activer/désactiver une feature

### 1. Modifier le fichier `.env`

Ouvrez le fichier `.env` et modifiez la valeur de la variable correspondante :

```bash
# Pour désactiver le Dashboard
VITE_FEATURE_DASHBOARD=false

# Pour activer le Dashboard
VITE_FEATURE_DASHBOARD=true
```

### 2. Redémarrer le serveur de développement

⚠️ **Important** : Les variables d'environnement Vite sont lues au démarrage. Vous **devez** redémarrer le serveur pour que les changements prennent effet.

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

### 3. Vérifier les changements

- Les liens de navigation (desktop et mobile) seront automatiquement mis à jour
- Les routes désactivées ne seront plus accessibles
- La redirection par défaut `/app` s'adaptera automatiquement à la première feature activée

## Environnements multiples

### Développement local

Utilisez le fichier `.env` pour votre configuration locale.

### Production

Pour la production, configurez les variables d'environnement dans votre plateforme de déploiement (Firebase Hosting, Vercel, etc.).

### Configuration temporaire

Pour tester rapidement une configuration sans modifier `.env`, créez un fichier `.env.local` :

```bash
# .env.local (ignoré par Git)
VITE_FEATURE_DASHBOARD=true
VITE_FEATURE_AUDIT=true
VITE_FEATURE_REPORTS=true
VITE_FEATURE_COPILOT=true
```

Ce fichier aura la priorité sur `.env` et ne sera pas commité dans Git.

## Utilisation dans le code

### Accéder aux feature flags dans un composant

```typescript
import { useFeatureFlags } from '../contexts/FeatureFlagsContext';

const MyComponent = () => {
  const { enableDashboard, enableAudit, enableReports, enableCopilot } = useFeatureFlags();

  return (
    <div>
      {enableDashboard && <DashboardLink />}
      {enableReports && <ReportsLink />}
    </div>
  );
};
```

### Conditional rendering

```typescript
{enableDashboard && (
  <Route path="dashboard" element={<Dashboard />} />
)}
```

## Comportement de la navigation

### Redirection par défaut

Lorsqu'un utilisateur accède à `/app`, il est automatiquement redirigé vers la première feature activée dans cet ordre de priorité :

1. Reports (`/app/reports`)
2. Dashboard (`/app/dashboard`)
3. Audit (`/app/audit`)
4. Copilot (`/app/copilot`)
5. Settings (`/app/settings`) - Toujours disponible comme fallback

### Liens de navigation

Les liens dans la navigation (desktop et mobile) sont automatiquement filtrés selon les features activées. Seuls les liens des features activées sont affichés.

## Cas d'usage

### Focus sur les rapports Google Ads

Configuration actuelle recommandée pour se concentrer uniquement sur la génération de rapports :

```bash
VITE_FEATURE_DASHBOARD=false
VITE_FEATURE_AUDIT=false
VITE_FEATURE_REPORTS=true
VITE_FEATURE_COPILOT=true
```

### Développement complet

Pour activer toutes les features pendant le développement :

```bash
VITE_FEATURE_DASHBOARD=true
VITE_FEATURE_AUDIT=true
VITE_FEATURE_REPORTS=true
VITE_FEATURE_COPILOT=true
```

### Tests A/B

Créez différents fichiers d'environnement pour tester différentes configurations :

```bash
# .env.variant-a
VITE_FEATURE_DASHBOARD=true
VITE_FEATURE_REPORTS=false

# .env.variant-b
VITE_FEATURE_DASHBOARD=false
VITE_FEATURE_REPORTS=true
```

## Limitations

### Accès direct par URL

⚠️ **Note importante** : Les routes désactivées ne sont pas affichées dans la navigation, mais elles restent techniquement accessibles si quelqu'un connaît l'URL directe (par exemple `/app/dashboard`).

Si vous avez besoin de bloquer complètement l'accès à une route, vous devrez ajouter une vérification dans le composant lui-même :

```typescript
const Dashboard = () => {
  const { enableDashboard } = useFeatureFlags();
  
  if (!enableDashboard) {
    return <Navigate to="/app/reports" replace />;
  }
  
  return <div>Dashboard content</div>;
};
```

## Dépannage

### Les changements ne sont pas pris en compte

1. Vérifiez que vous avez bien redémarré le serveur de développement
2. Vérifiez la syntaxe de votre fichier `.env` (pas d'espaces autour du `=`)
3. Vérifiez que le nom de la variable commence bien par `VITE_`
4. Videz le cache du navigateur (Cmd+Shift+R sur Mac, Ctrl+Shift+R sur Windows)

### Erreur "useFeatureFlags must be used within a FeatureFlagsProvider"

Cette erreur signifie que vous essayez d'utiliser le hook `useFeatureFlags()` en dehors du contexte du provider. Assurez-vous que votre composant est bien un enfant de `<FeatureFlagsProvider>` dans l'arbre des composants.

## Support

Pour toute question ou problème concernant les feature flags, consultez :
- Le code source : `src/contexts/FeatureFlagsContext.tsx`
- L'implémentation dans `src/App.tsx`
- Les exemples dans `src/layouts/AppLayout.tsx` et `src/components/MobileMenu.tsx`
