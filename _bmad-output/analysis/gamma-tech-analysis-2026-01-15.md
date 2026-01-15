# Gamma.app - Analyse Technique Complète

**Date:** 2026-01-15  
**Analysé par:** Browser Subagent + Web Research  
**Source:** https://gamma.app

---

## 🎯 Découverte Majeure

Gamma utilise une approche **document-first** (ProseMirror) au lieu de **canvas-first** (Craft.js/Konva). C'est un changement de paradigme fondamental qui remet en question notre recommandation initiale.

---

## 🛠️ Stack Technique Détecté

### Frontend Framework
- **Next.js** (React framework)
- **React** (UI library)
- **Chakra UI** (Design system)
- **Emotion** (CSS-in-JS)

### Éditeur Core ⭐ CRITIQUE
- **ProseMirror** (Document editor engine)
- **DOM-based rendering** (PAS de Canvas, PAS de SVG pour contenu principal)
- **NodeViews** (Bridge ProseMirror ↔ React components)

### Collaboration & Real-time
- **WebSockets** (Real-time sync)
- Probablement **Y.js** ou système transform-based natif ProseMirror

### Animations
- **CSS Transitions**
- Probablement **Framer Motion** (commun avec Chakra UI)

---

## 🏗️ Architecture Insights

### Concept Clé : "Slide = Document Node"

```
Traditional Slide Editor (PowerPoint/Google Slides):
┌─────────────────────────────────┐
│  Canvas                         │
│  ┌───────────┐  ┌──────────┐  │
│  │ Text Box  │  │  Image   │  │
│  └───────────┘  └──────────┘  │
│  ┌─────────────────────────┐  │
│  │      Chart              │  │
│  └─────────────────────────┘  │
└─────────────────────────────────┘

Gamma's Approach (ProseMirror):
┌─────────────────────────────────┐
│  Document (ProseMirror)         │
│  ├─ Slide Node 1                │
│  │  ├─ Heading Node             │
│  │  ├─ Paragraph Node           │
│  │  └─ Chart Node (React)       │
│  ├─ Slide Node 2                │
│  │  ├─ Image Node               │
│  │  └─ Text Node                │
│  └─ Slide Node 3                │
└─────────────────────────────────┘
```

### Avantages de l'Approche Document

1. **Seamless Transitions**
   - Mode "Document" ↔ Mode "Présentation" = même data
   - Pas de conversion nécessaire

2. **AI-Friendly**
   - Structure hiérarchique claire (JSON)
   - Facile à générer/modifier par LLM
   - Contenu sémantique (pas juste des positions x/y)

3. **Accessibilité**
   - DOM natif = Screen readers fonctionnent
   - SEO-friendly (si publié en ligne)
   - Text selection native

4. **Responsive**
   - Layout s'adapte automatiquement
   - Pas de tailles fixes en pixels

5. **Export Web**
   - Déjà du HTML/CSS
   - Partage en ligne trivial

---

## 🆚 Comparaison : ProseMirror vs Craft.js

| Aspect | **ProseMirror (Gamma)** | **Craft.js (Notre recommandation)** |
|--------|-------------------------|--------------------------------------|
| **Paradigme** | Document-first (contenu → layout) | Canvas-first (layout → contenu) |
| **Rendu** | DOM natif | DOM (mais pensé comme canvas) |
| **Use Case** | Présentations riches en texte | Design tools, page builders |
| **AI Generation** | ✅ Excellent (structure sémantique) | 🟡 Moyen (positions arbitraires) |
| **Collaboration** | ✅ Natif (OT/CRDT) | 🟡 À implémenter |
| **Accessibilité** | ✅ Excellent | 🟡 Moyen |
| **Courbe apprentissage** | 🔴 Élevée (concepts complexes) | 🟢 Moyenne |
| **Export PPTX** | 🟡 Conversion nécessaire | 🟡 Conversion nécessaire |
| **Responsive** | ✅ Natif | 🟡 À gérer manuellement |

---

## 💡 Implications pour Flipika

### ❓ Question Critique

**Flipika est-il plus proche de :**
- **A) Canva/Figma** (Design-heavy, positioning précis) → Craft.js
- **B) Gamma/Notion** (Content-heavy, structure sémantique) → ProseMirror

### 🎯 Analyse du Use Case Flipika

**Rapports Google Ads = Content-heavy**
- 80% données (métriques, charts, tableaux)
- 20% design (branding, couleurs)
- Structure prévisible (Performance → Charts → Metrics)
- **Génération AI** potentielle (Epic 11)

**Verdict :** Flipika est **plus proche de Gamma** que de Canva.

---

## 🆕 Option E : ProseMirror/TipTap (Document-First)

### TipTap = ProseMirror + React DX

**TipTap** est un wrapper React-friendly de ProseMirror avec :
- API plus simple
- Extensions pré-construites
- Meilleure DX que ProseMirror raw

### Architecture Proposée

```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SlideExtension } from './extensions/SlideExtension';
import { ChartExtension } from './extensions/ChartExtension';

const editor = useEditor({
  extensions: [
    StarterKit,
    SlideExtension,
    ChartExtension,
    // ... custom extensions
  ],
  content: reportData,
});

<EditorContent editor={editor} />
```

### Custom Extensions pour Flipika

```typescript
// SlideExtension.ts
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SlideComponent } from './SlideComponent';

export const SlideExtension = Node.create({
  name: 'slide',
  group: 'block',
  content: 'block+',
  
  addNodeView() {
    return ReactNodeViewRenderer(SlideComponent);
  },
  
  addAttributes() {
    return {
      slideType: { default: 'performance' },
      theme: { default: null },
      data: { default: {} },
    };
  },
});
```

---

## 📊 Nouvelle Matrice de Décision

| Critère | **Google Slides API** | **Craft.js** | **TipTap/ProseMirror** |
|---------|----------------------|--------------|------------------------|
| **Time to MVP** | 🟢 4 semaines | 🟡 8-10 semaines | 🟡 6-8 semaines |
| **AI Generation** | 🔴 Difficile | 🟡 Moyen | 🟢 Excellent |
| **Content-heavy** | 🟢 Bon | 🟡 Moyen | 🟢 Excellent |
| **Design-heavy** | 🔴 Limité | 🟢 Excellent | 🟡 Moyen |
| **Collaboration** | 🟢 Natif Google | 🔴 À implémenter | 🟢 Natif (Y.js) |
| **Export PPTX** | 🟢 Natif | 🟡 Conversion | 🟡 Conversion |
| **Responsive** | 🔴 Non | 🟡 Manuel | 🟢 Natif |
| **Accessibilité** | 🟢 Google | 🟡 Moyen | 🟢 Excellent |
| **Courbe apprentissage** | 🟢 Faible | 🟡 Moyenne | 🔴 Élevée |

---

## 🎯 Recommandation Révisée

### Scénario 1 : Approche Hybride V2 (RECOMMANDÉ)

**Phase 1 (MVP - 4 semaines) :** Google Slides API  
**Phase 2 (Différenciation - 6-8 semaines) :** TipTap/ProseMirror  
**Phase 3 (Optimisation) :** Coexistence + AI Generation

**Rationale :**
- TipTap mieux adapté pour contenu data-heavy
- Prépare Epic 11 (AI Analysis)
- Architecture plus scalable long-terme

### Scénario 2 : TipTap Direct (Si budget/temps)

**Skip Google Slides API**, aller directement à TipTap si :
- Vous avez 2-3 mois devant vous
- Vous voulez différenciation immédiate
- Vous prévoyez AI generation (Epic 11)

---

## 🚀 Next Steps

**Actions Immédiates :**
1. **Spike TipTap** (1 jour) : POC avec custom slide extension
2. **Comparer** : Craft.js POC vs TipTap POC
3. **Décision** : Document-first (TipTap) vs Canvas-first (Craft.js)

**Questions à Résoudre :**
- Flipika a-t-il besoin de positioning pixel-perfect ?
- L'AI generation (Epic 11) est-elle prioritaire ?
- Collaboration temps-réel est-elle nécessaire ?

---

## 📚 Resources

- **TipTap Docs:** https://tiptap.dev/
- **ProseMirror Guide:** https://prosemirror.net/docs/guide/
- **Y.js (Collaboration):** https://docs.yjs.dev/
- **Gamma Analysis:** Browser inspection + DevTools
