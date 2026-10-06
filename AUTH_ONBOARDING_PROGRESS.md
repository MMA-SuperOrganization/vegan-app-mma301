# Auth & Onboarding implementation status

## Runtime configuration

- API base URL: `EXPO_PUBLIC_API_URL` (defaults to `https://vegan-api.ngocthang.io.vn/api/v1`).
- Firebase Auth: `EXPO_PUBLIC_FIREBASE_API_KEY` is required for sign-in, sign-up, token refresh, and password reset.
- Google OAuth: the platform-specific `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` is required for Google sign-in. See `GOOGLE_AUTH_SETUP.md`.
- Privacy policy: `EXPO_PUBLIC_PRIVACY_POLICY_URL` is optional and only controls the link on the permissions screen.

Copy `.env.example` to `.env` and replace the Firebase placeholder before testing authenticated flows.

## Screens and routes

| Screen            | Route                             | Integration                                                   | Status                                                   |
| ----------------- | --------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| Welcome           | `/(auth)/welcome`                 | None                                                          | Complete                                                 |
| Sign in           | `/(auth)/login`                   | Firebase password or Google OAuth, then `POST /auth/sync`     | Complete; Google needs its platform client ID            |
| Sign up           | `/(auth)/register`                | Firebase `signUp` and `update`, then `POST /auth/sync`        | Complete; needs Firebase key for end-to-end verification |
| Recover account   | `/(auth)/forgot-password`         | Firebase `sendOobCode`                                        | Complete; needs Firebase key for end-to-end verification |
| Diet & goals      | `/(onboarding)/diet-goals`        | Persisted per-user draft                                      | Complete                                                 |
| Nutrition profile | `/(onboarding)/nutrition-profile` | Draft plus `PUT /profiles/me` on completion                   | Complete                                                 |
| Allergies         | `/(onboarding)/allergies`         | `GET /allergens?limit=50`                                     | Complete; empty master-data state is supported           |
| Permissions       | `/(onboarding)/permissions`       | Camera and notifications requested only after an explicit tap | Complete                                                 |

## Session and routing behavior

- Firebase access and refresh tokens are persisted with the existing AsyncStorage layer; passwords are never persisted.
- Expiring access tokens are refreshed before backend calls.
- The backend session is synchronized through `POST /auth/sync`.
- Unauthenticated users are sent to Welcome, authenticated users with incomplete onboarding to Diet & goals, and completed users to Tabs.
- Onboarding drafts and AI-profile consent are scoped by Firebase user ID.
- Onboarding is marked complete locally only after `PUT /onboarding`, optional profile update, and `POST /onboarding/complete` succeed.
- Camera and notification access are optional. A denied permission does not block onboarding completion.
- Android Expo Go does not load `expo-notifications` because remote notifications are unsupported there from SDK 53 onward; the notification action is disabled with a development-build label. Development and production builds continue to use the native permission API.
- Google OAuth uses an application callback scheme and therefore requires a development/production build. Expo Go shows `GOOGLE_REQUIRES_DEV_BUILD` instead of starting a callback that cannot complete.

## Maintainability safeguards

- Environment values are read through one typed `appConfig` module.
- Backend envelope parsing and error normalization are shared by auth and onboarding APIs.
- Authentication errors use one safe diagnostic shape (`message`, `code`, `operation`, optional HTTP status, timestamp), are visible on mobile, and are logged with `[VEGETA_ERROR]` without credentials or tokens.
- Google OAuth browser handling, Firebase credential exchange, backend account sync, and button presentation are isolated in separate modules.
- Token refresh is single-flight, so concurrent API calls do not trigger competing Firebase refresh requests.
- Logout/session replacement invalidates an in-progress refresh before it can restore stale credentials.
- Persisted onboarding drafts are runtime-sanitized before entering application state.
- Draft writes are serialized and flushed before deletion, preventing a late write from recreating a completed draft.
- The onboarding store imports the auth store directly instead of through the feature barrel, avoiding an unnecessary feature-level dependency cycle.
- Draft schema/parsing, persistence, completion orchestration, Zustand state, native permission handling, and screen rendering live in separate modules with one reason to change each.
- Native camera/notification state is isolated in `useDevicePermissions`; the permissions screen only coordinates presentation and navigation.
- The onboarding completion use-case is isolated from the store, keeping Zustand focused on observable state transitions.
- Expo Router route files import their screen/store directly, so an optional native module failure cannot invalidate unrelated route default exports through a feature barrel.

## Contract notes and intentional limitations

- The backend has no login, registration, or password-reset endpoint; those actions use Firebase Auth.
- The backend onboarding contract has no field for AI consent. Consent is stored locally per user and is not sent silently in another field.
- Google sign-in is exposed and fully wired, but the repository intentionally does not contain project-specific OAuth client IDs. The local `.env` must supply them and Firebase must enable the Google provider.
- Guest mode is not exposed because the application data APIs are protected by Firebase authentication.
- The design includes an email-verification concept, but the current backend does not require verified email for onboarding.
- Production currently returns an empty allergen list; the screen presents a retryable empty state and still permits an explicit “no allergies” answer.
- The package installer currently reports 29 transitive dependency advisories. No unsafe `audit fix --force` was applied because automated major-version changes can break the Expo SDK compatibility set.

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm run test:ui`
- `npx expo install --check`
- `npx expo export --platform all --output-dir dist/auth-google-final`

Automated coverage includes normalized auth diagnostic codes, blank/malformed auth fields, password length and confirmation mismatch, comma decimal parsing, measurement ranges, invalid/future dates, allergen multi-select behavior, the explicit empty-allergen representation, and sanitization of malformed or stale persisted drafts.
