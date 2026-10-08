# VEGETA v2 implementation progress

Updated: 2026-10-08. This is a checkpoint, not a completion claim.

## Group 1 — Auth and onboarding

Status: implemented in production routes (screens 02–09). Session restoration, Firebase auth, backend sync, user-scoped onboarding drafts, permissions and confirmed completion are wired. Device-wide visual regression remains to be completed.

## Group 2 — Discovery and recipes

Status: complete for the requested Recipe + Saved scope (screens 10–15, 17 and filter panel 102): Home → Explore/Search → Filter → Recipe detail → Cooking → Saved.

- Home reads the real `/home` feed and never substitutes demo recommendations.
- Search suggestions, recent searches, result filters, pagination and Explore use real backend queries; both the current envelope and legacy search shapes are normalized explicitly.
- The filter panel applies category, duration, difficulty, diet, sort and the profile's selected allergens; apply/clear creates a new query key and resets pagination.
- Recipe detail displays only returned servings, prep/cook times, nutrition, ingredients and allergens. An empty allergen list is disclosed as unknown safety, not as allergy-safe.
- Cooking uses real recipe steps and an absolute-deadline timer for timed steps, so background/foreground transitions do not pause elapsed wall time.
- Saved state is account-scoped and synchronized across Home, Explore, Search, Detail and Saved. Mutations are deduplicated, optimistic and rolled back on failure.
- Backend saved mutations first use a transaction and safely fall back to compensated standalone writes when MongoDB has no replica set.
- Loading, empty, network-error and retry states are present; missing recipes use the real request error.
- Android visual inspection completed with real backend data for Home, Search, filtered Search results, Filter, Explore, Detail, Cooking and Saved. Save persistence was verified after an app reload.
- A device save attempt with the backend stopped rolled optimistic state back and exposed the real connection-error retry state.

Still open outside this delivery scope: recipe reviews, blog, comments, video and content creation/editing. Seeded recipe media URLs now render on Android; timed-step UI is covered by automated logic tests because the current demo recipes do not declare `timerSeconds`.

## Coverage checkpoint

- Implemented route/screens: 17/104.
- Partial functional screens: 3/104.
- Shared states represented in real consumers: 4/104.
- Not implemented: 80/104.

## Cross-cutting — Internationalization

Status: implemented for all current production UI in Vietnamese and English.

- Typed catalogs live under `src/i18n`; missing English keys fail TypeScript.
- Language selection is persisted with AsyncStorage and restored before the app UI renders.
- `/language` is reachable from Profile and updates mounted screens immediately.
- Auth, onboarding, navigation, profile, discovery, validation, accessibility labels and client-side fallback errors use translation keys.
- Backend-provided content and error messages remain server-owned data and are displayed as returned.

The exact per-screen evidence is in `SCREEN_IMPLEMENTATION_MATRIX.md`. The historical/source comparison and contract limitations are in `V1_V2_AUDIT.md`.

## Next implementation groups

1. Complete community discovery: reviews, blog, comments and video (screens 16, 18–24).
2. Pantry, ingredient detail/editing and expiry reminders (screens 25–28, 103).
3. AI assistant, recognition and history (screens 29–30, 34–37, 96).
4. Meal plan, grocery and diary/tracking flows (screens 31–33, 55–68, 104).
5. Profile settings and account states (screens 40–46, 76–83, 97–101).
6. Content ownership/reporting and admin tools (screens 47–54, 69–75, 84–91, 102).

Each group must update the matrix, add or extend automated coverage, and be visually inspected against the provided 390 × 844 reference before it can be called complete.
