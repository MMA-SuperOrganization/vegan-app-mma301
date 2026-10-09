import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRecipeQuery,
  hasActiveRecipeFilters,
  parseRecipeFilters,
  serializeRecipeFilters,
} from '../src/features/recipes/filterState.ts';
import { updateSavedPage } from '../src/features/recipes/savedState.ts';
import { formatTimer, remainingSeconds } from '../src/features/recipes/timer.ts';

test('recipe filters parse, serialize and map profile allergens to the API query', () => {
  const filters = parseRecipeFilters({
    category: ['category-1'],
    difficulty: 'easy',
    maxTotalMinutes: '30',
    dietType: 'vegan',
    sort: 'quickest',
    avoidProfileAllergens: '1',
  });

  assert.deepEqual(filters, {
    category: 'category-1',
    difficulty: 'easy',
    maxTotalMinutes: 30,
    dietType: 'vegan',
    sort: 'quickest',
    avoidProfileAllergens: true,
  });
  assert.equal(hasActiveRecipeFilters(filters), true);
  assert.deepEqual(buildRecipeQuery(filters, ['allergen-1']), {
    category: 'category-1',
    difficulty: 'easy',
    maxTotalMinutes: 30,
    dietType: 'vegan',
    sort: 'quickest',
    excludeAllergenIds: ['allergen-1'],
  });
  assert.deepEqual(serializeRecipeFilters(filters), {
    category: 'category-1',
    difficulty: 'easy',
    maxTotalMinutes: '30',
    dietType: 'vegan',
    sort: 'quickest',
    avoidProfileAllergens: '1',
  });
});

test('invalid filter route values are ignored and clearing filters is inactive', () => {
  assert.deepEqual(
    parseRecipeFilters({
      difficulty: 'impossible',
      maxTotalMinutes: '-2',
      dietType: 'unknown',
      sort: 'random',
    }),
    {
      category: undefined,
      difficulty: undefined,
      maxTotalMinutes: undefined,
      dietType: undefined,
      sort: undefined,
      avoidProfileAllergens: false,
    }
  );
  assert.equal(hasActiveRecipeFilters({}), false);
});

test('saved optimistic state deduplicates saves and removes only the selected account item', () => {
  const recipe = { _id: 'recipe-1', title: 'Soup' };
  const saved = updateSavedPage(
    undefined,
    {
      type: 'recipe',
      id: recipe._id,
      saved: false,
      target: recipe,
    },
    'user-1'
  );
  const duplicate = updateSavedPage(
    saved,
    {
      type: 'recipe',
      id: recipe._id,
      saved: false,
      target: recipe,
    },
    'user-1'
  );

  assert.equal(duplicate.data.length, 1);
  assert.equal(duplicate.data[0].targetId, recipe._id);
  assert.deepEqual(
    updateSavedPage(
      duplicate,
      { type: 'recipe', id: recipe._id, saved: true },
      'user-1'
    ).data,
    []
  );
});

test('saved optimistic state supports food items and rolls them into the same library', () => {
  const foodItem = {
    _id: 'food-1',
    name: 'Chickpeas',
    type: 'food-item',
  };
  const saved = updateSavedPage(
    { data: [] },
    { type: 'food-item', id: foodItem._id, saved: false, target: foodItem },
    'user-1'
  );

  assert.equal(saved.data.length, 1);
  assert.equal(saved.data[0].targetType, 'food-item');
  assert.equal(saved.data[0].target?.name, 'Chickpeas');

  const removed = updateSavedPage(
    saved,
    { type: 'food-item', id: foodItem._id, saved: true },
    'user-1'
  );
  assert.equal(removed.data.length, 0);
});

test('saved optimistic state supports posts without waiting for the API response', () => {
  const post = { _id: 'post-1', title: 'Plant protein guide', type: 'post' };
  const optimistic = updateSavedPage(
    { data: [] },
    { type: 'post', id: post._id, saved: false, target: post },
    'user-1'
  );

  assert.deepEqual(optimistic.data[0], {
    _id: 'optimistic-user-1-post-post-1',
    targetType: 'post',
    targetId: 'post-1',
    target: post,
  });
});

test('timer derives remaining time from an absolute deadline after background gaps', () => {
  assert.equal(remainingSeconds(16_000, 10_100), 6);
  assert.equal(remainingSeconds(9_000, 10_000), 0);
  assert.equal(formatTimer(366), '06:06');
  assert.equal(formatTimer(-1), '00:00');
});
