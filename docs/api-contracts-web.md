# API Contracts - Part: web

> **Scan Level**: Quick (Pattern Matching Only)
> **Generated**: 2026-01-05

## Client Services Detected

The following service files were detected in `src/services/`. These likely correspond to API clients interacting with the backend.

| Service File | Likely Resource / Functionality |
| :--- | :--- |
| `reportService.ts` | Reports management (CRUD, generation) |
| `userProfileService.ts` | User profile and settings |
| `googleAds.ts` | Google Ads integration/proxy |
| `widgetService.ts` | Widget data and configuration |
| `templateService.ts` | Report templates |
| `scheduledReportService.ts` | Scheduled reporting tasks |
| `themeService.ts` | UI/Report themes |
| `liveDataService.ts` | Real-time or fetching live data |
| `demoDataService.ts` | Demo data generation |
| `dataService.ts` | General data fetching utility |

## API Patterns

- **Service Pattern**: The presence of `*Service.ts` files suggests a Service Repository pattern where API calls are encapsulated in service modules.
- **REST/RPC**: Likely communicates with Firebase Functions (RPC or REST) given the `functions` directory in the project.

_(Note: This is a quick scan based on filenames. For detailed endpoint signatures, run a Deep or Exhaustive scan.)_
