# ✅ Réutiliser votre Client ID Google Ads Existant

**Bonne nouvelle !** Vous n'avez PAS besoin de créer un nouveau Client ID. Vous pouvez utiliser celui que vous avez déjà pour Google Ads.

---

## 🔑 Étapes Simplifiées

### 1. Trouvez votre Client ID existant

Votre Client ID Google Ads est déjà configuré dans vos Firebase Functions.

**Où le trouver ?**
- Google Cloud Console → APIs et services → Identifiants
- Cherchez l'ID client OAuth 2.0 que vous utilisez pour Google Ads

### 2. Ajoutez les Scopes Google Slides

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Sélectionnez votre projet (celui avec Google Ads)
3. Allez à **"APIs et services"** → **"Bibliothèque"**
4. Recherchez et **activez** :
   - ✅ **Google Slides API**
   - ✅ **Google Drive API** (si pas déjà activé)

### 3. Mettez à jour `.env.development`

Remplacez :
```bash
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

Par votre vrai Client ID (le même que `GOOGLE_ADS_CLIENT_ID`) :
```bash
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

### 4. Vérifiez les Origines Autorisées

Dans Google Cloud Console → Identifiants → votre OAuth Client ID :

**Origines JavaScript autorisées** devrait déjà inclure :
- ✅ `http://localhost:5173` (dev)
- ✅ `https://flipika-dev.web.app` (staging)
- ✅ `https://flipika.com` (prod)

**URI de redirection autorisés** devrait déjà inclure :
- ✅ `http://localhost:5173/oauth/callback`

---

## 🎯 Pourquoi ça fonctionne ?

**Un seul Client ID peut avoir plusieurs scopes :**
- ✅ Google Ads (`https://www.googleapis.com/auth/adwords`)
- ✅ Google Slides (`https://www.googleapis.com/auth/presentations`)
- ✅ Google Drive (`https://www.googleapis.com/auth/drive.file`)

Quand l'utilisateur se connecte, il autorise **tous les scopes** en une seule fois.

---

## 🚀 Redémarrez le Serveur

```bash
# Ctrl+C pour arrêter
npm run dev
```

Puis testez : **http://localhost:5173/app/spike/google-slides**

---

## ⚠️ Note Importante

Lors du premier test, Google vous demandera d'autoriser les **nouveaux scopes** (Google Slides + Drive) en plus de Google Ads. C'est normal !

L'utilisateur verra :
- ✅ Accès à Google Ads (déjà autorisé)
- 🆕 Accès à Google Slides (nouveau)
- 🆕 Accès à Google Drive (nouveau)

---

**C'est tout ! Pas besoin de créer un nouveau Client ID.** 🎉
