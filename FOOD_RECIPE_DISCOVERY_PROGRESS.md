# Food & Recipe Discovery progress

Updated: 2026-10-10

## Functional requirements

- **FR-FOOD-01 & 02:** vegan food catalog supports pagination, name search, food-category filtering, images, default servings and nutrition per 100 g.
- **FR-FOOD-04:** food detail resolves declared allergens from the backend catalog and never treats unknown allergen data as safe.
- **FR-RECIPE-02:** recipe detail shows name, description, servings, preparation/cooking time and difficulty from the real recipe response.
- **FR-RECIPE-04:** cooking mode renders ordered steps, previous/next navigation and background-safe timers when provided.
- **FR-RECIPE-06:** recipe detail shows available nutrition per serving without fabricating missing values.
- **FR-SEARCH-01 & 02:** unified search supports recipe and food names plus category, diet and allergen filters. Food results open the food detail route.
- **FR-INTERACT-08 & 10:** recipe and food bookmarks use the account-scoped saved-items API, optimistic UI, deduplication and rollback.

## Routes

- `/(discover)/foods`
- `/(discover)/food/[id]`
- `/(discover)/search`
- `/(discover)/search-results`
- `/(discover)/recipe/[id]`
- `/(discover)/recipe/[id]/cook`
- `/(discover)/saved`

## APIs

- `GET /food-items`, `GET /food-items/:id`
- `GET /categories`, `GET /allergens`
- `GET /recipes`, `GET /recipes/:idOrSlug`
- `GET /search`, `GET /search/suggestions`, `GET /search/recent`
- `GET/PUT/DELETE /saved-items`

## Data rules

- Food catalog defaults to `isVegan=true`.
- Nutrition and allergen values come from backend responses; missing values are shown as unavailable rather than inferred.
- Search `rating` and `quickest` sorts are implemented by the backend to match the existing mobile filter choices.
- Saved state remains isolated by authenticated account.

## Verification

- Frontend TypeScript typecheck and ESLint pass.
- Frontend UI/domain tests pass: 48/48.
- Android Expo production bundle exports successfully.
- Backend tests pass: 541 passed, 9 skipped.
- Backend Node 24 build, generated OpenAPI validation and offline startup smoke pass.
- Real device/emulator interaction and a live Coolify database round trip still require a deployed environment with valid credentials.
