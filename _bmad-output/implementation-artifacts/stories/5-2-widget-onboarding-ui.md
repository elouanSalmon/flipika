# Story 5.2: Widget d'Onboarding (UI & Navigation)

**Epic:** 5 - Onboarding & Gamification
**Status:** ready-for-dev

## Description
Créer un composant React "Getting Started" affiché sur le Dashboard. Il doit lister les étapes d'onboarding, leur statut, et fournir un bouton d'action direct pour les étapes incomplètes.

## UI Requirements
- **Location**: Top of Dashboard (New or Old). Collapsible? (MVP: No, but dismissible once all done).
- **Design**: "Card" style with a progress bar or clear completion counter (e.g., "2/6 steps completed").
- **List Items**:
    - **Icon**: Empty circle (Pending) / Green checkmark (Done).
    - **Text**: Step name.
    - **Action**: Button (Primary/Secondary variant) visible ONLY if pending.
    - **Completed State**: Text dimmed, button hidden or replaced by "Done" label.

## Step Configuration (Data & Links)

| Step Name | Route | Action Label | Condition (from Story 5.1) |
| :--- | :--- | :--- | :--- |
| 1. Create your first Client | `/app/clients` | "Add Client" | `hasClient` |
| 2. Setup your brand Theme | `/app/themes` | "Create Theme" | `hasTheme` |
| 3. Define a Report Template | `/app/templates` | "Create Template" | `hasTemplate` |
| 4. Schedule a Report | `/app/schedules` | "Schedule Report" | `hasSchedule` |
| 5. Generate a PDF Report | `/app/reports/new` | "Generate Report" | `hasGeneratedReport` |
| 6. Send it to a Client | `/app/reports` | "Go to Reports" | `hasSentReport` |

*Note: For step 6, since "sending" happens on the preview page, we redirect to the report list where they can open a report and send it.*

## Acceptance Criteria

- [x] **Component**: `OnboardingWidget.tsx` created.
- [x] **State Connection**: Connects to `useOnboarding()` (from Story 5.1).
- [x] **Visuals**:
    - [x] Progress indicator is visible.
    - [x] "Action Buttons" work and redirect to correct routes.
    - [x] Completed items look distinct (dimmed/checked).
- [x] **Responsiveness**: Looks good on mobile (stack vertically).
- [x] **Animation**: Simple transition when status changes (optional but requested "tick animation").
- [x] **Logic**: Widget disappears (or minimizes) when 6/6 steps are done (updates `userProfile.hasCompletedOnboarding`).

## Technical Notes
- Use `react-router-dom` `useNavigate` for buttons.
- Use `framer-motion` for the tick animation if available, or simple CSS transition.
- Reuse `Card` component from design system.
