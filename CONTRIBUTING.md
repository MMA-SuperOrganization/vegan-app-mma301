# Contributing Guide

Thank you for contributing to the **Vegan Mobile App MMA302** project! To maintain high code quality and smooth team collaboration, please adhere to the following guidelines.

---

## 1. Branch Naming Conventions

All branches created for new features, bug fixes, or refactoring should follow standard conventions:

- `feature/<feature-name>`: New features (e.g., `feature/login-screen`, `feature/recipe-list`)
- `fix/<issue-name>`: Bug fixes (e.g., `fix/login-validation-crash`)
- `refactor/<module-name>`: Code refactoring without changing functionality (e.g., `refactor/button-styles`)
- `docs/<doc-name>`: Documentation updates (e.g., `docs/update-readme`)

---

## 2. Commit Message Conventions (Conventional Commits)

Commit messages should be written clearly in English following Conventional Commits standards:

- `feat: <description>`: New feature (e.g., `feat: add login screen with validation`)
- `fix: <description>`: Bug fix (e.g., `fix: resolve password visibility toggle issue`)
- `refactor: <description>`: Code refactoring (e.g., `refactor: extract Button styles to separate file`)
- `style: <description>`: UI adjustments, padding/margin tuning, formatting (e.g., `style: update login input margins`)
- `docs: <description>`: Documentation changes (e.g., `docs: update setup guide in README`)
- `chore: <description>`: Tooling, dependency changes, config adjustments (e.g., `chore: add npm run dev script`)

---

## 3. Pull Request (PR) Checklist

Before submitting a Pull Request to merge into `main` or `develop`, please complete the following steps:

1. **Sync Latest Changes**: Pull the latest updates from the base branch (`git pull origin main`).
2. **TypeScript Type Check**: Ensure there are no TypeScript errors or unintended `any` types:
   ```bash
   npm run typecheck
   ```
3. **Linting Verification**: Ensure code adheres to ESLint rules:
   ```bash
   npm run lint
   ```
4. **Code Formatting**: Ensure all files are formatted cleanly:
   ```bash
   npm run format
   ```
5. **Local Verification**: Start the development server using:
   ```bash
   npm run dev
   ```
   Confirm that screens render properly with no redboxes or unhandled errors.
6. **Descriptive PR Description**: Clearly state what was changed, attach UI screenshots/recordings if applicable, and highlight any items requiring reviewer attention.
