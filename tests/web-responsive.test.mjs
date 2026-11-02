import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

async function featureScreens(directory = new URL('../src/features/', import.meta.url)) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const url = new URL(entry.name, directory);
      if (entry.isDirectory()) return featureScreens(new URL(`${url.href}/`));
      return entry.name.endsWith('Screen.tsx') ? [url] : [];
    })
  );
  return nested.flat();
}

test('web content is capped and centered without changing native screen styles', async () => {
  const [screenWrapper, webLayout] = await Promise.all([
    read('src/components/layout/ScreenWrapper.tsx'),
    read('src/theme/webLayout.ts'),
  ]);

  assert.match(webLayout, /contentMaxWidth:\s*880/);
  assert.match(screenWrapper, /Platform\.OS === 'web' && styles\.webContent/);
  assert.match(screenWrapper, /maxWidth: webMaxWidth/);
  assert.match(screenWrapper, /Platform\.select/);
  assert.match(screenWrapper, /default:\s*\{\}/);
});

test('web navigation and sheets use desktop surfaces while retaining native paths', async () => {
  const [tabBar, bottomSheet] = await Promise.all([
    read('src/components/navigation/CustomTabBar.tsx'),
    read('src/components/ui/BottomSheet/BottomSheet.tsx'),
  ]);

  assert.match(tabBar, /Platform\.OS !== 'web' && coreTokens\.navigation\.tabBarShadow/);
  assert.match(tabBar, /styles\.webContainer/);
  assert.match(tabBar, /maxWidth: webLayout\.navigationMaxWidth/);
  assert.match(bottomSheet, /Platform\.OS === 'web' \? 'fade' : 'slide'/);
  assert.match(bottomSheet, /styles\.webBackdrop/);
  assert.match(bottomSheet, /maxWidth: webLayout\.dialogMaxWidth/);
});

test('auth gets a desktop composition and narrow readable form widths', async () => {
  const [welcome, login, register, forgotPassword] = await Promise.all([
    read('src/features/auth/screens/WelcomeScreen.tsx'),
    read('src/features/auth/screens/LoginScreen.tsx'),
    read('src/features/auth/screens/RegisterScreen.tsx'),
    read('src/features/auth/screens/ForgotPasswordScreen.tsx'),
  ]);

  assert.match(welcome, /Platform\.OS === 'web' && width >= 960/);
  assert.match(welcome, /webMaxWidth=\{1120\}/);
  for (const source of [login, register, forgotPassword]) {
    assert.match(source, /webMaxWidth=\{560\}/);
  }
});

test('every feature screen inherits a responsive web-aware screen shell', async () => {
  const screens = await featureScreens();
  assert.ok(screens.length >= 60, `expected a full screen inventory, got ${screens.length}`);

  const missingShell = [];
  for (const screen of screens) {
    const source = await readFile(screen, 'utf8');
    if (!/ScreenWrapper|SettingsScreenLayout|OnboardingScreen/.test(source)) {
      missingShell.push(screen.pathname);
    }
  }

  assert.deepEqual(missingShell, []);
});

test('web production output has a repeatable build command and SPA routing mode', async () => {
  const [packageJson, appJson] = await Promise.all([
    read('package.json'),
    read('app.json'),
  ]);
  assert.match(packageJson, /"build:web":\s*"expo export --platform web/);
  assert.match(appJson, /"output":\s*"single"/);
});
