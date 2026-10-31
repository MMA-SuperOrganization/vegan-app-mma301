import test from 'node:test';
import assert from 'node:assert/strict';
import {
  groceryProgress,
  groceryDateRange,
  groupGroceryItems,
  parseGroceryQuantity,
  updateItemChecked,
} from '../src/features/grocery/groceryState.ts';
import {
  hasExactIngredientName,
  normalizeIngredientName,
} from '../src/features/grocery/ingredientState.ts';

test('grocery range accepts a subset of the selected week and rejects rollover and reversed dates', () => {
  assert.deepEqual(groceryDateRange('20/10/2026', '22/10/2026', '2026-10-19'), {
    from: '2026-10-20',
    to: '2026-10-22',
  });
  for (const [from, to] of [
    ['22/10/2026', '20/10/2026'],
    ['18/10/2026', '20/10/2026'],
    ['20/10/2026', '26/10/2026'],
    ['31/02/2026', '22/10/2026'],
    ['', ''],
  ]) {
    assert.equal(groceryDateRange(from, to, '2026-10-19'), null);
  }
});

const items = [
  {
    itemId: 'tomato',
    nameSnapshot: 'Cà chua',
    quantity: 2,
    unit: 'piece',
    categorySnapshot: 'Rau củ',
    checked: true,
  },
  {
    itemId: 'pepper',
    nameSnapshot: 'Tiêu',
    quantity: 1,
    unit: 'tsp',
    categorySnapshot: 'Gia vị',
    checked: false,
  },
  {
    itemId: 'carrot',
    nameSnapshot: 'Cà rốt',
    quantity: 300,
    unit: 'g',
    categorySnapshot: 'Rau củ',
    checked: false,
  },
  {
    itemId: 'bag',
    nameSnapshot: 'Túi giấy',
    quantity: 1,
    unit: 'piece',
    checked: false,
  },
];

test('grocery items group by category with an explicit fallback', () => {
  const groups = groupGroceryItems(items, 'Khác');
  assert.deepEqual(
    groups.map((group) => [group.category, group.items.map((item) => item.itemId)]),
    [
      ['Rau củ', ['carrot', 'tomato']],
      ['Gia vị', ['pepper']],
      ['Khác', ['bag']],
    ]
  );
});

test('grocery progress counts checked items', () => {
  assert.deepEqual(groceryProgress({ items }), { checked: 1, total: 4 });
});

test('grocery quantities accept decimal comma and reject invalid values', () => {
  assert.equal(parseGroceryQuantity('1,5'), 1.5);
  assert.equal(parseGroceryQuantity('.5'), 0.5);
  for (const value of ['', '0', '-1', '1e3', 'abc', '1000001']) {
    assert.equal(parseGroceryQuantity(value), null, value);
  }
});

test('optimistic checkbox update is immutable and only changes its target', () => {
  const list = { _id: 'list', name: 'Test', status: 'active', items };
  const updated = updateItemChecked(list, 'carrot', true);
  assert.notEqual(updated, list);
  assert.equal(updated.items.find((item) => item.itemId === 'carrot').checked, true);
  assert.equal(list.items.find((item) => item.itemId === 'carrot').checked, false);
  assert.equal(
    updated.items.find((item) => item.itemId === 'pepper').checked,
    false
  );
});

test('ingredient names compare accent-insensitively before offering a personal duplicate', () => {
  assert.equal(normalizeIngredientName('  Đậu   hũ ký  '), 'dau hu ky');
  assert.equal(
    hasExactIngredientName(
      [
        {
          id: 'catalog',
          source: 'catalog',
          name: 'Đậu hũ ky',
          defaultUnit: 'g',
          foodItemId: 'catalog',
        },
      ],
      'dau hu ky'
    ),
    true
  );
  assert.equal(hasExactIngredientName([], 'Đậu hũ ky'), false);
});
