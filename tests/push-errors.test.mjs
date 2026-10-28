import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePushRegistrationError } from '../src/features/reminders/pushErrors.ts';

test('missing Firebase native setup produces an actionable stable error without native diagnostics', () => {
  const error = Object.assign(
    new Error(
      'Unable to get Firebase Messaging instance. Did you configure googleServicesFile? private diagnostic'
    ),
    { code: 'E_REGISTRATION_FAILED' }
  );
  const result = normalizePushRegistrationError(error);
  assert.equal(result.code, 'PUSH_CONFIGURATION_REQUIRED');
  assert.equal(result.message, 'PUSH_CONFIGURATION_REQUIRED');
  assert.notEqual(result, error);
});
test('network and unknown token failures retain their original classification', () => {
  for (const error of [
    new Error('unknown'),
    null,
    {
      code: 'E_REGISTRATION_FAILED',
      message: 'Fetching the token failed: SERVICE_NOT_AVAILABLE',
    },
    { code: 'OTHER', message: 'Firebase Messaging instance' },
  ])
    assert.equal(normalizePushRegistrationError(error), error);
});
