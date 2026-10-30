import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { getAiProgressStage } from '../src/features/ai/aiProgress.ts';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('AI progress reports truthful processing stages without fake percentages', () => {
  assert.equal(getAiProgressStage(0), 'sending');
  assert.equal(getAiProgressStage(2_000), 'checking');
  assert.equal(getAiProgressStage(8_000), 'generating');
  const status = read('../src/features/ai/components/AiProcessingStatus.tsx');
  assert.match(status, /accessibilityRole="progressbar"/);
  assert.doesNotMatch(status, /%|percent/i);
});

test('both AI chat surfaces show safety limits, allergen cautions, progress and retry', () => {
  for (const path of [
    '../src/features/ai/screens/AiChatScreen.tsx',
    '../src/features/ai/components/AiChatWidget.tsx',
  ]) {
    const source = read(path);
    assert.match(source, /AiMedicalDisclaimer/);
    assert.match(source, /AiSafetyNotices/);
    assert.match(source, /AiProcessingStatus/);
  }
  assert.match(
    read('../src/features/ai/screens/AiChatScreen.tsx'),
    /error=\{chat\.send\.error\}[\s\S]*retry=\{\(\) => void submitQuestion\(\)\}/
  );
  assert.match(
    read('../src/features/ai/components/AiChatWidget.tsx'),
    /'Thử lại' : 'Retry'/
  );
});

test('both AI chat surfaces upload an image before sending its media ID', () => {
  const attachmentHook = read('../src/features/ai/useAiImageAttachment.ts');
  assert.match(attachmentHook, /uploadImage\(asset, 'ai_chat'\)/);

  for (const path of [
    '../src/features/ai/screens/AiChatScreen.tsx',
    '../src/features/ai/components/AiChatWidget.tsx',
  ]) {
    const source = read(path);
    assert.match(source, /AiImageAttachmentPicker/);
    assert.match(source, /uploadIfNeeded\(\)/);
    assert.match(source, /mediaId/);
  }
});

test('Android app uses the VEGETA adaptive icon assets', () => {
  const config = JSON.parse(read('../app.json')).expo;
  assert.equal(config.name, 'VEGETA');
  assert.equal(config.android.adaptiveIcon.backgroundColor, '#F7F2EB');
  for (const path of [
    config.icon,
    config.android.adaptiveIcon.foregroundImage,
    config.android.adaptiveIcon.monochromeImage,
  ]) {
    assert.equal(
      existsSync(new URL(`../${path.replace(/^\.\//, '')}`, import.meta.url)),
      true
    );
  }
  assert.match(read('../assets/vegeta/mam-companion.svg'), /fill="#247A52"/);
  assert.equal(
    existsSync(
      new URL(
        '../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.webp',
        import.meta.url
      )
    ),
    true
  );
});

test('Android workflow builds on develop with repository variables and uploads an APK', () => {
  const workflow = read('../.github/workflows/android-apk.yml');
  assert.match(workflow, /push:\s*\n\s*branches: \[develop\]/);
  assert.match(workflow, /vars\.EXPO_PUBLIC_API_URL/);
  assert.match(workflow, /gradle\/actions\/setup-gradle@v4/);
  assert.match(workflow, /socketTimeout=300000/);
  assert.match(workflow, /for attempt in 1 2 3/);
  assert.match(workflow, /\.\/gradlew assembleInternal/);
  assert.match(workflow, /apk\/internal\/app-internal\.apk/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.doesNotMatch(workflow, /CLOUDFLARE_R2_SECRET|FIREBASE_PRIVATE_KEY/);
});
