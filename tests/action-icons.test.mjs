import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  formatEngagementCount,
  formatFullEngagementCount,
} from '../src/features/community/engagementPresentation.ts';

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
  const header = read('../src/components/layout/CustomHeader.tsx');
  const aiWidget = read('../src/features/ai/components/AiChatWidget.tsx');

  assert.match(post, /style={styles\.articleCard}/);
  assert.match(post, /<PostDetailEngagement/);
  assert.match(engagement, /onReact\('love', loved\)/);
  assert.match(engagement, /styles\.actions/);
  assert.doesNotMatch(engagement, /ReactionButtons/);
  assert.doesNotMatch(engagement, /'Tương tác'|'Engagement'/);
  assert.match(post, /style={styles\.authorAvatar}/);
  assert.doesNotMatch(post, /\/users\/\[id\]/);
  assert.match(post, /<BackButton onPress={goBack}/);
  assert.doesNotMatch(post, /<CustomHeader/);
  assert.match(post, /<PostComments/);
  assert.match(comments, /style=\{styles\.commentFooterActions\}/);
  assert.match(comments, /styles\.commentAction/);
  assert.match(comments, /expandedActionsId/);
  assert.match(comments, /usePublicProfile/);
  assert.match(comments, /Trả lời \$\{parentName\}/);
  assert.doesNotMatch(comments, /reactComment|commentReaction/);
  assert.match(comments, /name="comment"/);
  assert.match(aiWidget, /shouldHideAiWidget\(pathname\)/);
  assert.match(aiWidget, /launcherHidden/);
  assert.match(header, /numberOfLines={1}/);
});

test('post detail integrates back navigation into the article card instead of a tall header', () => {
  const post = read('../src/features/community/screens/PostDetailScreen.tsx');

  assert.match(post, /<ScreenWrapper\b/);
  assert.match(post, /style=\{styles\.articleHeaderRow\}/);
  assert.match(post, /!post \? \(/);
  assert.match(post, /style=\{styles\.loadingNavigation\}/);
  assert.match(post, /<BackButton onPress=\{goBack\}/);
  assert.doesNotMatch(post, /header=\{/);
  assert.doesNotMatch(post, /useSafeAreaInsets/);
  assert.match(post, /style=\{styles\.stickyBackButton\}/);
  assert.match(post, /style=\{styles\.hiddenBackButton\}/);
  assert.doesNotMatch(post, /onScroll=\{handleScroll\}/);
  assert.doesNotMatch(post, /backButtonSticky/);
  assert.doesNotMatch(post, /<CustomHeader/);
});

test('post engagement counts stay compact at large values without losing the full accessible number', () => {
  assert.equal(formatEngagementCount(1, 'vi'), '1');
  assert.equal(formatEngagementCount(1_250, 'vi'), '1,2K');
  assert.equal(formatEngagementCount(15_900, 'en'), '15.9K');
  assert.equal(formatEngagementCount(1_200_000, 'vi'), '1,2M');
  assert.equal(formatEngagementCount(2_000_000_000, 'en'), '2B');
  assert.equal(formatFullEngagementCount(15_900, 'vi'), '15.900');
});
