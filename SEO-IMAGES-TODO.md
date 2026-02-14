# Images requises pour le SEO

## og-image.png (PRIORITAIRE)
- **Emplacement** : `public/og-image.png`
- **Dimensions** : 1200x630px (ratio 1.91:1)
- **Format** : PNG
- **Usage** : Image affichee lors du partage du site sur les reseaux sociaux (Facebook, Twitter/X, LinkedIn, Slack, Discord, etc.)
- **Contenu suggere** :
  - Logo Flipika bien visible
  - Tagline : "Google Ads Reports in 2 Minutes"
  - Apercu d'un rapport/dashboard en arriere-plan
  - Couleur de fond : bleu primaire (#1963d5) ou gradient
  - Texte lisible meme en miniature
- **Referencee dans** : `index.html` (meta og:image, twitter:image), `src/components/SEO.tsx` (fallback og-image)

## logo.png (SECONDAIRE)
- **Emplacement** : `public/logo.png`
- **Dimensions** : 512x512px (carre)
- **Format** : PNG avec fond transparent
- **Usage** : Referencee dans le schema JSON-LD Organization et Product
- **Note** : Actuellement le schema utilise `favicon.svg` en fallback, mais un PNG carre est prefere par Google pour les structured data
- **Referencee dans** : `src/components/alternatives/ComparisonJSONLD.tsx` (logo.png), `src/pages/Landing.tsx` (favicon.svg en attendant)
