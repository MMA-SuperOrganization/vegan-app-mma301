import test from 'node:test';
import assert from 'node:assert/strict';
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
});
