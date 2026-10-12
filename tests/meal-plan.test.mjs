import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addCalendarDays,
  groupMealsByType,
  nextServingCount,
  plannedCalories,
  selectEditablePlan,
  startOfWeek,
  weekDates,
} from '../src/features/meal-plan/mealPlanState.ts';

const meal = (overrides = {}) => ({
  mealId: 'meal-1',
  type: 'breakfast',
  recipeId: 'recipe-1',
  servings: 1,
  completed: false,
  recipeSnapshot: {
    title: 'Tofu bowl',
    servings: 1,
    nutritionPerServing: { caloriesKcal: 420 },
  },
  ...overrides,
});

test('week helpers use Monday through Sunday calendar dates', () => {
  assert.equal(startOfWeek(new Date(2026, 9, 12, 8)), '2026-10-12');
  assert.equal(startOfWeek(new Date(2026, 9, 18, 20)), '2026-10-12');
  assert.deepEqual(weekDates('2026-10-12'), [
    '2026-10-12',
    '2026-10-13',
    '2026-10-14',
    '2026-10-15',
    '2026-10-16',
    '2026-10-17',
    '2026-10-18',
  ]);
  assert.equal(addCalendarDays('2026-12-29', 6), '2027-01-04');
});

test('meal-plan selection prefers the active editable plan and normalizes dates', () => {
  const plans = [
    {
      _id: 'draft',
      title: 'Draft',
      weekStartDate: '2026-10-12T00:00:00.000Z',
      status: 'draft',
      days: [],
      version: 0,
    },
    {
      _id: 'active',
      title: 'Active',
      weekStartDate: '2026-10-12T00:00:00.000Z',
      status: 'active',
      days: [{ date: '2026-10-13T00:00:00.000Z', meals: [] }],
      version: 1,
    },
  ];
  const selected = selectEditablePlan(plans);
  assert.equal(selected._id, 'active');
  assert.equal(selected.weekStartDate, '2026-10-12');
  assert.equal(selected.days[0].date, '2026-10-13');
});

test('meal groups, calories and serving steps follow the UI rules', () => {
  const meals = [meal(), meal({ mealId: 'meal-2', type: 'dinner', servings: 1.5 })];
  const groups = groupMealsByType(meals);
  assert.equal(groups.breakfast.length, 1);
  assert.equal(groups.lunch.length, 0);
  assert.equal(groups.dinner.length, 1);
  assert.equal(plannedCalories(meals), 1050);
  assert.equal(nextServingCount(1, 0.5), 1.5);
  assert.equal(nextServingCount(0.5, -0.5), 0.5);
  assert.equal(nextServingCount(100, 0.5), 100);
});
