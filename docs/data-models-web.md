# Data Models - Part: web

> **Scan Level**: Quick (Pattern Matching Only)
> **Generated**: 2026-01-05

## Detected Types/Models

The following type definition files were detected in `src/types/`. These likely define the core domain models.

| Type File | Domain Entity |
| :--- | :--- |
| `reportTypes.ts` | **Report**: Main entity for generated reports |
| `userProfile.ts` | **UserProfile**: User account details |
| `templateTypes.ts` | **Template**: Layouts for reports |
| `subscriptionTypes.ts` | **Subscription**: Billing/Plan status |
| `scheduledReportTypes.ts` | **ScheduledReport**: Cron-like report configs |
| `business.ts` | **Business**: Business rules or entities |
| `reportThemes.ts` | **ReportTheme**: Visual styling models |

## Schema Inference

Based on the file names, the application domain centers around:
1.  **Users** managing **Reports**
2.  **Reports** are created from **Templates**
3.  **ScheduledReports** automate Report creation
4.  **Subscriptions** gate access to features

_(Note: This is a quick scan based on filenames. For detailed field-level schemas, run a Deep or Exhaustive scan.)_
