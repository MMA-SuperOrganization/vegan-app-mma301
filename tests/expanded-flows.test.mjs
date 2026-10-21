import test from 'node:test';
import assert from 'node:assert/strict';
import { validReminderSchedule } from '../src/features/reminders/schedule.ts';
import {
  onceReminderAt,
  reminderWallTime,
} from '../src/features/reminders/reminderTime.ts';
import { contentHref } from '../src/features/recipes/contentNavigation.ts';

test('one-time reminders use the selected IANA zone and reject skipped DST times', () => {
  assert.equal(
    onceReminderAt('2026-10-21', '08:30', 'Asia/Ho_Chi_Minh'),
    '2026-10-21T01:30:00.000Z'
  );
  assert.equal(
    onceReminderAt('2026-10-21', '08:30', 'America/New_York'),
    '2026-10-21T12:30:00.000Z'
  );
  assert.equal(onceReminderAt('2026-03-08', '02:30', 'America/New_York'), null);
  assert.equal(onceReminderAt('2026-02-30', '08:00', 'UTC'), null);
  assert.equal(onceReminderAt('2026-10-21', '08:00', 'invalid'), null);
  assert.deepEqual(
    reminderWallTime('2026-10-21T01:30:00.000Z', 'Asia/Ho_Chi_Minh'),
    { date: '2026-10-21', time: '08:30' }
  );
});
test('discovery and saved content navigate every supported content type using the correct identifier', () => {
  const item = { _id: 'id', slug: 'slug' };
  assert.deepEqual(contentHref({ ...item, type: 'post' }), {
    pathname: '/community/post',
    params: { id: 'id' },
  });
  assert.deepEqual(contentHref({ ...item, type: 'video' }), {
    pathname: '/community/video',
    params: { id: 'slug' },
  });
  assert.deepEqual(contentHref({ ...item, type: 'food-item' }), {
    pathname: '/(discover)/food/[id]',
    params: { id: 'id' },
  });
  assert.deepEqual(contentHref({ ...item, type: 'recipe' }), {
    pathname: '/(discover)/recipe/[id]',
    params: { id: 'slug' },
  });
});
import {
  reviewMealProposal,
  reviewPantryProposal,
  mealConfirmationInput,
} from '../src/features/ai/proposalState.ts';

test('one-time reminders require a future real date with an explicit time-zone offset', () => {
  const now = Date.parse('2026-01-01T00:00:00Z');
  assert.equal(
    validReminderSchedule('once', '2026-10-21T08:30:00+07:00', [], now),
    true
  );
  assert.equal(validReminderSchedule('once', '2028-02-29T08:30Z', [], now), true);
  for (const value of [
    '2026-02-30T08:00Z',
    '2026-02-29T08:00Z',
    '2026-13-01T08:00Z',
    '2025-12-31T23:59Z',
    '2026-10-21T08:30',
    '2026-10-21',
    '2026-10-21T24:00Z',
    '2026-10-21T08:00+99:00',
  ])
    assert.equal(validReminderSchedule('once', value, [], now), false, value);
});
test('daily and weekly reminders enforce clock times and distinct whole weekdays', () => {
  assert.equal(validReminderSchedule('daily', '00:00', []), true);
  assert.equal(validReminderSchedule('weekly', '23:59', [0, 6]), true);
  for (const days of [[], [7], [-1], [1.5], [1, 1]])
    assert.equal(validReminderSchedule('weekly', '08:00', days), false);
  for (const value of ['8:00', '24:00', '12:60', '12:00Z'])
    assert.equal(validReminderSchedule('daily', value, []), false);
  assert.equal(validReminderSchedule('monthly', '08:00', [1]), false);
});
test('review rows retain their identity after removal and UI keys never enter the strict API payload', () => {
  const original = {
    proposalId: 'proposal',
    title: '  Lunch  ',
    days: [
      {
        date: '2026-10-19',
        meals: [
          { slot: 'lunch', recipeId: 'recipe-one', servings: 1 },
          { slot: 'dinner', recipeId: 'recipe-two', servings: 2 },
        ],
      },
    ],
  };
  const reviewed = reviewMealProposal(original);
  assert.equal(original.days[0].meals[0].reviewKey, undefined);
  const secondKey = reviewed.days[0].meals[1].reviewKey;
  reviewed.days[0].meals.splice(0, 1);
  assert.equal(reviewed.days[0].meals[0].reviewKey, secondKey);
  assert.deepEqual(mealConfirmationInput(reviewed), {
    title: 'Lunch',
    activate: false,
    days: [
      {
        date: '2026-10-19',
        meals: [{ slot: 'dinner', recipeId: 'recipe-two', servings: 2 }],
      },
    ],
  });
  const pantry = reviewPantryProposal({
    proposalId: 'pantry',
    items: [
      { name: 'Tofu', quantity: 1, unit: 'g' },
      { name: 'Beans', quantity: 2, unit: 'g' },
    ],
  });
  const key = pantry.items[1].reviewKey;
  pantry.items.shift();
  assert.equal(pantry.items[0].reviewKey, key);
});
