# Epic 12 - Prochaines Actions

**Date:** 2026-01-15  
**Décision:** Approche Hybride Progressive V2  
**Roadmap:** Google Slides API → TipTap Editor

---

## ✅ Décision Validée

**Phase 1 (MVP - 4 semaines):** Google Slides API Integration  
**Phase 2 (Différenciation - 6-8 semaines):** TipTap/ProseMirror Editor

**Rationale:**
- Google Slides API = Validation marché rapide
- TipTap = Architecture document-first (comme Gamma)
- Préparation Epic 11 (AI Analysis)

---

## 🚀 Actions Immédiates (Cette Semaine)

### 1. Créer Branche Feature

```bash
git checkout -b feature/slides-editor
git push -u origin feature/slides-editor
```

### 2. Spike Google Slides API (1 jour)

**Objectif:** Valider faisabilité technique

**Tâches:**
- [ ] Setup Google Cloud Project
- [ ] Activer Google Slides API
- [ ] Configurer OAuth 2.0
- [ ] POC: Créer présentation vide
- [ ] POC: Ajouter 1 slide avec texte via `batchUpdate()`

**Critères de succès:**
- ✅ Authentification OAuth fonctionne
- ✅ Création de présentation réussie
- ✅ Ajout de slide avec contenu réussi

**Ressources:**
- Tech Spec: `tech-spec-epic12-phase1-google-slides.md`
- Google Slides API Docs: https://developers.google.com/slides/api

---

### 3. Spike TipTap (1 jour)

**Objectif:** Valider faisabilité et DX

**Tâches:**
- [ ] Installer TipTap: `npm install @tiptap/react @tiptap/starter-kit`
- [ ] POC: Éditeur basique avec StarterKit
- [ ] POC: Custom extension "Slide"
- [ ] POC: Sérialisation JSON → Firestore
- [ ] POC: Rendu d'une slide "Performance Overview"

**Critères de succès:**
- ✅ Éditeur TipTap fonctionne
- ✅ Custom extension créée
- ✅ JSON sérialisable/désérialisable
- ✅ Rendu slide avec données Google Ads

**Ressources:**
- TipTap Docs: https://tiptap.dev/
- Custom Extensions Guide: https://tiptap.dev/guide/custom-extensions

---

## 📋 Semaine Prochaine

### 4. Décision Go/No-Go

**Critères de décision:**

| Critère | Google Slides API | TipTap |
|---------|-------------------|--------|
| Faisabilité technique | ✅/❌ | ✅/❌ |
| Complexité | Faible/Moyenne/Élevée | Faible/Moyenne/Élevée |
| Time to MVP | X semaines | X semaines |
| Recommandation | Go/No-Go | Go/No-Go |

**Si Go:**
- Démarrer Phase 1 (Google Slides API)
- Planifier Phase 2 (TipTap)

**Si No-Go:**
- Réévaluer options (Craft.js, PDF only, etc.)

---

### 5. Phase 1 - Google Slides API (Si Go)

**Semaine 1:**
- [ ] Setup Google Cloud (OAuth, API)
- [ ] Service `GoogleSlidesService.ts`
- [ ] Component `ExportToGoogleSlidesButton.tsx`

**Semaine 2:**
- [ ] Mapping slide types → Google Slides layouts
- [ ] Génération slides Performance, Chart, Metrics
- [ ] Tests unitaires

**Semaine 3:**
- [ ] Firestore schema `googleSlidesExports`
- [ ] Error handling
- [ ] Loading states & UX

**Semaine 4:**
- [ ] Deploy staging
- [ ] User testing
- [ ] Deploy production
- [ ] Monitoring & metrics

---

## 📊 Success Metrics

**Phase 1 (Google Slides API):**
- ✅ 80% taux de succès export
- ✅ < 10 secondes temps moyen export
- ✅ < 5% taux d'erreur

**Phase 2 (TipTap):**
- ✅ 50% utilisateurs testent éditeur
- ✅ 30% préfèrent éditeur vs Quick Export

---

## 📚 Documentation

**Brainstorming Session:**
- `_bmad-output/analysis/brainstorming-session-2026-01-15.md`

**Tech Specs:**
- `_bmad-output/implementation-artifacts/tech-spec-epic12-phase1-google-slides.md`

**Competitive Analysis:**
- `_bmad-output/analysis/gamma-tech-analysis-2026-01-15.md`

**Epic 12:**
- `_bmad-output/planning-artifacts/epics.md` (Epic 12)

---

## 🎯 Objectif Final

**Vision Long-Terme:**
Flipika devient un éditeur de rapports Google Ads avec:
- ✅ Export rapide (Google Slides API)
- ✅ Éditeur intégré (TipTap)
- ✅ AI-powered insights (Epic 11)
- ✅ Collaboration (future)

**Différenciation vs Concurrents:**
- Architecture document-first (comme Gamma)
- Spécialisé Google Ads (vs générique)
- AI-native (Epic 11)

---

**Prêt à démarrer ! 🚀**
