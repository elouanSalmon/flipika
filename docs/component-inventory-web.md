# Component Inventory - Part: web

> **Scan Level**: Quick (Structure Analysis)
> **Generated**: 2026-01-05

## Component Categories

The `src/components/` directory is organized by feature domain.

### 1. Reports (`src/components/reports/`)
The core feature of the application.
- **Editors**: `ReportEditor`, `ReportCanvas`, `DesignPanel`.
- **Widgets**: `widgets/` folder containing data visualization components (`PerformanceOverviewWidget`, `CampaignChartWidget`).
- **Items**: `SectionItem`, `WidgetItem` (Draggable elements).

### 2. Dashboard (`src/components/dashboard/`)
Data visualization for the main user view.
- **Cards**: `KPICard`, `MetricsGrid`.
- **Charts**: `SpendingChart`, `ConversionTrendChart`.

### 3. Billing (`src/components/billing/`)
Subscription management UI.
- **Modals**: `PricingInfoModal`.
- **Info**: `CanceledSubscriptionNotice`.

### 4. Common / Shared (`src/components/common/`)
Reusable UI elements used across efficient contexts.
- **Input**: `DateRangePicker`.
- **Feedback**: `Spinner`, `ErrorState`, `EmptyState`.

### 5. Layout & Navigation
- **Headers**: `Header`, `SimpleHeader`, `ReportEditorHeader`.
- **Footer**: `Footer`.
- **HOCs**: `SubscriptionGuard` (Protects routes based on plan).

## Design System

- **Styling**: TailwindCSS is the primary design system implementation.
- **Theming**: Supported via `ThemeContext` and `src/data/defaultThemes.ts` for report styling flexibility.

_(Note: This is a high-level inventory. For a complete list of props and usage, run a Deep scan.)_
