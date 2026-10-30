import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  aiContentHref,
  normalizeLegacyAiContentLinks,
} from '../src/features/ai/aiContentLink.ts';

const markdownComponent = readFileSync(
  new URL('../src/features/ai/components/AiMarkdownMessage.tsx', import.meta.url),
  'utf8'
);
const widget = readFileSync(
  new URL('../src/features/ai/components/AiChatWidget.tsx', import.meta.url),
  'utf8'
);
const screen = readFileSync(
  new URL('../src/features/ai/screens/AiChatScreen.tsx', import.meta.url),
  'utf8'
);

test('AI answers use the shared Markdown renderer in every chat surface', () => {
  assert.match(
    markdownComponent,
    /from '@ronradtke\/react-native-markdown-display'/
  );
  assert.match(markdownComponent, /heading2:/);
  assert.match(markdownComponent, /bullet_list:/);
  assert.match(markdownComponent, /strong:/);
  assert.match(markdownComponent, /code_inline:/);
  assert.match(widget, /onOpenContent=\{closePanel\}/);
  assert.match(screen, /<AiMarkdownMessage content=\{message\.content\} \/>/);
});

test('AI catalog links navigate only to supported in-app content routes', () => {
  const id = '6ac9b6cf9494132fdd20b0b0';
  assert.deepEqual(aiContentHref(`veganapp://recipe/${id}`), {
    pathname: '/(discover)/recipe/[id]',
    params: { id },
  });
  assert.deepEqual(aiContentHref(`veganapp://food/${id}`), {
    pathname: '/(discover)/food/[id]',
    params: { id },
  });
  assert.equal(aiContentHref('https://example.com/recipe'), null);
  assert.equal(aiContentHref('veganapp://recipe/not-an-object-id'), null);
});

test('legacy AI answers hide raw recipe IDs behind tappable titles', () => {
  const id = '6ac9b6cf9494132fdd20b0b0';
  const normalized = normalizeLegacyAiContentLinks(
    `- **Black Bean Corn Salad** (ID: \`${id}\`) - Giàu chất xơ\n- Avocado Toast (ID: ${id})`
  );

  assert.equal(
    normalized,
    `- **[Black Bean Corn Salad](veganapp://recipe/${id})** - Giàu chất xơ\n- [Avocado Toast](veganapp://recipe/${id})`
  );
  assert.doesNotMatch(normalized, /\bID\s*:/i);
});

test('user messages remain plain text instead of executing Markdown formatting', () => {
  assert.match(widget, /fromUser \? \([\s\S]*?<AppText selectable/);
  assert.match(
    screen,
    /message\.role === AiMessageRole\.ASSISTANT \? \([\s\S]*?<AiMarkdownMessage/
  );
});
