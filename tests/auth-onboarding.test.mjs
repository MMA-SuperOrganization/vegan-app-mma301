import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEmail,
  validateLogin,
  validateRegistration,
} from '../src/features/auth/validations/loginValidation.ts';
import {
  dateInputToIso,
  formatDateInput,
  isStep1Complete,
  isStep2Complete,
  isStep3Complete,
  parseDecimal,
  toggleAllergenSelection,
  validateMeasurement,
} from '../src/features/onboarding/validation.ts';
import {
  initialOnboardingDraft,
  parseOnboardingDraft,
} from '../src/features/onboarding/draftSchema.ts';
import {
  AppError,
  logAppError,
  toAppErrorDetails,
} from '../src/services/errors/appError.ts';
import { normalizeFirebaseSession } from '../src/services/auth/firebaseSession.ts';

test('auth errors retain safe diagnostic context for mobile troubleshooting', () => {
  const details = toAppErrorDetails(
    new AppError('Firebase chưa được cấu hình.', 'FIREBASE_NOT_CONFIGURED', 503),
    'auth.login.password',
    'Không thể đăng nhập.'
  );

  assert.equal(details.message, 'Firebase chưa được cấu hình.');
  assert.equal(details.code, 'FIREBASE_NOT_CONFIGURED');
  assert.equal(details.status, 503);
  assert.equal(details.operation, 'auth.login.password');
  assert.match(details.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal('password' in details, false);
  assert.equal('token' in details, false);
});

test('unknown auth failures receive a stable fallback code', () => {
  const details = toAppErrorDetails(
    'unexpected',
    'auth.login.google.oauth',
    'Không thể đăng nhập bằng Google.',
    'GOOGLE_LOGIN_FAILED'
  );

  assert.equal(details.message, 'Không thể đăng nhập bằng Google.');
  assert.equal(details.code, 'GOOGLE_LOGIN_FAILED');
});

test('diagnostic logging does not trigger the Expo error overlay', (t) => {
  const calls = [];
  t.mock.method(console, 'log', (...args) => calls.push(args));
  t.mock.method(console, 'error', () => {
    throw new Error('console.error must not be used for handled auth failures');
  });

  logAppError({
    message: 'Không thể đăng nhập.',
    code: 'INVALID_LOGIN_CREDENTIALS',
    operation: 'auth.login.password',
    timestamp: '2026-10-06T00:00:00.000Z',
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], '[VEGETA_ERROR]');
  assert.equal(calls[0][1].code, 'INVALID_LOGIN_CREDENTIALS');
  assert.equal(calls[0][1].message, 'Không thể đăng nhập.');
});

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

test('profile updates preserve registration credentials when Firebase omits session fields', () => {
  const registrationSession = {
    idToken: 'registration-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    localId: 'firebase-user',
    email: 'mam@example.com',
  };

  assert.deepEqual(
    normalizeFirebaseSession(
      { localId: 'firebase-user', displayName: 'Mầm' },
      registrationSession
    ),
    { ...registrationSession, displayName: 'Mầm' }
  );
  assert.throws(
    () => normalizeFirebaseSession({ displayName: 'Mầm' }),
    /missing required session credentials/
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

test('date of birth input blocks letters, inserts slashes and supports one-digit manual slashes', () => {
  assert.equal(formatDateInput('2a'), '2');
  assert.equal(formatDateInput('28'), '28/');
  assert.equal(formatDateInput('2808'), '28/08/');
  assert.equal(formatDateInput('28/08', '28/0'), '28/08/');
  assert.equal(formatDateInput('28082002'), '28/08/2002');
  assert.equal(formatDateInput('1/'), '01/');
  assert.equal(formatDateInput('1/8/'), '01/08/');
  assert.equal(formatDateInput('28', '28/'), '28');
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

test('release builds retain diagnostics without an error overlay', (t) => {
  globalThis.__DEV__ = false;
  t.after(() => {
    delete globalThis.__DEV__;
  });
  const calls = [];
  t.mock.method(console, 'log', (...args) => calls.push(args));
  logAppError(
    toAppErrorDetails(new Error('private detail'), 'auth.login', 'Try again')
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0][1].message, 'private detail');
});

test('onboarding step completion guards enforce sequential progress', () => {
  const empty = { ...initialOnboardingDraft };
  assert.equal(isStep1Complete(empty), false);
  assert.equal(isStep2Complete(empty), false);
  assert.equal(isStep3Complete(empty), false);

  const step1 = { ...empty, dietType: 'vegan', goal: 'maintain' };
  assert.equal(isStep1Complete(step1), true);
  assert.equal(isStep2Complete(step1), false);

  const step2 = {
    ...step1,
    dateOfBirth: '15/08/2000',
    heightCm: '175',
    currentWeightKg: '68',
    activityLevel: 'moderate',
  };
  assert.equal(isStep2Complete(step2), true);
  assert.equal(isStep3Complete(step2), false);

  const step3 = { ...step2, allergyAnswered: true, allergenIds: [] };
  assert.equal(isStep3Complete(step3), true);
});

