import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('startup splash uses the VEGETA and DisNote branded artwork', () => {
  const config = JSON.parse(read('../app.json'));

  assert.deepEqual(config.expo.splash, {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#F7F2EB',
  });
  assert.equal(
    existsSync(new URL('../assets/splash-icon.png', import.meta.url)),
    true
  );
  assert.equal(
    existsSync(new URL('../assets/branding/disnote-wordmark.png', import.meta.url)),
    true
  );
});

test('native and React loading screens share the startup branding', () => {
  const loadingScreen = read('../src/components/feedback/LoadingScreen.tsx');
  const rootLayout = read('../src/app/_layout.tsx');
  const colors = read('../android/app/src/main/res/values/colors.xml');
  const styles = read('../android/app/src/main/res/values/styles.xml');

  assert.match(loadingScreen, /Powered by/);
  assert.match(loadingScreen, /branding\/disnote-wordmark\.png/);
  assert.match(loadingScreen, /android-icon-foreground\.png/);
  assert.match(rootLayout, /STARTUP_BRAND_DURATION_MS = 2000/);
  assert.match(rootLayout, /isStartupBrandVisible/);
  assert.match(colors, /splashscreen_background">#F7F2EB/);
  assert.match(styles, /@drawable\/launch_screen/);
});
