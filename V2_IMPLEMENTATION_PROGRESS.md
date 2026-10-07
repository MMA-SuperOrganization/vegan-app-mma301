# VEGETA v2 implementation progress

Updated: 2026-10-07. This is a checkpoint, not a completion claim.

## Group 1 — Auth and onboarding

Status: implemented in production routes (screens 02–09). Session restoration, Firebase auth, backend sync, user-scoped onboarding drafts, permissions and confirmed completion are wired. Device-wide visual regression remains to be completed.

## Group 2 — Discovery and recipes

Status: implemented core path for Home → Explore/Search → Recipe detail → Cooking → Saved.

- Home reads the real `/home` feed and never substitutes demo recommendations.
- Search suggestions, recent searches, result filters and Explore use real backend queries; no static “popular” result data is substituted.
- Recipe detail and cooking steps use `/recipes/:idOrSlug`.
- Saved library uses the real saved-item query and mutations, with server errors surfaced to the user.
- Loading, empty, network-error and retry states are present.
- Android visual inspection completed for Search and Explore empty states. Search header alignment was corrected during that check.

Still open in this group: recipe reviews, blog, comments, video, content creation/editing, renderable media URLs, and visual checks for non-empty result/detail/cooking/saved states.

## Coverage checkpoint

- Implemented route/screens: 15/104.
- Partial functional screens: 4/104.
- Shared states represented in real consumers: 4/104.
- Not implemented: 81/104.

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
