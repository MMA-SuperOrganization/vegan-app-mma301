import test from 'node:test';
import assert from 'node:assert/strict';
import { performSafeBack } from '../src/hooks/safeBack.ts';

test('safe back uses current navigator history when available', () => {
  const calls = [];

  performSafeBack({
    canGoBack: () => true,
    goBack: () => calls.push('back'),
    goToFallback: () => calls.push('fallback'),
  });

  assert.deepEqual(calls, ['back']);
});

test('safe back replaces with fallback when a deep link has no history', () => {
  const calls = [];

  performSafeBack({
    canGoBack: () => false,
    goBack: () => calls.push('back'),
    goToFallback: () => calls.push('fallback'),
  });

  assert.deepEqual(calls, ['fallback']);
});
