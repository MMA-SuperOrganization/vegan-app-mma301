# Google Sign-In setup

The application code supports this flow:

`Google OAuth -> Firebase Authentication -> POST /api/v1/auth/sync -> local session`

## Required configuration

1. Enable **Google** in Firebase Console > Authentication > Sign-in method.
2. Create OAuth clients for the target platforms in the same Google/Firebase project.
3. Copy `.env.example` to `.env` and set:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
```

Only the client ID for the platform being run is required. These are public OAuth
client identifiers, not client secrets. Never add a Google client secret to the app.

## Run on mobile

OAuth callbacks cannot be tested in Expo Go. Create and use a development build:

```bash
npx expo run:android
```

The configured callback is `veganapp://oauthredirect`. If the Google Cloud setup
requires an authorized redirect URI, use that exact value.

## Diagnostics

Authentication failures are rendered on the screen with a stable error code and
are logged to Metro with the prefix `[VEGETA_ERROR]`. Logs contain only normalized
diagnostic fields and never include passwords, Google ID tokens, Firebase ID tokens,
or refresh tokens.
