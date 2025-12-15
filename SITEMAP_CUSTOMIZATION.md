# 🎯 Guide de Personnalisation du Sitemap

## Collections Firestore à Adapter

Vous devez modifier les noms de collections et champs dans **deux fichiers** :

### 📁 Fichiers à Modifier

1. [`functions/src/serveSitemap.ts`](file:///Users/elouan.salmon@ekwateur.fr/Documents/GitHub/flipika/functions/src/serveSitemap.ts)
2. [`functions/src/generateSitemap.ts`](file:///Users/elouan.salmon@ekwateur.fr/Documents/GitHub/flipika/functions/src/generateSitemap.ts)

---

## 🔧 Modifications Requises

### 1. Collection Users/Profiles

**Localisation :** Lignes ~53-73 dans `serveSitemap.ts`

**Code actuel :**
```typescript
const usersSnapshot = await db
  .collection("users")  // ← CHANGEZ ICI
  .select("uid", "updatedAt")  // ← CHANGEZ ICI
  .limit(1000)
  .get();

usersSnapshot.forEach((doc) => {
  const data = doc.data();
  const userId = data.uid || doc.id;  // ← CHANGEZ ICI
  const lastmod = data.updatedAt?.toDate?.()?.toISOString();  // ← CHANGEZ ICI

  links.push({
    url: `/profile/${userId}`,  // ← CHANGEZ ICI si votre route est différente
    changefreq: "weekly",
    priority: 0.6,
    ...(lastmod && {lastmod}),
  });
});
```

**Questions à vous poser :**
- ✅ Quel est le nom de votre collection d'utilisateurs ?
- ✅ Quel champ contient l'identifiant utilisateur ?
- ✅ Quel champ contient la date de mise à jour ?
- ✅ Quelle est votre route de profil ? (ex: `/user/:id`, `/profile/:username`)

---

### 2. Collection Articles/Posts

**Localisation :** Lignes ~87-113 dans `serveSitemap.ts`

**Code actuel :**
```typescript
const postsSnapshot = await db
  .collection("posts")  // ← CHANGEZ ICI
  .where("published", "==", true)  // ← CHANGEZ ICI si nécessaire
  .select("slug", "publishedAt", "updatedAt")  // ← CHANGEZ ICI
  .limit(1000)
  .get();

postsSnapshot.forEach((doc) => {
  const data = doc.data();
  const slug = data.slug || doc.id;  // ← CHANGEZ ICI
  const lastmod = (data.updatedAt || data.publishedAt)?.toDate?.()?.toISOString();

  links.push({
    url: `/article/${slug}`,  // ← CHANGEZ ICI si votre route est différente
    changefreq: "monthly",
    priority: 0.7,
    ...(lastmod && {lastmod}),
  });
});
```

**Questions à vous poser :**
- ✅ Quel est le nom de votre collection d'articles ?
- ✅ Avez-vous un champ pour filtrer les articles publiés ?
- ✅ Quel champ contient le slug/identifiant ?
- ✅ Quelle est votre route d'article ? (ex: `/blog/:slug`, `/post/:id`)

---

### 3. Ajouter d'Autres Collections (Optionnel)

Si vous avez d'autres types de pages dynamiques, ajoutez-les de la même manière :

```typescript
// Exemple : Collection de produits
try {
  const productsSnapshot = await db
    .collection("products")
    .where("active", "==", true)
    .select("slug", "updatedAt")
    .limit(1000)
    .get();

  productsSnapshot.forEach((doc) => {
    const data = doc.data();
    links.push({
      url: `/product/${data.slug}`,
      changefreq: "weekly",
      priority: 0.8,
      lastmod: data.updatedAt?.toDate?.()?.toISOString(),
    });
  });
} catch (error) {
  functions.logger.warn("Error fetching products:", error);
}
```

---

## 📝 Pages Statiques

**Localisation :** Lignes ~33-43 dans `serveSitemap.ts`

**Code actuel :**
```typescript
const staticPages = [
  {url: "/", changefreq: "daily", priority: 1.0},
  {url: "/login", changefreq: "monthly", priority: 0.5},
  {url: "/pricing", changefreq: "weekly", priority: 0.8},
  {url: "/app/dashboard", changefreq: "daily", priority: 0.7},
  {url: "/app/audit", changefreq: "weekly", priority: 0.7},
  {url: "/app/reports", changefreq: "weekly", priority: 0.7},
  {url: "/app/settings", changefreq: "monthly", priority: 0.5},
];
```

**À faire :**
- ✅ Ajoutez vos pages statiques
- ✅ Supprimez les pages qui n'existent pas
- ✅ Ajustez les priorités (0.0 à 1.0)

---

## 🚀 Après Modification

### 1. Recompiler
```bash
cd functions
npm run build
```

### 2. Tester localement
```bash
npm run serve
# Dans un autre terminal :
curl http://localhost:5001/flipika/us-central1/serveSitemap
```

### 3. Déployer
```bash
npm run deploy
# OU
firebase deploy --only functions:serveSitemap,functions:generateSitemap
```

### 4. Vérifier
```bash
curl https://flipika.com/sitemap.xml
```

---

## ⚠️ Points d'Attention

### Limites Firestore

- **Limite actuelle :** 1000 documents par collection
- **Si vous avez plus :** Augmentez la limite ou utilisez la pagination (déjà implémentée dans `generateSitemap.ts`)

### Performance

- **Timeout :** 60 secondes pour `serveSitemap`
- **Si timeout :** Réduisez le nombre de documents ou optimisez les requêtes

### Sécurité

- **Données sensibles :** Ne pas inclure d'URLs privées
- **Filtrage :** Utilisez `.where()` pour exclure les contenus non publiés

---

## 📞 Besoin d'Aide ?

Si vous avez des questions sur la personnalisation :

1. Vérifiez les logs : `firebase functions:log`
2. Testez avec les émulateurs locaux
3. Vérifiez la structure de vos collections Firestore

---

## ✅ Checklist de Personnalisation

- [ ] Modifier le nom de la collection users
- [ ] Modifier les champs de la collection users
- [ ] Modifier la route des profils
- [ ] Modifier le nom de la collection posts/articles
- [ ] Modifier les champs de la collection posts
- [ ] Modifier la route des articles
- [ ] Ajouter d'autres collections si nécessaire
- [ ] Ajuster les pages statiques
- [ ] Tester localement
- [ ] Déployer en production
- [ ] Vérifier l'accès au sitemap
- [ ] Soumettre à Google Search Console
