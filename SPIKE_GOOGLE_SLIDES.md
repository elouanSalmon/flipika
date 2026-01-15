# Spike: Google Slides API Integration

**Date:** 2026-01-15  
**Durée estimée:** 1 jour  
**Objectif:** Valider la faisabilité technique de l'intégration Google Slides API

---

## 🎯 Objectifs du Spike

- [ ] Setup Google Cloud Project
- [ ] Activer Google Slides API
- [ ] Configurer OAuth 2.0
- [ ] POC: Créer une présentation vide
- [ ] POC: Ajouter une slide avec texte via `batchUpdate()`
- [ ] Documenter les limitations découvertes

---

## 📋 Checklist Setup

### 1. Google Cloud Console

- [ ] Créer projet "Flipika Slides" (ou utiliser existant)
- [ ] Activer Google Slides API
- [ ] Activer Google Drive API (pour stockage)
- [ ] Configurer OAuth Consent Screen
  - App name: Flipika
  - User support email
  - Developer contact
- [ ] Créer OAuth 2.0 Client ID (Web application)
  - Authorized JavaScript origins: `http://localhost:5173`
  - Authorized redirect URIs: `http://localhost:5173/auth/callback`

**Scopes requis:**
- `https://www.googleapis.com/auth/presentations`
- `https://www.googleapis.com/auth/drive.file`

---

### 2. Installation Dépendances

```bash
npm install @react-oauth/google gapi-script
```

---

### 3. Configuration Environnement

Ajouter à `.env.development`:
```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

---

## 🧪 POC 1: Authentification OAuth

**Fichier:** `src/spike/GoogleAuthTest.tsx`

**Objectif:** Tester le flow OAuth et obtenir un access token

**Critères de succès:**
- ✅ Bouton "Sign in with Google" fonctionne
- ✅ Popup OAuth s'ouvre
- ✅ Access token reçu et affiché dans console
- ✅ Token stocké dans localStorage

---

## 🧪 POC 2: Créer Présentation Vide

**Fichier:** `src/spike/CreatePresentationTest.tsx`

**Objectif:** Utiliser l'API pour créer une présentation vide

**Code à tester:**
```typescript
const createPresentation = async (accessToken: string) => {
  const response = await fetch(
    'https://slides.googleapis.com/v1/presentations',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Flipika - ' + new Date().toISOString()
      })
    }
  );
  
  const data = await response.json();
  console.log('Presentation created:', data);
  return data.presentationId;
};
```

**Critères de succès:**
- ✅ Présentation créée dans Google Drive
- ✅ `presentationId` retourné
- ✅ Lien vers présentation fonctionne

---

## 🧪 POC 3: Ajouter Slide avec Contenu

**Fichier:** `src/spike/AddSlideTest.tsx`

**Objectif:** Utiliser `batchUpdate` pour ajouter une slide avec titre et texte

**Code à tester:**
```typescript
const addSlide = async (presentationId: string, accessToken: string) => {
  const requests = [
    {
      createSlide: {
        slideLayoutReference: {
          predefinedLayout: 'TITLE_AND_BODY'
        }
      }
    }
  ];
  
  const response = await fetch(
    `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests })
    }
  );
  
  return await response.json();
};
```

**Critères de succès:**
- ✅ Slide ajoutée à la présentation
- ✅ Layout "TITLE_AND_BODY" appliqué
- ✅ Contenu visible dans Google Slides

---

## 🧪 POC 4: Ajouter Texte et Données

**Objectif:** Insérer du texte dans les placeholders de la slide

**Code à tester:**
```typescript
const addText = async (presentationId: string, slideId: string, accessToken: string) => {
  const requests = [
    {
      insertText: {
        objectId: 'TITLE_PLACEHOLDER_ID', // À récupérer de la slide
        text: 'Performance Janvier 2026'
      }
    },
    {
      insertText: {
        objectId: 'BODY_PLACEHOLDER_ID',
        text: 'Coût: 5000€\nClics: 1200\nCPC: 4.17€'
      }
    }
  ];
  
  // ... batchUpdate
};
```

**Critères de succès:**
- ✅ Texte inséré dans titre
- ✅ Texte inséré dans body
- ✅ Formatage préservé

---

## 📊 Résultats Attendus

### Questions à Répondre

1. **Complexité batchUpdate:**
   - Quelle est la complexité du JSON pour créer une slide complète ?
   - Combien de requests pour une slide "Performance Overview" ?

2. **Limitations:**
   - Peut-on insérer des charts (Recharts) ?
   - Quelle est la qualité du rendu ?
   - Y a-t-il des rate limits ?

3. **Performance:**
   - Temps pour créer une présentation ?
   - Temps pour ajouter 5 slides ?

4. **UX:**
   - Le flow OAuth est-il fluide ?
   - La redirection vers Google Slides est-elle rapide ?

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

## 🎯 Décision Go/No-Go

**Critères:**
- [ ] Authentification OAuth fonctionne sans friction
- [ ] Création de présentation < 5 secondes
- [ ] batchUpdate JSON raisonnablement simple
- [ ] Pas de blockers majeurs découverts

**Décision:** ✅ Go / ❌ No-Go

**Justification:**
...

---

## 📚 Ressources

- [Google Slides API Reference](https://developers.google.com/slides/api/reference/rest)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [batchUpdate Examples](https://developers.google.com/slides/api/samples/presentations)
