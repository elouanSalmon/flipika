# Architecture: Web Frontend

> **Part ID**: web
> **Type**: Web Application
> **Generated**: 2026-01-05

## Executive Summary

The Web Frontend is a **React 19 Single Page Application (SPA)** built with Vite. It serves as the primary interface for users to generate, view, and schedule Google Ads reports. It leverages Firebase for authentication, database (Firestore), and hosting.

## Architecture Pattern

- **Pattern**: Component-Based SPA
- **State Management**: Hybrid approach
  - **Server State**: Managed via Firestore listeners (Real-time) and API calls.
  - **UI State**: React Local State (`useState`) and Context API (`ThemeContext`, `DemoModeContext`) for global preferences.
- **Routing**: Client-side routing via `react-router-dom`.

## Technology Stack

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Framework** | React 19 | Core UI library |
| **Build Tool** | Vite | Dev server and bundler |
| **Styling** | TailwindCSS | Utility-first styling |
| **Language** | TypeScript | Static typing |
| **Icons** | Lucide React | Iconography |
| **Drag & Drop** | @dnd-kit | Report builder interface |
| **PDF Generation** | html2pdf.js / jspdf | Report export |

## Key Modules

### 1. Report Engine
- **Location**: `src/components/reports/`
- **Purpose**: Core feature allowing drag-and-drop report construction.
- **Components**: `ReportEditor`, `ReportCanvas`, `SectionLibrary`, `WidgetSelector`.

### 2. Dashboard
- **Location**: `src/components/dashboard/`
- **Purpose**: Overview of account performance.
- **Components**: `KPICard`, `MetricsGrid`.

### 3. Service Layer
- **Location**: `src/services/`
- **Purpose**: Abstraction over API calls and Firebase SDK to keep components clean.
- **Key Services**: `reportService`, `userProfileService`, `widgetService`.

## Data Architecture

- **Models**: Defined in `src/types/` (Reports, Templates, Users).
- **Storage**: 
    - **Firestore**: structured data (user profiles, saved reports).
    - **LocalStorage**: ephemeral UI preferences.

## Security

- **Authentication**: Firebase Authentication (Google provider).
- **Authorization**: `SubscriptionGuard` component prevents access to paid features.
- **Environment**: Configured via `.env` variables (API keys, project IDs).
