import test from 'node:test';
import assert from 'node:assert/strict';
import { collectPages } from '../src/services/api/collectPages.ts';

test('history collects every page with more than 100 entries', async () => {
  const source = Array.from({ length: 205 }, (_, index) => index);
  const calls = [];
  const result = await collectPages(async (page) => {
    calls.push(page);
    return {
      data: source.slice((page - 1) * 100, page * 100),
      meta: { page, totalPages: 3 },
    };
  });
  assert.deepEqual(calls, [1, 2, 3]);
  assert.deepEqual(result.data, source);
});

test('legacy and empty responses remain usable and failed pages reject the whole query', async () => {
  assert.deepEqual(await collectPages(async () => ({ data: [] })), { data: [] });
  await assert.rejects(
    collectPages(async (page) => {
      if (page === 2) throw new Error('offline');
      return { data: [1], meta: { page, totalPages: 2 } };
    }),
    /offline/
  );
});
