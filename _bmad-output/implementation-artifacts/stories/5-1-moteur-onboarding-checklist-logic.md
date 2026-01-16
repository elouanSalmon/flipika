# Story 5.1: Moteur d'Onboarding (Checklist Logic)

**Epic:** 5 - Onboarding & Gamification
**Status:** done

## Description
Implémenter la logique backend/frontend pour suivre l'état d'avancement de l'onboarding pour chaque utilisateur. Le système doit pouvoir déterminer si chacune des 6 étapes clés a été réalisée.

**Steps to Track:**
1.  **Create Client**: Has the user created at least one Client?
2.  **Create Theme**: Has the user created a Theme (or is using a default one actively linked)? *Clarification: User must create a custom theme.*
3.  **Create Template**: Has the user created a specific template or preset?
4.  **Create Schedule**: Is there at least one active schedule?
5.  **Create Report**: Has a report been generated (event log or existence check)?
6.  **Send Report**: Has a report been marked as sent?

## Technical Approach
- **Service Layer**: Create `OnboardingService` to centralize checks.
- **Persistence**: 
    - Option A (Real-time): Query Firestore counts on load (e.g. `clients.length > 0`). 
    - Option B (Stored State): Store a `onboardingStatus` object in `users/{userId}` with booleans using Cloud Functions triggers. 
    - **Decision**: Use **Option A (Real-time/Cached)** for "Resource existence" checks (Client, Theme, Template, Schedule) as it's simpler and less prone to sync errors. For ephemeral events ("Report Generated", "Sent"), use a flag in `userProfile` or check the `History` collection.
- **Store**: Add `onboarding` slice to Global Store (Context or Zustand) to avoid re-fetching constantly.

## Acceptance Criteria

- [x] **Data Model**: structure definie pour porter l'état (ex: `{ steps: { createClient: boolean, ... }, progress: number }`).
- [x] **Service Method**: `checkOnboardingStatus(userId)` returns the status object.
- [x] **Auto-Detection**:
    - [x] `checkClientExists()`: Queries `clients` collection.
    - [x] `checkThemeExists()`: Queries `themes` collection (excluding system defaults).
    - [x] `checkTemplateExists()`: Queries `templates` collection.
    - [x] `checkScheduleExists()`: Queries `schedules` collection.
    - [x] `checkReportGenerated()`: Queries `reports` history or user flag.
    - [x] `checkReportSent()`: Queries `reports` history where status == 'sent'.

## Tasks
1.  [x] Create `Onboarding Context` or Service.
2.  [x] Implement check functions for each step.
3.  [x] Integrate with User Profile to save "Completed" state if we want to hide the widget later (e.g. `hasCompletedOnboarding` flag already exists in `ProtectedRoutes.tsx` - reuse this!).
