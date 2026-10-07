# Google Sign-In setup

The application code supports this flow:

`Google OAuth -> Firebase Authentication -> POST /api/v1/auth/sync -> local session`

## Required configuration

1. Enable **Google** in Firebase Console > Authentication > Sign-in method.
2. Add an Android app with package name `com.ngocthang.veganapp` to the same
   Firebase project and add this debug SHA-1 fingerprint:
   `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`.
3. Create a **Web application** OAuth client in that project. The native Google
   Sign-In SDK uses this client ID to request the ID token consumed by Firebase.
4. Copy `.env.example` to `.env` and set:

```dotenv
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=... # optional; kept for project metadata
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...     # required only when iOS is configured
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
```

`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is required on Android. These are public OAuth
client identifiers, not client secrets. Never add a Google client secret to the app.

## Run on mobile

Google Sign-In cannot be tested in Expo Go because it needs a native module. Build
and install the development client (the Android emulator must already be running):

```bash
npm run android
```

For later JavaScript-only changes, keep the installed app and start Metro with:

```bash
npm run android:dev
```

If `adb devices` does not show `emulator-5554 device`, start the AVD first and
then rerun the command. The native Android flow does not use a custom OAuth
redirect URI; Google returns the ID token directly to the app.

## Team setup and Google Play

After cloning, create your own ignored `.env` using the team's Firebase API key
and Web OAuth client ID, run `npm ci`, then run `npm run android`. The repository
includes `android/app/debug.keystore` for development only, so team debug builds
use the same SHA-1 listed above. If you replace that keystore, register its SHA-1
in Firebase as well.

Before publishing, configure a separate release/upload signing key. The current
generated release build uses the debug signing configuration and is not ready
for Google Play distribution. Add the SHA-1 of the **App signing key certificate**
from Play Console to Firebase for users installing from Google Play. Verify
Google login with a Play internal testing build before public release.

## Diagnostics

Authentication failures are rendered on the screen with a stable error code and
are logged to Metro with the prefix `[VEGETA_ERROR]`. Logs contain only normalized
diagnostic fields and never include passwords, Google ID tokens, Firebase ID tokens,
or refresh tokens.
