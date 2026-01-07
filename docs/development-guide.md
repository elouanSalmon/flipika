# Development Guide

> **Generated**: 2026-01-05

## Prerequisites

- **Node.js**: v22 (Required for Functions)
- **npm**: Compatible with Node 22
- **Firebase CLI**: `npm install -g firebase-tools`
- **Java Development Kit (JDK)**: Required for Firebase Emulators

## Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    # Root (Frontend)
    npm install

    # Functions (Backend)
    cd functions
    npm install
    ```
3.  **Environment Variables**:
    - Copy `.env.example` to `.env` in root
    - Copy `.env.example` to `.functions/.env` (if applicable)

## Local Development

### Frontend
Run the Vite development server:
```bash
npm run dev
```
Access at `http://localhost:5173`

### Backend (Functions)
Run the Firebase Emulators:
```bash
npm run serve
# Or from root:
firebase emulators:start
```

## Build

### Frontend
```bash
# Development build
npm run build:dev

# Production build
npm run build:prod
```

### Backend
```bash
cd functions
npm run build
```

## Testing

- **Linting**: `npm run lint`

## Project Structure

- **src/**: React Frontend
- **functions/**: Firebase Cloud Functions
