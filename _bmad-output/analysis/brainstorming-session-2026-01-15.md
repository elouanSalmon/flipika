---
stepsCompleted: [1]
inputDocuments: ['_bmad-output/planning-artifacts/epics.md']
session_topic: 'Epic 12 - Pivot Architectural : CSS Editor → PowerPoint-Style Slide Editor'
session_goals: 'Explorer solutions techniques, frameworks existants, faisabilité React, et stratégie de stockage Firebase pour un éditeur de slides natif'
selected_approach: 'ai-recommended'
techniques_used: ['Cross-Pollination', 'Solution Matrix', 'Six Thinking Hats', 'Gamma Competitive Analysis']
ideas_generated: ['Craft.js framework', 'Google Slides API integration', 'Hybrid progressive approach', 'Freemium upsell model', 'AI-powered slide generation', 'TipTap/ProseMirror document-first architecture']
context_file: 'epics.md - Epic 12'
user_approval: 'approved'
final_decision: 'Hybrid Progressive V2 - Google Slides API MVP → TipTap Editor (document-first)'
decision_date: '2026-01-15'
---

# Brainstorming Session - Epic 12 Architectural Pivot

**Facilitateur:** Elou
**Date:** 2026-01-15

## Session Overview

**Topic:** Epic 12 - Pivot Architectural : CSS Editor → PowerPoint-Style Slide Editor

**Goals:** Explorer solutions techniques, frameworks existants, faisabilité React, et stratégie de stockage Firebase pour un éditeur de slides natif

### Context Guidance

**Contexte Initial (Epic 12 Original):**
L'Epic 12 était initialement conçu comme un système d'**export** :
- Story 12.1 : Service de génération PPTX (Backend)
- Story 12.2 : Intégration Google Slides API
- Story 12.3 : Mapping CSS → PowerPoint shapes

**Nouveau Pivot (Meeting Summary):**
Transformation complète de l'architecture :
- Remplacer l'éditeur CSS actuel par un éditeur de slides natif
- Fonctionnalité type Google Slides (SaaS online)
- Création et édition de slides directement dans l'interface
- Stockage des slides dans Firebase (format à définir)

### Questions Critiques à Résoudre

1. **Framework vs From Scratch** : Utiliser un framework existant ou construire le module de slides ?
2. **Projets Similaires** : Existe-t-il des projets open-source comparables ?
3. **Faisabilité React** : Comment implémenter un éditeur de slides en React ?
4. **Stockage Firebase** : Quel format de données pour stocker les slides ?

### Session Setup

## Phase 1 : Cross-Pollination - Recherche de Frameworks ✅

**Technique :** Cross-Pollination (Transfer solutions from completely different industries/domains)

**Objectif :** Explorer comment d'autres projets ont résolu le problème d'éditeur de slides en React.

### Domaines Explorés

#### 1. Éditeurs de Présentation Open-Source
- **Slidev** (Vue-based, architecture markdown-to-slides)
- **reveal.js** (HTML presentations, pas d'éditeur WYSIWYG)
- **Spectacle** (React-based presentations, code-driven)
- **Impress.js** (CSS3 transforms, pas d'éditeur)

**Insight :** Peu d'éditeurs WYSIWYG React natifs pour slides. Opportunité de différenciation.

#### 2. Canvas/Design Editors en React ⭐
- **Excalidraw** (whiteboard React, open-source, JSON serialization)
- **tldraw** (infinite canvas, React, excellent DX)
- **Fabric.js** + React wrappers (canvas manipulation)
- **Konva.js** + React-Konva (2D canvas, performant)

**Insight :** Architecture de manipulation d'objets + sérialisation JSON = transférable aux slides.

#### 3. Page Builders / No-Code Editors ⭐⭐⭐
- **Craft.js** (React page builder framework, MIT license)
- **GrapesJS** (page builder, drag-and-drop)
- **Builder.io** (visual editor, commercial)
- **Plasmic** (design tool, code generation)

**Insight :** **Craft.js** résout exactement le problème : composants React éditables + JSON + drag-and-drop.

#### 4. Diagramming / Flowchart Tools
- **React Flow** (node-based editor, excellent pour layouts)
- **Rete.js** (visual programming)

**Insight :** Gestion de layouts et connections, moins pertinent pour slides.

### Options Techniques Identifiées

#### **Option A : Craft.js + Custom Slide Components** ⭐ RECOMMANDÉ

**Framework :** [Craft.js](https://craft.js.org/)

**Avantages :**
- ✅ React-first (s'intègre parfaitement avec stack existante)
- ✅ JSON serialization native (parfait pour Firebase)
- ✅ Drag-and-drop intégré
- ✅ Composants personnalisables (créer des "Slide Types")
- ✅ Open-source (MIT License)
- ✅ Actif et documenté
- ✅ Headless (contrôle total sur le rendu)

**Architecture Proposée :**
```typescript
// Slide Component Example
const PerformanceSlide = ({ data }) => (
  <div className="slide">
    <h2>{data.title}</h2>
    <Chart data={data.metrics} />
  </div>
);

PerformanceSlide.craft = {
  props: { title: "Performance", metrics: {} },
  related: { settings: PerformanceSlideSettings }
};
```

**Stockage Firebase :** JSON natif de Craft.js → Firestore document

#### **Option B : React-Konva + Custom Editor**

**Framework :** [React-Konva](https://konvajs.org/docs/react/)

**Avantages :**
- ✅ Canvas 2D puissant
- ✅ Export vers images/PDF facile
- ✅ Contrôle total sur le rendu
- ✅ Performant pour animations

**Inconvénients :**
- ❌ Plus de code custom à écrire
- ❌ Pas de drag-and-drop intégré
- ❌ Courbe d'apprentissage

#### **Option C : From Scratch avec React DnD**

**Framework :** [React DnD](https://react-dnd.github.io/react-dnd/)

**Avantages :**
- ✅ Contrôle total
- ✅ Pas de dépendances lourdes

**Inconvénients :**
- ❌ Beaucoup de travail
- ❌ Réinventer la roue
- ❌ Maintenance à long terme

### Recommandation Forte : Craft.js

**Rationale :**
1. Résout 80% du problème out-of-the-box
2. Architecture éprouvée (utilisé en production)
3. JSON serialization = Firebase ready
4. Permet de se concentrer sur les "Slide Components" métier
5. Migration progressive possible (coexistence avec ancien système)

---

---

## Phase 1b : Deep Dive - Google Slides & Canva Architectures 🔍

**User Question :** "Comment fonctionnent Google Slide et Canva ? Pourrait-on simplement se connecter à Google Slides ?"

### 🎨 Canva Architecture (Research Findings)

**Stack Technique :**
- **Frontend :** React + TypeScript + MobX (state management)
- **Rendering :** SVG + HTML Canvas pour manipulation visuelle
- **Backend :** Java microservices (Spring Boot) + WebSockets (real-time collab)
- **Storage :** Redis (in-memory) + PostgreSQL (persistent)

**Insights Clés :**
1. ✅ **React-based** : Confirme que React est viable pour éditeur complexe
2. ✅ **Canvas/SVG** : Rendu visuel via technologies web standard
3. ✅ **WebSockets** : Collaboration temps réel (pas nécessaire pour Flipika v1)
4. ⚠️ **Complexité** : Architecture microservices lourde (overkill pour votre cas)

**Transférable à Flipika :**
- React + TypeScript ✅
- SVG pour rendu de slides ✅
- State management (MobX ou Redux) ✅

---

### 📊 Google Slides API - Analyse Approfondie

**Capacités de l'API :**
1. ✅ **Créer des présentations** : `presentations.create()`
2. ✅ **Modifier des slides** : `presentations.batchUpdate()` (ajouter texte, images, shapes, charts)
3. ✅ **Lire des présentations** : Récupérer structure et contenu
4. ❌ **Embed l'éditeur** : **IMPOSSIBLE** - Google ne permet pas d'intégrer l'éditeur dans un iframe

**Workflow avec Google Slides API :**
```typescript
// 1. Authentification OAuth 2.0
const auth = await googleOAuth.authorize();

// 2. Créer présentation
const presentation = await gapi.client.slides.presentations.create({
  title: "Rapport Client X - Janvier 2026"
});

// 3. Ajouter slides via batchUpdate
await gapi.client.slides.presentations.batchUpdate({
  presentationId: presentation.presentationId,
  requests: [
    { createSlide: { slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' } } },
    { insertText: { objectId: 'textBox1', text: 'Performance Overview' } }
  ]
});

// 4. Ouvrir dans Google Slides pour édition
window.open(`https://docs.google.com/presentation/d/${presentation.presentationId}/edit`);
```

**Limitations Critiques :**
1. ❌ **Pas d'éditeur embeddable** : Impossible d'intégrer l'UI Google Slides dans Flipika
2. ⚠️ **Complexité batchUpdate** : JSON verbeux et complexe pour créer slides
3. ⚠️ **Dépendance Google** : Utilisateurs DOIVENT avoir compte Google
4. ⚠️ **Pas de templates custom** : Impossible d'utiliser vos propres templates Flipika
5. ⚠️ **Édition externe** : Utilisateur redirigé vers Google Slides pour modifier

---

### 🆕 Option D : Google Slides API Integration (Headless)

**Concept :** Utiliser Flipika comme "générateur" de Google Slides, pas comme éditeur.

**Architecture :**
```
Flipika (React) → Configure Report → Google Slides API → Génère Presentation → Ouvre dans Google Slides
```

**Avantages :**
- ✅ **Pas d'éditeur à construire** : Google Slides fait le travail
- ✅ **Export natif** : PPTX/PDF déjà géré par Google
- ✅ **Collaboration Google** : Partage, commentaires, etc.
- ✅ **Moins de code** : Juste API calls, pas d'UI editor

**Inconvénients :**
- ❌ **Pas de contrôle UI** : Utilisateur quitte Flipika pour éditer
- ❌ **Dépendance Google** : Compte Google obligatoire
- ❌ **Complexité API** : batchUpdate JSON très verbeux
- ❌ **Pas de branding Flipika** : Édition dans Google Slides, pas Flipika
- ❌ **Perte de différenciation** : Flipika devient juste un "wrapper" API

---

## 📊 Comparaison des 4 Options

| Critère | **A: Craft.js** | **B: React-Konva** | **C: From Scratch** | **D: Google Slides API** |
|---------|-----------------|--------------------|--------------------|--------------------------|
| **Contrôle UI** | ✅ Total | ✅ Total | ✅ Total | ❌ Aucun (externe) |
| **Effort Dev** | 🟡 Moyen | 🔴 Élevé | 🔴 Très élevé | 🟢 Faible |
| **Branding** | ✅ 100% Flipika | ✅ 100% Flipika | ✅ 100% Flipika | ❌ Google Slides |
| **Export PPTX** | 🟡 À implémenter | 🟡 À implémenter | 🟡 À implémenter | ✅ Natif |
| **Stockage** | ✅ Firebase JSON | ✅ Firebase JSON | ✅ Firebase JSON | 🟡 Google Drive |
| **Dépendance** | 🟢 Aucune | 🟢 Aucune | 🟢 Aucune | 🔴 Compte Google |
| **Collaboration** | 🟡 À implémenter | 🟡 À implémenter | 🟡 À implémenter | ✅ Natif Google |
| **Différenciation** | ✅ Forte | ✅ Forte | ✅ Forte | ❌ Faible |
| **Courbe apprentissage** | 🟢 Faible | 🟡 Moyenne | 🔴 Élevée | 🟢 Faible |

---

## 🎯 Recommandation Finale Actualisée

### **Scénario 1 : Vous voulez un PRODUIT différencié** → **Option A : Craft.js** ⭐⭐⭐

**Pourquoi :**
- Contrôle total de l'UX (branding Flipika)
- Pas de dépendance externe
- Éditeur intégré dans votre app
- Différenciation forte vs concurrents

**Effort :** Moyen (framework fait 80% du travail)

---

### **Scénario 2 : Vous voulez un MVP RAPIDE** → **Option D : Google Slides API** ⭐⭐

**Pourquoi :**
- Développement rapide (juste API calls)
- Export PPTX/PDF gratuit
- Collaboration native

**Compromis :**
- Utilisateur quitte Flipika pour éditer
- Perte de différenciation
- Dépendance Google

---

### **Scénario 3 : Vous voulez le MEILLEUR des deux mondes** → **Hybride** ⭐⭐⭐⭐

**Architecture Hybride :**
1. **Phase 1 (MVP)** : Google Slides API pour générer rapidement
2. **Phase 2 (Différenciation)** : Craft.js pour éditeur intégré
3. **Coexistence** : Offrir les deux options aux utilisateurs

**Workflow :**
```
Flipika → [Choix utilisateur]
  ├─ "Quick Export" → Google Slides API → Ouvre dans Google Slides
  └─ "Advanced Editor" → Craft.js → Édition dans Flipika → Export PPTX custom
```

**Avantages :**
- ✅ MVP rapide avec Google Slides API
- ✅ Différenciation progressive avec Craft.js
- ✅ Flexibilité pour utilisateurs

---

---

## Phase 2 : Solution Matrix - Validation Systématique ✅

**Technique :** Solution Matrix (Systematic grid of problem variables and solution approaches)

**Objectif :** Valider les options contre vos critères de décision.

### Matrice de Décision

| Critère (Poids) | **A: Craft.js** | **B: React-Konva** | **C: From Scratch** | **D: Google Slides API** | **Hybride** |
|------------------|-----------------|--------------------|--------------------|--------------------------|-------------|
| **Time to MVP (40%)** | 🟡 3/5 (2-3 mois) | 🔴 1/5 (4-6 mois) | 🔴 0/5 (6+ mois) | 🟢 5/5 (2-4 semaines) | 🟢 4/5 (1 mois) |
| **Contrôle UX (30%)** | 🟢 5/5 | 🟢 5/5 | 🟢 5/5 | 🔴 0/5 | 🟡 3/5 (progressif) |
| **Maintenance (15%)** | 🟢 4/5 | 🟡 3/5 | 🔴 1/5 | 🟢 5/5 | 🟡 3/5 |
| **Différenciation (15%)** | 🟢 5/5 | 🟢 5/5 | 🟢 5/5 | 🔴 1/5 | 🟢 4/5 |
| **SCORE TOTAL** | **4.0/5** | **3.2/5** | **2.7/5** | **3.1/5** | **3.7/5** |

### Analyse des Résultats

**🥇 Option A : Craft.js (4.0/5)**
- **Forces :** Équilibre parfait entre rapidité et contrôle
- **Faiblesses :** Courbe d'apprentissage du framework
- **Verdict :** Meilleur choix pour produit différencié

**🥈 Option Hybride (3.7/5)**
- **Forces :** MVP rapide + migration progressive
- **Faiblesses :** Complexité de maintenir 2 systèmes
- **Verdict :** Meilleur choix pour réduire risque

**🥉 Option B : React-Konva (3.2/5)**
- **Forces :** Contrôle total, performant
- **Faiblesses :** Beaucoup de code custom
- **Verdict :** Overkill pour votre cas

**Option D : Google Slides API (3.1/5)**
- **Forces :** MVP ultra-rapide
- **Faiblesses :** Perte de différenciation
- **Verdict :** Bon pour tester marché, pas pour produit final

**Option C : From Scratch (2.7/5)**
- **Verdict :** ❌ Déconseillé (réinventer la roue)

---

## Phase 3 : Six Thinking Hats - Validation Stratégique ✅

**Technique :** Six Thinking Hats (Explore problems through six distinct perspectives)

**Objectif :** Valider la stratégie de migration sous tous les angles.

### 🎩 Chapeau Blanc (Faits & Données)

**Faits Objectifs :**
- Flipika n'a **aucun utilisateur actuel** → Aucune contrainte de compatibilité
- Stack actuelle : React + Firebase + Vite
- Epic 12 original prévoyait "export PPTX", pas "éditeur complet"
- Craft.js : 7.8k ⭐ GitHub, MIT License, actif
- Google Slides API : Mature, stable, documentée

**Données Techniques :**
- Craft.js bundle size : ~50kb gzipped
- Google Slides API : Gratuit (quotas généreux)
- Temps estimé Craft.js MVP : 2-3 mois
- Temps estimé Google Slides API : 2-4 semaines

---

### 💛 Chapeau Jaune (Bénéfices & Opportunités)

**Approche Hybride - Bénéfices :**

**Phase 1 : Google Slides API (MVP)**
- ✅ **Validation marché rapide** : Tester l'appétit pour slides vs PDF
- ✅ **Revenus précoces** : Monétiser pendant développement Craft.js
- ✅ **Feedback utilisateurs** : Comprendre besoins réels avant investir
- ✅ **Export PPTX gratuit** : Pas de coût de développement

**Phase 2 : Craft.js (Différenciation)**
- ✅ **Contrôle total UX** : Branding Flipika à 100%
- ✅ **Fonctionnalités custom** : Slides spécifiques Google Ads (impossible avec API Google)
- ✅ **Pas de dépendance** : Autonomie complète
- ✅ **Valeur ajoutée** : Justifie pricing premium

**Opportunité Unique :**
- Offrir **2 modes** : "Quick Export" (Google Slides) + "Pro Editor" (Craft.js)
- Upsell naturel : Utilisateurs commencent avec Quick, upgradent vers Pro

---

### 🖤 Chapeau Noir (Risques & Précautions)

**Risques Identifiés :**

**Google Slides API :**
- ⚠️ **Dépendance Google** : Changements API, quotas, pricing
- ⚠️ **UX fragmentée** : Utilisateur quitte Flipika pour éditer
- ⚠️ **Complexité batchUpdate** : JSON verbeux, difficile à maintenir
- ⚠️ **Pas de templates custom** : Limité aux layouts Google

**Craft.js :**
- ⚠️ **Courbe apprentissage** : Framework nouveau pour l'équipe
- ⚠️ **Export PPTX** : Complexe à implémenter (OpenXML)
- ⚠️ **Maintenance** : Dépendance à un framework tiers

**Approche Hybride :**
- ⚠️ **Complexité architecture** : Maintenir 2 systèmes en parallèle
- ⚠️ **Confusion utilisateur** : Quel mode choisir ?
- ⚠️ **Coût dev** : Double effort initial

**Mitigations :**
1. **Google Slides API** : Wrapper abstraction layer pour isoler dépendance
2. **Craft.js** : POC de 1 semaine avant commitment
3. **Hybride** : Documentation claire des use cases par mode

---

### 🟢 Chapeau Vert (Créativité & Alternatives)

**Idées Créatives :**

**1. "Progressive Enhancement" Strategy**
```
V1 (Semaine 1-4) : Google Slides API (Quick Export)
V2 (Mois 2-3)    : Craft.js (Basic Editor) + Migration tool
V3 (Mois 4+)     : Craft.js (Advanced) + Deprecate Google Slides
```

**2. "Freemium avec Upsell"**
- **Free Tier** : Google Slides API (3 rapports/mois)
- **Pro Tier** : Craft.js Editor (illimité + templates custom)

**3. "Template Marketplace"**
- Craft.js permet templates custom
- Créer marketplace de templates Flipika
- Revenus additionnels

**4. "AI-Powered Slide Generation"**
- Utiliser LLM pour générer contenu slides
- Craft.js pour rendu, AI pour contenu
- Différenciation majeure

---

### 🔵 Chapeau Bleu (Processus & Décision)

**Synthèse & Recommandation Finale :**

### 🎯 DÉCISION : Approche Hybride Progressive

**Roadmap Recommandée :**

**Phase 1 : MVP Google Slides API (Semaines 1-4)** 🚀
- Implémenter Google Slides API integration
- Workflow : Flipika → Configure → Generate Google Slides → Open in Google
- **Objectif :** Valider marché, générer revenus précoces

**Phase 2 : POC Craft.js (Semaine 5)** 🧪
- POC de 1 semaine : 1 slide type (Performance Overview)
- Valider faisabilité technique
- **Go/No-Go decision**

**Phase 3 : Craft.js MVP (Mois 2-3)** 🎨
- Développer éditeur Craft.js avec 4-5 slide types essentiels
- Coexistence avec Google Slides API
- Migration tool : Import Google Slides → Craft.js

**Phase 4 : Deprecation Google Slides (Mois 4+)** 📉
- Migrer utilisateurs vers Craft.js
- Garder Google Slides en "legacy mode" (maintenance only)

---

### ✅ Actions Immédiates

**Cette semaine :**
1. ✅ Créer nouvelle branche `feature/slides-editor`
2. ✅ Spike Google Slides API (1 jour) : Tester `presentations.create()` + `batchUpdate()`
3. ✅ Spike Craft.js (1 jour) : Tester drag-and-drop + JSON serialization

**Semaine prochaine :**
- Décision Go/No-Go basée sur spikes
- Si Go : Commencer Phase 1 (Google Slides API MVP)

---

## 📝 Session Summary & Next Steps

**Nous avons réussi à :**
1. ✅ Explorer 4 domaines techniques (Presentation editors, Canvas editors, Page builders, Diagramming)
2. ✅ Identifier 4 options viables (Craft.js, React-Konva, From Scratch, Google Slides API)
3. ✅ Analyser architectures Google Slides & Canva
4. ✅ Créer matrice de décision systématique
5. ✅ Valider stratégie sous 6 angles (Six Thinking Hats)
6. ✅ Définir roadmap hybride progressive

**Recommandation Finale :**
- 🎯 **Approche Hybride** : Google Slides API (MVP rapide) → Craft.js (différenciation)
- 🚀 **Actions immédiates** : Spikes techniques cette semaine
- 📊 **Décision** : Go/No-Go basée sur résultats spikes

**Prochaines Étapes :**
1. Valider cette approche avec vous
2. Créer tech specs détaillées pour Phase 1
3. Estimer effort et timeline précis
4. Mettre à jour Epic 12 dans `epics.md`

---

---

## 🔍 Phase 4 : Gamma Competitive Analysis (GAME CHANGER)

**User Request :** Benchmark de Gamma.app (concurrent direct)

### Découverte Majeure : Architecture Document-First

**Gamma utilise ProseMirror, PAS Canvas/Craft.js !**

#### Stack Technique Gamma
- **Frontend :** Next.js + React + Chakra UI
- **Éditeur :** **ProseMirror** (document engine)
- **Rendu :** DOM natif (pas de Canvas)
- **Collaboration :** WebSockets + probablement Y.js

#### Paradigme Différent

**Craft.js (Notre recommandation initiale) :**
```
Canvas-first : Layout → Contenu
┌─────────────────┐
│  Box at (x, y)  │ ← Position fixe
│  ├─ Text        │
│  └─ Chart       │
└─────────────────┘
```

**ProseMirror (Gamma) :**
```
Document-first : Contenu → Layout
Document
├─ Slide Node
│  ├─ Heading
│  ├─ Paragraph
│  └─ Chart (React component)
└─ Slide Node
```

### 🆕 Option E : TipTap/ProseMirror (Document-First)

**TipTap** = ProseMirror avec meilleure DX React

**Avantages pour Flipika :**
1. ✅ **AI-Friendly** : Structure sémantique (parfait pour Epic 11 - AI Analysis)
2. ✅ **Content-heavy** : Rapports Google Ads = 80% data, 20% design
3. ✅ **Collaboration** : Natif avec Y.js
4. ✅ **Accessibilité** : DOM natif
5. ✅ **Responsive** : Layout s'adapte automatiquement

**Inconvénients :**
1. ❌ **Courbe apprentissage** : ProseMirror est complexe
2. ❌ **Design limité** : Moins de contrôle pixel-perfect que Craft.js
3. ❌ **Export PPTX** : Toujours nécessite conversion

### Comparaison Révisée

| Critère | **Craft.js** | **TipTap/ProseMirror** | **Gamma** |
|---------|--------------|------------------------|-----------|
| **Paradigme** | Canvas-first | Document-first | Document-first |
| **Use Case** | Design tools | Content editors | Presentations |
| **AI Generation** | 🟡 Moyen | 🟢 Excellent | 🟢 Excellent |
| **Flipika Fit** | 🟡 Moyen | 🟢 Excellent | 🟢 Excellent |
| **Courbe apprentissage** | 🟡 Moyenne | 🔴 Élevée | N/A |

### 🎯 Question Critique

**Flipika est-il :**
- **A) Design-heavy** (comme Canva) → Craft.js ✅
- **B) Content-heavy** (comme Gamma) → TipTap ✅

**Analyse :**
- Rapports Google Ads = **Content-heavy** (métriques, charts, tableaux)
- Structure prévisible (Performance → Charts → Metrics)
- Epic 11 prévoit AI generation → **Document-first** est meilleur

**Verdict :** Flipika est **plus proche de Gamma** que de Canva.

---

## 🎯 Recommandation Finale RÉVISÉE

### ⭐ Nouvelle Recommandation : Hybride avec TipTap

**Phase 1 (MVP - 4 semaines) :** Google Slides API (inchangé)  
**Phase 2 (Différenciation - 6-8 semaines) :** **TipTap/ProseMirror** (au lieu de Craft.js)  
**Phase 3 (AI Generation) :** Epic 11 facilité par structure document

**Pourquoi TipTap au lieu de Craft.js :**
1. ✅ Mieux adapté pour contenu data-heavy
2. ✅ Prépare Epic 11 (AI Analysis)
3. ✅ Architecture prouvée par Gamma (concurrent à succès)
4. ✅ Collaboration native (si besoin futur)

**Trade-offs acceptables :**
- ❌ Courbe apprentissage plus élevée
- ❌ Moins de contrôle design pixel-perfect
- ✅ Mais Flipika n'a pas besoin de design ultra-custom

### Alternative : Garder Craft.js si...

**Restez sur Craft.js si :**
- Vous voulez contrôle design total
- Vous ne prévoyez PAS Epic 11 (AI) à court terme
- Vous préférez courbe apprentissage plus douce

---

## 📝 Session Summary & Next Steps

**Nous avons réussi à :**
1. ✅ Explorer 4 domaines techniques (Presentation editors, Canvas editors, Page builders, Diagramming)
2. ✅ Identifier 4 options viables (Craft.js, React-Konva, From Scratch, Google Slides API)
3. ✅ Analyser architectures Google Slides & Canva
4. ✅ **Benchmarker Gamma** (concurrent direct) → Découverte ProseMirror
5. ✅ Ajouter Option E (TipTap/ProseMirror)
6. ✅ Créer matrice de décision systématique
7. ✅ Valider stratégie sous 6 angles (Six Thinking Hats)
8. ✅ Définir roadmap hybride progressive

**Recommandation Finale RÉVISÉE :**
- 🎯 **Approche Hybride V2** : Google Slides API (MVP) → **TipTap/ProseMirror** (différenciation)
- 🚀 **Actions immédiates** : Spikes techniques (Google Slides API + TipTap + Craft.js)
- 📊 **Décision** : Document-first (TipTap) vs Canvas-first (Craft.js)

**Prochaines Étapes :**
1. **Spike TipTap** (1 jour) : POC avec custom slide extension
2. **Comparer** : Craft.js POC vs TipTap POC
3. **Décision finale** : Basée sur résultats des 2 POCs
4. Mettre à jour Epic 12 avec choix final

---

**Ampleur du Changement :**
Ce n'est plus un simple "export" mais une **refonte architecturale majeure** qui impacte :
- Le modèle de données (Widgets → Slides natifs)
- L'éditeur UI (CSS → Slide canvas)
- Le rendu (HTML/CSS → Slide rendering engine)
- L'export (Conversion → Export natif)
- Le stockage (JSON CSS → Slide format)

