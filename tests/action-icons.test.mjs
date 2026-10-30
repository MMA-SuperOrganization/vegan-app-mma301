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

test('post detail groups article, engagement and comments without overlay clutter', () => {
  const post = read('../src/features/community/screens/PostDetailScreen.tsx');
  const header = read('../src/components/layout/CustomHeader.tsx');
  const aiWidget = read('../src/features/ai/components/AiChatWidget.tsx');

  assert.match(post, /style={styles\.articleCard}/);
  assert.match(post, /PostReactionButton/);
  assert.match(post, /style={styles\.reactions}/);
  assert.match(post, /style={styles\.engagementCard}/);
  assert.match(post, /style={styles\.commentsCard}/);
  assert.match(post, /style={styles\.commentActions}/);
  assert.match(post, /name="comment"/);
  assert.match(aiWidget, /pathname\.startsWith\('\/community'\)/);
  assert.match(aiWidget, /pathname\.startsWith\('\/search-results'\)/);
  assert.match(aiWidget, /launcherHidden/);
  assert.match(header, /numberOfLines={1}/);
});
