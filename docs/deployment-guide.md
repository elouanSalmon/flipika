# Deployment Guide

> **Generated**: 2026-01-05

## Infrastructure

The project is deployed on **Google Firebase** using:
- **Hosting**: Serves the React frontend (SPA)
- **Cloud Functions**: Backend logic and API endpoints
- **Firestore**: NoSQL Database
- **Authentication**: Firebase Auth

## Configuration

- **firebase.json**: Handles hosting configuration, rewrites, and security headers.
  - Rewrites `/oauth/callback` to `handleOAuthCallback` function.
  - Rewrites `/sitemap.xml` to `serveSitemap` function.
  - Enforces strict Content Security Policy (CSP) headers.

## Deploying

The project uses `npm` scripts in the root directory for deployment.

### Environments

The project supports `dev` and `production` environments via Firebase project aliases.

### Development Environment
```bash
# Deploy everything (Hosting + Functions)
npm run deploy:dev

# Deploy Hosting only
npm run deploy:hosting:dev

# Deploy Functions only
npm run deploy:functions:dev
```

### Production Environment
```bash
# Deploy everything (Hosting + Functions)
npm run deploy:prod

# Deploy Hosting only
npm run deploy:hosting:prod

# Deploy Functions only
npm run deploy:functions:prod
```

## CI/CD

_(To be generated - Check .github/workflows for automated pipelines)_
