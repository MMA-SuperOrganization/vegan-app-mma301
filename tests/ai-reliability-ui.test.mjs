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
import { appendAiMessages } from '../src/features/ai/aiMessageCache.ts';
import {
  clampAiWidgetPosition,
  getAiWidgetBounds,
  shouldHideAiWidget,
  snapAiWidgetToNearestEdge,
} from '../src/features/ai/aiWidgetPosition.ts';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('AI progress reports truthful processing stages without fake percentages', () => {
  assert.equal(getAiProgressStage(0), AiProgressStage.SENDING);
  assert.equal(getAiProgressStage(2_000), AiProgressStage.CHECKING);
  assert.equal(getAiProgressStage(8_000), AiProgressStage.GENERATING);
  const status = read('../src/features/ai/components/AiProcessingStatus.tsx');
  assert.match(status, /accessibilityRole="progressbar"/);
  assert.doesNotMatch(status, /%|percent/i);
});

test('AI chat cache keeps the submitted question and returned answer visible', () => {
  const initial = {
    data: [{ _id: 'old', role: AiMessageRole.ASSISTANT, content: 'Old answer' }],
  };
  const userMessage = {
    _id: 'optimistic-user',
    role: AiMessageRole.USER,
    content: 'New question',
  };
  const assistantMessage = {
    _id: 'assistant-answer',
    role: AiMessageRole.ASSISTANT,
    content: 'New answer',
  };

  const optimistic = appendAiMessages(initial, [userMessage]);
  const completed = appendAiMessages(optimistic, [assistantMessage, assistantMessage]);

  assert.deepEqual(initial.data.map((message) => message._id), ['old']);
  assert.deepEqual(completed.data.map((message) => message._id), [
    'old',
    'optimistic-user',
    'assistant-answer',
  ]);
});

test('AI requests keep running in the background and stay scoped to their conversation', () => {
  const hooks = read('../src/features/ai/hooks.ts');
  const widget = read('../src/features/ai/components/AiChatWidget.tsx');
  const screen = read('../src/features/ai/screens/AiChatScreen.tsx');

  assert.match(hooks, /mutationKey: sendMutationKey/);
  assert.match(hooks, /mutationKey: createMutationKey/);
  assert.match(hooks, /variables\?\.targetConversationId === conversationId/);
  assert.match(hooks, /aiApi\.send\(targetConversationId, content, mediaId\)/);
  const closePanel = widget.slice(
    widget.indexOf('const closePanel'),
    widget.indexOf('const openFullScreenChat')
  );
  const selectConversation = screen.slice(
    screen.indexOf('const selectConversation'),
    screen.indexOf('const createConversation')
  );
  assert.doesNotMatch(
    closePanel,
    /chat\.(?:send|create)\.reset\(\)|attachment\.clear\(\)/
  );
  assert.doesNotMatch(
    selectConversation,
    /chat\.(?:send|create)\.reset\(\)/
  );
  assert.match(widget, /chat\.isSending/);
  assert.match(widget, /chat\.isCreating/);
  assert.match(widget, /accessibilityState=\{\{ busy: chat\.hasPendingWork \}\}/);
  assert.match(widget, /conversationIdRef\.current === targetConversationId/);
  assert.match(screen, /chat\.isSending/);
  assert.match(screen, /chat\.isCreating/);
  assert.match(screen, /activeIdRef\.current === targetConversationId/);
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
  assert.match(widget, /shouldHideAiWidget\(pathname\)/);
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

test('AI chat always uses the nutrition profile without showing an opt-out toggle', () => {
  for (const path of [
    '../src/features/ai/screens/AiChatScreen.tsx',
    '../src/features/ai/components/AiChatWidget.tsx',
  ]) {
    const source = read(path);
    assert.doesNotMatch(source, /\bToggle\b/);
    assert.doesNotMatch(source, /\buseProfile\b/);
  }

  const api = read('../src/features/ai/aiApi.ts');
  assert.match(
    api,
    /send:\s*\(id:\s*string,\s*content:\s*string,\s*mediaId\?:\s*string\)[\s\S]*?useProfile:\s*true/
  );
});

test('AI launcher stays draggable inside the safe screen and snaps to an edge', () => {
  const bounds = getAiWidgetBounds(
    { width: 390, height: 844 },
    { top: 47, right: 0, bottom: 34, left: 0 },
    64,
    110,
    8
  );

  assert.deepEqual(bounds, { minX: 8, maxX: 318, minY: 55, maxY: 670 });
  assert.deepEqual(clampAiWidgetPosition({ x: -20, y: 900 }, bounds), {
    x: 8,
    y: 670,
  });
  assert.deepEqual(snapAiWidgetToNearestEdge({ x: 100, y: 300 }, bounds), {
    x: 8,
    y: 300,
  });
  assert.deepEqual(snapAiWidgetToNearestEdge({ x: 250, y: 300 }, bounds), {
    x: 318,
    y: 300,
  });

  const widget = read('../src/features/ai/components/AiChatWidget.tsx');
  assert.match(widget, /launcherDragResponder\.panHandlers/);
  assert.match(widget, /DRAG_ACTIVATION_DISTANCE/);
});

test('AI launcher remains available across app content routes', () => {
  assert.equal(shouldHideAiWidget('/'), false);
  assert.equal(shouldHideAiWidget('/community/post'), false);
  assert.equal(shouldHideAiWidget('/search-results'), false);
  assert.equal(shouldHideAiWidget('/ai'), true);
  assert.equal(shouldHideAiWidget('/ai/history'), true);
});

test('AI widget lets users scroll chat history without forced jumps', () => {
  const widget = read('../src/features/ai/components/AiChatWidget.tsx');
  const sheet = read('../src/components/ui/BottomSheet/BottomSheet.tsx');

  assert.match(widget, /nestedScrollEnabled/);
  assert.match(widget, /onScroll=\{trackMessageScrollPosition\}/);
  assert.match(widget, /distanceFromBottom <= AUTO_SCROLL_THRESHOLD/);
  assert.doesNotMatch(widget, /onContentSizeChange=/);
  assert.doesNotMatch(widget, /swipeResponder\.panHandlers/);
  assert.doesNotMatch(widget, /SWIPE_HINT|composerToolbar/);
  assert.match(sheet, /style=\{StyleSheet\.absoluteFill\}/);
  assert.match(sheet, /sheetMotion:\s*\{/);
  assert.match(sheet, /zIndex: 1/);
  assert.doesNotMatch(sheet, /onPress=\{\(e\) => e\.stopPropagation\(\)\}/);
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

test('AI meal planner shows progress steps, elapsed time and can cancel', () => {
  const screen = readFileSync(
    new URL('../src/features/ai/screens/AiMealPlannerScreen.tsx', import.meta.url),
    'utf8'
  );
  const panel = readFileSync(
    new URL('../src/features/ai/components/AiProgressPanel.tsx', import.meta.url),
    'utf8'
  );
  const api = readFileSync(new URL('../src/features/ai/aiApi.ts', import.meta.url), 'utf8');
  assert.match(screen, /<AiProgressPanel/);
  assert.match(screen, /new AbortController\(\)/);
  assert.match(screen, /controller\.signal/);
  assert.match(panel, /accessibilityRole="progressbar"/);
  assert.match(panel, /elapsedLabel\(seconds\)/);
  assert.match(api, /\{ \.\.\.aiGenerationRequest, signal \}/);
});
