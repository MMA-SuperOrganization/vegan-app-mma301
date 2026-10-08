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
    │   ├── index.ts                 # Component library public barrel export (re-exports ui & layout)
    │   ├── feedback/                # Modals, toasts, alerts, and confirmation dialogs (.gitkeep)
    │   ├── layout/                  # Screen-level wrappers and container layouts
    │   │   ├── index.ts             # Layout barrel export (re-exports Screen)
    │   │   └── Screen/              # Safe-area and background-aware screen container
    │   │       ├── Screen.tsx       # Screen container implementation (wraps SafeAreaView)
    │   │       ├── Screen.styles.ts # Base container styles (flex: 1, backgroundColor: colors.background.base)
    │   │       ├── Screen.types.ts  # ScreenProps interface (children, style, edges, backgroundColor, testID)
    │   │       └── index.ts         # Screen component barrel export
    │   ├── navigation/              # Custom headers, bottom navigation tabs, drawers (.gitkeep)
    │   └── ui/                      # Atomic design UI elements
    │       ├── index.ts             # UI components barrel export (Badge, Button, Card, Input, Loading)
    │       ├── Badge/               # Category, status, and tag indicators
    │       │   ├── Badge.tsx        # Badge component implementation
    │       │   ├── Badge.styles.ts  # Variant styles (primary, secondary, success, warning, danger, neutral)
    │       │   ├── Badge.types.ts   # BadgeVariant, BadgeSize, and BadgeProps interface
    │       │   └── index.ts         # Badge barrel export
    │       ├── Button/              # Interactive pressable buttons
    │       │   ├── Button.tsx       # Button component (supports loading spinner, disabled, fullWidth)
    │       │   ├── Button.styles.ts # Button variants (primary, secondary, outline, ghost) and press states
    │       │   └── index.ts         # Button barrel export (Button, ButtonProps, ButtonVariant)
    │       ├── Card/                # Content card surfaces
    │       │   ├── Card.tsx         # Card container component with optional onPress touch feedback
    │       │   ├── Card.styles.ts   # Card variants (default, surface, accent, outlined) & shadows
    │       │   ├── Card.types.ts    # CardVariant and CardProps interface
    │       │   └── index.ts         # Card barrel export
    │       ├── Input/               # Controlled text inputs
    │       │   ├── Input.tsx        # Input component with label, error message, & password eye-toggle
    │       │   ├── Input.styles.ts  # Focus ring, error border, typography, and helper text styling
    │       │   └── index.ts         # Input barrel export (Input, InputProps)
    │       └── Loading/             # Visual progress and activity indicators
    │           ├── Loading.tsx      # Inline activity indicator & full-screen modal backdrop overlay
    │           └── index.ts         # Loading barrel export (Loading, LoadingProps)
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

## Components & Layout System

The project separates presentation into **Layout** (screen-level containers and wrappers) and **UI** (atomic, reusable design elements). All components are completely decoupled from domain business logic, fully typed with TypeScript, and consume centralized design tokens from `@/theme`.

Import any component directly from the root `@/components` barrel:

```tsx
import { Badge, Button, Card, Input, Loading, Screen } from '@/components';
```

---

### 1. Layout System (`src/components/layout/`)

The layout layer provides consistent screen wrapping, safe area inset handling across Android and iOS devices, notch avoidance, and background color management.

#### File Architecture:

- `src/components/layout/index.ts`: Barrel export re-exporting `Screen` and layout types.
- `src/components/layout/Screen/`:
  - `Screen.tsx`: Component wrapping `SafeAreaView` from `react-native-safe-area-context`.
  - `Screen.styles.ts`: Base styles setting `flex: 1` and default `backgroundColor: colors.background.base`.
  - `Screen.types.ts`: TypeScript contracts for `ScreenProps`.
  - `index.ts`: Local barrel export for `Screen`.

#### `Screen` Component Specification:

| Prop              | Type                   | Default                              | Description                                                  |
| :---------------- | :--------------------- | :----------------------------------- | :----------------------------------------------------------- |
| `children`        | `React.ReactNode`      | **Required**                         | Nested view hierarchy, screens, or scroll views              |
| `style`           | `StyleProp<ViewStyle>` | `undefined`                          | Additional custom style overrides                            |
| `edges`           | `Edge[]`               | `['top', 'bottom', 'left', 'right']` | Safe area insets to apply (`top`, `bottom`, `left`, `right`) |
| `backgroundColor` | `string`               | `colors.background.base`             | Custom screen background color                               |
| `testID`          | `string`               | `undefined`                          | Identifier for automated tests                               |

#### Usage Example:

```tsx
import { ScrollView, Text } from 'react-native';
import { Screen } from '@/components';

export function ExampleScreen() {
  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text>Content protected from notches and system bars</Text>
      </ScrollView>
    </Screen>
  );
}
```

---

### 2. UI Component Library (`src/components/ui/`)

Located in `src/components/ui/`, each UI element is organized in an independent folder containing the component, its dedicated stylesheet, TypeScript definitions, and an `index.ts` barrel.

#### (A) `Badge` (`src/components/ui/Badge/`)

Compact visual tag for categories, statuses, allergen tags, and dietary labels.

- **Files**:
  - `Badge.tsx`: Main component rendering label inside styled pill container.
  - `Badge.styles.ts`: Visual variants and size dimensions.
  - `Badge.types.ts`: Type definitions (`BadgeVariant`, `BadgeSize`, `BadgeProps`).
  - `index.ts`: Barrel export.
- **Variants (`BadgeVariant`)**:
  - `'primary'`: Forest green tint with brand green text.
  - `'secondary'`: Subtle green background for secondary indicators.
  - `'success'`: Bright emerald green for verified/active states.
  - `'warning'`: Amber/orange for alerts and cautions.
  - `'danger'`: Crimson red for errors and allergens.
  - `'neutral'`: Slate/gray for general tags.
- **Sizes (`BadgeSize`)**: `'sm'` (compact pill), `'md'` (standard badge).

| Prop        | Type                   | Default      | Description                     |
| :---------- | :--------------------- | :----------- | :------------------------------ |
| `label`     | `string`               | **Required** | Text content to display         |
| `variant`   | `BadgeVariant`         | `'neutral'`  | Visual color treatment          |
| `size`      | `BadgeSize`            | `'md'`       | Scale and padding size          |
| `style`     | `StyleProp<ViewStyle>` | `undefined`  | Custom outer container styling  |
| `textStyle` | `StyleProp<TextStyle>` | `undefined`  | Custom badge typography styling |
| `testID`    | `string`               | `undefined`  | Testing identifier              |

```tsx
import { Badge } from '@/components';

<Badge label="🌱 100% Vegan" variant="primary" size="md" />
<Badge label="Gluten-Free" variant="success" size="sm" />
<Badge label="Contains Nuts" variant="danger" size="sm" />
```

---

#### (B) `Button` (`src/components/ui/Button/`)

Touchable interactive button with built-in press feedback, loading indicator replacement, and disabled states.

- **Files**:
  - `Button.tsx`: Pressable button rendering title or centered `ActivityIndicator`.
  - `Button.styles.ts`: Pressed states, background colors, and typographic styling.
  - `index.ts`: Re-exports `Button`, `ButtonProps`, and `ButtonVariant`.
- **Variants (`ButtonVariant`)**:
  - `'primary'`: Solid brand green button (`colors.primary[500]`) with white text.
  - `'secondary'`: Tinted green button (`colors.primary[100]`) with dark green text.
  - `'outline'`: Transparent background with crisp green border (`colors.primary[500]`).
  - `'ghost'`: Borderless text button with hover/press background effect.

| Prop        | Type                   | Default      | Description                               |
| :---------- | :--------------------- | :----------- | :---------------------------------------- |
| `title`     | `string`               | **Required** | Button text label                         |
| `onPress`   | `() => void`           | **Required** | Touch handler callback                    |
| `variant`   | `ButtonVariant`        | `'primary'`  | Visual button styling                     |
| `loading`   | `boolean`              | `false`      | Shows activity spinner and disables touch |
| `disabled`  | `boolean`              | `false`      | Disables touch and applies muted opacity  |
| `fullWidth` | `boolean`              | `true`       | Expands button to 100% of parent width    |
| `style`     | `StyleProp<ViewStyle>` | `undefined`  | Container style overrides                 |
| `textStyle` | `StyleProp<TextStyle>` | `undefined`  | Typography style overrides                |
| `testID`    | `string`               | `undefined`  | Testing identifier                        |

```tsx
import { Button } from '@/components';

<Button
  title="Sign In"
  variant="primary"
  loading={isSubmitting}
  onPress={handleLogin}
/>

<Button
  title="Cancel"
  variant="outline"
  onPress={handleCancel}
/>
```

---

#### (C) `Card` (`src/components/ui/Card/`)

Elevated content container with rounded corners and consistent padding.

- **Files**:
  - `Card.tsx`: Container component with optional `onPress` touch feedback.
  - `Card.styles.ts`: Surface styles, drop shadows, and border tokens.
  - `Card.types.ts`: `CardVariant` and `CardProps` interface definitions.
  - `index.ts`: Barrel export.
- **Variants (`CardVariant`)**:
  - `'default'`: Surface card with subtle border (`colors.border.default`).
  - `'surface'`: Elevated pure white card with subtle drop shadow.
  - `'accent'`: Warm culinary orange accent container for daily tips & notifications.
  - `'outlined'`: Clean transparent card with prominent outline.

| Prop       | Type                   | Default      | Description                           |
| :--------- | :--------------------- | :----------- | :------------------------------------ |
| `children` | `React.ReactNode`      | **Required** | Content elements rendered inside card |
| `variant`  | `CardVariant`          | `'default'`  | Visual surface style                  |
| `style`    | `StyleProp<ViewStyle>` | `undefined`  | Custom container style overrides      |
| `onPress`  | `() => void`           | `undefined`  | If provided, makes the card pressable |
| `testID`   | `string`               | `undefined`  | Testing identifier                    |

```tsx
import { Card } from '@/components';
import { Text } from 'react-native';

<Card variant="accent" onPress={() => navigate('/tips')}>
  <Text>🥗 Daily Vegan Insight</Text>
  <Text>Pair plant iron with vitamin C for maximum absorption!</Text>
</Card>;
```

---

#### (D) `Input` (`src/components/ui/Input/`)

Controlled text input with floating label, validation error feedback, and interactive password visibility toggle.

- **Files**:
  - `Input.tsx`: TextInput with focus tracking, error styling, and Show/Hide toggle.
  - `Input.styles.ts`: Focus ring, error border (`colors.status.error`), and label styling.
  - `index.ts`: Barrel export (`Input`, `InputProps`).
- **Interactive States**:
  - **Focused**: Border transitions to brand green (`colors.primary[500]`).
  - **Error**: Border transitions to crimson red (`colors.status.error`) with error message below.
  - **Password Toggle**: When `secureTextEntry={true}`, automatically renders a pressable toggle button (`Show` / `Hide`).
  - **Disabled**: Dimmed background and uneditable input field.

| Prop              | Type                               | Default      | Description                                                |
| :---------------- | :--------------------------------- | :----------- | :--------------------------------------------------------- |
| `value`           | `string`                           | **Required** | Current input text value                                   |
| `onChangeText`    | `(text: string) => void`           | **Required** | Text change handler                                        |
| `label`           | `string`                           | `undefined`  | Input label displayed above the field                      |
| `placeholder`     | `string`                           | `undefined`  | Placeholder text                                           |
| `secureTextEntry` | `boolean`                          | `false`      | Enables password masking and eye-toggle                    |
| `error`           | `string \| null`                   | `undefined`  | Error message string; triggers error border                |
| `disabled`        | `boolean`                          | `false`      | Disables interaction                                       |
| `keyboardType`    | `KeyboardTypeOptions`              | `'default'`  | Virtual keyboard layout (`email-address`, `numeric`, etc.) |
| `autoCapitalize`  | `'none' \| 'sentences' \| 'words'` | `'none'`     | Auto-capitalization behavior                               |
| `style`           | `StyleProp<ViewStyle>`             | `undefined`  | Outer container style override                             |
| `inputStyle`      | `StyleProp<TextStyle>`             | `undefined`  | TextInput field style override                             |

```tsx
import { Input } from '@/components';

<Input
  label="Password"
  placeholder="Enter at least 6 characters"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  error={passwordError}
/>;
```

---

#### (E) `Loading` (`src/components/ui/Loading/`)

Visual activity indicator supporting inline sections or full-screen modal overlays.

- **Files**:
  - `Loading.tsx`: Component supporting inline spinner or backdrop overlay card.
  - `index.ts`: Barrel export (`Loading`, `LoadingProps`).
- **Display Modes**:
  - **Inline Mode** (`fullScreen: false`): Centered `ActivityIndicator` with optional status text, perfect for embedding inside cards or lists.
  - **Full-Screen Mode** (`fullScreen: true`): Semi-transparent backdrop (`colors.overlay.modal`) overlaying the entire screen with an elevated center card, ideal during session restoration and critical mutations.

| Prop         | Type                   | Default               | Description                                 |
| :----------- | :--------------------- | :-------------------- | :------------------------------------------ |
| `message`    | `string`               | `undefined`           | Informational status text below the spinner |
| `fullScreen` | `boolean`              | `false`               | Toggles full-screen backdrop overlay mode   |
| `size`       | `'small' \| 'large'`   | `'large'`             | Activity indicator spinner size             |
| `color`      | `string`               | `colors.primary[700]` | Spinner color                               |
| `style`      | `StyleProp<ViewStyle>` | `undefined`           | Custom style overrides                      |

```tsx
import { Loading } from '@/components';

// Inline usage
<Loading message="Fetching vegan recipes..." />;

// Full-screen overlay during session restore
if (isRestoringSession) {
  return <Loading fullScreen message="Loading your session..." />;
}
```

---

### 3. Planned Component Modules

- **`src/components/feedback/` (`.gitkeep`)**: Reserved for application-wide Toast messages, Confirm Dialogs, Action Sheets, and Snackbars.
- **`src/components/navigation/` (`.gitkeep`)**: Reserved for custom Top Navigation AppBars, Bottom Tab Bars, and Drawer Navigation headers.

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

> Hướng dẫn chi tiết: [API & Authentication Integration Guideline](docs/API_AUTH_INTEGRATION_GUIDELINE.md) — environment, Firebase ID/refresh token, Axios interceptor, thêm endpoint, test API và troubleshooting.

1. **Bootstrap (`src/app/_layout.tsx`)** sets up TanStack Query and calls `restoreSession()` before rendering protected routes.
2. **Firebase Authentication** handles email/password and Google identity, then returns a Firebase ID token and refresh token.
3. **Backend synchronization** calls `POST /auth/sync`; the shared Axios interceptor attaches the valid Firebase ID token as a Bearer token.
4. **Session persistence** stores the Firebase session in `AsyncStorage`, refreshes the ID token before expiry, and clears auth plus account-scoped query state when the user signs out or changes account.
5. **Route groups** guard onboarding, tabs, discover, and profile routes using the restored Zustand authentication state.

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
