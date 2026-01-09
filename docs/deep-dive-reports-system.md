# Deep Dive: Reports System

## Overview
The Reports System is the core value proposition of Flipika, enabling users to generate professional, data-driven PDF reports from their Google Ads performance data. It supports immediate generation, template-based customization, and automated scheduling.

## Architecture & Data Flow

### Core Data Models
-   **Report**: The central entity stored in `reports/{reportId}`. It contains configuration (date range, selected campaigns), content (TipTap JSON), and metadata.
-   **Widget**: Stored as sub-collection `reports/{reportId}/widgets/{widgetId}`. Represents dynamic data blocks (charts, tables) linked to specific data sources.
-   **ReportTemplate**: A blueprint for reports, stored in `reportTemplates`. Used for creating new reports and automated schedules.
-   **ScheduledReport**: Defines recurring generation jobs, stored in `scheduledReports`.

### Component Architecture
```mermaid
graph TD
    User -->|Creates/Edits| Editor[ReportEditor (TipTap)]
    Editor -->|Updates| Firestore[(Firestore: reports)]
    Editor -->|Manages| Widgets[WidgetLibrary]
    Widgets -->|Adds/updates| SubColl[(Firestore: reports/widgets)]
    
    User -->|Schedules| Scheduler[ScheduledReportService]
    Scheduler -->|Creates| SchedDoc[(Firestore: scheduledReports)]
    
    Cron[Cloud Schedule] -->|Triggers| backend[Functions: generateScheduledReports]
    backend -->|Queries| SchedDoc
    backend -->|Reads| Template[(Firestore: reportTemplates)]
    backend -->|Generates| NewReport[(Firestore: reports)]
    
    User -->|Exports| Generator[ReportGenerator (jsPDF)]
    Generator -->|Fetches Data| GoogleAds[Google Ads API]
    Generator -->|Renders| PDF[PDF Blob]
```

## Frontend Components

### 1. Report Editor (`components/reports/ReportEditor.tsx`)
Built on **TipTap**, a headless rich text editor.
-   **Custom Extensions**: Includes tables, images, and custom styling nodes.
-   **Collaborative-ready**: While currently single-user, the document structure allows for future real-time collaboration.
-   **Design Panel**: Allows customization of global report styles (colors, fonts, margins), which are passed to the PDF generator.

### 2. Widget System (`components/reports/WidgetLibrary.tsx`)
A drag-and-drop system for adding data visualizations.
-   **Types**: Global Metrics, Campaign Performance, Time Evolution, Recommendations, etc.
-   **Data Fetching**: Widgets fetch data dynamically based on the report's global configuration (date range, accounts) or local overrides.

### 3. PDF Generator (`services/reportGenerator.ts`)
A robust client-side PDF generation engine using `jsPDF` and `jspdf-autotable`.
-   **Rendering**: Converts the TipTap JSON content and Widget data into a formatted PDF.
-   **Styling**: Applies the user's selected design themes (colors, logos) to the generated PDF.
-   **Modules**: Supports conditional inclusion of sections (Executive Summary, Budget Analysis, etc.) based on `ReportConfig`.

## Backend Services

### 1. Scheduled Generation (`functions/src/generateScheduledReports.ts`)
-   **Trigger**: Runs hourly via Cloud Scheduler.
-   **Logic**:
    1.  Queries active schedules where `nextRun <= now`.
    2.  Fetches the associated `ReportTemplate`.
    3.  Resolves dynamic parameters (e.g., date ranges like `last_30_days`).
    4.  Creates a new `Report` document in Firestore with status `draft`.
    5.  Updates the schedule's `lastRun` and `nextRun` timestamps.
-   **Note**: Actual PDF generation currently happens on-demand or could be extended to server-side generation using Puppeteer/Node-canvas if background email delivery is required.

### 2. Data Access & Security
-   **ReportService (`services/reportService.ts`)**: Handles CRUD operations, leveraging Firestore batch writes for atomicity when manipulating reports and their widgets.
-   **Permissions**: Firestore Security Rules ensure users can only access their own reports and templates.

## Key Features

### 1. Dynamic Date Ranges
The system supports "rolling" date ranges (e.g., "Last 30 Days", "This Month"). These are calculated at generation time, ensuring scheduled reports always contain up-to-date data.

### 2. Template System
Templates allow users to pre-configure report structures (sections, widget layouts, design settings).
-   **Instantiation**: When a report is created from a template, all content and widgets are deep-copied to the new report entity.

### 3. Password Protection
Reports can be shared publicly via a unique URL.
-   **Security**: Password hashes are stored in the report document (`passwordHash`).
-   **Verification**: Client-side entered passwords are hashed and compared against the stored hash before revealing content.

## Future Improvements
-   **Server-Side Rendering**: Moving PDF generation to the backend to support emailing attachments directly.
-   **Versioning**: Implementing full version history for reports to allow rollback.
-   **Team Sharing**: Enhanced permissions model for team-based editing.
