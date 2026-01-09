---
allowed-tools: Bash(git checkout --branch:*), Bash(git add:*), Bash(git status:*), Bash(git push:*), Bash(git commit:*), Bash(gh pr create:*), Bash(npm run deploy:*)
description: Commit, push to GitHub, and deploy to Firebase (Dev & Prod)
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Changed filenames: !`git diff --name-only HEAD`
- Current branch: !`git branch --show-current`

## Your task

You need to perform a complete sync and deployment workflow.
Based on the file changes above:

1.  **Git Sync**:
    -   Stage and commit changes with a descriptive message.
    -   Push to the current branch on GitHub.
    -   Create a PR if needed/requested.

2.  **Firebase Deployment**:
    -   Analyze the changed files to determine the necessary deployment targets (Hosting, Functions, or both).
        -   Changes in `functions/` -> Deploy Functions.
        -   Changes in `src/`, `public/`, `index.html` -> Deploy Hosting.
        -   Changes in `firestore.rules` -> Deploy Firestore Rules (if applicable script exists).
    -   **Deploy to DEV**: Execute the appropriate `npm run deploy:...:dev` commands (e.g., `deploy:hosting:dev` or `deploy:functions:dev`).
    -   **Deploy to PROD**: Execute the appropriate `npm run deploy:...:prod` commands.

You have the capability to call multiple tools in a single response. Perform the git operations and the deployments efficiently.
