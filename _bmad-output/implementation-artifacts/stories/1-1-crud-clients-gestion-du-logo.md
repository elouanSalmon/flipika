# Story 1.1: CRUD Clients & Gestion du Logo

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Admin User**,
I want to **create, read, update and delete Clients with their logo**,
so that **I can manage my portfolio of distinct customers.**

## Acceptance Criteria

### Creation
- [x] **Given** I am on the Client List page
- [x] **When** I click "Add Client" and fill in Name, Email, Google Ads ID and upload a Logo file
- [x] **Then** The client is created in Firestore (`users/{userId}/clients/{clientId}`)
- [x] **And** The Google Ads ID is saved and validated for uniqueness in the user's scope
- [x] **And** The logo is uploaded to Storage (`clients/{clientId}/logo.png`) and the URL is saved with the client
- [x] **And** I see the new client in the list

### Modification
- [x] **Given** I have an existing client
- [x] **When** I change their Name, Google Ads ID or Logo
- [x] **And** The new Google Ads ID is not already used by another client
- [x] **Then** The information is updated immediately across the system (Optimistic UI + Firestore Update)

### Lists & Deletion
- [ ] **When** I view the client list, I see all my clients with their logos
- [ ] **When** I delete a client, it is removed from the list and Firestore

## Tasks / Subtasks

- [x] **1. Service Layer Implementation (`src/services/clientService.ts`)** (AC: All)
  - [x] Implement `createClient(clientData, logoFile)`: Upload logo to Storage -> Get URL -> Create Firestore doc
  - [x] Implement `getClients()`: Fetch all clients for current user
  - [x] Implement `updateClient(clientId, data, newLogoFile?)`: Handle optional logo replacement
  - [x] Implement `deleteClient(clientId)`: Delete Firestore doc (and optionally logo from Storage)

- [x] **2. UI Components - Client Card & List (`src/components/clients/`)** (AC: List)
  - [x] Create `ClientCard.tsx`: Display name, email, logo thumbnail, actions menu
  - [x] Create `ClientList.tsx` (or update `ClientsPage.tsx`): Grid of cards + "Add" button
  - [x] Implement loading states using skeleton loaders

- [x] **3. UI Components - Client Form (`src/components/clients/`)** (AC: Creation, Modif)
  - [x] Create `ClientForm.tsx`: Modal or separate page (decision: Modal for MVP flow)
  - [x] Implement file input for Logo with preview
  - [x] Form validation (Name required, Email format)

- [x] **4. Page Integration (`src/pages/ClientsPage.tsx`)** (AC: All)
  - [x] Connect `useClients` hook with `clientService`
  - [x] Manage local state for "Add/Edit Client" modal visibility
  - [x] Handle error states with `react-hot-toast`

## Dev Notes

- **Architecture:** Client-centric model. Firestore path: `users/{userId}/clients/{clientId}`.
- **Storage:** Store logos in `users/{userId}/clients/{clientId}/logo`.
- **Hooks:** Create a `useClients` hook to abstract the service layer and handle `react-query` or `useEffect` loading states.
- **UX:** Use `react-hot-toast` for success/error feedback.
- **Components:** Reuse `Modal` from `src/components/common/`.
- **Types:** Define `ClientType` in `src/types/client.ts`.

### Project Structure Notes

- Service: `src/services/clientService.ts`
- Types: `src/types/client.ts`
- Components: `src/components/clients/`
- Pages: `src/pages/ClientsPage.tsx`

### References

- [Architecture: Data Model](_bmad-output/planning-artifacts/architecture.md#data-architecture)
- [Project Context: Naming Conventions](_bmad-output/project-context.md#naming-conventions)

## Dev Agent Record

### Agent Model Used
(To be filled by Dev Agent)

### Debug Log References
(To be filled by Dev Agent)

### Completion Notes List
(To be filled by Dev Agent)

### File List
(To be filled by Dev Agent)
