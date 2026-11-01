import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('shared buttons provide semantic action icons across the app', () => {
  const button = read('../src/components/ui/Button/Button.tsx');
  const resolver = read('../src/components/ui/Button/buttonIcon.ts');
  const assets = read('../src/theme/assets.ts');

  assert.match(button, /inferButtonIcon\(title\)/);
  assert.match(button, /icon\?: AssetName \| false/);
  for (const icon of [
    'plus',
    'edit',
    'trash',
    'share',
    'thumb-up',
    'heart',
    'lightbulb',
    'flag',
    'comment',
    'send',
    'refresh',
    'save',
  ]) {
    assert.match(assets, new RegExp(`['"]?${icon}['"]?\\s*:`));
  }
  assert.match(resolver, /normalize\('NFD'\)/);
  assert.match(resolver, /chia se/);
  assert.match(resolver, /bao cao/);
  assert.match(resolver, /luu binh luan/);
});

test('post detail groups article and engagement while keeping AI accessible', () => {
  const post = read('../src/features/community/screens/PostDetailScreen.tsx');
  const comments = read('../src/features/community/components/PostComments.tsx');
  const engagement = read(
    '../src/features/community/components/PostDetailEngagement.tsx'
  );
  const reactions = read('../src/features/engagement/ReactionButtons.tsx');
  const header = read('../src/components/layout/CustomHeader.tsx');
  const aiWidget = read('../src/features/ai/components/AiChatWidget.tsx');

  assert.match(post, /style={styles\.articleCard}/);
  assert.match(post, /<PostDetailEngagement/);
  assert.match(engagement, /<ReactionButtons/);
  assert.match(reactions, /style={styles\.reactions}/);
  assert.match(engagement, /style={styles\.card}/);
  assert.match(post, /<PostComments/);
  assert.match(comments, /style={styles\.commentActions}/);
  assert.match(comments, /styles\.commentAction/);
  assert.match(comments, /name="comment"/);
  assert.match(aiWidget, /shouldHideAiWidget\(pathname\)/);
  assert.match(aiWidget, /launcherHidden/);
  assert.match(header, /numberOfLines={1}/);
});
