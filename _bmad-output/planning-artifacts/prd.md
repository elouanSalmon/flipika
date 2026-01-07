---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
inputDocuments: ['planning-artifacts/product-brief-flipika-2026-01-05.md', 'analysis/brainstorming-session-2026-01-05.md', 'docs/index.md']
workflowType: 'prd'
lastStep: 0
---

# Product Requirements Document - flipika

**Author:** Elou
**Date:** 2026-01-05

## Executive Summary

**Flipika** est une plateforme de reporting "Safety First" conçue pour éliminer le stress des lundis matins pour les Media Buyers. Contrairement aux outils classiques qui se concentrent sur la flexibilité, Flipika privilégie la **sérénité** et la **fiabilité**.

Le système lie rigidement chaque Compte Google Ads à un "Preset Client" (Template, Thème, Contact, Fréquence), automatisant entièrement la phase de préparation "ingrate". Une interface de **"Pre-Flight Check"** obligatoire garantit qu'aucune erreur ne passe inaperçue avant l'envoi.

### Ce qui rend ce produit unique (Differentiators)

1.  **Liaison Contextuelle Forte :** Pas de sélection manuelle à chaque fois. Le système "sait" que le compte X va avec le logo Y et le mail Z.
2.  **Validation "Pre-Flight" :** Une étape de vérification visuelle explicite qui rassure l'utilisateur (comme un pilote avant le décollage).
3.  **Envoi "Low-Tech" Robuste :** Génération PDF + lien `mailto:` pré-rempli. Simple, infaillible, et laisse le contrôle final à l'utilisateur.

## Project Classification

**Technical Type:** SaaS B2B / Web App
**Domain:** AdTech / Productivity
**Complexity:** Medium
**Complexity:** Medium
**Project Context:** Brownfield - extending existing system

## Success Criteria

### User Success
*   **Ratio Administration vs Analyse :** Passage de 80/20 à **10/90**. L'utilisateur doit passer 90% de son temps sur l'analyse à valeur ajoutée.
*   **Confiance "Pre-Flight" :** **100%**. L'utilisateur ne doit jamais ressentir le besoin de rouvrir un PDF généré pour vérification.

### Business Success
*   **Adoption des Presets (North Star) :** % de clients configurés avec un preset complet. Un preset configuré = un utilisateur retenu.
*   **Taux d'Édition Structurelle :** Doit tendre vers **0%**. Si l'utilisateur modifie la structure du rapport après génération, le preset a échoué.

### Technical Success
*   **Fiabilité du Binding :** 100% de correspondance entre le Google Ads Customer ID et le Preset appliqué.
*   **Génération Client-Side :** Génération PDF performante (< 5s) directement dans le navigateur.

### Measurable Outcomes
*   Tous les rapports hebdo envoyés avant lundi 10h00.
*   0 erreur d'inversion de logo/client rapportée en production.

## Product Scope

### MVP - Minimum Viable Product
*   **Source de Données :** Google Ads API (Uniquement).
*   **Core Feature :** Client Presets (Liaison Customer ID <> Template/Thème).
*   **Validation :** Interface de "Pre-Flight Check" visuelle obligatoire.
*   **Export :** Génération PDF + Bouton `mailto:` pré-rempli.

### Out of Scope (V1)
*   **Multi-sources :** Pas de Facebook Ads, LinkedIn Ads, etc.
*   **IA Générative :** Pas de rédaction automatique d'analyse.
*   **Envoi Serveur :** Pas d'envoi SMTP ou de planification d'envoi automatique (l'humain valide et clique).
*   **Portail Client :** Pas d'accès client, uniquement envoi de fichier.

### Vision (Future)
*   **V2 :** Intégration Meta Ads & Microsoft Ads.
*   **V2 :** Intégration Meta Ads & Microsoft Ads.
*   **V3 :** Assistant IA "Co-pilote" pour pré-rédiger les analyses de performance.

## User Journeys

### Journey 1: Le "Set & Forget" (Configuration d'un Nouveau Client)
Thomas vient de signer "GreenBurger". Il veut configurer le reporting immédiatement pour ne plus y penser.
1.  **Connexion :** Il se connecte à Flipika.
2.  **Auto-Discovery :** Il clique sur "Nouveau Client". Le système interroge l'API Google Ads et lui affiche la liste de tous ses comptes gérés.
3.  **Sélection :** Il sélectionne "GreenBurger" dans la liste. Le binding est fait (ID + Nom).
4.  **Preset :** Il choisit le Template "Performance Hebdo", applique le Thème "Eco-Green", et définit l'email destinataire.
5.  **Résultat :** Configuration terminée en 3 clics. Zéro saisie manuelle d'ID.

### Journey 2: Le "Lundi Matin Zen" (Flux de Production)
Lundi, 9h00. Thomas a 15 rapports à envoyer.
1.  **Dashboard :** "15 Rapports prêts à générer".
2.  **Action :** Clic sur "GreenBurger".
3.  **Pre-Flight Check :** Validation visuelle (Logo + KPIs).
4.  **Validation :** Clic "Générer & Envoyer".
5.  **Envoi Low-Tech :** PDF téléchargé + Client Mail ouvert avec draft prêt.
6.  **Répétition.**

### Journey Requirements Summary
*   **Google Ads Account Listing :** Capacité à lister les comptes accessibles via le token OAuth (Customer Service).
*   **Gestion des Presets :** CRUD entités Clients/Presets.
*   **Génération de Thème :** Éditeur simple.
*   **Deep Linking Mailto :** Génération d'URL mailto.

## SaaS B2B Requirements

### Project-Type Overview
Flipika fonctionne comme un **SaaS Single-Tenant** (Focalisation Solo User pour la V1) avec un **Modèle de Facturation à l'Usage** (Par Compte Google Ads Actif).

### Technical Architecture Considerations

*   **Authentication & Identity:**
    *   **Provider:** Firebase Auth (Google Sign-In).
    *   **OAuth Scopes:** `https://www.googleapis.com/auth/adwords` (Critique pour l'accès API).
    *   **Tenancy:** Scope Utilisateur Unique. Les agences partagent un accès unique en V1.

*   **Data Architecture & Persistence:**
    *   **Configuration Data (Hot):** Templates, Presets, Thèmes stockés dans Firestore.
    *   **Live Data (Ephemeral):** Récupérées en temps réel via l'API Google Ads pour le "Pre-Flight". Pas de stockage avant validation.
    *   **Report History (Cold):** À la "Génération", nous stockons une "Snapshot" :
        1.  Le Fichier PDF (Firebase Storage).
        2.  Un Enregistrement de Métadonnées (Firestore : Date, ClientID, Statut).

*   **Billing & Limits (Existing):**
    *   Modèle : Licence par `Google Ads Customer ID`.
    *   Application : L'interface bloque l'ajout de nouveaux Presets si la licence ne couvre pas de slot supplémentaire.

### Implementation Considerations
*   **Performance:** Les appels API Google Ads peuvent être lents. L'implémentation doit gérer les "Loading States" avec soin lors du Pre-Flight.
*   **Optimisation:** Ne récupérer les données que lorsque le contexte client est activé pour minimiser les coûts d'API et la latence.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy
**MVP Approach:** Problem-Solving MVP (Focus: "Lundi Matin Zen")
**Philosophy:** Résoudre spécifiquement la douleur de l'assemblage manuel et de l'anxiété, sans disperser l'effort sur des features "génériques" de dashboarding.

### MVP Feature Set (Phase 1)
**Core User Journeys Supported:**
*   Journey 1: Setup Client (Binding + Preset)
*   Journey 2: Production Hebdo (Pre-flight + Envoi)

**Must-Have Capabilities:**
1.  **Auth & Binding:** Google Sign-In + Sélection de compte Google Ads.
2.  **Preset Management:** CRUD pour associer un Compte Ads à un Template/Thème/Email.
3.  **Pre-Flight Check:** Interface de validation visuelle avant génération.
4.  **PDF Generation:** Client-side generation (react-pdf).
5.  **Smart Mailto:** Génération du lien d'envoi pré-rempli.

### Post-MVP Features

**Phase 2 (Growth - Nice to Have):**
*   **Team Management:** Partage de presets entre collègues.
*   **Multi-Source:** Intégration Meta Ads.
*   **Advanced Editor:** Éditeur de template drag-and-drop.

### Risk Mitigation Strategy
*   **Technical Risks (API Latency):** Atténuation via des "Loading States" soignés et une gestion optimisée des appels API (ne charger que le visible).
*   **Market Risks (Too Simple):** Positionnement clair sur la "Sérénité" et le gain de temps, plutôt que sur la puissance analytique brute (DataStudio).

## Functional Requirements

### Authentication & Account Binding
*   **FR-01:** L'utilisateur peut se connecter à l'application via Google Sign-In.
*   **FR-02:** L'utilisateur peut lister les comptes Google Ads associés à son token OAuth (via API Customer Service).
*   **FR-03:** L'utilisateur peut sélectionner un compte Google Ads spécifique pour le lier à un Client Flipika (Binding ID).

### Client & Preset Management
*   **FR-04:** L'utilisateur peut créer, lire, mettre à jour et supprimer (CRUD) une entité "Client" (Nom, Email, Logo).
*   **FR-05:** L'utilisateur peut configurer un "Preset" par défaut pour chaque client (Template associé, Thème associé, Période de rapport).
*   **FR-06:** L'utilisateur peut définir et sauvegarder un Thème personnalisé (Palette de couleurs Hex + Logo).

### Report Generation Engine
*   **FR-07:** L'utilisateur peut initier la génération d'un rapport pour un Client spécifique depuis le Dashboard.
*   **FR-08 (Pre-Flight):** Le système doit afficher une modale de prévisualisation obligatoire présentant les KPIs clés et les métadonnées (Dates, Client) *avant* la génération finale.
*   **FR-09:** L'utilisateur peut valider la conformité visuelle (Action "Générer") ou annuler pour corriger.

### Export & Delivery
*   **FR-10:** Le système génère le rapport final au format PDF directement dans le navigateur du client (Client-side generation).
*   **FR-10:** Le système génère le rapport final au format PDF directement dans le navigateur du client (Client-side generation).
*   **FR-11:** Le système génère et déclenche un lien `mailto:` pré-rempli avec l'adresse du destinataire, l'objet et le corps du message configurés.

## Non-Functional Requirements

### Performance
*   **NFR-01 (Critical):** La génération du PDF client-side doit prendre moins de **5 secondes** pour un rapport standard (1 mois de data).
*   **NFR-02:** Le "Pre-Flight Check" doit s'afficher en moins de **2 secondes** (optimiste UI si l'API est lente) pour maintenir la sensation de fluidité.

### Security
*   **NFR-03 (Critical):** Le Token OAuth Google Ads doit être stocké de manière sécurisée et ne jamais être exposé côté client sans nécessité.
*   **NFR-04 (Scopes):** L'application doit demander les scopes minimaux requis : `email`, `profile`, `openid` (Auth Utilisateur) et `https://www.googleapis.com/auth/adwords` (Accès API).
*   **NFR-05 (Smart Persistence):**
    *   *Snapshot:* Les données des rapports **validés et générés** doivent être sauvegardées (Snapshot) pour l'historique et pour éviter de re-consommer l'API lors de la consultation d'archives.
    *   *Live:* Les données de "Pre-flight" peuvent être éphémères ou cachées à court terme.

### Reliability
*   **NFR-06:** En cas d'échec de l'API Google Ads, l'utilisateur doit recevoir un message d'erreur explicite ("Google Ads ne répond pas") et non un crash ou un chargement infini.
*   **NFR-07:** Le système de "Binding" doit être résilient : si un compte Google Ads est renommé ou déplacé, Flipika doit tenter de le retrouver ou signaler l'incohérence proprement.
