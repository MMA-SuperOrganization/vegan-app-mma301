# Run and Test Guide for VEGETA

This guide is for new team members and testers: how to run the app, install an APK
for testing, record results in the Log Test sheet, and handle common problems.
For more technical detail see:

- [USB_DEVICE_TESTING.md](USB_DEVICE_TESTING.md): running on a real phone over USB.
- [ANDROID_APK_CI.md](ANDROID_APK_CI.md): the GitHub Actions APK workflow.
- [API_AUTH_INTEGRATION_GUIDELINE.md](API_AUTH_INTEGRATION_GUIDELINE.md): sign-in, tokens and API calls.

## 1. Prerequisites

| Tool                | Notes                                                                |
| :------------------ | :------------------------------------------------------------------- |
| Node.js 20+ and npm | Use `npm ci` to install the exact versions from `package-lock.json`. |
| Android Studio      | Provides the Android SDK, `adb` and the emulator (Device Manager).   |
| Git                 | Branch off `develop` and use one branch per task.                    |

Create `.env` from `.env.example` and fill in the values shared by the team. The app
talks to the deployed backend, so you do not need to run `vegan-api` locally:

```env
EXPO_PUBLIC_API_URL=<deployed API URL shared by the team>/api/v1
```

Check that the backend is up before testing:

```bash
curl "$EXPO_PUBLIC_API_URL/health"
```

If it returns `503 no available server`, the backend is down or redeploying. Tell the
backend owner and stop testing, because every screen will show errors.

## 2. Run the web build (fastest way to check UI)

```bash
npm ci
npm run web
```

Open `http://localhost:8081` and sign in. The web build reloads when you edit code.

Known web-only limitations (**not app bugs**):

- **Image uploads** (avatar, post images, ingredient recognition) always fail because
  Cloudflare R2 blocks CORS from `localhost`. Test these features on an APK.
- **Push notifications** only work on Android.
- After switching branches or re-running `npm ci`, if the console shows odd errors such
  as `... is not a function`, reload the page or restart `npm run web`.

## 3. Test on an Android emulator with an APK

The team recommends the **Medium Phone** device profile (other profiles are slow).

1. Android Studio → **Device Manager** → **Create Virtual Device** → choose **Medium Phone**
   → pick the latest system image → **Finish**, then press ▶ to start the emulator.
2. Download the latest APK: GitHub → `vegan-app-mma301` repo → **Actions** → the
   **Android APK** workflow → the latest successful ✅ run on `develop` → **Artifacts**
   → download `VEGETA-develop-<number>` (a .zip kept for 14 days) and extract it.
3. Install it over the existing app (your signed-in account is kept):

   ```bash
   adb devices
   adb install -r "<download folder>/VEGETA-develop-<number>/VEGETA-develop-<number>.apk"
   ```

   You can also drag the `.apk` file onto the emulator window.

4. Open **VEGETA** and sign in with your test account.

> The emulator only gets new code when you install a new APK. Code merged into
> `develop` is not in an older APK.

Tips:

- Hide the emulator keyboard with `Esc` instead of Back (Back may leave the screen).
- Add test images to the emulator gallery: `adb push photo.jpg /sdcard/Pictures/`.

## 4. Test data rules

The backend is a **server shared by the whole team**; every action writes real data.

- Prefix test data with `[TEST]` and the tester's name, for example
  `[TEST] Sample post - tester Huyen`.
- Only edit, delete, report or hide data you created yourself or `[TEST]` data.
- When testing with an **admin** account, never suspend, delete or change the role of
  other people's accounts. Restore anything you hide or suspend right after the test.
- Never paste account passwords (especially admin ones) into chats, issues or commits.

## 5. Recording results in the Log Test sheet

Each row is one user story (`FR-...`). Main columns:

| Column       | How to fill it                                                                                           |
| :----------- | :------------------------------------------------------------------------------------------------------- |
| Test status  | `Pass`, `Fail`, `In Progress`, `Blocked` (blocked by another bug) or `Untested`.                         |
| Bug details  | Steps to reproduce, actual and expected result. State the build tested (APK number, web, emulator).      |
| Evidence     | A screenshot or a link to it.                                                                            |
| Bug status   | `New Bug` when found, `Fixed` when fixed, `Retest` when it needs testing again, `Closed` when it passes. |
| Tester/Fixer | Who tested / who fixed it.                                                                               |

Take an emulator screenshot with the 📷 button in the emulator toolbar, or:

```bash
adb exec-out screencap -p > screen.png
```

## 6. Checks before opening a pull request

CI (the **Android APK** workflow) runs these steps in this order; run the same locally
before pushing:

```bash
npm ci
npm run typecheck
npm run lint
npm run test:ui
```

- `test:ui` reads source files and checks them with regular expressions. Renaming a
  component or moving code to another file can fail a test even when the app works;
  update the matching test.
- The `tests/` folder is listed in `.gitignore`, so a **new** test file must be added with
  `git add -f tests/<file>.test.mjs`, otherwise CI will not have it.
- If `tsc` runs out of memory, retry with
  `NODE_OPTIONS=--max-old-space-size=4096 npm run typecheck`.

Branch and commit conventions: `feat/...`, `fix/...`, Conventional Commits
(`fix(profile): ...`). Open pull requests against `develop`.

### Merging `develop` into `main`

Use **Create a merge commit** (or **Rebase and merge**) so GitHub keeps the author of
every commit. **Do not use Squash and merge** for the `develop` → `main` pull request:
the whole team's changes would collapse into one commit owned by whoever opened it.

## 7. Common problems

| Symptom                                                      | Cause / fix                                                                                                                                                              |
| :----------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Unable to load profile", every API call fails               | The backend is down (`/health` returns 503). Tell the backend owner.                                                                                                     |
| Image upload shows "Something went wrong" on web             | R2 CORS, see section 2. Test on an APK.                                                                                                                                  |
| "Register for push" says the Android build is not configured | The APK was built without `google-services.json`: `app.config.ts` only enables push when that file exists and the APK workflow does not create it. Tell whoever owns CI. |
| The account is suspended                                     | The app signs out and explains that the account is suspended.                                                                                                            |
| `adb` does not list the emulator                             | Start the emulator first, then run `adb kill-server` and `adb devices`.                                                                                                  |
| Emulator screen stays black after boot                       | Send a wake-up key: `adb shell input keyevent 224`.                                                                                                                      |
