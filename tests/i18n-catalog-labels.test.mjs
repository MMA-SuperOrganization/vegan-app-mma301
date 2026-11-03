import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allergenLabel,
  catalogSlug,
  categoryFilterLabel,
  categoryNameLabel,
  recipeTagLabel,
} from '../src/features/recipes/filterLabels.ts';
import {
  DEFAULT_MEAL_PLAN_TITLE,
  mealPlanTitle,
} from '../src/features/meal-plan/mealPlanState.ts';
import { matchingAllergenNames } from '../src/features/profile/allergenMatching.ts';

test('catalog names without a slug map to the API slug format', () => {
  assert.equal(catalogSlug('Nuts & Seeds'), 'nuts-seeds');
  assert.equal(catalogSlug('  Tree Nuts '), 'tree-nuts');
  assert.equal(catalogSlug('Vegetables'), 'vegetables');
});

test('food and post categories are shown in Vietnamese and fall back to the API name', () => {
  const food = { _id: 'c1', slug: 'nuts-seeds', name: 'Nuts & Seeds', type: 'food' };
  assert.equal(categoryFilterLabel(food, 'vi'), 'Các loại hạt');
  assert.equal(categoryFilterLabel(food, 'en'), 'Nuts & Seeds');
  assert.equal(categoryNameLabel('Vegetables', 'vi'), 'Rau củ');
  assert.equal(categoryNameLabel('Lifestyle', 'vi'), 'Lối sống');
  assert.equal(categoryNameLabel('Mushrooms', 'vi'), 'Mushrooms');
  assert.equal(categoryNameLabel('Vegetables', 'en'), 'Vegetables');
});

test('allergens are translated for Vietnamese users only', () => {
  assert.equal(allergenLabel('Soy', 'vi'), 'Đậu nành');
  assert.equal(allergenLabel('Tree Nuts', 'vi'), 'Các loại hạt cây');
  assert.equal(allergenLabel('Wheat', 'vi'), 'Lúa mì');
  assert.equal(allergenLabel('Soy', 'en'), 'Soy');
  assert.equal(allergenLabel('Mustard', 'vi'), 'Mustard');
});

test('recipe tags left in English are now translated', () => {
  assert.equal(recipeTagLabel('beverage', 'vi'), 'Đồ uống');
  assert.equal(recipeTagLabel('street-food', 'vi'), 'Món đường phố');
  assert.equal(recipeTagLabel('lentils', 'vi'), 'Đậu lăng');
  assert.equal(recipeTagLabel('beverage', 'en'), 'Beverage');
});

test('matching allergens can be labelled without touching unknown ones', () => {
  const catalog = [
    { _id: 'a1', name: 'Soy' },
    { _id: 'a2', name: 'Wheat' },
  ];
  const names = matchingAllergenNames(
    ['a1', 'a2', 'missing'],
    ['a1', 'missing'],
    catalog,
    'Dị nguyên chưa xác định',
    (name) => allergenLabel(name, 'vi')
  );
  assert.deepEqual(names, ['Đậu nành', 'Dị nguyên chưa xác định']);
  assert.deepEqual(matchingAllergenNames(['a1'], ['a1'], catalog, '?'), ['Soy']);
});

test('only the API default meal plan title is replaced by the app label', () => {
  assert.equal(mealPlanTitle(DEFAULT_MEAL_PLAN_TITLE, 'Thực đơn tuần'), 'Thực đơn tuần');
  assert.equal(mealPlanTitle(' Weekly meal plan ', 'Thực đơn tuần'), 'Thực đơn tuần');
  assert.equal(mealPlanTitle('Ăn sạch tuần 1', 'Thực đơn tuần'), 'Ăn sạch tuần 1');
});
