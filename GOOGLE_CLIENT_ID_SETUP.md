# 🔑 Comment Obtenir votre Google Client ID

## Étape 1 : Accéder à Google Cloud Console

1. Allez sur : **https://console.cloud.google.com**
2. Connectez-vous avec votre compte Google

---

## Étape 2 : Créer ou Sélectionner un Projet

### Option A : Créer un nouveau projet
1. Cliquez sur le sélecteur de projet (en haut à gauche)
2. Cliquez sur **"Nouveau projet"**
3. Nom du projet : **Flipika** (ou autre nom)
4. Cliquez sur **"Créer"**

### Option B : Utiliser un projet existant
1. Sélectionnez votre projet existant dans la liste

---

## Étape 3 : Activer les APIs

1. Dans le menu de gauche, allez à **"APIs et services"** → **"Bibliothèque"**
2. Recherchez et activez :
   - ✅ **Google Slides API**
   - ✅ **Google Drive API**

---

## Étape 4 : Configurer l'Écran de Consentement OAuth

1. Allez à **"APIs et services"** → **"Écran de consentement OAuth"**
2. Sélectionnez **"Externe"** (ou "Interne" si G Workspace)
3. Cliquez sur **"Créer"**
4. Remplissez les informations :
   - **Nom de l'application** : Flipika
   - **E-mail d'assistance utilisateur** : votre@email.com
   - **Coordonnées du développeur** : votre@email.com
5. Cliquez sur **"Enregistrer et continuer"**
6. **Champs d'application** : Cliquez sur **"Enregistrer et continuer"** (on ajoutera les scopes plus tard)
7. **Utilisateurs test** : Ajoutez votre email si l'app est en mode "Test"
8. Cliquez sur **"Enregistrer et continuer"**

---

## Étape 5 : Créer les Identifiants OAuth 2.0 ⭐

1. Allez à **"APIs et services"** → **"Identifiants"**
2. Cliquez sur **"+ CRÉER DES IDENTIFIANTS"**
3. Sélectionnez **"ID client OAuth"**
4. Type d'application : **"Application Web"**
5. Nom : **Flipika Dev**
6. **Origines JavaScript autorisées** :
   - Cliquez sur **"+ Ajouter un URI"**
   - Ajoutez : `http://localhost:5173`
7. **URI de redirection autorisés** :
   - Cliquez sur **"+ Ajouter un URI"**
   - Ajoutez : `http://localhost:5173/auth/callback`
8. Cliquez sur **"CRÉER"**

---

## Étape 6 : Copier votre Client ID 🎯

Une popup s'affiche avec :
- **ID client** : `123456789-abcdefg.apps.googleusercontent.com`
- **Code secret du client** : (pas besoin pour l'instant)

**Copiez l'ID client !**

---

## Étape 7 : Ajouter à votre .env.development

1. Ouvrez le fichier `.env.development` dans Flipika
2. Ajoutez cette ligne :

```bash
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

**⚠️ Remplacez par votre vrai Client ID !**

---

## Étape 8 : Redémarrer le Serveur

```bash
# Arrêtez le serveur (Ctrl+C)
# Relancez-le
npm run dev
```

---

## ✅ Vérification

1. Ouvrez : `http://localhost:5173/app/spike/google-slides`
2. Vous devriez voir le dashboard (pas d'erreur "Configuration Required")
3. Cliquez sur **"Sign in with Google"**
4. La popup OAuth devrait s'ouvrir

---

## 🐛 Troubleshooting

### Erreur : "redirect_uri_mismatch"
**Solution :** Vérifiez que l'URI de redirection est exactement :
- `http://localhost:5173/auth/callback`

### Erreur : "Access blocked"
**Solution :** 
1. Vérifiez que l'écran de consentement OAuth est configuré
2. Ajoutez votre email aux utilisateurs test

### Le Client ID ne s'affiche pas
**Solution :**
1. Retournez à **"APIs et services"** → **"Identifiants"**
2. Cliquez sur votre ID client OAuth
3. Copiez l'ID client depuis cette page

---

## 📸 Capture d'Écran de Référence

Votre Client ID ressemble à :
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

C'est une longue chaîne avec :
- Des chiffres au début
- Un tiret `-`
- Des lettres/chiffres
- `.apps.googleusercontent.com` à la fin

---

**Besoin d'aide ?** Consultez la [documentation officielle](https://developers.google.com/identity/protocols/oauth2) ou demandez-moi ! 🚀
