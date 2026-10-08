# Recipe + Saved module progress

Updated: 2026-10-08.

## Completed scope

- Screen 10 Home: real profile name, `/home` content, images and synchronized save controls.
- Screens 11–12 Search: suggestions/history, current and legacy response normalization, type tabs, pagination, loading/empty/error/retry.
- Screen 13 Explore: real paginated recipes, Search/Saved entry points and save controls.
- Screen 14 Recipe detail: returned ingredients, servings, nutrition, prep/cook time and explicit allergen disclosure.
- Screen 15 Cooking: previous/next/finish behavior plus an absolute-deadline timer for steps with `timerSeconds`.
- Screen 17 Saved: account-scoped persisted bookmarks that reopen detail and can be removed.
- Screen 102 Filter: real categories, duration, difficulty, diet, sort and profile-allergen exclusion, with apply/clear and pagination reset.

## API and persistence

- No mock fallback is used. The module calls the existing recipe, search, category, home and saved-item endpoints.
- Query cache keys include the authenticated account. Changing or clearing the account clears server-state cache.
- Save/unsave is optimistic, blocks duplicate taps and restores snapshots when the request fails.
- The backend attempts transactional bookmark writes first and uses compensated standalone writes only for `TRANSACTIONS_REQUIRED`, supporting the current Coolify standalone MongoDB deployment.

## Verification

- Android Medium Phone: Home → Search → filtered results → Detail → Save → Explore → Saved → Detail → Cooking was exercised with real local API and MongoDB data.
- Reloading the app retained the saved Green Pea Soup bookmark for the same account.
- With the backend stopped, a save attempt displayed its pending state, rolled the heart back to unsaved, and exposed a real connection-error retry state instead of false success.
- Automated frontend coverage checks filter parsing/serialization, API parameter mapping, pagination-reset inputs, optimistic saved-state dedupe/removal and deadline timer math.
- Backend integration coverage checks idempotent standalone save/unsave and compensation when counter updates fail.

## Explicit limits

- The current seeded recipe steps do not declare `timerSeconds`; timer UI logic is implemented and automated, but a timed seed is still needed for a visual countdown sample.
- Recipe reviews and post/video creation or detail flows are outside this module delivery.
