import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { ensureAndroidDebugKey } from '../scripts/setup-android-debug-key.mjs';

test('fresh checkouts get the same development key and setup is repeatable', () => {
  const directory = mkdtempSync(join(tmpdir(), 'vegeta-debug-key-'));
  try {
    const destination = join(directory, 'android/app/debug.keystore');
    ensureAndroidDebugKey(destination);
    const key = readFileSync(destination);
    assert.equal(
      createHash('sha256').update(key).digest('hex'),
      '221e0a3106aa4c3ccc154e0a418b55020b3f9ea6e84f92e8749cd9e2f39f5e58'
    );
    ensureAndroidDebugKey(destination);
    assert.deepEqual(readFileSync(destination), key);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('setup preserves an existing custom keystore and reports the conflict', () => {
  const directory = mkdtempSync(join(tmpdir(), 'vegeta-debug-key-'));
  try {
    const destination = join(directory, 'debug.keystore');
    writeFileSync(destination, 'existing custom key');
    assert.throws(
      () => ensureAndroidDebugKey(destination),
      /different debug keystore/
    );
    assert.equal(readFileSync(destination, 'utf8'), 'existing custom key');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
