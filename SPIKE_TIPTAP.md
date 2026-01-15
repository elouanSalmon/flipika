# Spike: TipTap Editor Integration

**Date:** 2026-01-15  
**Durée estimée:** 1 jour  
**Objectif:** Valider la faisabilité technique de TipTap pour éditeur de slides

---

## 🎯 Objectifs du Spike

- [ ] Installer TipTap
- [ ] POC: Éditeur basique avec StarterKit
- [ ] POC: Custom extension "Slide"
- [ ] POC: Sérialisation JSON → Firestore
- [ ] POC: Rendu slide "Performance Overview" avec données
- [ ] Évaluer courbe d'apprentissage

---

## 📋 Checklist Setup

### 1. Installation Dépendances

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

---

### 2. POC 1: Éditeur Basique

**Fichier:** `src/spike/TipTapBasicEditor.tsx`

**Code:**
```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export const TipTapBasicEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World!</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    },
  });

  return (
    <div className="border rounded p-4">
      <EditorContent editor={editor} />
      <button onClick={() => console.log(editor?.getJSON())}>
        Log JSON
      </button>
    </div>
  );
};
```

**Critères de succès:**
- ✅ Éditeur s'affiche
- ✅ Texte éditable
- ✅ Formatage fonctionne (bold, italic, etc.)
- ✅ JSON sérialisable

---

## 🧪 POC 2: Custom Extension "Slide"

**Fichier:** `src/spike/extensions/SlideExtension.ts`

**Objectif:** Créer une extension custom pour représenter une "slide"

**Code:**
```typescript
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SlideComponent } from './SlideComponent';

export const SlideExtension = Node.create({
  name: 'slide',
  
  group: 'block',
  
  content: 'block+',
  
  addAttributes() {
    return {
      slideType: {
        default: 'performance',
        parseHTML: element => element.getAttribute('data-slide-type'),
        renderHTML: attributes => ({
          'data-slide-type': attributes.slideType,
        }),
      },
      slideData: {
        default: {},
        parseHTML: element => JSON.parse(element.getAttribute('data-slide-data') || '{}'),
        renderHTML: attributes => ({
          'data-slide-data': JSON.stringify(attributes.slideData),
        }),
      },
    };
  },
  
  parseHTML() {
    return [{ tag: 'div[data-slide]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-slide': '' }), 0];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(SlideComponent);
  },
});
```

**Critères de succès:**
- ✅ Extension se charge sans erreur
- ✅ Slide insérée dans l'éditeur
- ✅ Attributs (slideType, slideData) fonctionnent
- ✅ React component rendu

---

## 🧪 POC 3: Slide Component React

**Fichier:** `src/spike/extensions/SlideComponent.tsx`

**Objectif:** Créer un composant React pour afficher une slide

**Code:**
```typescript
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';

export const SlideComponent = ({ node, updateAttributes }: any) => {
  const { slideType, slideData } = node.attrs;
  
  return (
    <NodeViewWrapper className="slide-wrapper border-2 border-blue-500 rounded-lg p-4 my-4">
      <div className="slide-header flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-blue-600">
          Slide: {slideType}
        </span>
        <select
          value={slideType}
          onChange={(e) => updateAttributes({ slideType: e.target.value })}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="performance">Performance</option>
          <option value="chart">Chart</option>
          <option value="metrics">Metrics</option>
        </select>
      </div>
      
      <div className="slide-content bg-white p-4 rounded">
        <NodeViewContent className="content" />
      </div>
      
      {slideData && (
        <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
          {JSON.stringify(slideData, null, 2)}
        </pre>
      )}
    </NodeViewWrapper>
  );
};
```

**Critères de succès:**
- ✅ Slide affichée avec border
- ✅ Type de slide modifiable
- ✅ Contenu éditable
- ✅ slideData affiché

---

## 🧪 POC 4: Performance Slide avec Données

**Fichier:** `src/spike/PerformanceSlideEditor.tsx`

**Objectif:** Créer une slide "Performance Overview" avec vraies données Google Ads

**Code:**
```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SlideExtension } from './extensions/SlideExtension';

export const PerformanceSlideEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      SlideExtension,
    ],
    content: {
      type: 'doc',
      content: [
        {
          type: 'slide',
          attrs: {
            slideType: 'performance',
            slideData: {
              cost: 5000,
              clicks: 1200,
              impressions: 50000,
              cpc: 4.17,
              ctr: 2.4,
            },
          },
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Performance Janvier 2026' }],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Analyse des performances du mois' }],
            },
          ],
        },
      ],
    },
  });

  const handleSave = () => {
    const json = editor?.getJSON();
    console.log('Saving to Firestore:', json);
    // TODO: Save to Firestore
  };

  return (
    <div>
      <EditorContent editor={editor} />
      <button onClick={handleSave} className="mt-4 btn-primary">
        Save to Firestore
      </button>
    </div>
  );
};
```

**Critères de succès:**
- ✅ Slide Performance affichée
- ✅ Données Google Ads visibles
- ✅ Titre et contenu éditables
- ✅ JSON sérialisable pour Firestore

---

## 🧪 POC 5: Firestore Integration

**Fichier:** `src/spike/FirestoreTipTapTest.tsx`

**Objectif:** Sauvegarder et charger le contenu TipTap depuis Firestore

**Code:**
```typescript
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const saveToFirestore = async (reportId: string, content: any) => {
  await setDoc(doc(db, 'reports', reportId), {
    tiptapContent: content,
    updatedAt: new Date(),
  });
};

const loadFromFirestore = async (reportId: string) => {
  const docSnap = await getDoc(doc(db, 'reports', reportId));
  if (docSnap.exists()) {
    return docSnap.data().tiptapContent;
  }
  return null;
};
```

**Critères de succès:**
- ✅ Contenu sauvegardé dans Firestore
- ✅ Contenu rechargé correctement
- ✅ Édition persistée

---

## 📊 Résultats Attendus

### Questions à Répondre

1. **Complexité:**
   - Quelle est la courbe d'apprentissage ?
   - Combien de temps pour créer une custom extension ?

2. **Performance:**
   - L'éditeur est-il fluide avec 10+ slides ?
   - Temps de sérialisation JSON ?

3. **Limitations:**
   - Peut-on intégrer des charts (Recharts) ?
   - Drag-and-drop de slides fonctionne ?

4. **DX (Developer Experience):**
   - Documentation claire ?
   - Debugging facile ?

---

## 📝 Documentation des Résultats

### ✅ Ce qui fonctionne bien

- ...

### ⚠️ Limitations découvertes

- ...

### 🔴 Blockers potentiels

- ...

### 💡 Recommandations

- ...

---

## 🆚 Comparaison avec Craft.js

| Aspect | TipTap | Craft.js |
|--------|--------|----------|
| Setup time | ... | ... |
| Complexité | ... | ... |
| Fit Flipika | ... | ... |
| Recommandation | ✅/❌ | ✅/❌ |

---

## 🎯 Décision Go/No-Go

**Critères:**
- [ ] Custom extension créée en < 2h
- [ ] Performance acceptable (10+ slides)
- [ ] Firestore integration fonctionne
- [ ] DX acceptable (documentation, debugging)

**Décision:** ✅ Go / ❌ No-Go

**Justification:**
...

---

## 📚 Ressources

- [TipTap Documentation](https://tiptap.dev/)
- [Custom Extensions Guide](https://tiptap.dev/guide/custom-extensions)
- [NodeViews Guide](https://tiptap.dev/guide/node-views)
- [React Integration](https://tiptap.dev/installation/react)
