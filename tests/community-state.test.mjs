import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCommentRelativeTime } from '../src/features/community/commentPresentation.ts';
import { postCopy } from '../src/features/community/postPresentation.ts';
import { applyPostReaction } from '../src/features/community/reactionState.ts';
import {
  formatReportCode,
  formatReportDateTime,
} from '../src/features/community/reportPresentation.ts';

const now = new Date(2026, 10, 3, 12, 0).getTime();
const ago = (ms) => new Date(now - ms).toISOString();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

test('comment times read like a social feed in Vietnamese and English', () => {
  assert.equal(formatCommentRelativeTime(ago(20_000), 'vi', now), 'Vừa xong');
  assert.equal(formatCommentRelativeTime(ago(15 * MINUTE), 'vi', now), '15 phút');
  assert.equal(formatCommentRelativeTime(ago(2 * HOUR), 'vi', now), '2 giờ');
  assert.equal(formatCommentRelativeTime(ago(3 * DAY), 'vi', now), '3 ngày');

  assert.equal(formatCommentRelativeTime(ago(20_000), 'en', now), 'Just now');
  assert.equal(formatCommentRelativeTime(ago(15 * MINUTE), 'en', now), '15m');
  assert.equal(formatCommentRelativeTime(ago(2 * HOUR), 'en', now), '2h');
  assert.equal(formatCommentRelativeTime(ago(3 * DAY), 'en', now), '3d');
});

test('comment times switch units exactly at the boundaries', () => {
  assert.equal(formatCommentRelativeTime(ago(59 * MINUTE), 'en', now), '59m');
  assert.equal(formatCommentRelativeTime(ago(60 * MINUTE), 'en', now), '1h');
  assert.equal(formatCommentRelativeTime(ago(23 * HOUR), 'en', now), '23h');
  assert.equal(formatCommentRelativeTime(ago(24 * HOUR), 'en', now), '1d');
  assert.equal(formatCommentRelativeTime(ago(6 * DAY), 'en', now), '6d');
});

test('older comments show a calendar date and bad input shows nothing', () => {
  const old = formatCommentRelativeTime(ago(10 * DAY), 'vi', now);
  assert.ok(old && !/ngày$/.test(old), `expected a date, got ${old}`);
  assert.equal(formatCommentRelativeTime(undefined, 'vi', now), null);
  assert.equal(formatCommentRelativeTime('', 'vi', now), null);
  assert.equal(formatCommentRelativeTime('not a date', 'vi', now), null);
  // Clock skew must never produce a negative age.
  assert.equal(formatCommentRelativeTime(ago(-5 * MINUTE), 'vi', now), 'Vừa xong');
});

test('post copy hides content that only repeats the title', () => {
  assert.deepEqual(postCopy('Hum nay ang zi', 'Hum nay ang zi'), {
    title: 'Hum nay ang zi',
    content: '',
  });
  assert.deepEqual(postCopy('Đậu hũ giòn!', '  đậu   hũ giòn  '), {
    title: 'Đậu hũ giòn!',
    content: '',
  });
  assert.deepEqual(postCopy('Mẹo nấu ăn', 'Ép bớt nước trong đậu hũ.'), {
    title: 'Mẹo nấu ăn',
    content: 'Ép bớt nước trong đậu hũ.',
  });
});

test('post copy trims text and copes with a missing title or content', () => {
  assert.deepEqual(postCopy(undefined, '  Chỉ có nội dung  '), {
    title: '',
    content: 'Chỉ có nội dung',
  });
  assert.deepEqual(postCopy('  Chỉ có tiêu đề ', null), {
    title: 'Chỉ có tiêu đề',
    content: '',
  });
  assert.deepEqual(postCopy(null, null), { title: '', content: '' });
});

const post = (overrides = {}) => ({
  _id: 'post-1',
  authorId: 'user-1',
  title: 'Post',
  content: 'Body',
  status: 'published',
  reacted: null,
  reactionCount: 2,
  ...overrides,
});

test('reacting to a post updates the count only when the reaction appears or disappears', () => {
  const liked = applyPostReaction(post(), 'love');
  assert.equal(liked.reacted, 'love');
  assert.equal(liked.reactionCount, 3);

  const switched = applyPostReaction(post({ reacted: 'like', reactionCount: 3 }), 'love');
  assert.equal(switched.reacted, 'love');
  assert.equal(switched.reactionCount, 3);

  const removed = applyPostReaction(post({ reacted: 'love', reactionCount: 3 }), null);
  assert.equal(removed.reacted, null);
  assert.equal(removed.reactionCount, 2);
});

test('reaction counts never go below zero and the cached post is not mutated', () => {
  const original = post({ reacted: 'love', reactionCount: 0 });
  assert.equal(applyPostReaction(original, null).reactionCount, 0);
  assert.equal(original.reacted, 'love');

  const missingCount = post({ reactionCount: undefined });
  assert.equal(applyPostReaction(missingCount, 'love').reactionCount, 1);
});

test('report codes use the last six characters of the id in upper case', () => {
  assert.equal(formatReportCode('6ae4c68d7c354e270e614234'), '614234');
  assert.equal(formatReportCode('6ae4c68d7c354e270e61abcd'), '61ABCD');
  assert.equal(formatReportCode('abc'), 'ABC');
  assert.equal(formatReportCode(''), '');
  assert.equal(formatReportCode(null), '');
});

test('report times use day/month/year and 24-hour local time', () => {
  const iso = new Date(2026, 10, 2, 14, 9).toISOString();
  assert.equal(formatReportDateTime(iso), '02/11/2026 14:09');
  const midnight = new Date(2026, 0, 5, 0, 0).toISOString();
  assert.equal(formatReportDateTime(midnight), '05/01/2026 00:00');
  assert.equal(formatReportDateTime(undefined), null);
  assert.equal(formatReportDateTime('nope'), null);
});
