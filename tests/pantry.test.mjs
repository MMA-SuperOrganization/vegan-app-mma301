import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pantryExpiryDay,
  pantryExpiryStatus,
  parsePantryExpiry,
  parsePantryQuantity,
  selectPantryItems,
} from '../src/features/pantry/pantryState.ts';

test('pantry quantities match the API bounds and accept decimal commas', () => {
  assert.equal(parsePantryQuantity(' 1,25 '), 1.25);
  assert.equal(parsePantryQuantity('.5'), 0.5);
  assert.equal(parsePantryQuantity('1000000'), 1000000);
  for (const value of ['', '0', '-1', '1e3', '1.2.3', 'Infinity', '1000001']) {
    assert.equal(parsePantryQuantity(value), null, value);
  }
});

test('expiry accepts real calendar days, rejects rollover, and supports clearing', () => {
  assert.equal(parsePantryExpiry(''), null);
  assert.equal(parsePantryExpiry('  '), null);
  for (const value of [
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
    '20/10/2026',
    '2026-1-01',
    '0000-01-01',
  ]) {
    assert.equal(parsePantryExpiry(value), undefined, value);
  }
  const expiry = parsePantryExpiry('2028-02-29');
  assert.equal(pantryExpiryDay(expiry), '2028-02-29');
  const local = new Date(expiry);
  assert.equal(local.getHours(), 23);
  assert.equal(local.getMinutes(), 59);
  assert.equal(local.getSeconds(), 59);
  assert.equal(local.getMilliseconds(), 999);
});

test('expiry status includes the seven-day boundary and treats unknown dates separately', () => {
  const now = Date.parse('2026-10-20T10:00:00Z');
  assert.equal(pantryExpiryStatus({}, now), 'none');
  assert.equal(pantryExpiryStatus({ expiresAt: 'invalid' }, now), 'none');
  assert.equal(
    pantryExpiryStatus({ expiresAt: '2026-10-20T09:59:59Z' }, now),
    'expired'
  );
  assert.equal(
    pantryExpiryStatus({ expiresAt: '2026-10-20T10:00:00Z' }, now),
    'expiring'
  );
  assert.equal(
    pantryExpiryStatus({ expiresAt: '2026-10-27T10:00:00Z' }, now),
    'expiring'
  );
  assert.equal(
    pantryExpiryStatus({ expiresAt: '2026-10-27T10:00:01Z' }, now),
    'fresh'
  );
});

test('pantry filters combine search and expiry without mutating the cached inventory', () => {
  const items = [
    { itemId: 'none', foodNameSnapshot: 'Rice' },
    { itemId: 'soon', foodNameSnapshot: 'Tofu', expiresAt: '2026-10-22T00:00:00Z' },
    {
      itemId: 'expired',
      foodNameSnapshot: 'Tofu',
      expiresAt: '2026-10-19T00:00:00Z',
    },
    { itemId: 'fresh', foodNameSnapshot: 'Tofu', expiresAt: '2026-12-01T00:00:00Z' },
  ];
  const now = Date.parse('2026-10-20T00:00:00Z');
  assert.deepEqual(
    selectPantryItems(items, 'expiring', ' TOFU ', now).map((item) => item.itemId),
    ['soon']
  );
  assert.deepEqual(
    selectPantryItems(items, 'expired', '', now).map((item) => item.itemId),
    ['expired']
  );
  assert.deepEqual(
    selectPantryItems(items, 'all', '', now).map((item) => item.itemId),
    ['expired', 'soon', 'fresh', 'none']
  );
  assert.equal(selectPantryItems(items, 'all', 'missing', now).length, 0);
  assert.equal(items[0].itemId, 'none');
});
