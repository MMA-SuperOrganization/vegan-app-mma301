# Vegan Mobile App MMA302

[![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~57.0.24-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~6.0.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zustand](https://img.shields.io/badge/State-Zustand_5-443e38)](https://zustand-demo.pmnd.rs/)
[![TanStack Query](https://img.shields.io/badge/Query-TanStack_5-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![License](https://img.shields.io/badge/Course-MMA301%20%2F%20MMA302-green)](https://fpt.edu.vn)

## Overview

**Vegan Mobile App** is a modern, cross-platform mobile application designed to assist users in adopting, maintaining, and enjoying a vegetarian and plant-based lifestyle. The application provides comprehensive support for discovering delicious vegan recipes, personalized meal planning, AI-powered nutritional recommendations, educational cooking videos, and community interactions.

The project is engineered following **Clean Architecture**, **Feature-First Domain Grouping**, **Strict TypeScript Typing**, and **Centralized Design Tokens** based on Figma specifications.

---

## Tech Stack & Architecture Decisions

| Technology                       | Category             | Purpose & Rationale                                                                                                                        |
| :------------------------------- | :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| **React Native & Expo**          | Core Framework       | Cross-platform runtime targeting iOS and Android. Expo Go enables rapid on-device testing and debugging without manual native compilation. |
| **Expo Router (`expo-router`)**  | Navigation & Routing | Modern file-based routing architecture. App routes in `src/app/` act as thin delegates to domain-rich feature screens.                     |
| **TypeScript**                   | Type Safety          | Strict compile-time validation across components, theme tokens, store actions, and API schemas to eliminate runtime bugs.                  |
| **Zustand**                      | Client State         | Minimalist, hook-driven client-side state management (authentication status, current session, user profile, UI preferences).               |
| **TanStack Query (React Query)** | Server State         | Declarative server-state caching, background synchronization, stale-time handling, and network state management.                           |
| **Axios**                        | HTTP Client          | Centralized HTTP client configured with environment-based URLs, request timeouts, bearer token injection, and unified error handling.      |
| **AsyncStorage**                 | Local Storage        | Asynchronous, unencrypted key-value persistent storage for preserving sessions and cached preferences across app restarts.                 |
| **React Native `StyleSheet`**    | Styling Engine       | Built-in stylesheet system integrated with centralized theme tokens (`@/theme`). Zero third-party runtime CSS overhead.                    |
| **ESLint & Prettier**            | Code Quality         | Flat ESLint configuration (`typescript-eslint`) and Prettier rules ensuring clean code and consistent formatting.                          |

### Architectural Principles

1. **Strict State Segregation**:
   - **Zustand** manages client-only state (`src/features/auth/store/`).
   - **TanStack Query** manages server state (remote queries, caching, mutations). Server responses are not cloned into Zustand.
2. **Design Tokens First**:
   - All components consume tokens (`colors`, `spacing`, `radius`, `typography`, `shadows`, `sizes`) from `@/theme`. Hardcoded values are strictly avoided.
3. **Thin Route Layer**:
   - Files in `src/app/` only configure route wrappers and navigation headers, immediately delegating rendering to feature screen components in `src/features/`.
4. **Service Abstraction**:
   - Network interactions and local storage are abstracted inside `src/services/` to prevent third-party library lock-in across feature screens.

---

## Design System & Theme Foundation

The visual identity is derived from the Figma **Typography & Color Theme** foundation (node [`158:542`](https://www.figma.com/design/ubV7q0QQdol4rlSN1ZBTjC/MMA301?node-id=158-542)).

```ts
import { colors, spacing, radius, typography, shadows, sizes } from '@/theme';
```

### Visual Tokens

- **Colors (`colors.ts`)**:
  - `primary`: Forest green palette (`100`, `200`, `300`, `400`, `500` [brand], `600`, `700`, `800`, `900`).
  - `accent`: Warm culinary orange tones (`100`, `500`, `700`).
  - `background`: Base canvas (`#F7F2EB`), surface cards (`#FFFFFF`), elevated elements (`#FFFFFF`), disabled (`#F1EAE0`).
  - `text`: High-contrast primary (`#222B27`), secondary muted (`#5C6B64`), tertiary (`#8C9A93`), inverse (`#FFFFFF`).
  - `status`: Semantic colors for `success`, `warning`, `error`, `info`.
  - `border`: Default (`#D7DFD8`), focused, and disabled borders.
- **Typography (`typography.ts`)**:
  - Native system sans-serif font stack (`System` on iOS, `sans-serif` on Android) for instant rendering and clean aesthetics.
  - Scale: `heading1` (32px), `heading2` (28px), `heading3` (24px), `heading4` (20px), `heading5` (18px), `heading6` (16px), `bodyDefault` (16px), `bodyStrong` (16px bold), `bodySmall` (14px), `caption` (12px).
- **Spacing (`spacing.ts`)**: Consistent 4px grid scale (`xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 40`, `xxxl: 48`).
- **Radius (`radius.ts`)**: Boundary roundedness (`xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `full: 9999`).
- **Shadows (`shadows.ts`)**: Multi-platform drop shadows (`sm`, `md`, `lg`).
- **Sizes (`sizes.ts`)**: Element sizing tokens for icons (`xs` to `xxl`), buttons, inputs, and avatars.

---

## Project Structure

The project employs a modular, domain-driven structure designed for scalability and maintainability:

```text
vegan-app-mma302/
├── .env.example                     # Environment variable definitions template
├── .gitignore                       # Git ignore specifications
├── app.json                         # Expo configuration (scheme: veganapp, adaptive icons)
├── CONTRIBUTING.md                  # Team workflow, branching, commit, & PR guidelines
├── eslint.config.js                 # Flat ESLint configuration with typescript-eslint
├── package.json                     # Project dependencies, scripts, and package metadata
├── prettier.config.js               # Prettier formatting specifications
├── README.md                        # Master repository documentation
├── tsconfig.json                    # TypeScript compiler configuration with @/* alias
│
├── assets/                          # Static media, icons, and asset bundles
│   ├── animations/                  # Lottie and micro-interaction animations (.gitkeep)
│   ├── fonts/                       # Custom typography assets (.gitkeep)
│   ├── icons/                       # Domain-specific SVG / vector icons (.gitkeep)
│   ├── images/                      # Static food illustrations and recipe images (.gitkeep)
│   ├── android-icon-background.png  # Adaptive Android icon background
│   ├── android-icon-foreground.png  # Adaptive Android icon foreground
│   ├── android-icon-monochrome.png  # Adaptive Android monochrome icon
│   ├── favicon.png                  # Web favicon
│   ├── icon.png                     # Primary application launcher icon
│   └── splash-icon.png              # Splash screen brand icon
│
├── tests/                           # Unit and integration test suites (.gitkeep)
│
└── src/                             # Source code root (@/*)
    ├── app/                         # Expo Router file-based navigation (routes only)
    │   ├── _layout.tsx              # Root app layout (SafeArea, QueryClient, StatusBar, Stack)
    │   ├── index.tsx                # Initial entry route -> delegates to HomeScreen
    │   └── (auth)/                  # Auth route group
    │       └── login.tsx            # Login route -> delegates to LoginScreen
    │
    ├── components/                  # Shared, reusable UI component library
    │   ├── index.ts                 # Component library public barrel export
    │   ├── feedback/                # Modals, toasts, alerts, and confirmation dialogs (.gitkeep)
    │   ├── layout/                  # Screen-level wrappers and container layouts
    │   │   ├── index.ts             # Layout barrel export
    │   │   └── Screen/              # Safe-area and background aware screen container
    │   │       ├── Screen.tsx
    │   │       ├── Screen.styles.ts
    │   │       ├── Screen.types.ts
    │   │       └── index.ts
    │   ├── navigation/              # Custom headers, bottom navigation tabs, drawers (.gitkeep)
    │   └── ui/                      # Atomic design UI elements
    │       ├── index.ts             # UI components barrel export
    │       ├── Badge/               # Status and category badges (primary, success, neutral, etc.)
    │       ├── Button/              # Primary, secondary, outline, and ghost touchable buttons
    │       ├── Card/                # Content card containers (default, surface, accent, outlined)
    │       ├── Input/               # Text inputs with labels, helper texts, icons, & eye-toggle
    │       └── Loading/             # Centered activity indicator and full-screen overlay
    │
    ├── constants/                   # Global configuration constants and enum values (.gitkeep)
    │
    ├── features/                    # Domain-driven feature modules
    │   ├── ai-chat/                 # AI Vegan culinary & nutrition chatbot (.gitkeep)
    │   │
    │   ├── auth/                    # Authentication domain module
    │   │   ├── components/          # Auth-specific UI elements (.gitkeep)
    │   │   ├── hooks/               # Auth-specific custom hooks (.gitkeep)
    │   │   ├── screens/             # Auth presentation screens
    │   │   │   └── LoginScreen.tsx  # Interactive login screen with validation & states
    │   │   ├── services/            # Auth API and backend integration
    │   │   │   └── authApi.ts       # Login, logout, and token authentication service
    │   │   ├── store/               # Feature-scoped client state
    │   │   │   └── authStore.ts     # Zustand store with persistent session restore
    │   │   ├── types/               # Auth domain TypeScript contracts
    │   │   │   └── auth.types.ts    # User, AuthState, and AuthResponse interfaces
    │   │   ├── validations/         # Form validation logic
    │   │   │   └── loginValidation.ts # Email and password validation utilities
    │   │   └── index.ts             # Feature public API barrel export
    │   │
    │   ├── community/               # Social feed, user recipe posts, and reviews (.gitkeep)
    │   │
    │   ├── meal-planner/            # Weekly meal scheduling and smart grocery checklists
    │   │   ├── components/          # Meal schedule cards, calendar widgets (.gitkeep)
    │   │   ├── hooks/               # Meal planning hooks (.gitkeep)
    │   │   ├── screens/             # Meal plan overview & grocery list screens (.gitkeep)
    │   │   ├── services/            # Meal planning API endpoints (.gitkeep)
    │   │   ├── store/               # Meal planner client state (.gitkeep)
    │   │   ├── types/               # Meal, recipe allocation, and grocery types (.gitkeep)
    │   │   └── validations/         # Meal input validation (.gitkeep)
    │   │
    │   ├── notifications/           # Push and in-app reminder notifications (.gitkeep)
    │   │
    │   ├── profile/                 # User profile, account management, & dashboard
    │   │   ├── components/          # Profile widgets (.gitkeep)
    │   │   ├── hooks/               # Profile hooks (.gitkeep)
    │   │   ├── screens/             # Profile presentation screens
    │   │   │   └── HomeScreen.tsx   # Authenticated dashboard with user info & logout
    │   │   ├── services/            # Profile API endpoints (.gitkeep)
    │   │   ├── types/               # Profile data contracts (.gitkeep)
    │   │   └── index.ts             # Profile feature barrel export
    │   │
    │   ├── recipes/                 # Recipe catalog, categories, search, and details
    │   │   ├── components/          # RecipeCard, IngredientList, FilterChips (.gitkeep)
    │   │   ├── hooks/               # useRecipes, useRecipeDetail query hooks (.gitkeep)
    │   │   ├── screens/             # RecipeList, RecipeDetail screens (.gitkeep)
    │   │   ├── services/            # Recipe catalog API requests (.gitkeep)
    │   │   ├── store/               # Recipe filters & search state (.gitkeep)
    │   │   ├── types/               # Recipe, Ingredient, and Category types (.gitkeep)
    │   │   └── validations/         # Recipe review & rating validations (.gitkeep)
    │   │
    │   ├── shops/                   # Vegan restaurants, cafes, & green grocery locator (.gitkeep)
    │   │
    │   └── videos/                  # Cooking guides, recipe reels, & culinary videos (.gitkeep)
    │
    ├── hooks/                       # Shared custom hooks across features
    │   ├── useAppTheme.ts           # Access current theme tokens hook
    │   └── index.ts                 # Hooks barrel export
    │
    ├── services/                    # Infrastructure and core application services
    │   ├── api/                     # Centralized HTTP network client
    │   │   ├── apiClient.ts         # Axios instance, interceptors, auth headers
    │   │   ├── apiConfig.ts         # Base endpoints, timeouts, and headers
    │   │   ├── apiError.ts          # Standardized ApiError handling class
    │   │   └── index.ts             # API service barrel export
    │   ├── firebase/                # Firebase messaging and push notification service (.gitkeep)
    │   ├── location/                # Device geolocation and map services (.gitkeep)
    │   └── storage/                 # Local persistence wrapper
    │       ├── storage.ts           # Type-safe AsyncStorage get, set, remove, clear
    │       ├── storageKeys.ts       # Centralized storage key definitions
    │       └── index.ts             # Storage service barrel export
    │
    ├── store/                       # Global cross-cutting stores (.gitkeep)
    │
    ├── theme/                       # Figma-backed design system tokens
    │   ├── colors.ts                # Palette colors (primary, accent, background, text, status)
    │   ├── commonStyles.ts          # Standardized layout utilities (flexCenter, rowBetween, etc.)
    │   ├── lightTheme.ts            # Default light theme implementation
    │   ├── radius.ts                # Corner border radius tokens
    │   ├── shadows.ts               # Elevation and multi-platform shadow tokens
    │   ├── sizes.ts                 # Standard dimension tokens for UI elements
    │   ├── spacing.ts               # 4px-grid spacing tokens (xs to xxxl)
    │   ├── types.ts                 # Theme types and AppTheme interface
    │   ├── typography.ts            # Typography scale, weights, and letter spacings
    │   └── index.ts                 # Theme barrel export
    │
    ├── types/                       # Shared global TypeScript types
    │   └── index.ts                 # BaseEntity, ApiResponse<T>, PaginatedResponse<T>
    │
    └── utils/                       # Shared general utility functions (.gitkeep)
```

---

## Directory Responsibilities

| Directory                    | Purpose                                                              | Best Practices                                                                                                        |
| :--------------------------- | :------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **`src/app/`**               | Expo Router route adapters and navigation root.                      | Keep files thin! Route files should only extract params and delegate rendering to feature screens in `src/features/`. |
| **`src/components/ui/`**     | Atomic reusable UI components (Button, Input, Card, Badge, Loading). | Purely presentational. Never couple to business domain logic. Must consume design tokens from `@/theme`.              |
| **`src/components/layout/`** | Screen containers and layout primitives.                             | Handles safe areas, status bar styling, and platform background adjustments.                                          |
| **`src/features/<name>/`**   | Domain-encapsulated feature modules.                                 | Contains screens, feature-scoped components, custom hooks, API calls, types, validations, and Zustand stores.         |
| **`src/services/api/`**      | Unified network abstraction layer.                                   | Manages Axios instances, base URLs, Bearer authorization token injection, and response normalization.                 |
| **`src/services/storage/`**  | Device persistence layer.                                            | Encapsulates AsyncStorage with JSON serialization, error logging, and centralized keys (`storageKeys.ts`).            |
| **`src/theme/`**             | Centralized Figma visual design tokens.                              | Source of truth for all styling (`colors`, `spacing`, `typography`, `radius`, `shadows`, `sizes`).                    |
| **`src/types/`**             | Universal data models.                                               | Base entities, standard paginated API envelopes, and shared data transfer objects.                                    |
| **`src/hooks/`**             | Cross-feature custom React hooks.                                    | General-purpose utilities (e.g. `useAppTheme`). Feature-specific hooks belong in their respective feature folder.     |

---

## UI Component Library

The app includes built-in, type-safe UI components located in `src/components/`:

### 1. `Button`

Supports visual variants (`primary`, `secondary`, `outline`, `ghost`), multiple sizes (`sm`, `md`, `lg`), loading spinner, disabled state, and left/right icon slots.

```tsx
import { Button } from '@/components';

<Button
  title="Sign In"
  variant="primary"
  size="md"
  loading={isLoading}
  onPress={handleLogin}
/>;
```

### 2. `Input`

Provides floating labels, placeholder text, secure entry toggling with eye icon, left/right accessory icons, helper text, and real-time error states.

```tsx
import { Input } from '@/components';

<Input
  label="Email Address"
  placeholder="user@veganapp.com"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  autoCapitalize="none"
  keyboardType="email-address"
/>;
```

### 3. `Card`

Surface container supporting `default`, `surface`, `accent`, and `outlined` styles with optional touch interaction.

```tsx
import { Card } from '@/components';

<Card variant="accent" onPress={handlePress}>
  <Text>Daily Vegan Nutrition Insight</Text>
</Card>;
```

### 4. `Badge`

Compact label for categories, difficulty levels, and statuses with color variants (`primary`, `secondary`, `success`, `warning`, `danger`, `neutral`).

```tsx
import { Badge } from '@/components';

<Badge label="High Protein" variant="success" size="sm" />;
```

### 5. `Loading`

Activity indicator with configurable colors, informative status messages, and full-screen backdrop modes.

```tsx
import { Loading } from '@/components';

if (isRestoringSession) {
  return <Loading fullScreen message="Loading session..." />;
}
```

### 6. `Screen`

Consistent screen layout wrapper managing safe area insets and background colors across iOS and Android.

```tsx
import { Screen } from '@/components';

<Screen>
  <ScrollView>{/* Screen content */}</ScrollView>
</Screen>;
```

---

## Getting Started

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **Package Manager**: npm or Yarn
- **Expo Go App**: Installed on your physical Android or iOS device for live mobile testing.

### 2. Installation

Clone the repository and install all dependencies:

```bash
# Using npm
npm install --legacy-peer-deps

# Or using Yarn
yarn install
```

### 3. Configure Environment

Create your `.env` configuration file from `.env.example`:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux / Git Bash
cp .env.example .env
```

Ensure `EXPO_PUBLIC_API_URL` points to your backend instance:

```env
EXPO_PUBLIC_API_URL=https://api.veganapp.example.com
```

### 4. Running the Development Server

Start the local Expo development bundler:

```bash
# Using npm
npm run dev

# Or using Yarn
yarn dev
```

### 5. Launching on Devices & Emulators

Once the Expo interactive terminal is running:

- **Physical Device**: Open the **Expo Go** application and scan the QR code in your terminal.
- **Android Emulator**: Press `a` in your terminal (or run `npm run android` / `yarn android`).
- **iOS Simulator**: Press `i` in your terminal (or run `npm run ios` / `yarn ios`).
- **Web Browser**: Press `w` in your terminal (or run `npm run web` / `yarn web`).

---

## Available Scripts

| Script          | Command (npm / Yarn)                   | Description                                             |
| :-------------- | :------------------------------------- | :------------------------------------------------------ |
| **`dev`**       | `npm run dev` / `yarn dev`             | Starts the Expo development server with Metro bundler   |
| **`start`**     | `npm start` / `yarn start`             | Alias to start Expo development server                  |
| **`android`**   | `npm run android` / `yarn android`     | Boots the application directly into an Android emulator |
| **`ios`**       | `npm run ios` / `yarn ios`             | Boots the application directly into an iOS simulator    |
| **`web`**       | `npm run web` / `yarn web`             | Launches the web version of the application in browser  |
| **`typecheck`** | `npm run typecheck` / `yarn typecheck` | Validates TypeScript types across the entire project    |
| **`lint`**      | `npm run lint` / `yarn lint`           | Lints JavaScript and TypeScript files using ESLint 9    |
| **`format`**    | `npm run format` / `yarn format`       | Automatically formats all source code with Prettier     |

---

## Authentication & Navigation Flow

1. **Bootstrap (`src/app/_layout.tsx`)**:
   - The application mounts `RootLayout`, sets up the `QueryClientProvider` and `SafeAreaProvider`.
   - Calls `restoreSession()` from `useAuthStore` to inspect local `AsyncStorage` for existing session credentials.
2. **Session Guard (`src/features/profile/screens/HomeScreen.tsx`)**:
   - If session restoration is in progress, the full-screen `Loading` indicator is presented.
   - If unauthenticated, the app performs a declarative redirect (`<Redirect href="/(auth)/login" />`).
3. **Login Experience (`src/features/auth/screens/LoginScreen.tsx`)**:
   - Accepts user credentials with live validation (valid email format, 6+ character password).
   - In development/mock mode, users can sign in with any valid email and 6+ character password (e.g. `test@example.com` / `123456`).
   - Upon authentication, tokens and profile details are persisted to `AsyncStorage`, and the store updates `isAuthenticated: true`.
4. **Dashboard (`HomeScreen`)**:
   - Shows active user information, daily nutrition insights, and a one-touch **Sign Out** button that clears persisted tokens and redirects back to Login.

---

## Roadmap & Milestone Features

```text
Phase 1: Architecture Baseline (Completed)
    ├── Figma Design System & Tokens
    ├── Atomic UI Component Library (Button, Input, Card, Badge, Loading, Screen)
    ├── Expo Router Navigation Shell & Layouts
    ├── Feature-Scoped Auth Module (LoginScreen, Validation, Mock Auth API)
    ├── Zustand Store & Local AsyncStorage Persistence
    └── Strict TypeScript, ESLint 9, & Prettier Infrastructure
    ↓
Phase 2: Recipe Discovery & Catalog (In Progress)
    ├── Recipe Card Components & Horizontal Category Carousels
    ├── Full-Text Search, Allergen Filters, & Dietary Badges
    └── Remote Recipe API Integration with TanStack React Query Caching
    ↓
Phase 3: Meal Planning & Smart Groceries
    ├── Weekly Meal Schedule Calendar (Breakfast, Lunch, Dinner, Snack)
    ├── Automated Grocery List Generation & Checklist Management
    └── Caloric & Macronutrient Balance Tracking
    ↓
Phase 4: Culinary Videos, Community & AI Assistant
    ├── Short-Form Cooking Video Feed (`expo-video`)
    ├── Community Recipe Sharing, Ratings & Reviews
    └── AI Nutritional Companion & Plant-Based Substitutions Assistant
    ↓
Phase 5: Production Hardening & Security
    ├── Migration to `expo-secure-store` for Sensitive Token Vaulting
    ├── Offline Cache Synchronization with TanStack Query Persisters
    └── Comprehensive Automated Unit and E2E Tests
```

---

## Contributing & Collaboration

We welcome contributions from all team members! Please consult [CONTRIBUTING.md](file:///d:/FPT_UNIVERSITY/SEMESTER_07/MMA301/vegan-app-mma302/CONTRIBUTING.md) for full guidelines.

### Summary Checklist Before Creating a PR:

1. **Keep branches clean**: Follow `feature/<name>`, `fix/<name>`, or `refactor/<name>`.
2. **Verify TypeScript**: Ensure zero type errors:
   ```bash
   npm run typecheck
   ```
3. **Verify Linting**:
   ```bash
   npm run lint
   ```
4. **Format Code**:
   ```bash
   npm run format
   ```
5. **Adhere to Conventional Commits**: Write clear commit messages (e.g., `feat: add recipe search filters`, `fix: handle invalid login error`).
