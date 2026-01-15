# Epic 12 - Tech Spec: Google Slides API Integration (Phase 1)

**Epic:** Export Avancé (PPT/GSlides) - Phase 1: Google Slides API MVP  
**Date:** 2026-01-15  
**Author:** Brainstorming Session Output  
**Status:** Ready for Implementation

---

## 🎯 Objectif

Implémenter une intégration avec Google Slides API permettant de générer des présentations Google Slides à partir des rapports Flipika, comme MVP rapide avant le développement de l'éditeur Craft.js.

---

## 📋 User Stories Couvertes

### Story 12.1-API: Génération Google Slides via API

**As a** Flipika User,  
**I want to** generate a Google Slides presentation from my report configuration,  
**So that** I can quickly share editable presentations with my clients.

**Acceptance Criteria:**

**Given** I have configured a report with slides  
**When** I click "Export to Google Slides"  
**Then** A Google Slides presentation is created in my Google Drive  
**And** The presentation contains all configured slides with data  
**And** I am redirected to the Google Slides editor to make final edits  

---

## 🏗️ Architecture Technique

### Stack

- **Frontend:** React + TypeScript
- **API:** Google Slides API v1
- **Auth:** Google OAuth 2.0 (`@react-oauth/google`)
- **Storage:** Firestore (metadata only, presentation stored in Google Drive)

### Data Flow

```
User → Flipika Report Config → Google OAuth → Google Slides API
  ↓
presentations.create()
  ↓
presentations.batchUpdate() (add slides + content)
  ↓
Save presentation ID to Firestore
  ↓
Redirect to Google Slides editor
```

---

## 🔧 Implémentation

### 1. Google Cloud Setup

**Actions:**
1. Créer projet Google Cloud (ou utiliser existant)
2. Activer Google Slides API
3. Configurer OAuth 2.0 Consent Screen
4. Créer OAuth 2.0 Client ID (Web application)
5. Ajouter scopes:
   - `https://www.googleapis.com/auth/presentations`
   - `https://www.googleapis.com/auth/drive.file`

**Authorized JavaScript Origins:**
- `http://localhost:5173` (dev)
- `https://flipika-dev.web.app` (staging)
- `https://flipika.app` (prod)

---

### 2. Frontend - Google OAuth Integration

**File:** `src/services/googleAuth.ts`

```typescript
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

const SCOPES = [
  'https://www.googleapis.com/auth/presentations',
  'https://www.googleapis.com/auth/drive.file'
].join(' ');

export const useGoogleSlidesAuth = () => {
  const login = useGoogleLogin({
    scope: SCOPES,
    onSuccess: (tokenResponse) => {
      // Store access token
      localStorage.setItem('google_access_token', tokenResponse.access_token);
    },
    onError: (error) => {
      console.error('Google Auth Error:', error);
    }
  });

  return { login };
};
```

---

### 3. Google Slides Service

**File:** `src/services/googleSlides.ts`

```typescript
import { gapi } from 'gapi-script';

interface SlideConfig {
  type: 'performance' | 'chart' | 'metrics' | 'creative';
  title: string;
  data: any;
}

export class GoogleSlidesService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createPresentation(title: string): Promise<string> {
    const response = await gapi.client.slides.presentations.create({
      title
    });
    return response.result.presentationId!;
  }

  async addSlides(presentationId: string, slides: SlideConfig[]): Promise<void> {
    const requests = slides.flatMap(slide => 
      this.buildSlideRequests(slide)
    );

    await gapi.client.slides.presentations.batchUpdate({
      presentationId,
      requests
    });
  }

  private buildSlideRequests(slide: SlideConfig) {
    // Build batchUpdate requests based on slide type
    switch (slide.type) {
      case 'performance':
        return this.buildPerformanceSlide(slide);
      case 'chart':
        return this.buildChartSlide(slide);
      // ... autres types
    }
  }

  private buildPerformanceSlide(slide: SlideConfig) {
    return [
      {
        createSlide: {
          slideLayoutReference: {
            predefinedLayout: 'TITLE_AND_BODY'
          }
        }
      },
      {
        insertText: {
          objectId: 'titleTextBox',
          text: slide.title
        }
      }
      // ... add metrics, charts, etc.
    ];
  }
}
```

---

### 4. React Component - Export Button

**File:** `src/components/reports/ExportToGoogleSlidesButton.tsx`

```typescript
import { useState } from 'react';
import { useGoogleSlidesAuth } from '@/services/googleAuth';
import { GoogleSlidesService } from '@/services/googleSlides';
import { useReport } from '@/contexts/ReportContext';

export const ExportToGoogleSlidesButton = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useGoogleSlidesAuth();
  const { report } = useReport();

  const handleExport = async () => {
    setLoading(true);
    try {
      // 1. Ensure authenticated
      const token = localStorage.getItem('google_access_token');
      if (!token) {
        await login();
        return;
      }

      // 2. Create presentation
      const service = new GoogleSlidesService(token);
      const presentationId = await service.createPresentation(
        `${report.clientName} - ${report.period}`
      );

      // 3. Add slides
      await service.addSlides(presentationId, report.slides);

      // 4. Save to Firestore
      await saveGoogleSlidesExport(report.id, presentationId);

      // 5. Redirect to Google Slides
      window.open(
        `https://docs.google.com/presentation/d/${presentationId}/edit`,
        '_blank'
      );

      toast.success('Présentation créée avec succès !');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="btn-primary"
    >
      {loading ? 'Génération...' : 'Exporter vers Google Slides'}
    </button>
  );
};
```

---

### 5. Firestore Schema

**Collection:** `googleSlidesExports`

```typescript
interface GoogleSlidesExport {
  id: string;
  reportId: string;
  presentationId: string;
  presentationUrl: string;
  createdAt: Timestamp;
  createdBy: string;
  clientId: string;
  status: 'created' | 'edited' | 'shared';
}
```

---

## 🔒 Security

### Firestore Rules

```javascript
match /googleSlidesExports/{exportId} {
  allow read, write: if request.auth != null 
    && request.auth.uid == resource.data.createdBy;
}
```

### Token Storage

- **Access Token:** `localStorage` (short-lived, 1h)
- **Refresh Token:** Backend only (Firebase Functions)
- **Never expose tokens** in client-side code

---

## 🧪 Testing

### Unit Tests

```typescript
describe('GoogleSlidesService', () => {
  it('should create presentation with correct title', async () => {
    const service = new GoogleSlidesService(mockToken);
    const id = await service.createPresentation('Test Report');
    expect(id).toBeDefined();
  });

  it('should add slides with correct layout', async () => {
    // ...
  });
});
```

### Integration Tests

1. Test OAuth flow complet
2. Test création présentation
3. Test ajout de slides
4. Test redirection vers Google Slides

---

## 📊 Metrics & Analytics

**Track:**
- Nombre d'exports Google Slides par utilisateur
- Taux de succès/échec
- Temps moyen de génération
- Types de slides les plus utilisés

**Firebase Analytics Events:**
```typescript
logEvent('google_slides_export_started');
logEvent('google_slides_export_success', { slideCount: 5 });
logEvent('google_slides_export_error', { error: 'auth_failed' });
```

---

## 🚀 Rollout Plan

### Week 1: Setup & POC
- ✅ Google Cloud project setup
- ✅ OAuth integration
- ✅ POC: Create blank presentation

### Week 2: Core Implementation
- ✅ Implement GoogleSlidesService
- ✅ Build slide templates (Performance, Chart, Metrics)
- ✅ Export button UI

### Week 3: Testing & Polish
- ✅ Unit tests
- ✅ Integration tests
- ✅ Error handling
- ✅ Loading states

### Week 4: Deploy & Monitor
- ✅ Deploy to staging
- ✅ User testing
- ✅ Deploy to production
- ✅ Monitor metrics

---

## ⚠️ Limitations & Known Issues

1. **No custom templates:** Limited to Google Slides predefined layouts
2. **Complex charts:** May not render perfectly (use images as fallback)
3. **Rate limits:** Google Slides API has quotas (100 requests/100 seconds/user)
4. **Offline mode:** Requires internet connection

---

## 🔄 Migration Path to Craft.js (Phase 2)

**When Craft.js is ready:**
1. Add "Advanced Editor" option alongside "Quick Export"
2. Offer migration tool: Import Google Slides → Craft.js
3. Deprecate Google Slides export (keep as legacy)

---

## 📚 Resources

- [Google Slides API Docs](https://developers.google.com/slides/api)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [batchUpdate Reference](https://developers.google.com/slides/api/reference/rest/v1/presentations/batchUpdate)
- [Craft.js Docs](https://craft.js.org/) (for Phase 2)
