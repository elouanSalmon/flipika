---
project_name: 'flipika'
user_name: 'Elou'
date: '2026-01-09'
sections_completed: ['all']
source: 'architecture.md'
---

# Project Context for AI Agents

_Règles critiques que les agents AI DOIVENT suivre pour flipika._

---

## Technology Stack & Versions

| Technology | Version | Usage |
|------------|---------|-------|
| React | 19.1.1 | UI Framework |
| TypeScript | 5.9.3 | Language |
| Vite | 7.1.7 | Build tool |
| TailwindCSS | 3.4.19 | Styling |
| Firebase | 12.4.0 | BaaS (Auth, Firestore, Functions) |
| Node.js | 22 | Backend runtime |
| i18next | 25.6.2 | Internationalization |
| html2pdf.js | 0.12.1 | PDF generation |
| react-hot-toast | 2.6.0 | Notifications |

---

## Critical Implementation Rules

### Naming Conventions

- **Variables/Functions**: `camelCase` → `clientData`, `getClientById`
- **Components**: `PascalCase` → `PreFlightModal.tsx`
- **Hooks**: `use` + `PascalCase` → `usePreFlight`
- **Types**: `PascalCase` + suffix → `ClientType`, `PresetConfig`
- **Constants**: `SCREAMING_SNAKE` → `MAX_REPORT_PAGES`
- **Firestore collections**: `camelCase` pluriel → `clients`, `presets`

### Error Handling (CRITICAL)

```typescript
// ✅ TOUJOURS utiliser react-hot-toast
import toast from 'react-hot-toast';
toast.error("Message d'erreur");
toast.success("Succès");

// ❌ JAMAIS alert() ou console.log pour l'utilisateur
```

### Loading States

```typescript
// Booléen simple
const [isLoading, setIsLoading] = useState(false);

// États multiples
type Status = 'idle' | 'loading' | 'success' | 'error';
```

### API Response Format (Firebase Functions)

```typescript
// SUCCESS
{ success: true, data: { /* payload */ } }

// ERROR
{ success: false, error: "Message lisible" }
```

### Async Pattern Standard

```typescript
const handleAction = async () => {
  setIsLoading(true);
  try {
    const result = await someService.doSomething();
    toast.success(t('success.message'));
  } catch (error) {
    toast.error(t('errors.generic'));
  } finally {
    setIsLoading(false);
  }
};
```

---

## Project Structure Rules

```
src/
├── components/    # Réutilisables (2x+ usage)
├── pages/         # 1 fichier = 1 route
├── services/      # Abstraction Firebase/API
├── hooks/         # Custom hooks
├── contexts/      # Global state (Theme, Auth)
├── types/         # TypeScript definitions
├── utils/         # Helpers purs
└── locales/       # i18n FR/EN
```

**Placement Rules:**
- Composant 1x → dossier de la page
- Composant 2x+ → `/components/`
- Logique métier → `/services/`
- Max 300 lignes par fichier

---

## Security Rules (CRITICAL)

### OAuth Google Ads
- **JAMAIS** exposer le refresh token côté client
- Toutes les requêtes Google Ads passent par Firebase Functions
- Token stocké **chiffré** dans Firestore, accessible Functions only

### XSS Protection
- Utiliser `DOMPurify` pour tout HTML dynamique (TipTap editor)

---

## i18n Rules

- Messages utilisateur **TOUJOURS** via `t('key')`
- Langue UI: Français par défaut
- Fichiers: `src/locales/fr/translation.json`

---

## Anti-Patterns (À ÉVITER)

```typescript
// ❌ snake_case
const client_id = "123";

// ❌ alert() pour erreurs
alert("Erreur!");

// ❌ console.log pour feedback user
console.log("Opération réussie");

// ❌ undefined dans JSON
{ field: undefined }

// ❌ Fetch Google Ads depuis le frontend
fetch('https://googleads.googleapis.com/...')
```

---

## PDF Generation Rules

- **Méthode unique**: html2pdf.js (HTML → Canvas → PDF)
- **Pas de fallback** - si échec, export down
- **Performance**: < 5 secondes (NFR-01)
- **Limite**: ~20 pages max

---

## Data Model Rules

- **Client ↔ Customer ID**: Binding 1:1 strict
- **Templates**: Par client (non partagés)
- **Historique rapports**: Conservation indéfinie
- **Collections user-scoped**: `users/{userId}/clients/{clientId}`

---

## Reference Documents

- **Architecture complète**: `_bmad-output/planning-artifacts/architecture.md`
- **PRD**: `_bmad-output/planning-artifacts/prd.md`
- **Documentation technique**: `docs/index.md`
