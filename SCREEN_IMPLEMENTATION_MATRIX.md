# VEGETA v2 screen implementation matrix

Updated: 2026-10-07. Scope: 104 screens. The Figma `Project overview` frame (`179:402`) is intentionally excluded because it is not a screen or route.

Status meanings: **Implemented** has a real route/state and real service contract; **Partial** is functional but does not yet reproduce all v2 content/layout; **Reused shared state** is reproduced by a shared component in real consumers; **Not implemented** has no inspectable production route/state.

| # | Screen / node | Reference | Implementation / opening path | API / data | Status and verification |
|---:|---|---|---|---|---|
| 1 | 01 · Splash · `174:366` | `screens/001-01-splash-174-366.png` | Native Expo splash (`app.json`) | None | **Partial** — Dedicated 390×844 runtime comparison pending |
| 2 | 02 · Welcome · `174:367` | `screens/002-02-welcome-174-367.png` | `/(auth)/welcome` → `WelcomeScreen.tsx` | Firebase/auth navigation | **Implemented** — Automated checks; visual pending |
| 3 | 03 · Sign in · `174:368` | `screens/003-03-sign-in-174-368.png` | `/(auth)/login` → `LoginScreen.tsx` | Firebase + `/auth/sync` | **Implemented** — Automated checks; visual pending |
| 4 | 04 · Sign up · `174:369` | `screens/004-04-sign-up-174-369.png` | `/(auth)/register` → `RegisterScreen.tsx` | Firebase + `/auth/sync` | **Implemented** — Automated checks; visual pending |
| 5 | 05 · Recover account · `174:370` | `screens/005-05-recover-account-174-370.png` | `/(auth)/forgot-password` | Firebase password reset | **Implemented** — Automated checks; visual pending |
| 6 | 06 · Diet & goals · `174:371` | `screens/006-06-diet-goals-174-371.png` | `/(onboarding)/diet-goals` | `PUT /onboarding` at completion | **Implemented** — Automated checks; visual pending |
| 7 | 07 · Nutrition profile · `174:372` | `screens/007-07-nutrition-profile-174-372.png` | `/(onboarding)/nutrition-profile` | `PUT /profiles/me`, `/onboarding` | **Implemented** — Automated checks; visual pending |
| 8 | 08 · Allergies · `174:373` | `screens/008-08-allergies-174-373.png` | `/(onboarding)/allergies` | `GET /allergens` | **Implemented** — Automated checks; visual pending |
| 9 | 09 · Permissions · `174:374` | `screens/009-09-permissions-174-374.png` | `/(onboarding)/permissions` | `POST /onboarding/complete` | **Implemented** — Automated checks; visual pending |
| 10 | 10 · Home · `174:375` | `screens/010-10-home-174-375.png` | `/(tabs)` → `HomeScreen.tsx` | `GET /users/me`, `GET /home` | **Partial** — Real recommendations; remaining visual composition pending |
| 11 | 11 · Search · `174:376` | `screens/011-11-search-174-376.png` | `/(discover)/search` → `SearchScreen.tsx` | `GET /search/recent`, `GET /search/suggestions` | **Implemented** — Android visual inspection; empty state verified |
| 12 | 12 · Search results · `174:377` | `screens/012-12-search-results-174-377.png` | `/(discover)/search-results` | `GET /search` | **Implemented** — Type/lint; visual pending |
| 13 | 13 · Explore · `174:378` | `screens/013-13-explore-174-378.png` | `/(discover)/explore` | `GET /recipes` | **Implemented** — Android visual inspection; empty state verified |
| 14 | 14 · Recipe detail · `174:379` | `screens/014-14-recipe-detail-174-379.png` | `/(discover)/recipe/[id]` | `GET /recipes/:idOrSlug` | **Implemented** — Type/lint; visual pending |
| 15 | 15 · Cooking steps · `174:380` | `screens/015-15-cooking-steps-174-380.png` | `/(discover)/recipe/[id]/cook` | `GET /recipes/:idOrSlug` | **Implemented** — Type/lint; visual pending |
| 16 | 16 · Recipe reviews · `174:381` | `screens/016-16-recipe-reviews-174-381.png` | Recipe reviews route missing | Not integrated | **Not implemented** — Inventory only |
| 17 | 17 · Saved library · `174:382` | `screens/017-17-saved-library-174-382.png` | `/(discover)/saved` | `GET/PUT/DELETE /saved-items` | **Implemented** — Type/lint; mutation depends on DB transactions |
| 18 | 18 · Blog feed · `174:383` | `screens/018-18-blog-feed-174-383.png` | Blog feature missing | Not integrated | **Not implemented** — Inventory only |
| 19 | 19 · Blog detail · `174:384` | `screens/019-19-blog-detail-174-384.png` | Blog detail missing | Not integrated | **Not implemented** — Inventory only |
| 20 | 20 · Create or edit post · `174:385` | `screens/020-20-create-or-edit-post-174-385.png` | Post editor missing | Not integrated | **Not implemented** — Inventory only |
| 21 | 21 · Comments · `174:386` | `screens/021-21-comments-174-386.png` | Comments missing | Not integrated | **Not implemented** — Inventory only |
| 22 | 22 · Video feed · `174:387` | `screens/022-22-video-feed-174-387.png` | Video feed missing | Not integrated | **Not implemented** — Inventory only |
| 23 | 23 · Video detail · `174:388` | `screens/023-23-video-detail-174-388.png` | Video detail missing | Not integrated | **Not implemented** — Inventory only |
| 24 | 24 · Upload or edit video · `174:389` | `screens/024-24-upload-or-edit-video-174-389.png` | Video editor missing | Not integrated | **Not implemented** — Inventory only |
| 25 | 25 · Pantry · `174:390` | `screens/025-25-pantry-174-390.png` | Pantry feature missing | Not integrated | **Not implemented** — Inventory only |
| 26 | 26 · Ingredient detail · `174:391` | `screens/026-26-ingredient-detail-174-391.png` | Ingredient detail missing | Not integrated | **Not implemented** — Inventory only |
| 27 | 27 · Add or edit ingredient · `174:392` | `screens/027-27-add-or-edit-ingredient-174-392.png` | Ingredient editor missing | Not integrated | **Not implemented** — Inventory only |
| 28 | 28 · Expiry reminders · `174:393` | `screens/028-28-expiry-reminders-174-393.png` | Expiry reminders missing | Not integrated | **Not implemented** — Inventory only |
| 29 | 29 · AI assistant · `174:394` | `screens/029-29-ai-assistant-174-394.png` | AI assistant missing | Not integrated | **Not implemented** — Inventory only |
| 30 | 30 · AI chat · `174:395` | `screens/030-30-ai-chat-174-395.png` | AI chat missing | Not integrated | **Not implemented** — Inventory only |
| 31 | 31 · Meal plan setup · `174:396` | `screens/031-31-meal-plan-setup-174-396.png` | Meal-plan tab is placeholder | Not integrated | **Not implemented** — Inventory only |
| 32 | 32 · Meal plan result · `174:397` | `screens/032-32-meal-plan-result-174-397.png` | Meal-plan result missing | Not integrated | **Not implemented** — Inventory only |
| 33 | 33 · Meal day detail · `174:398` | `screens/033-33-meal-day-detail-174-398.png` | Meal-day detail missing | Not integrated | **Not implemented** — Inventory only |
| 34 | 34 · Cook from ingredients · `174:399` | `screens/034-34-cook-from-ingredients-174-399.png` | Cook-from-ingredients missing | Not integrated | **Not implemented** — Inventory only |
| 35 | 35 · Ingredient recognition capture · `174:400` | `screens/035-35-ingredient-recognition-capture-174-400.png` | Recognition capture missing | Not integrated | **Not implemented** — Inventory only |
| 36 | 36 · Ingredient recognition review · `174:401` | `screens/036-36-ingredient-recognition-review-174-401.png` | Recognition review missing | Not integrated | **Not implemented** — Inventory only |
| 37 | 37 · AI history · `174:402` | `screens/037-37-ai-history-174-402.png` | AI history missing | Not integrated | **Not implemented** — Inventory only |
| 38 | 42 · Profile · `174:407` | `screens/038-42-profile-174-407.png` | `/(tabs)/profile` → `ProfileScreen.tsx` | `GET /users/me` | **Partial** — Functional; detail destinations pending |
| 39 | 43 · Edit profile · `174:408` | `screens/039-43-edit-profile-174-408.png` | `/edit-profile` → `EditProfileScreen.tsx` | `PATCH /users/me`, `PUT /nutrition-profiles/me` | **Partial** — Functional subset; visual pending |
| 40 | 44 · Nutrition & BMI · `174:409` | `screens/040-44-nutrition-bmi-174-409.png` | Nutrition detail missing | Not integrated | **Not implemented** — Inventory only |
| 41 | 45 · Dietary preferences · `174:410` | `screens/041-45-dietary-preferences-174-410.png` | Dietary preferences missing | Not integrated | **Not implemented** — Inventory only |
| 42 | 46 · My allergies · `174:411` | `screens/042-46-my-allergies-174-411.png` | Allergy editor missing | Not integrated | **Not implemented** — Inventory only |
| 43 | 47 · Notification inbox · `174:412` | `screens/043-47-notification-inbox-174-412.png` | Notification inbox missing | Not integrated | **Not implemented** — Inventory only |
| 44 | 48 · Notification settings · `174:413` | `screens/044-48-notification-settings-174-413.png` | Notification settings missing | Not integrated | **Not implemented** — Inventory only |
| 45 | 49 · Language · `174:414` | `screens/045-49-language-174-414.png` | `/language` → `LanguageScreen.tsx` | Local persisted preference (`app_locale`) | **Implemented** — VI/EN runtime switching; automated catalog tests; visual verification pending |
| 46 | 50 · Account & security · `174:415` | `screens/046-50-account-security-174-415.png` | Account/security missing | Not integrated | **Not implemented** — Inventory only |
| 47 | 51 · Admin dashboard · `174:416` | `screens/047-51-admin-dashboard-174-416.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 48 | 52 · Member management · `174:417` | `screens/048-52-member-management-174-417.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 49 | 53 · Member detail · `174:418` | `screens/049-53-member-detail-174-418.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 50 | 54 · Moderation queue · `174:419` | `screens/050-54-moderation-queue-174-419.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 51 | 55 · Moderation review · `174:420` | `screens/051-55-moderation-review-174-420.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 52 | 56 · Category management · `174:421` | `screens/052-56-category-management-174-421.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 53 | 57 · AI model monitoring · `174:422` | `screens/053-57-ai-model-monitoring-174-422.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 54 | 58 · AI log detail · `174:423` | `screens/054-58-ai-log-detail-174-423.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 55 | Extra · Meal plans · `183:620` | `screens/056-extra-meal-plans-183-620.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 56 | Extra · Manual meal plan · `183:648` | `screens/057-extra-manual-meal-plan-183-648.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 57 | Extra · Meal editor · `183:678` | `screens/058-extra-meal-editor-183-678.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 58 | Extra · Plan activation · `183:702` | `screens/059-extra-plan-activation-183-702.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 59 | Extra · Grocery lists · `183:736` | `screens/060-extra-grocery-lists-183-736.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 60 | Extra · Grocery detail · `183:764` | `screens/061-extra-grocery-detail-183-764.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 61 | Extra · Grocery item editor · `183:810` | `screens/062-extra-grocery-item-editor-183-810.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 62 | Extra · Food diary · `183:836` | `screens/063-extra-food-diary-183-836.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 63 | Extra · Diary entry editor · `183:880` | `screens/064-extra-diary-entry-editor-183-880.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 64 | Extra · Nutrition summary · `183:906` | `screens/065-extra-nutrition-summary-183-906.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 65 | Extra · Weight tracking · `183:958` | `screens/066-extra-weight-tracking-183-958.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 66 | Extra · Weight editor · `183:1000` | `screens/067-extra-weight-editor-183-1000.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 67 | Extra · Water tracking · `183:1022` | `screens/068-extra-water-tracking-183-1022.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 68 | Extra · Water editor · `183:1068` | `screens/069-extra-water-editor-183-1068.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 69 | Extra · My content · `183:1086` | `screens/070-extra-my-content-183-1086.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 70 | Extra · Recipe editor · `183:1128` | `screens/071-extra-recipe-editor-183-1128.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 71 | Extra · Recipe ingredients steps · `183:1160` | `screens/072-extra-recipe-ingredients-steps-183-1160.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 72 | Extra · Content actions · `183:1206` | `screens/073-extra-content-actions-183-1206.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 73 | Extra · Report content · `183:1236` | `screens/074-extra-report-content-183-1236.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 74 | Extra · My reports · `183:1258` | `screens/075-extra-my-reports-183-1258.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 75 | Extra · Report detail · `183:1284` | `screens/076-extra-report-detail-183-1284.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 76 | Extra · Reminders · `183:1318` | `screens/077-extra-reminders-183-1318.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 77 | Extra · Reminder editor · `183:1352` | `screens/078-extra-reminder-editor-183-1352.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 78 | Extra · Public profile · `183:1382` | `screens/079-extra-public-profile-183-1382.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 79 | Extra · Viewing history · `183:1418` | `screens/080-extra-viewing-history-183-1418.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 80 | Extra · Media library · `183:1452` | `screens/081-extra-media-library-183-1452.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 81 | Extra · Upload progress · `183:1486` | `screens/082-extra-upload-progress-183-1486.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 82 | Extra · Change password · `183:1514` | `screens/083-extra-change-password-183-1514.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 83 | Extra · Verify email · `183:1548` | `screens/084-extra-verify-email-183-1548.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 84 | Extra · Admin allergens · `183:1576` | `screens/085-extra-admin-allergens-183-1576.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 85 | Extra · Admin food items · `183:1612` | `screens/086-extra-admin-food-items-183-1612.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 86 | Extra · Admin master editor · `183:1648` | `screens/087-extra-admin-master-editor-183-1648.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 87 | Extra · Admin report queue · `183:1680` | `screens/088-extra-admin-report-queue-183-1680.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 88 | Extra · Admin audit · `183:1708` | `screens/089-extra-admin-audit-183-1708.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 89 | Extra · Admin audit detail · `183:1742` | `screens/090-extra-admin-audit-detail-183-1742.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 90 | Extra · Admin role editor · `183:1792` | `screens/091-extra-admin-role-editor-183-1792.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 91 | Extra · Rating editor · `183:1818` | `screens/092-extra-rating-editor-183-1818.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 92 | Extra · Form error · `183:1838` | `screens/093-extra-form-error-183-1838.png` | Input/FormField error variants | None | **Partial shared state** — Integrated; no dedicated preview route |
| 93 | Extra · Empty state · `183:1856` | `screens/094-extra-empty-state-183-1856.png` | `EmptyState` component | None | **Reused shared state** — Covered through consumers |
| 94 | Extra · Loading state · `183:1869` | `screens/095-extra-loading-state-183-1869.png` | `LoadingScreen` / `LoadingSpinner` | None | **Reused shared state** — Covered through consumers |
| 95 | Extra · Network error · `183:1885` | `screens/096-extra-network-error-183-1885.png` | Bootstrap/query error + retry states | Real request errors | **Partial shared state** — Integrated; dedicated reference preview missing |
| 96 | Extra · AI unavailable · `183:1898` | `screens/097-extra-ai-unavailable-183-1898.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 97 | Extra · Permission denied · `183:1913` | `screens/098-extra-permission-denied-183-1913.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 98 | Extra · Account suspended · `183:1928` | `screens/099-extra-account-suspended-183-1928.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 99 | Extra · Update required · `183:1946` | `screens/100-extra-update-required-183-1946.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 100 | Extra · Delete confirmation · `183:1959` | `screens/101-extra-delete-confirmation-183-1959.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 101 | Extra · Success state · `183:1979` | `screens/102-extra-success-state-183-1979.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 102 | Extra · Filter panel · `183:1992` | `screens/103-extra-filter-panel-183-1992.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 103 | Extra · Pantry bulk add · `183:2020` | `screens/104-extra-pantry-bulk-add-183-2020.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |
| 104 | Extra · Meal completion · `183:2056` | `screens/105-extra-meal-completion-183-2056.png` | No production route/state | Not integrated | **Not implemented** — Inventory only |

## Count at this checkpoint

- Implemented route/screens: 15/104.
- Partial functional screens: 4/104.
- Shared reference states reproduced by real components: 4/104.
- Not implemented: 81/104.
- Visual verification on Android emulator: Search and Explore empty states inspected; Search header spacing fixed. Results, detail, cooking and saved states remain pending.
