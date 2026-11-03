import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  groceryProgress,
  groceryTransferSummary,
  groupGroceryItems,
  parseGroceryQuantity,
  updateItemChecked,
} from '../src/features/grocery/groceryState.ts';
import {
  hasExactIngredientName,
  normalizeIngredientName,
} from '../src/features/grocery/ingredientState.ts';

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

test('pantry transfer includes only checked items linked to catalog or personal ingredients', () => {
  const summary = groceryTransferSummary([
    { ...items[0], foodItemId: 'catalog-food' },
    { ...items[1], checked: true, personalIngredientId: 'personal-food' },
    { ...items[2], checked: true },
    items[3],
  ]);
  assert.deepEqual(
    summary.eligible.map((item) => item.itemId),
    ['tomato', 'pepper']
  );
  assert.deepEqual(
    summary.skipped.map((item) => item.itemId),
    ['carrot']
  );
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

test('inventory tabs animate one shared selection indicator between grocery and pantry', () => {
  const tabs = readFileSync(
    new URL(
      '../src/features/grocery/components/GroceryPantryTabs.tsx',
      import.meta.url
    ),
    'utf8'
  );

  assert.match(tabs, /Animated\.spring\(indicatorProgress/);
  assert.match(tabs, /transform: \[\{ translateX: indicatorTranslateX \}\]/);
  assert.match(tabs, /opacity: selectedLabelOpacity/);
  assert.match(tabs, /pointerEvents="none"/);
  assert.doesNotMatch(tabs, /selected && styles\.selectedTab/);

  const inventory = readFileSync(
    new URL(
      '../src/features/inventory/screens/InventoryScreen.tsx',
      import.meta.url
    ),
    'utf8'
  );
  assert.match(inventory, /Animated\.parallel\(\[/);
  assert.match(inventory, /transform: \[\{ translateX: contentTranslateX \}\]/);
});

test('meal-plan grocery generation offers day and week scopes', () => {
  const screen = readFileSync(
    new URL(
      '../src/features/grocery/screens/GroceryGenerateScreen.tsx',
      import.meta.url
    ),
    'utf8'
  );
  const selector = readFileSync(
    new URL(
      '../src/features/grocery/components/GroceryGenerationScopeSelector.tsx',
      import.meta.url
    ),
    'utf8'
  );

  assert.match(selector, /\['day', 'week'\]/);
  assert.match(screen, /scope === 'day'/);
  assert.match(screen, /date: selectedDate/);
  assert.match(screen, /<WeekDaySelector/);
  assert.match(screen, /<GroceryMealPreview/);
  assert.match(screen, /scope === 'day'[\s\S]*mealCounts\[selectedDate\]/);

  const preview = readFileSync(
    new URL(
      '../src/features/grocery/components/GroceryMealPreview.tsx',
      import.meta.url
    ),
    'utf8'
  );
  assert.match(preview, /meal\.recipeSnapshot\.title/);
  assert.match(preview, /mealLabel\(meal\.type\)/);
  assert.match(preview, /formatNumber\(meal\.servings, 0\)/);
});
