# Epic 12: Slides Editor - Feature Branch

**Branche:** `feature/slides-editor`  
**Date:** 2026-01-15  
**Statut:** Spikes en cours

---

## 🎯 Objectif

Transformer Flipika d'un système d'export PDF vers un éditeur de slides avec approche hybride progressive.

**Approche validée:**
- **Phase 1 (4 semaines):** Google Slides API (MVP)
- **Phase 2 (6-8 semaines):** TipTap Editor (document-first)

---

## 📋 Spikes à Réaliser Cette Semaine

### 1. Google Slides API (1 jour)

**Documentation:** `SPIKE_GOOGLE_SLIDES.md`

**Objectifs:**
- ✅ Setup OAuth 2.0
- ✅ Créer présentation via API
- ✅ Ajouter slides avec `batchUpdate()`
- ✅ Valider faisabilité technique

**Commandes:**
```bash
# Installer dépendances
npm install @react-oauth/google gapi-script

# Lancer spike
npm run dev
# Ouvrir http://localhost:5173/spike/google-slides
```

---

### 2. TipTap Editor (1 jour)

**Documentation:** `SPIKE_TIPTAP.md`

**Objectifs:**
- ✅ Setup TipTap
- ✅ Custom extension "Slide"
- ✅ Sérialisation Firestore
- ✅ Valider DX et performance

**Commandes:**
```bash
# Installer dépendances
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder

# Lancer spike
npm run dev
# Ouvrir http://localhost:5173/spike/tiptap
```

---

## 📊 Critères de Décision

### Google Slides API

**Go si:**
- ✅ OAuth fluide
- ✅ Création < 5 secondes
- ✅ batchUpdate JSON raisonnable
- ✅ Pas de blockers majeurs

### TipTap

**Go si:**
- ✅ Custom extension < 2h
- ✅ Performance OK (10+ slides)
- ✅ Firestore integration fonctionne
- ✅ DX acceptable

---

## 📁 Structure des Fichiers

```
flipika/
├── SPIKE_GOOGLE_SLIDES.md    # Documentation spike Google Slides
├── SPIKE_TIPTAP.md            # Documentation spike TipTap
├── src/
│   └── spike/                 # Dossier pour POCs
│       ├── GoogleAuthTest.tsx
│       ├── CreatePresentationTest.tsx
│       ├── TipTapBasicEditor.tsx
│       ├── PerformanceSlideEditor.tsx
│       └── extensions/
│           ├── SlideExtension.ts
│           └── SlideComponent.tsx
└── _bmad-output/
    ├── analysis/
    │   ├── brainstorming-session-2026-01-15.md
    │   └── gamma-tech-analysis-2026-01-15.md
    └── implementation-artifacts/
        ├── tech-spec-epic12-phase1-google-slides.md
        └── NEXT_STEPS.md
```

---

## 🚀 Prochaines Étapes

**Aujourd'hui:**
1. Lire `SPIKE_GOOGLE_SLIDES.md`
2. Réaliser POCs Google Slides API
3. Documenter résultats

**Demain:**
1. Lire `SPIKE_TIPTAP.md`
2. Réaliser POCs TipTap
3. Documenter résultats

**Après-demain:**
1. Comparer résultats des 2 spikes
2. Décision Go/No-Go
3. Démarrer Phase 1 si Go

---

## 📚 Documentation Complète

- **Brainstorming Session:** `_bmad-output/analysis/brainstorming-session-2026-01-15.md`
- **Analyse Gamma:** `_bmad-output/analysis/gamma-tech-analysis-2026-01-15.md`
- **Tech Spec Phase 1:** `_bmad-output/implementation-artifacts/tech-spec-epic12-phase1-google-slides.md`
- **Next Steps:** `_bmad-output/implementation-artifacts/NEXT_STEPS.md`

---

## 🎯 Objectif Final

Créer un éditeur de rapports Google Ads avec:
- ✅ Export rapide (Google Slides API)
- ✅ Éditeur intégré (TipTap)
- ✅ Architecture document-first (comme Gamma)
- ✅ Préparation AI generation (Epic 11)

**Let's build! 🚀**
