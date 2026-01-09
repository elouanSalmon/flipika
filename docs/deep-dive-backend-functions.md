# Deep Dive: Backend Functions

## Overview
The `functions/src` directory contains the server-less backend logic for Flipika, built on **Firebase Cloud Functions (2nd Gen)**. It handles critical business logic that cannot run on the client, including Google Ads OAuth, Stripe billing synchronization, automated report generation, and data fetching for the dashboard.

## Key Responsibilities
1.  **Authentication & OAuth**: Managing Google Ads tokens and session security.
2.  **Billing & Subscriptions**: syncing Stripe events with proper access control (number of seats/accounts).
3.  **Data Processing**: Fetching and aggregating metrics from Google Ads API for dashboard widgets.
4.  **Scheduled Tasks**: Automated report generation, billing synchronization, and system backups.

## Architecture & Entry Points
The entry point is `index.ts`, which initializes the Firebase Admin SDK and exports all cloud functions.

### Core Functions
| Function Name | Trigger Type | Purpose | Source File |
| :--- | :--- | :--- | :--- |
| `initiateOAuth` | HTTP | Generates Google OAuth URL with state protection. | `oauth.ts` |
| `handleOAuthCallback` | HTTP | Exchanges code for tokens and updates user Firestore. | `oauth.ts` |
| `createStripeCheckout` | Callable | Creates Stripe session for new subscriptions. | `index.ts` / `stripe.ts` |
| `stripeWebhook` | HTTP | Handles subscription lifecycles (created, updated, canceled). | `index.ts` / `stripe.ts` |

### Data & Reporting
| Function Name | Trigger Type | Purpose | Source File |
| :--- | :--- | :--- | :--- |
| `listCampaigns` | HTTP | Fetches user campaigns using stored refresh tokens. | `index.ts` |
| `getWidgetMetrics` | HTTP | Aggregates performance data for dashboard charts. | `widgetMetrics.ts` |
| `getAdCreatives` | HTTP | Retrieves ad previews (headlines, images) for widgets. | `adCreatives.ts` |
| `generateScheduledReports` | Scheduled | Hourly job to generate PDF/Email reports. | `generateScheduledReports.ts` |

### System & SEO
| Function Name | Trigger Type | Purpose | Source File |
| :--- | :--- | :--- | :--- |
| `serveSitemap` | HTTP | Dynamic sitemap generation for SEO. | `serveSitemap.ts` |
| `domainRedirect` | HTTP | Redirects `*.web.app` to primary domain. | `domainRedirect.ts` |
| `backupFirestore` | Scheduled | Daily backup of Firestore data to GCS. | `backupFirestore.ts` |

## Dependencies
- **firebase-admin**: Database and Auth management.
- **firebase-functions**: Cloud Function triggers (v1 & v2).
- **google-ads-api**: Querying Google Ads data (GAQL).
- **stripe**: Payment processing.
- **cors**: Handling cross-origin requests for HTTP functions.

## Detailed Component Analysis

### Google Ads Integration (`oauth.ts`, `index.ts`)
The system uses a **centralized Developer Token** but individual **User Refresh Tokens**.
- `initiateOAuth`: Generates a secure URL with a random `state` (stored in Firestore `oauth_states`) to prevent CSRF.
- `listCampaigns`: Uses the user's stored refresh token to instantiate a `GoogleAdsApi` client and fetch campaign data.
- **Security**: The Developer Token is stored in Firebase Secrets (`GOOGLE_ADS_DEVELOPER_TOKEN`).

### Billing Synchronization (`stripe.ts`)
Billing is strictly tied to the **number of connected Google Ads accounts**.
- **Sync Logic**: `syncUserBilling` queries the Google Ads API to count active accounts and updates the Stripe Subscription quantity.
- **Webhooks**: Listens for `checkout.session.completed`, `customer.subscription.updated`, etc., to keep Firestore `subscriptions` collection in sync.

### Reporting Engine (`generateScheduledReports.ts`)
- **Trigger**: Runs every hour using `onSchedule`.
- **Logic**: Queries `scheduledReports` collection for due items (`nextRun <= now`).
- **Execution**: Generates a report artifact (PDF generation logic handled via template service) and updates `lastRun` status.

### Data Fetching (`widgetMetrics.ts`)
Optimized for frontend widgets.
- **Input**: `campaignIds`, `dateRange`, `widgetType` (e.g., 'performance_overview', 'campaign_chart').
- **Optimization**: Uses GAQL `IN` clauses for filtering campaigns and aggregates metrics (Impressions, Clicks, CTR, ROAS) server-side to reduce payload size.

## File Inventory
- `index.ts`: Main export file.
- `oauth.ts`: OAuth flow handlers.
- `stripe.ts`: Stripe SDK wrapper and webhook handlers.
- `widgetMetrics.ts`: Dashboard data aggregator.
- `adCreatives.ts`: Ad preview fetcher.
- `generateScheduledReports.ts`: Scheduling engine.
- `backupFirestore.ts`: Backup utility.
- `domainRedirect.ts`: SEO utility.
- `serveSitemap.ts` / `generateSitemap.ts`: Sitemap generation.
- `rateLimiter.ts`: Firestore-based rate limiting utility.
- `validators.ts`: Input validation helpers.
