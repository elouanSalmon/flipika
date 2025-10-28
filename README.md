# 🚀 Flipika - Landing Page

Une landing page moderne et élégante inspirée de Madgicx, construite avec React, TypeScript, et un design system glassmorphism sombre pour 2025.

## ✨ Fonctionnalités

- 🎨 **Design Glassmorphism** - Interface moderne avec effets de verre
- 🌙 **Thème Sombre** - Design system optimisé pour 2025
- ⚡ **Animations Fluides** - Powered by Framer Motion
- 📧 **Collecte d'Emails** - Intégration Firebase Firestore
- 📱 **Responsive Design** - Optimisé pour tous les appareils
- 🔥 **Firebase Hosting** - Déploiement rapide et sécurisé
- ⚡ **Vite + React** - Performance optimale

## 🛠️ Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: CSS3 avec variables personnalisées
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore, Hosting)
- **Build**: Vite avec optimisations

## 🚀 Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd ads
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Firebase**
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos clés Firebase
# VITE_FIREBASE_API_KEY=your-api-key
# VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# etc...
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

## 🔧 Configuration Firebase

### 1. Créer un projet Firebase
1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Créer un nouveau projet
3. Activer Firestore Database
4. Activer Firebase Hosting

### 2. Configurer les variables d'environnement
Créer un fichier `.env` à la racine du projet :
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Initialiser Firebase CLI
```bash
# Se connecter à Firebase
npm run firebase:login

# Initialiser le projet (optionnel si firebase.json existe déjà)
npm run firebase:init
```

## 📦 Déploiement

### Déploiement complet (Hosting + Firestore)
```bash
npm run deploy
```

### Déploiement Hosting uniquement
```bash
npm run deploy:hosting
```

### Build local
```bash
npm run build
npm run preview
```

## 📁 Structure du Projet

```
src/
├── components/          # Composants React
│   ├── Header.tsx      # Navigation principale
│   ├── Hero.tsx        # Section héro
│   ├── Features.tsx    # Section fonctionnalités
│   ├── Testimonials.tsx # Témoignages clients
│   ├── EmailCapture.tsx # Formulaire d'inscription
│   └── Footer.tsx      # Pied de page
├── firebase/           # Configuration Firebase
│   ├── config.ts       # Configuration Firebase
│   └── emailService.ts # Service de collecte d'emails
├── App.tsx            # Composant principal
├── index.css          # Styles globaux et variables CSS
└── main.tsx           # Point d'entrée
```

## 🎨 Design System

Le projet utilise un design system basé sur des variables CSS :

- **Couleurs** : Palette sombre avec accents colorés
- **Glassmorphism** : Effets de transparence et flou
- **Typographie** : Font Inter avec hiérarchie claire
- **Animations** : Transitions fluides et micro-interactions
- **Responsive** : Mobile-first avec breakpoints optimisés

## 📧 Collecte d'Emails

Les emails sont automatiquement stockés dans Firestore avec :
- Validation côté client et serveur
- Prévention des doublons
- Horodatage automatique
- Métadonnées (source, user agent)

## 🔒 Sécurité

- Variables d'environnement pour les clés sensibles
- Règles Firestore configurées
- Validation des données côté client et serveur
- Headers de sécurité configurés

## 📈 Performance

- Code splitting automatique avec Vite
- Optimisation des images et assets
- Cache headers configurés
- Bundle size optimisé

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

Fait avec ❤️ par l'équipe Flipika
