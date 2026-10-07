# VEGETA v1 → v2 audit

Audit date: 2026-10-07. Target: `VEGETA-v2`, section `174:365`, 104 screens plus one non-route overview frame.

## Evidence and scope

- The recoverable source baseline is Git commit `092090f` (`chore: initialize vegan mobile app`). It contains Login, a root Home route, primitive Button/Input/Loading, an auth store and API/storage foundations. This is the concrete source evidence used for “v1”.
- Commit `df94fa3` introduced the v2 UI core, followed by navigation/auth/onboarding work. Therefore current `main` is mixed maturity and is not treated wholesale as v1.
- The old Figma page `VEGETA Prototype - Mobile` could not be read from the available Figma URL in this environment. No visual claims about unavailable v1 frames are made.
- The v2 source is locally complete: `VEGETA-v2/SCREEN_INDEX.csv` lists 104 screens, `Project overview` is a separate non-route frame, and all targets are 390 × 844 with 2× PNG references.
- Backend contracts were verified from `vegan-api-mma302/src/routes/api-manifest.js` and the owning services/validators. No endpoint below was inferred from screen names.

## Current architecture

- Expo Router routes are thin adapters under `src/app`.
- Feature UI/business logic lives in `src/features`.
- Shared UI, safe-area/keyboard handling and feedback states live in `src/components`.
- Theme tokens and component masters already come from the v2 handoff; these are retained.
- Zustand owns auth/onboarding/profile client coordination. TanStack Query owns new recipe/search/saved server state.
- Firebase Authentication remains the identity provider; the backend account is synchronized through `/auth/sync`.

## Flow audit

| Flow | Evidence | Classification | Result / remaining work |
|---|---|---|---|
| Welcome, login, registration, recovery | `src/app/(auth)`, `src/features/auth` | Implemented and broadly aligned to v2 | Validation/loading/errors and native Google sign-in exist. Visual device regression still required. |
| Session restoration | `src/app/_layout.tsx`, `authStore.ts`, `authApi.ts` | Error fixed | Cached identity prevents false onboarding decisions during transient sync failure; profile is loaded before protected routing. |
| Onboarding | `src/app/(onboarding)`, `src/features/onboarding` | Implemented and aligned to screens 06–09 | Draft is user-scoped; completion waits for backend confirmation and profile reload; failed writes retain the draft. |
| Home | `src/app/(tabs)/index.tsx`, `HomeScreen.tsx` | Functional but visually incomplete | Real user name, valid child routes and `/home` recommendations are integrated. Design imagery is unavailable from API cards. |
| Search and results | `src/app/(discover)/search*.tsx`, `src/features/recipes` | Implemented in this pass | Uses `/search` and `/search/recent`, query-keyed cache, loading/empty/error/retry. Emulator visual QA pending. |
| Explore | `src/app/(discover)/explore.tsx` | Implemented in this pass | Uses published `/recipes`; recipe/post/video segmented feed remains incomplete. |
| Recipe detail and cooking steps | `src/app/(discover)/recipe/[id]` | Implemented in this pass | Uses `/recipes/:idOrSlug`; cooking steps are real recipe steps. Reviews screen is missing. |
| Saved library | `src/app/(discover)/saved.tsx` | Implemented in this pass | Uses `/saved-items`; recipe targets open. Post/video detail routes remain missing. |
| Profile and edit profile | `src/app/(tabs)/profile.tsx`, `src/app/edit-profile.tsx`, `src/features/profile` | Functional but visually incomplete | Shared persisted profile source, missing/none distinctions, retry, edit and logout exist. Separate Nutrition/Diet/Allergy screens are missing. |
| Meal plan, grocery, diary tabs | `src/app/(tabs)/meal-plan.tsx`, `grocery.tsx`, `diary.tsx` | Not implemented | Routes render `PlaceholderTabScreen`; file existence is not counted as a working feature. |
| Pantry, tracking, AI, community, admin | No feature routes in current source | Not implemented | Backend contracts exist for many domains, but UI integration has not started. |

## Shared UI and behavior

- `ScreenWrapper` owns safe area, keyboard avoidance and scrolling. Auth/onboarding/edit screens use it; long-form emulator checks remain pending.
- Button/Input/Card/Badge/Toggle/Progress/feedback components use v2 tokens and are retained.
- Loading and Empty states are implemented. Network retry is implemented for bootstrap and new discovery queries. Form errors are integrated into inputs.
- Existing shared hooks have behavioral tests for async locking, stale results, debounce cleanup, selection ownership, keyboard subscriptions and responsive layout.
- No duplicate HTTP client or authentication store was introduced.

## Known contract and asset limits

- Recipe/search responses expose media IDs but not directly renderable signed media URLs. The new cards intentionally use a neutral branded placeholder instead of presenting an unrelated image as original artwork.
- Saved-item mutations require a backend transaction outside the onboarding-specific standalone fallback. On a standalone MongoDB deployment, save/unsave may return `TRANSACTIONS_REQUIRED`; the UI displays the real failure and never reports false success.
- The Figma URL was not accessible in this environment. Local PNG, CSV, JSON and contact sheets are the visual authority used for this audit.
- Android emulator visual inspection is complete for the Explore empty state and Search screen at the Medium Phone viewport. Search header spacing was corrected from that inspection. Remaining discovery states still need direct comparison.

## Verification status

- Automated: TypeScript, ESLint and existing Node tests are required before each checkpoint.
- Contract: backend service and validator source inspected for every integrated endpoint.
- Visual: reference images inspected at 390 × 844; Explore empty state and Search were inspected on Android, while the remaining runtime comparisons are pending and must not be marked passed.
- The detailed status for every v2 screen is maintained in `SCREEN_IMPLEMENTATION_MATRIX.md`.
