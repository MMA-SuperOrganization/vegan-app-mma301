import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { getAiProgressStage } from '../src/features/ai/aiProgress.ts';
import {
  AI_STARTER_PROMPTS,
  deriveConversationTitle,
  formatAiMessageTime,
  getAiStarterPrompts,
} from '../src/features/ai/aiChatCopy.ts';
import {
  AI_TRANSLATION_KEYS,
  AiFeedbackRating,
  AiMessageRole,
  AiProgressStage,
  AiSafetyNoticeCode,
} from '../src/features/ai/aiConstants.ts';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('AI progress reports truthful processing stages without fake percentages', () => {
  assert.equal(getAiProgressStage(0), AiProgressStage.SENDING);
  assert.equal(getAiProgressStage(2_000), AiProgressStage.CHECKING);
  assert.equal(getAiProgressStage(8_000), AiProgressStage.GENERATING);
  const status = read('../src/features/ai/components/AiProcessingStatus.tsx');
  assert.match(status, /accessibilityRole="progressbar"/);
  assert.doesNotMatch(status, /%|percent/i);
});

test('AI chat copy helper derives concise titles and formats timestamps safely via i18n', () => {
  assert.equal(AI_STARTER_PROMPTS.vi.length, 4);
  assert.equal(AI_STARTER_PROMPTS.en.length, 4);
  assert.deepEqual(getAiStarterPrompts('vi'), AI_STARTER_PROMPTS.vi);
  assert.deepEqual(getAiStarterPrompts('en'), AI_STARTER_PROMPTS.en);
  assert.equal(deriveConversationTitle('   ', 'vi'), 'Trò chuyện mới');
  assert.equal(deriveConversationTitle('   ', 'en'), 'New conversation');
  assert.equal(
    deriveConversationTitle('  Gợi ý   bữa tối giàu đạm  ', 'vi'),
    'Gợi ý bữa tối giàu đạm'
  );
  assert.equal(
    deriveConversationTitle('x'.repeat(60), 'en').endsWith('…'),
    true
  );
  assert.equal(formatAiMessageTime(undefined, 'vi'), null);
  assert.equal(formatAiMessageTime('not-a-date', 'en'), null);
  assert.equal(typeof formatAiMessageTime('2026-10-30T10:15:00.000Z', 'vi'), 'string');
});

test('AI and Admin modules centralize domain values in enums/constants and strings in i18n', () => {
  assert.equal(AiSafetyNoticeCode.ALLERGEN_CAUTION, 'ALLERGEN_CAUTION');
  assert.equal(AiMessageRole.USER, 'user');
  assert.equal(AiMessageRole.ASSISTANT, 'assistant');
  assert.equal(AiFeedbackRating.HELPFUL, 'helpful');
  assert.equal(AiFeedbackRating.NOT_HELPFUL, 'not_helpful');
  assert.equal(AI_TRANSLATION_KEYS.WIDGET.RETRY, 'ai.widget.retry');

  for (const path of [
    '../src/features/admin/MasterDataPanel.tsx',
    '../src/features/admin/AdminDashboardScreen.tsx',
    '../src/features/ai/components/AiSafetyNotices.tsx',
    '../src/features/ai/components/AiProcessingStatus.tsx',
    '../src/features/ai/components/AiImageAttachmentPicker.tsx',
    '../src/features/ai/screens/AiChatScreen.tsx',
    '../src/features/ai/components/AiChatWidget.tsx',
    '../src/features/ai/screens/AiHistoryScreen.tsx',
  ]) {
    const source = read(path);
    assert.doesNotMatch(
      source,
      /\bvi\s*\?\s*['"`]/,
      `${path} should use i18n keys instead of inline vi ? '...' : '...' strings`
    );
  }
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
  const screen = read('../src/features/ai/screens/AiChatScreen.tsx');
  const widget = read('../src/features/ai/components/AiChatWidget.tsx');
  assert.match(
    screen,
    /error=\{chat\.send\.error\}[\s\S]*retry=\{\(\) => void submitQuestion\(\)\}/
  );
  assert.match(screen, /scrollable=\{false\}/);
  assert.match(screen, /styles\.composerDock/);
  assert.match(widget, /widgetKeys\.RETRY/);
  assert.match(widget, /pathname\.startsWith\('\/ai'\)/);
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
