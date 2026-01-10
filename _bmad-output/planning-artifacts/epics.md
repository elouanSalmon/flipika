---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/ux-design-specification.md']
---

# flipika - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for flipika, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-01: L'utilisateur peut se connecter à l'application via Google Sign-In.
FR-02: L'utilisateur peut lister les comptes Google Ads associés à son token OAuth (via API Customer Service).
FR-03: L'utilisateur peut sélectionner un compte Google Ads spécifique pour le lier à un Client Flipika (Binding ID).
FR-04: L'utilisateur peut créer, lire, mettre à jour et supprimer (CRUD) une entité "Client" (Nom, Email, Logo).
FR-05: L'utilisateur peut configurer un "Preset" par défaut pour chaque client (Template associé, Thème associé, Période de rapport).
FR-06: L'utilisateur peut définir et sauvegarder un Thème personnalisé (Palette de couleurs Hex + Logo).
FR-07: L'utilisateur peut initier la génération d'un rapport pour un Client spécifique depuis le Dashboard.
FR-08 (Pre-Flight): Le système doit afficher une modale de prévisualisation obligatoire présentant les KPIs clés et les métadonnées (Dates, Client) *avant* la génération finale.
FR-09: L'utilisateur peut valider la conformité visuelle (Action "Générer") ou annuler pour corriger.
FR-10: Le système génère le rapport final au format PDF directement dans le navigateur du client (Client-side generation).
FR-11: Le système génère et déclenche un lien `mailto:` pré-rempli avec l'adresse du destinataire, l'objet et le corps du message configurés.

### NonFunctional Requirements

NFR-01 (Critical): La génération du PDF client-side doit prendre moins de **5 secondes** pour un rapport standard (1 mois de data).
NFR-02: Le "Pre-Flight Check" doit s'afficher en moins de **2 secondes** (optimiste UI si l'API est lente) pour maintenir la sensation de fluidité.
NFR-03 (Critical): Le Token OAuth Google Ads doit être stocké de manière sécurisée et ne jamais être exposé côté client sans nécessité.
NFR-04 (Scopes): L'application doit demander les scopes minimaux requis : `email`, `profile`, `openid` (Auth Utilisateur) et `https://www.googleapis.com/auth/adwords` (Accès API).
NFR-05 (Smart Persistence): Les données des rapports **validés et générés** doivent être sauvegardées (Snapshot) pour l'historique. Les données de "Pre-flight" peuvent être éphémères.
NFR-06: En cas d'échec de l'API Google Ads, l'utilisateur doit recevoir un message d'erreur explicite ("Google Ads ne répond pas") et non un crash ou un chargement infini.
NFR-07: Le système de "Binding" doit être résilient : si un compte Google Ads est renommé ou déplacé, Flipika doit tenter de le retrouver ou signaler l'incohérence proprement.

### Additional Requirements

From Architecture:
- [OAuth Architecture] Frontend initiates flow, Function exchanges code > tokens, Refresh token stored encrypted in Firestore (server access only).
- [Data Model] Strict 1:1 Binding required between Client and Google Ads Customer ID.
- [Data Model] "Templates" are scoped per client (not shared).
- [Pre-Flight State Machine] Must implement state machine: SELECT_CLIENT → LOADING_DATA → PRE_FLIGHT_CHECK → GENERATING_PDF → SENT / ABORTED.
- [PDF Generation] Must use html2pdf.js without server-side fallback.
- [Technology Stack] Must use React 19, Vite, TailwindCSS, Firebase SDK (Frontend) and Node.js 22, Firebase Functions (Backend).
- [Code Organization] Respect established project structure (Pages/Components/Services/Hooks/Contexts).
- [Naming Convention] Enforce camelCase for vars/functions, PascalCase for components.
- [Error Handling] Use `react-hot-toast` for user feedback.

From UX Design:
- [General] Interaction model is "Review, Approve, Relax" - passive validation over active creation.
- [General] "Zen" Dashboard layout: Central feed, no sidebar.
- [Pre-Flight] Mandatory modal gateway ("Protective Blocking").
- [Pre-Flight] Check loading < 200ms (optimistic), Data verification < 1s.
- [Pre-Flight] Visual Receipt: Show thumbnail of PDF next to green ticks.
- [Pre-Flight] "Protective Friction" - Send button disabled until checks pass.
- [Onboarding] "Magic Link": Input ID > Auto-fetch name/currency/logo using API.
- [Visual] Custom "Glass-Premium" aesthetic using Tailwind (slate/blue palette, dark mode first).
- [Feedback] Optimistic updates for actions (Save/Send).
- [Accessibility] Keyboard navigation support (Cmd+Enter to confirm).

### FR Coverage Map

FR-01: Epic 2 - Authentification Google Sign-In
FR-02: Epic 2 - Listing des comptes Google Ads
FR-03: Epic 2 - Binding Compte Ads <-> Client Flipika
FR-04: Epic 1 - CRUD Clients (Nom, Email, Logo)
FR-05: Epic 1 - Configuration Presets (Template, Thème, Période)
FR-06: Epic 1 - Création de Thèmes personnalisés
FR-07: Epic 3 - Initiation génération rapport depuis Dashboard
FR-08: Epic 3 - Modale Pre-Flight Check (obligatoire)
FR-09: Epic 3 - Validation / Correction dans Pre-Flight
FR-10: Epic 3 - Génération PDF Client-Side
FR-11: Epic 4 - Génération lien Mailto pré-rempli

## Epic List

### Epic 1: Gestion des Clients & Configuration ("La Fondation")
Permettre à l'utilisateur de configurer son environnement de travail (Clients, Templates, Thèmes) pour que le système soit prêt pour le "Binding".
**FRs covered:** FR-04, FR-05, FR-06
**Notes:** Feature critique pour préparer le terrain. Gestion CRUD standard + upload logo. Stockage Firestore.

### Story 1.1: CRUD Clients & Gestion du Logo

As a Admin User,
I want to create, updade and delete Clients with their logo,
So that I can manage my portfolio of distinct customers.

**Acceptance Criteria:**

**Given** I am on the Client List page
**When** I click "Add Client" and fill in Name, Email and upload a Logo file
**Then** The client is created in Firestore
**And** The logo is uploaded to Storage and the URL is saved with the client
**And** I see the new client in the list

**Given** I have an existing client
**When** I change their Name or Logo
**Then** The information is updated immediately across the system

### Story 1.2: Configuration des Thèmes Personnalisés

As a Admin User,
I want to create custom visual themes (Color + Logo overrides),
So that the generated reports match my clients' branding.

**Acceptance Criteria:**

**Given** I am in the Theme Manager
**When** I select a Primary Color and upload a specific Logo variant
**Then** I see a live preview of how it looks on a "Dummy Report"
**And** I can save this as a named Theme (e.g., "Dark Premium")

### Story 1.3: Gestion des Presets par Client

As a Admin User,
I want to assign default settings (Template, Theme, Period) to a Client,
So that I don't have to re-configure everything each time I generate a report.

**Acceptance Criteria:**

**Given** I am editing a Client
**When** I select a default Template (e.g., "Monthly Performance") and a default Theme
**Then** These choices are persisted as the "Preset" for this client
**And** When I start a report for this client later, these options are pre-selected

### Epic 2: Authentification & Binding Google Ads ("Le Moteur")
Connecter l'utilisateur à Google et lier chaque "Client Flipika" à un vrai "Compte Customer Ads" de manière 1:1 pour permettre l'automatisation.
**FRs covered:** FR-01, FR-02, FR-03, NFR-03, NFR-04
**Notes:** Implique OAuth flow sécurisé, stockage refresh token (Functions), et logique de binding résiliente.

### Story 2.1: Authentification Google & Scopes Minimaux

As a User,
I want to log in with my Google Account and grant minimum necessary permissions,
So that I can trust the app with my data without over-sharing.

**Acceptance Criteria:**

**Given** I am on the Login page
**When** I click "Sign in with Google"
**Then** I am redirected to Google's consent screen
**And** The requested scopes are ONLY `openid`, `email`, `profile` and `adwords` (NO Analytics)
**And** Upon success, I am authenticated in Flipika

### Story 2.2: Sécurisation du Token OAuth (Backend)

As a System Architect,
I want the Google Ads Refresh Token to be stored securely on the server side,
So that it is never exposed to the frontend (XSS protection).

**Acceptance Criteria:**

**Given** A user has just granted permissions
**When** The Authorization Code is received by the callback
**Then** A Cloud Function exchanges this code for Access + Refresh Tokens
**And** The Refresh Token is stored in a secured Firestore collection (or Secret Manager) NOT accessible by client rules
**And** The frontend only receives a session token or non-sensitive status

### Story 2.3: Binding Manager (Liaison Compte <-> Client)

As a User,
I want to link a specific Google Ads Customer ID to a Flipika Client,
So that the system knows exactly which data to fetch for reports.

**Acceptance Criteria:**

**Given** I have a Flipika Client created
**When** I list available Google Ads Accounts (fetched via API)
**And** I select one account to "Bind"
**Then** The link is saved (Client ID <-> Customer ID)
**And** If the text/name differs, a warning or confirmation is shown to ensure it's the right match

### Epic 3: Moteur de Génération & Pre-Flight ("Le Décollage")
L'expérience centrale du "Lundi Matin" : Sélectionner, Valider (Pre-Flight) et Générer. Cœur de la valeur ajoutée "Sérénité".
**FRs covered:** FR-07, FR-08, FR-09, FR-10, NFR-01, NFR-02, NFR-05, NFR-06
**Notes:** UX critique (Modale "Protective Friction"). Performance critique (PDF generation). Gestion des loading states.

### Story 3.1: Le "Pre-Flight Check" (State Machine/UI)

As a User,
I want to see a summary of the data *before* the report is generated,
So that I can verify everything is correct and avoid sending bad reports.

**Acceptance Criteria:**

**Given** I have selected a Client and a Period
**When** I click "Generate Report"
**Then** A modal opens immediately (< 200ms) with a loading state
**And** Key KPIs (Cost, Clicks, Impressions) are fetched and displayed
**And** The "Download/Send" buttons remain disabled until the check is complete and valid

### Story 3.2: Moteur de Génération PDF (Client-Side)

As a User,
I want to obtain a beautifully formatted PDF report instantly,
So that I can send it to my client without waiting.

**Acceptance Criteria:**

**Given** I am in the Pre-Flight modal and the data is loaded
**When** I click "Download PDF"
**Then** The current view is converted to a high-quality PDF
**And** The generation takes less than 5 seconds
**And** The PDF respects the CSS layout and Client Theme colors

### Story 3.3: Gestion des Erreurs et États Vides

As a User,
I want to know clearly if the Google Ads API fails,
So that I don't generate a broken report or wait indefinitely.

**Acceptance Criteria:**

**Given** The Pre-Flight check is running
**When** The Google Ads API returns an error or times out
**Then** An explicit error message is displayed in the modal
**And** I can click "Retry" to attempt the fetch again
**And** I cannot proceed to generation until data is valid

### Story 3.4: Snapshot & Historique

As a User,
I want the system to remember that I generated a report,
So that I can track my work history.

**Acceptance Criteria:**

**Given** I have successfully generated a PDF
**When** The action is completed
**Then** A record is saved in the "History" collection (Date, Client, Report Type)
**And** The status is set to "Generated"

### Epic 4: Livraison & Fin de Flux ("L'Atterrissage")
Finaliser la boucle par l'envoi fluide du rapport, assurant que le travail généré est bien livré au client final.
**FRs covered:** FR-11
**Notes:** Génération intelligente du lien mailto (encodage caractères, body pré-rempli). Transition "Out of App".

### Story 4.1: Smart Mailto Generator

As a User,
I want to click a button to prepare an email to my client with everything pre-filled,
So that I just have to press "Send" in my mail app.

**Acceptance Criteria:**

**Given** The PDF has been generated
**When** I click "Send by Email"
**Then** My default mail client opens (mailto:)
**And** The "To" field is filled with the Client's contact email
**And** The "Subject" is dynamic: "[Project Name] Report for [Period]"
**And** The "Body" contains a polite message text
**And** (Technical limitation) I manually attach the PDF file (drag & drop)

### Story 4.2: Confirmation d'Envoi (Historique)

As a User,
I want to mark a report as "Sent",
So that I know which clients I have already handled this month.

**Acceptance Criteria:**

**Given** I have generated and sent a report
**When** I return to the dashboard or click "Mark as Sent"
**Then** The status for this Client/Month updates to "Sent" (Green checkmark)


### Epic 5: Onboarding & Gamification ("Le Guide")
Accompagner l'utilisateur pas à pas dans la découverte de l'application via une checklist interactive qui se valide automatiquement.
**FRs covered:** N/A (New Requirement)
**Notes:** Système de "Meta-State" qui écoute les événements ou interroge la base pour valider des étapes. Doit être non-intrusif mais gratifiant.

### Story 5.1: Moteur d'Onboarding (Checklist Logic)

As a System,
I want to track the completion status of key onboarding steps for each user/client,
So that I can display their progress in real-time.

**Acceptance Criteria:**

**Given** A new user account
**When** The user completes an action (Create Client, Bind Ads, etc.)
**Then** The system detects this event (via listeners or periodic check)
**And** Updates the status of the corresponding step to "Completed" in the User's profile
**And** This state persists across sessions

**Steps to Track:**
1. Create Client
2. Create Theme & Link to Client
3. Create Template
4. Create Schedule
5. Create Report
6. Send Report

### Story 5.2: Widget d'Onboarding (UI & Navigation)

As a User,
I want to see a clear, step-by-step checklist of actions to perform,
So that I can click a button to go exactly where I need to be and see my progress instantly.

**Acceptance Criteria:**

**Given** I am on the Dashboard
**When** I have incomplete onboarding steps
**Then** I see a "Getting Started" container listing the 6 steps
**And** Each step has a **visual status indicator** (Empty circle vs Green Checkmark)
**And** Each incomplete step has a clear **"Action Button"** (e.g., "Create Client", "Go to Settings")
**And** Clicking the button redirects me **directly** to the specific URL required for that step
**And** Completed steps are visually "dimmed" or marked as Done to plainly show progress
