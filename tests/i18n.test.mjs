import test from 'node:test';
import assert from 'node:assert/strict';
import { en, vi } from '../src/i18n/translations.ts';
import { translateFor } from '../src/i18n/translator.ts';
import {
  ADMIN_TRANSLATION_KEYS,
  MASTER_CATEGORY_TYPE_LABEL_KEYS,
  MASTER_RECORD_STATUS_LABEL_KEYS,
  MasterCategoryType,
  MasterRecordStatus,
} from '../src/features/admin/adminConstants.ts';
import {
  AI_TRANSLATION_KEYS,
  AiSafetyNoticeCode,
} from '../src/features/ai/aiConstants.ts';

test('Vietnamese and English catalogs expose the same keys', () => {
  assert.deepEqual(Object.keys(en).sort(), Object.keys(vi).sort());
});

test('translator selects locale and interpolates named values', () => {
  assert.equal(translateFor('vi', 'home.greeting', { name: 'Mầm' }), 'Xin chào, Mầm');
  assert.equal(translateFor('en', 'home.greeting', { name: 'Mầm' }), 'Hello, Mầm');
  assert.equal(translateFor('en', 'recipe.stepProgress', { current: 2, total: 4 }), 'Step 2 of 4');
});

test('admin master data and AI safety translation keys resolve in both locales', () => {
  assert.equal(
    translateFor('vi', ADMIN_TRANSLATION_KEYS.MASTER.TITLE),
    'Dữ liệu nền'
  );
  assert.equal(
    translateFor('en', ADMIN_TRANSLATION_KEYS.MASTER.TITLE),
    'Master data'
  );
  assert.equal(
    translateFor(
      'vi',
      MASTER_CATEGORY_TYPE_LABEL_KEYS[MasterCategoryType.RECIPE]
    ),
    'Công thức'
  );
  assert.equal(
    translateFor(
      'en',
      MASTER_RECORD_STATUS_LABEL_KEYS[MasterRecordStatus.INACTIVE]
    ),
    'Inactive'
  );
  assert.equal(AiSafetyNoticeCode.ALLERGEN_CAUTION, 'ALLERGEN_CAUTION');
  assert.equal(
    translateFor('vi', AI_TRANSLATION_KEYS.SAFETY.ALLERGEN_CAUTION_TITLE),
    'Lưu ý dị nguyên'
  );
  assert.equal(
    translateFor('en', AI_TRANSLATION_KEYS.SAFETY.ALLERGEN_CAUTION_TITLE),
    'Allergen caution'
  );
});
