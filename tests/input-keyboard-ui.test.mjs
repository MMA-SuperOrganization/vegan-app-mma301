import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('birth date field restricts typing and exposes the native date picker', () => {
  const field = read('../src/components/ui/DateInputField/DateInputField.tsx');
  const onboarding = read(
    '../src/features/onboarding/screens/NutritionProfileScreen.tsx'
  );

  assert.match(field, /keyboardType="numbers-and-punctuation"/);
  assert.match(field, /DateTimePicker/);
  assert.match(field, /maximumDate=\{new Date\(\)\}/);
  assert.match(onboarding, /<DateInputField/);
});

test('AI bottom sheet resizes and scrolls its composer above the Android keyboard', () => {
  const sheet = read('../src/components/ui/BottomSheet/BottomSheet.tsx');
  const chat = read('../src/features/ai/components/AiChatWidget.tsx');

  assert.match(sheet, /Platform\.OS === 'ios' \? 'padding' : 'height'/);
  assert.match(chat, /useKeyboardInsets\(\)/);
  assert.match(chat, /keyboard\.visible/);
  assert.match(chat, /scrollToEnd/);
});

test('password input renders eye and eye-off toggle icon instead of text dot', () => {
  const input = read('../src/components/ui/Input/Input.tsx');
  const assets = read('../src/theme/assets.ts');

  assert.match(assets, /eye:\s*\{/);
  assert.match(assets, /'eye-off':\s*\{/);
  assert.match(input, /visible \? 'eye-off' : 'eye'/);
  assert.doesNotMatch(
    input,
    /kind === 'password'[\s\S]*?<AppText[^>]*>\{icon\.text\}<\/AppText>/
  );
});

