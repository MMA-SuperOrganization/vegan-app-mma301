# Vegan Mobile App MMA302

## Overview

Vegan Mobile App is a React Native mobile application designed to assist users interested in vegetarian and vegan nutrition, recipes, videos, lifestyle guidance, AI-powered recommendations, and related community services.

The project is structured with clean architecture, high maintainability, strict type safety, and beginner-friendly patterns tailored for university coursework and collaborative development teams.

---

## Tech Stack & Architecture Decisions

The project chooses modern, lightweight, and maintainable technologies tailored for collaborative mobile development:

| Technology                          | Category               | Purpose & Rationale                                                                                                                                                                                                                                                        |
| ----------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React Native & Expo**             | Core Mobile Framework  | Enables rapid cross-platform mobile development for Android and iOS. Expo Go allows immediate on-device preview without requiring heavy native compilation during early development.                                                                                       |
| **Expo Router**                     | Navigation & Routing   | Modern file-based routing architecture. Isolates screen definitions and layout hierarchies (`_layout.tsx`, `index.tsx`, `(auth)/login.tsx`) inside `src/app/`, preventing business logic leakage into routing files.                                                       |
| **TypeScript**                      | Language & Type Safety | Provides strict compile-time type checking for UI component props, theme tokens, API payloads, and store states. Eliminates common runtime bugs and accelerates teamwork.                                                                                                  |
| **ES Modules (`"type": "module"`)** | Module Standard        | Employs standard ES Module imports and exports throughout the codebase and configuration files.                                                                                                                                                                            |
| **React Native `StyleSheet`**       | Styling System         | Uses React Native's built-in `StyleSheet.create()` paired with centralized design tokens (`src/theme/`). Avoids third-party CSS utility frameworks (no NativeWind, Tailwind, or styled-components) to keep the project lightweight, predictable, and simple for beginners. |
| **Zustand**                         | Client / Global State  | Lightweight, hook-based client state manager without Redux boilerplate. Specifically designated for client-side state (authentication status, current user profile, local session flags).                                                                                  |
| **TanStack Query (React Query)**    | Server / Async State   | Industry-standard async server state manager. Handles API caching, background refetching, stale time management, and network synchronization without polluting global client stores.                                                                                       |
| **Axios**                           | Network / HTTP Client  | Centralized HTTP client instance (`src/services/api/client.ts`) configured with base URL resolution from environment variables, request timeouts, and interceptors for bearer token insertion.                                                                             |
| **AsyncStorage**                    | Local Persistence      | Provides key-value offline storage wrapped inside `src/services/storage/storage.ts` for session and preference preservation across app restarts.                                                                                                                           |
| **ESLint & Prettier**               | Quality & Formatting   | Enforces consistent code formatting and static code quality rules across all team contributors.                                                                                                                                                                            |

### Architectural Principles

1. **Separation of State Responsibilities**:
   - **Zustand** handles _client-side state_ (e.g., active user, authentication tokens, theme preferences).
   - **TanStack Query** handles _server-side state_ (e.g., recipes, nutrition data, remote queries). API responses are not duplicated in Zustand.
2. **Design Tokens Over Hardcoded Values**:
   - All components consume centralized tokens from `@/theme` (`colors`, `spacing`, `typography`, `radius`), ensuring a cohesive visual identity.
3. **Abstraction of External Services**:
   - Storage operations are wrapped in `src/services/storage/` and API calls in `src/services/api/` to avoid direct library coupling throughout screens.

---

## Getting Started

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment

Copy `.env.example` to `.env` and set your API base URL:

```bash
cp .env.example .env
```

### 3. Start the development server

You can start the app using `npm run dev`:

```bash
npm run dev
```

_(Alternatively, you can also run `npm start` or `npx expo start`)_

### 4. Running on Target Platforms

- **Physical Device / Expo Go**: Scan the QR code displayed in the terminal using the Expo Go mobile app.
- **Android Emulator**: Press `a` in the terminal after the development server starts.
- **Web Browser**: Run `npm run web` (or press `w` in the terminal).

---

## Project Structure

```text
vegan-app-mma302/
│
├── src/
│   ├── app/           # Expo Router: routes, layouts (_layout.tsx), and screens
│   ├── components/    # Reusable UI components (Button, Input, Loading)
│   ├── features/      # Feature modules (auth, recipes, meal-planner, etc.)
│   ├── services/      # External services (Axios apiClient, AsyncStorage persistence)
│   ├── store/         # Zustand global stores (authStore)
│   ├── hooks/         # Custom reusable React hooks
│   ├── theme/         # Design system tokens (colors, spacing, typography, radius)
│   ├── constants/     # Application constants
│   ├── types/         # Shared TypeScript definitions
│   └── utils/         # Helper functions and utilities
│
├── assets/            # Static media, icons, and fonts
├── tests/             # Automated test suites
├── .env.example       # Sample environment configuration
├── .gitignore         # Version control ignore rules
├── app.json           # Expo app manifest (scheme: veganapp)
├── package.json       # Project dependencies, scripts, and ES module configuration
├── tsconfig.json      # TypeScript compiler configuration with @/* path alias
├── eslint.config.js   # ESLint flat config with typescript-eslint
└── prettier.config.js # Prettier formatting settings
```

### Directory Responsibilities

- **`src/app/`**: Contains route files, navigation groups (e.g. `(auth)/login.tsx`), and root layouts (`_layout.tsx`). Business logic should not be placed directly in route files.
- **`src/components/`**: Houses reusable UI components built on design system tokens.
- **`src/features/`**: Domain-specific feature modules created on-demand as features are implemented.
- **`src/services/`**: Centralized API client and local device storage abstraction layer.
- **`src/store/`**: Global client-side state stores (e.g. user authentication and session management).
- **`src/hooks/`**: Shared custom React hooks across screens.
- **`src/theme/`**: Theme tokens including color palette, spacing, typography, and border radius.
- **`src/constants/`**: Global constant values, error codes, and configuration parameters.
- **`src/types/`**: Shared TypeScript types and data models.
- **`src/utils/`**: General helper and formatting functions.

---

## Available Scripts

| Command             | Description                                           |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Starts the Expo development server                    |
| `npm start`         | Alias for `expo start`                                |
| `npm run android`   | Starts the development server for Android             |
| `npm run ios`       | Starts the development server for iOS                 |
| `npm run web`       | Starts the web development server                     |
| `npm run typecheck` | Validates TypeScript types across the codebase        |
| `npm run lint`      | Analyzes code for syntax and style issues with ESLint |
| `npm run format`    | Formats the codebase using Prettier                   |

---

## Environment Variables

Defined in `.env.example`:

| Variable              | Description                                |
| --------------------- | ------------------------------------------ |
| `EXPO_PUBLIC_API_URL` | Base endpoint URL for backend API requests |

---

## Authentication Flow (Initial Milestone)

1. The app boots into `src/app/_layout.tsx` and checks for an active session using `authStore.restoreSession()`.
2. If unauthenticated, the app redirects to the Login screen (`/(auth)/login`).
3. Users can test login with any valid email and a password of 6+ characters.
4. Upon successful authentication, session state is persisted in `AsyncStorage` and the user is navigated to the Home Dashboard with sign-out functionality.

---

## Planned Libraries & Future Integrations

As the application expands to support advanced vegan lifestyle features, the following libraries are slated for progressive adoption:

| Planned Library                                | Category                     | Intended Use Case in Vegan App                                                                                                                                                        |
| ---------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Expo SecureStore** (`expo-secure-store`)     | Security & Credentials       | Encrypted storage for sensitive authentication tokens (JWT refresh tokens, biometric credentials), replacing standard AsyncStorage for high-security items.                           |
| **Expo Image** (`expo-image`)                  | Media Optimization           | High-performance, memory-efficient image loading with automatic disk caching, blurhash placeholders, and progressive rendering for food photography, recipe covers, and user avatars. |
| **Expo Video / AV** (`expo-video` / `expo-av`) | Multimedia Streaming         | Fluid video playback for vegan cooking tutorials, chef recipe guides, and short-form lifestyle tips.                                                                                  |
| **React Hook Form + Zod**                      | Form Management & Validation | Declarative form state management and runtime type-safe schema validation for complex forms (e.g., custom recipe creator, personalized onboarding questionnaires, allergen filters).  |
| **React Native Reanimated**                    | Motion & Animation           | 60/120fps gesture-driven micro-interactions, smooth swipe-to-delete on grocery lists, card transition animations, and interactive meal-prep timelines.                                |
| **Jest + React Native Testing Library**        | Automated Testing            | Comprehensive unit and integration test coverage for core business logic, utility functions, custom hooks, and critical UI workflows.                                                 |

---

## Development Strategy & Roadmap

The development follows a **pragmatic, milestone-driven, and incremental** approach to prevent over-engineering and ensure steady progress:

```text
Start Simple (Lean Baseline)
    ↓
Build a Working Vertical Slice
    ↓
Identify Reusable Patterns
    ↓
Extract Components & Tokens
    ↓
Progressive Feature Expansion
```

### Core Strategy Principles

1. **Feature On-Demand Folder Structure**:
   Do not pre-create empty feature folders prematurely. Feature modules under `src/features/` (e.g., `recipes/`, `meal-planner/`, `chatbot/`) are created only when that domain is actively developed.
2. **State Segregation Rule**:
   - Client state stays in **Zustand** stores (`src/store/`).
   - Remote data stays in **TanStack Query** hooks (`src/services/api/` and feature hooks).
   - Never duplicate server-fetched data into Zustand unless offline persistence is specifically mandated.
3. **Design System Discipline**:
   Avoid arbitrary colors, margins, or padding. Every component must strictly consume tokens from `@/theme` (`colors`, `spacing`, `typography`, `radius`).
4. **Codebase Readability & Student Friendliness**:
   Prioritize self-documenting code, straightforward TypeScript types, and clear component contracts over heavy abstract design patterns.

### Milestone Roadmap

- **Phase 1 (Completed)**: Baseline Architecture, Design Tokens, Reusable Components (Button, Input, Loading), Expo Router Navigation, Zustand Auth Store, and AsyncStorage Session Persistence.
- **Phase 2 — Recipe Catalog & Discovery**: Implement `src/features/recipe` with categorized browse, full-text search, dietary allergen filters, and remote API integration via TanStack Query.
- **Phase 3 — Meal Planning & Smart Groceries**: Implement `src/features/meal-planner` allowing users to schedule weekly vegan meals and automatically generate organized grocery checklists.
- **Phase 4 — Media, Community & AI Assistant**: Add `src/features/video` for cooking guides, `src/features/blog` for nutrition articles, and `src/features/chatbot` for conversational vegan nutritional assistance.
- **Phase 5 — Security Hardening & Performance Polish**: Migrate token storage to Expo SecureStore, add offline query caching, implement automated tests, and bundle optimization for production release.
