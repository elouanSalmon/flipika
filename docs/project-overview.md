# Project Overview: Flipika

> **Generated**: 2026-01-05
> **Type**: Full Stack Application (React + Firebase)

## Executive Summary

**Flipika** is a SaaS platform designed to automate the creation and scheduling of Google Ads performance reports. It targets media buyers and agencies who need to provide transparent, regular reporting to their clients without manual effort.

## Architecture Classification

The project follows a **Multi-Part Monorepo** structure:
- **Frontend**: React SPA for user interaction.
- **Backend**: Firebase Cloud Functions for business logic and integrations.
- **Repository**: Single Git repository containing both parts.

## Technology Stack Summary

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, TailwindCSS |
| **Backend** | Node.js 22, Firebase Cloud Functions |
| **Database** | Cloud Firestore (NoSQL) |
| **Auth** | Firebase Authentication |
| **Integrations** | Google Ads API, Stripe |

## Key Features

1.  **Report Builder**: Drag-and-drop interface to create custom reporting templates.
2.  **Google Ads Integration**: Secure OAuth flow to pull live campaign metrics.
3.  **Scheduling**: Automated email delivery of reports (daily, weekly, monthly).
4.  **Client Dashboard**: View-only access for clients to see their stats.
5.  **Billing**: SaaS subscription model handled via Stripe.

## Documentation Navigation

- [Architecture - Web](./architecture-web.md)
- [Architecture - Backend](./architecture-backend.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Integration Architecture](./integration-architecture.md)
