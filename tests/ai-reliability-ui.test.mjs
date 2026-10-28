import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
    /error=\{chat\.send\.error\} retry=\{submitQuestion\}/
  );
  assert.match(
    read('../src/features/ai/components/AiChatWidget.tsx'),
    /'Thử lại' : 'Retry'/
  );
});

test('Android workflow builds on develop with repository variables and uploads an APK', () => {
  const workflow = read('../.github/workflows/android-apk.yml');
  assert.match(workflow, /push:\s*\n\s*branches: \[develop\]/);
  assert.match(workflow, /vars\.EXPO_PUBLIC_API_URL/);
  assert.match(workflow, /gradle\/actions\/setup-gradle@v4/);
  assert.match(workflow, /socketTimeout=300000/);
  assert.match(workflow, /for attempt in 1 2 3/);
  assert.match(workflow, /\.\/gradlew assembleRelease/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.doesNotMatch(workflow, /CLOUDFLARE_R2_SECRET|FIREBASE_PRIVATE_KEY/);
});
