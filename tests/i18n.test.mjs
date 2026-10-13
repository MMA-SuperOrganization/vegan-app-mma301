import test from 'node:test';
import assert from 'node:assert/strict';
import { en, vi } from '../src/i18n/translations.ts';
import { translateFor } from '../src/i18n/translator.ts';

test('Vietnamese and English catalogs expose the same keys', () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(vi).sort());
});

test('translator selects locale and interpolates named values', () => {
  assert.equal(translateFor('vi', 'home.greeting', { name: 'Mầm' }), 'Xin chào, Mầm');
  assert.equal(translateFor('en', 'home.greeting', { name: 'Mầm' }), 'Hello, Mầm');
  assert.equal(translateFor('en', 'recipe.stepProgress', { current: 2, total: 4 }), 'Step 2 of 4');
});
