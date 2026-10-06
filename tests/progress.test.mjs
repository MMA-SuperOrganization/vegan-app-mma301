import { test } from 'node:test';
import assert from 'node:assert/strict';
import { progressRatio } from '../src/components/ui/ProgressBar/progress.ts';
test('progress clamps bounds and handles invalid totals', () => {
  for (const [value, max, expected] of [
    [25, 100, 0.25],
    [120, 100, 1],
    [-10, 100, 0],
    [10, 0, 0],
    [10, -1, 0],
    [NaN, 100, 0],
    [10, NaN, 0],
    [10, Infinity, 0],
    [Infinity, 100, 1],
    [-Infinity, 100, 0],
  ]) {
    assert.equal(progressRatio(value, max), expected, `${value}/${max}`);
  }
});
