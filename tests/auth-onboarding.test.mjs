import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEmail,
  validateLogin,
  validateRegistration,
} from '../src/features/auth/validations/loginValidation.ts';
import {
  dateInputToIso,
  parseDecimal,
  toggleAllergenSelection,
  validateMeasurement,
} from '../src/features/onboarding/validation.ts';
import {
  initialOnboardingDraft,
  parseOnboardingDraft,
} from '../src/features/onboarding/types.ts';

test('auth validation rejects empty and malformed credentials', () => {
  assert.equal(validateEmail(''), 'Vui lòng nhập email.');
  assert.equal(validateEmail('not-an-email'), 'Email không hợp lệ.');
  assert.deepEqual(validateLogin('', ''), {
    email: 'Vui lòng nhập email.',
    password: 'Vui lòng nhập mật khẩu.',
  });
});

test('registration requires Firebase minimum password and matching confirmation', () => {
  const errors = validateRegistration('Mầm', 'mam@example.com', '12345', '54321');
  assert.equal(errors.name, null);
  assert.equal(errors.email, null);
  assert.match(errors.password, /6 ký tự/);
  assert.match(errors.confirmation, /chưa khớp/);
  assert.deepEqual(
    validateRegistration('Mầm', 'mam@example.com', '123456', '123456'),
    { name: null, email: null, password: null, confirmation: null }
  );
});

test('onboarding numeric parsing supports comma and enforces backend ranges', () => {
  assert.equal(parseDecimal('65,5'), 65.5);
  assert.equal(parseDecimal('-2'), -2);
  assert.equal(parseDecimal('abc'), null);
  assert.equal(
    validateMeasurement('49', 'Chiều cao', 50, 250),
    'Chiều cao phải từ 50 đến 250.'
  );
  assert.equal(validateMeasurement('170,5', 'Chiều cao', 50, 250), null);
  assert.equal(
    validateMeasurement('501', 'Cân nặng', 10, 500),
    'Cân nặng phải từ 10 đến 500.'
  );
});

test('date of birth parser rejects invalid and future calendar dates', () => {
  assert.equal(dateInputToIso('15/08/2002'), '2002-08-15');
  assert.equal(dateInputToIso('31/02/2002'), null);
  assert.equal(dateInputToIso('2002-08-15'), null);
  assert.equal(dateInputToIso('01/01/2999'), null);
});

test('allergen selection is multi-select and none is represented by an empty list', () => {
  const selected = toggleAllergenSelection([], 'allergen-a');
  assert.deepEqual(selected, ['allergen-a']);
  assert.deepEqual(toggleAllergenSelection(selected, 'allergen-b'), [
    'allergen-a',
    'allergen-b',
  ]);
  assert.deepEqual(toggleAllergenSelection(selected, 'allergen-a'), []);
  const noneSelected = [];
  assert.deepEqual(noneSelected, []);
});

test('persisted onboarding drafts are sanitized before hydration', () => {
  assert.deepEqual(parseOnboardingDraft('{not-json'), initialOnboardingDraft);
  assert.deepEqual(
    parseOnboardingDraft(
      JSON.stringify({
        dietType: 'unsupported',
        goal: 'maintain',
        heightCm: 170,
        allergenIds: ['valid-id', 12, null],
        allergyAnswered: 'yes',
        aiProfileConsent: true,
      })
    ),
    {
      ...initialOnboardingDraft,
      goal: 'maintain',
      allergenIds: ['valid-id'],
      aiProfileConsent: true,
    }
  );
});
