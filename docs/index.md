# Project Documentation Index

> **Generated**: 2026-01-05
> **Workflow**: Document Project (Quick Scan)

## Project Overview

- **Name**: Flipika (derived)
- **Type**: Multi-Part (Web + Backend)
- **Primary Languages**: TypeScript, React, Node.js
- **Architecture**: Serverless / SPA

[Read Project Overview](./project-overview.md)

## Quick Reference

### Web Application (Frontend)
- **Tech**: React 19, Vite, TailwindCSS
- **Root**: `src/`
- **Entry**: `src/main.tsx`
- **Docs**: [Architecture](./architecture-web.md) | [Component Inventory](./component-inventory-web.md) | [API Contracts](./api-contracts-web.md)

### Backend Functions (Backend)
- **Tech**: Node.js 22, Firebase Cloud Functions
- **Root**: `functions/`
- **Entry**: `functions/src/index.ts`
- **Docs**: [Architecture](./architecture-backend.md) | [API Contracts](./api-contracts-backend.md)

## Generated Documentation

### Architecture & Design
- [Project Overview](./project-overview.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Integration Architecture](./integration-architecture.md)
- [Web Architecture](./architecture-web.md)
- [Backend Architecture](./architecture-backend.md)

### Technical Details
- [Component Inventory (Web)](./component-inventory-web.md)
- [Data Models (Web)](./data-models-web.md)
- [Data Models (Backend)](./data-models-backend.md) (Inferred)
- [API Contracts (Web)](./api-contracts-web.md)
- [API Contracts (Backend)](./api-contracts-backend.md)

### Guides
- [Development Guide](./development-guide.md)
- [Deployment Guide](./deployment-guide.md)

## Existing Documentation Found

- [README.md](../README.md) - Main entry
- [CLAUDE.md](../CLAUDE.md) - AI/LLM Instructions
- [FEATURE_FLAGS.md](../FEATURE_FLAGS.md)
- [STRIPE_SETUP.md](../STRIPE_SETUP.md)
- [GA4_USAGE_GUIDE.md](../GA4_USAGE_GUIDE.md)
- [I18N_STRUCTURE.md](../I18N_STRUCTURE.md)
- [DISASTER_RECOVERY.md](../DISASTER_RECOVERY.md)
- [BACKUP_DEPLOYMENT.md](../BACKUP_DEPLOYMENT.md)

## Getting Started

To run the full stack locally:

1.  **Frontend**: `npm run dev` in root
2.  **Backend**: `npm run serve` (requires Java for emulators)

See [Development Guide](./development-guide.md) for full setup.
