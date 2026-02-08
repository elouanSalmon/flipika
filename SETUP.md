# Setup Instructions

## 1. Prerequisites
This machine is missing **Node.js**, which is required to run the project.

- **Install Node.js (v22 recommended)**:
  - We recommend using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager):
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    # Restart terminal based on instructions, then:
    nvm install 22
    nvm use 22
    ```
- **Install Firebase CLI**:
  ```bash
  npm install -g firebase-tools
  ```

## 2. Installation
Once Node.js is installed, run the following commands in the project root (`flipika`):

```bash
# Install root dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

## 3. Files to Import (Transfer from other Mac)
To continue coding with full functionality, you need to copy these configuration files from your other machine. These are ignored by git for security.

### Essential
- **`.env`** (in project root `flipika/`)
  - Contains API keys, Firebase config, Stripe keys, etc.
  - Reference: See `.env.example` for the expected variables.

### Backend / Gitignored
- **`functions/.env`** (if it exists)
  - Contains backend-specific secrets.
- **`serviceAccountKey.json`** (if present)
  - Check `functions/` or root. Often used for Admin SDK local emulation.
- **`google-ads.yaml`** (if present)
  - Required if you are working on the Google Ads integration locally.

## 4. Launching
After setup:
- **Dev Server**: `npm run dev`
- **Deploy**: `npm run deploy:dev` (See `package.json` for all scripts)
