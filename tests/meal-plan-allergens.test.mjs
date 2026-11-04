import test from 'node:test';
import assert from 'node:assert/strict';
import { matchingAllergenNames } from '../src/features/profile/allergenMatching.ts';

test('meal plan allergen matching returns only profile allergens with readable names', () => {
  assert.deepEqual(
    matchingAllergenNames(
      ['soy-id', 'sesame-id'],
      ['soy-id', 'wheat-id'],
      [
        { _id: 'soy-id', name: 'Soy' },
        { _id: 'wheat-id', name: 'Wheat' },
      ],
      'Unknown allergen'
    ),
    ['Soy']
  );
});

test('meal plan allergen matching uses a safe fallback when labels are unavailable', () => {
  assert.deepEqual(
    matchingAllergenNames(['soy-id'], ['soy-id'], [], 'Unknown allergen'),
    ['Unknown allergen']
  );
});
