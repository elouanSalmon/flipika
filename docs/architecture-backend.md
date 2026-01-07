# Architecture: Backend

> **Part ID**: backend
> **Type**: Serverless Functions
> **Generated**: 2026-01-05

## Executive Summary

The Backend consists of **Firebase Cloud Functions** running in a Node.js 22 environment. It acts as the secure middleware for sensitive operations (payments, OAuth) and the engine for background tasks (scheduled reporting).

## Architecture Pattern

- **Pattern**: Serverless Microservices / Event-Driven
- **Triggers**:
  - **HTTP**: Synchronous endpoints invoked by Frontend.
  - **Protected HTTP**: Webhooks (Stripe, OAuth).
  - **Scheduled**: Cron-like triggers (Pub/Sub) for daily reporting.
  - **Database Triggers**: Firestore `onWrite` (not explicit in quick scan, but common pattern).

## Technology Stack

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Runtime** | Node.js 22 | Execution environment |
| **Framework** | Firebase Functions | Serverless framework |
| **Language** | TypeScript | Static typing |
| **SDK** | Firebase Admin | Privileged database access |
| **Integrations** | Google Ads API, Stripe | External services |

## Key Functions

### 1. OAuth Handler (`oauth.ts`)
- **Type**: HTTP
- **Role**: Handles the OAuth 2.0 callback flow from Google to securely exchange authorization codes for refresh tokens.

### 2. Widget Metrics (`widgetMetrics.ts`)
- **Type**: HTTP (Callable)
- **Role**: Securely queries Google Ads API with the stored user refresh token to fetch performance data for widgets. This keeps the Google Ads API token secure on the server.

### 3. Scheduled Reports (`generateScheduledReports.ts`)
- **Type**: Scheduled (Cron)
- **Role**: Runs daily to check for due reports, generates them, and potentially emails them.

### 4. Payments (`stripe.ts`)
- **Type**: HTTP (Webhook)
- **Role**: Listens for Stripe events (payment_succeeded, subscription_updated) to sync subscription status with Firestore User profiles.

## Security

- **Validation**: `validators.ts` ensures input integrity.
- **Rate Limiting**: `rateLimiter.ts` protects endpoints.
- **IAM**: Uses Service Account credentials via Firebase Admin SDK.
