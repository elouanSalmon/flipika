# Plan : Table Bubble Menu - Boutons contextuels intelligents

## Objectif
Re-ajouter les boutons fusionner/diviser/en-tete avec une UX amelioree : icones claires, visibilite conditionnelle selon le contexte de selection.

## Changements

### 1. `TableBubbleMenu.tsx` - Refonte des groupes de boutons

**Structure des groupes :**

| Groupe | Boutons | Icone Lucide | Condition de visibilite |
|--------|---------|-------------|------------------------|
| Colonnes | Ajouter avant | `BetweenVerticalStart` | Toujours visible |
| | Ajouter apres | `BetweenVerticalEnd` | Toujours visible |
| | Supprimer | `Columns` (danger) | Toujours visible |
| Lignes | Ajouter avant | `BetweenHorizontalStart` | Toujours (disabled sur header) |
| | Ajouter apres | `BetweenHorizontalEnd` | Toujours visible |
| | Supprimer | `Rows` (danger) | Toujours (disabled si impossible) |
| Cellules | Fusionner | `TableCellsMerge` | **Visible uniquement si `editor.can().mergeCells()`** |
| | Diviser | `TableCellsSplit` | **Visible uniquement si `editor.can().splitCell()`** |
| En-tetes | Ligne d'en-tete | `PanelTop` | Toujours visible, **etat actif** si `tableHeader` actif |
| | Colonne d'en-tete | `PanelLeft` | Toujours visible, **etat actif** si header column actif |
| Supprimer | Supprimer tableau | `Trash2` (danger) | Toujours visible |

**Comportement dynamique :**
- Le groupe "Cellules" (fusionner/diviser) est **completement masque** si aucune des deux actions n'est disponible (cas par defaut : curseur dans une seule cellule non fusionnee)
- Il **apparait** automatiquement quand l'utilisateur selectionne plusieurs cellules (fusionner) ou est dans une cellule fusionnee (diviser)
- Les boutons en-tete utilisent un **etat actif** (meme style que Bold/Italic dans TextBubbleMenu : fond colore) pour indiquer si la ligne/colonne d'en-tete est activee

**Ajout d'une variante `active` au composant `TableButton` :**
- Nouvelle prop `isActive?: boolean`
- Style actif identique a TextBubbleMenu : `bg-primary-100 text-primary dark:bg-primary-900/30 dark:text-primary-light`

### 2. `reports.json` (FR + EN) - Ajout des cles i18n

Ajout sous `toolbar` :

**FR :**
```json
"tableMenu": {
  "addColumnBefore": "Ajouter une colonne avant",
  "addColumnAfter": "Ajouter une colonne apres",
  "deleteColumn": "Supprimer la colonne",
  "addRowBefore": "Ajouter une ligne avant",
  "addRowAfter": "Ajouter une ligne apres",
  "deleteRow": "Supprimer la ligne",
  "mergeCells": "Fusionner les cellules",
  "splitCell": "Diviser la cellule",
  "toggleHeaderRow": "Ligne d'en-tete",
  "toggleHeaderColumn": "Colonne d'en-tete",
  "deleteTable": "Supprimer le tableau"
}
```

**EN :**
```json
"tableMenu": {
  "addColumnBefore": "Add column before",
  "addColumnAfter": "Add column after",
  "deleteColumn": "Delete column",
  "addRowBefore": "Add row before",
  "addRowAfter": "Add row after",
  "deleteRow": "Delete row",
  "mergeCells": "Merge cells",
  "splitCell": "Split cell",
  "toggleHeaderRow": "Header row",
  "toggleHeaderColumn": "Header column",
  "deleteTable": "Delete table"
}
```

### 3. Pas de changement CSS necessaire
- Les styles pour `th` (header) existent deja
- Le z-index du bubble menu est deja gere
- `selectedCell:after` gere deja la surbrillance de selection multi-cellules

## Fichiers modifies
1. `src/components/editor/components/TableBubbleMenu.tsx`
2. `src/locales/fr/reports.json`
3. `src/locales/en/reports.json`

## Reactivite
Le `BubbleMenu` de TipTap re-render automatiquement a chaque changement de selection (`updateDelay: 0`). Les `editor.can().mergeCells()` et `editor.can().splitCell()` sont evalues a chaque render, donc les boutons apparaissent/disparaissent naturellement en suivant la selection.
