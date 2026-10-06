# Auth & Onboarding implementation status

## Runtime configuration

- API base URL: `EXPO_PUBLIC_API_URL` (defaults to `https://vegan-api.ngocthang.io.vn/api/v1`).
- Firebase Auth: `EXPO_PUBLIC_FIREBASE_API_KEY` is required for sign-in, sign-up, token refresh, and password reset.
- Privacy policy: `EXPO_PUBLIC_PRIVACY_POLICY_URL` is optional and only controls the link on the permissions screen.

Copy `.env.example` to `.env` and replace the Firebase placeholder before testing authenticated flows.

## Screens and routes

| Screen            | Route                             | Integration                                                   | Status                                                   |
| ----------------- | --------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| Welcome           | `/(auth)/welcome`                 | None                                                          | Complete                                                 |
| Sign in           | `/(auth)/login`                   | Firebase `signInWithPassword`, then `POST /auth/sync`         | Complete; needs Firebase key for end-to-end verification |
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

## Maintainability safeguards

- Environment values are read through one typed `appConfig` module.
- Backend envelope parsing and error normalization are shared by auth and onboarding APIs.
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
- Google sign-in is not exposed because the repository has no configured Google OAuth/native provider. No fake-success adapter is used.
- Guest mode is not exposed because the application data APIs are protected by Firebase authentication.
- The design includes an email-verification concept, but the current backend does not require verified email for onboarding.
- Production currently returns an empty allergen list; the screen presents a retryable empty state and still permits an explicit “no allergies” answer.
- `npm audit --omit=dev` currently reports 29 transitive Expo/Metro/React Native advisories (10 moderate, 19 high, 0 critical). The suggested automatic fixes would downgrade Expo to SDK 44 or cross a major SDK boundary, so no unsafe `audit fix --force` was applied. Expo's own compatibility check passes on SDK 57.

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm run test:ui`
- `npx expo install --check`
- `npx expo export --platform all --output-dir dist/auth-onboarding-maintainability`

Automated coverage includes blank/malformed auth fields, password length and confirmation mismatch, comma decimal parsing, measurement ranges, invalid/future dates, allergen multi-select behavior, the explicit empty-allergen representation, and sanitization of malformed or stale persisted drafts.
