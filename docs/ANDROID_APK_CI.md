# Android APK from GitHub Actions

The `Android APK` workflow builds a standalone APK whenever a commit reaches the
`develop` branch. Merging a pull request into `develop` creates that push and
therefore triggers the same workflow. It can also be started manually from the
Actions page.

## Repository variables

Configure these under **Settings → Secrets and variables → Actions → Variables**:

- `EXPO_PUBLIC_API_URL` (required, including `/api/v1`)
- `EXPO_PUBLIC_FIREBASE_API_KEY` (required for authentication)
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (required for Android Google sign-in)
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` (optional project metadata)
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` (optional for this Android build)
- `EXPO_PUBLIC_PRIVACY_POLICY_URL` (optional)

Expo embeds every `EXPO_PUBLIC_*` value in the APK. These values must never be
private credentials. Backend AI keys, Firebase service-account private keys,
Cloudflare R2 secrets, and production signing keys belong in GitHub Actions
Secrets or the backend deployment environment and must not use the
`EXPO_PUBLIC_` prefix.

The generated APK is signed with Expo's public development key and is intended
for internal installation/testing, not Play Store publication. A production
release requires a private upload keystore stored as GitHub Secrets.

## Download

Open **Actions → Android APK → the completed run → Artifacts**, then download
`VEGETA-develop-<run number>`. Artifacts are retained for 14 days.
