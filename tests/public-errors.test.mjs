import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolvePublicErrorMessage } from '../src/services/errors/publicError.ts';
import { translateFor } from '../src/i18n/translator.ts';

const fallback = 'Please try again later.';
const translate = (key) => translateFor('en', key);

test('provider, configuration, server and arbitrary errors never display raw messages', () => {
  for (const error of [
    {
      code: '10',
      message: 'DEVELOPER_ERROR: https://internal.example/troubleshooting',
    },
    { code: 'FIREBASE_NOT_CONFIGURED', message: 'Missing API key' },
    { code: 'INTERNAL_ERROR', status: 500, message: 'Database password' },
    { code: 'TOKEN_INVALID', status: 503, message: 'Infrastructure failure' },
    { code: '__proto__', message: 'raw' },
    { code: 'toString', message: 'raw' },
    new Error('private native error'),
    null,
    'private string',
  ]) {
    assert.equal(resolvePublicErrorMessage(error, fallback, translate), fallback);
  }
});

test('known actionable errors use controlled localized copy and ignore incoming messages', () => {
  assert.equal(
    resolvePublicErrorMessage(
      { code: 'INVALID_PASSWORD', message: 'raw' },
      fallback,
      translate
    ),
    'The email or password is incorrect.'
  );
  assert.equal(
    resolvePublicErrorMessage({ code: 'ERR_NETWORK' }, fallback, translate),
    'Unable to connect to the server.'
  );
  assert.equal(
    resolvePublicErrorMessage({ code: 'EMAIL_EXISTS' }, fallback, (key) =>
      translateFor('vi', key)
    ),
    translateFor('vi', 'firebase.emailExists')
  );
  assert.equal(
    resolvePublicErrorMessage({ code: 'USERNAME_TAKEN', status: 409 }, fallback, (key) =>
      translateFor('vi', key)
    ),
    translateFor('vi', 'profile.error.usernameTaken')
  );
});

test('blocked accounts get a clear message and are signed out', () => {
  for (const [code, key] of [
    ['ACCOUNT_SUSPENDED', 'error.accountSuspended'],
    ['ACCOUNT_DISABLED', 'error.accountDisabled'],
    ['ACCOUNT_DELETED', 'error.accountDeleted'],
    ['ACCOUNT_INACTIVE', 'error.accountInactive'],
  ])
    assert.equal(
      resolvePublicErrorMessage({ code, status: 403 }, fallback, (k) => k),
      key
    );
  const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
  const client = read('../src/services/api/apiClient.ts');
  const store = read('../src/features/auth/store/authStore.ts');
  assert.match(client, /interceptors\.response\.use/);
  assert.match(store, /onAccountBlocked\(/);
  assert.match(store, /handleBlockedAccount: async/);
});

test('profile screens show account status and last update time', () => {
  const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
  assert.match(read('../src/features/profile/screens/ProfileScreen.tsx'), /<ProfileUpdateStatus/);
  assert.match(read('../src/features/profile/screens/EditProfileScreen.tsx'), /<ProfileUpdateStatus/);
});
