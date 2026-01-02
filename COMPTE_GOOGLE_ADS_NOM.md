# Problème d'affichage du nom de compte Google Ads

## Symptôme

Les cartes de rapports, templates et schedules affichent l'ID du compte (`1740273292`) au lieu du nom du compte (`Sylkee`).

## Cause

L'API Google Ads retourne l'ID dans le champ `descriptive_name` au lieu du nom réel du compte.

Exemple de ce qui est retourné :
```javascript
{
  id: "1740273292",
  descriptive_name: "1740273292",  // ← Devrait être "Sylkee"
  currency_code: "EUR",
  timezone: "Europe/Paris"
}
```

## Solution appliquée

### 1. Logique simplifiée partout

Tous les composants utilisent maintenant la même logique que `ReportConfigModal` :

```typescript
const accountName = accounts.find(a => a.id === accountId)?.name || accountId || 'Non défini';
```

**Fichiers modifiés :**
- `src/components/reports/ReportCard/ReportCard.tsx`
- `src/components/templates/TemplateCard.tsx`

### 2. Backend amélioré

La fonction `getAccessibleCustomers` a été améliorée pour :
- Logger ce que Google Ads retourne vraiment
- Gérer le cas où `descriptive_name` est vide ou égal à l'ID
- Utiliser un fallback : `Compte Google Ads [ID]`

**Fichier modifié :** `functions/src/index.ts:225-282`

### 3. Cloud Functions déployées

```bash
firebase deploy --only functions:getAccessibleCustomers
```

## Resynchroniser les comptes

Pour forcer la mise à jour :

1. Va dans **Paramètres > Connexions**
2. Clique sur **Déconnecter** Google Ads
3. Clique sur **Connecter** pour reconnecter

## Vérifier dans Google Ads

Le nom du compte doit être configuré dans Google Ads :

1. Va sur [ads.google.com](https://ads.google.com)
2. Paramètres > Détails du compte
3. Vérifie que **"Nom du compte"** contient bien "Sylkee"

## Investigation possible

Si après resynchronisation le nom est toujours l'ID :

1. L'API Google Ads ne retourne pas le champ `descriptive_name`
2. Le compte n'a pas de nom configuré dans Google Ads
3. Il faut utiliser un autre champ de l'API (ex: `name` au lieu de `descriptive_name`)

**Pour déboguer :**
- Regarder les logs Firebase de `getAccessibleCustomers`
- Les logs afficheront exactement ce que Google Ads retourne
