# Android development signing

After installing Node.js, the Android SDK/JDK, and configuring `.env` from
`.env.example`, run:

```sh
npm ci
npm run android
```

`postinstall` and `preandroid` restore Expo's public development keystore from
the installed `expo/template.tgz`. Gradle uses this project-local key rather
than a different key generated in each developer's home directory. The keystore
stays ignored by Git. The setup verifies the template key's hash and refuses to
overwrite an existing different keystore. If install scripts were disabled,
run `node scripts/setup-android-debug-key.mjs` before invoking Gradle directly.
The `tar` command must be available (included in current Windows, macOS, and
typical Linux installations).

Register this development certificate once for the project's Android package
in Firebase / Google Cloud OAuth:

```text
SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

All developers must also use the same Firebase project and Web OAuth client ID
in their local environment. Signing setup does not provision backend services,
environment variables, or Google accounts.

If the device already has the app signed by a different key, Android requires
uninstalling it once before installing this build; uninstalling erases its local
data. Do not remove other developers' registered fingerprints.

## Store releases

This public key is only for local development. The existing release Gradle
configuration still references debug signing and must be replaced with private
release/upload credentials before store publication. Do not use this workflow
to produce a store release.

For Google Play, register the **Play App Signing certificate** for the Android
package in Google OAuth/Firebase. All users installing that release receive the
same signed app, regardless of their device. An upload key and Play's app
signing key can have different fingerprints.

For Apple's App Store, configure a separate iOS OAuth client for the bundle ID,
the Google callback URL scheme, and iOS signing/provisioning. Android SHA-1
registration does not configure iOS login.
