# Profile & Settings implementation progress

Updated: 2026-10-09

## Completed

- Profile hub with live account, diet, BMI, allergen and unread-notification data.
- Edit profile: display name, bio, birth date, timezone, height and weight.
- Nutrition/BMI editing and server-side target recalculation.
- Dietary preference, nutrition goal and activity-level editing.
- Allergen selection with explicit empty state and safety guidance.
- Notification inbox with loading, empty, error/retry and optimistic read state.
- Notification preferences, quiet hours, timezone and OS permission handoff.
- Persisted Vietnamese/English language selection.
- Password-reset email, privacy-policy link, logout and confirmed account deletion.
- MongoDB standalone fallback for regular-user account deletion is covered by a backend regression test.

## API sources

- `/users/me`, `/profiles/me`, `/nutrition-profiles/me`
- `/allergens`
- `/notifications`, `/notifications/unread-count`, `/notifications/read-all`
- `/notification-preferences`
- Firebase password reset

## Known boundary

Avatar upload is intentionally not presented as a working control. The backend supports `avatarMediaId`, but the mobile project does not yet contain a media-picker/upload client. Existing avatars continue to display correctly.
