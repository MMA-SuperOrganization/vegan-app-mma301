import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addCalendarDays,
  addPlannedMeal,
  completeNutritionSnapshot,
  groupMealsByType,
  nextServingCount,
  plannedCalories,
  plannedNutrition,
  monthStart,
  relativeWeekOffset,
  removePlannedMeal,
  selectEditablePlan,
  shiftWeekSelection,
  shiftMonth,
  startOfWeek,
  updatePlannedMeal,
  weekDates,
  weeksIntersectingMonth,
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
    nutritionPerServing: {
      caloriesKcal: 420,
      proteinG: 24,
      carbsG: 50,
      fatG: 12,
      fiberG: 8,
    },
  },
  ...overrides,
});

test('optimistic meal edits update nutrition inputs without mutating cached plans', () => {
  const plan = {
    _id: 'plan-1',
    title: 'Week',
    weekStartDate: '2026-10-26',
    status: 'active',
    version: 1,
    days: [{ date: '2026-11-01', meals: [meal()] }],
  };
  const increased = updatePlannedMeal(plan, 'meal-1', { servings: 2 });
  assert.equal(increased.days[0].meals[0].servings, 2);
  assert.equal(plan.days[0].meals[0].servings, 1);

  const added = addPlannedMeal(
    increased,
    '2026-11-01',
    meal({ mealId: 'meal-2', type: 'dinner' })
  );
  assert.equal(added.days[0].meals.length, 2);
  const removed = removePlannedMeal(added, 'meal-1');
  assert.deepEqual(removed.days[0].meals.map((entry) => entry.mealId), ['meal-2']);
});

test('optimistic recipe snapshots fill absent nutrient values safely', () => {
  assert.deepEqual(completeNutritionSnapshot({ caloriesKcal: 250, proteinG: 12 }), {
    caloriesKcal: 250,
    proteinG: 12,
    carbsG: 0,
    fatG: 0,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 0,
    calciumMg: 0,
    ironMg: 0,
    vitaminB12Mcg: 0,
    vitaminDMcg: 0,
  });
});

test('week picker lists every week intersecting a month and navigates months', () => {
  assert.equal(monthStart('2026-10-19'), '2026-10-01');
  assert.equal(shiftMonth('2026-12-01', 1), '2027-01-01');
  assert.equal(shiftMonth('2026-01-01', -1), '2025-12-01');
  assert.deepEqual(weeksIntersectingMonth('2026-10-01'), [
    '2026-09-28',
    '2026-10-05',
    '2026-10-12',
    '2026-10-19',
    '2026-10-26',
  ]);
  assert.deepEqual(weeksIntersectingMonth('2026-08-01'), [
    '2026-07-27',
    '2026-08-03',
    '2026-08-10',
    '2026-08-17',
    '2026-08-24',
    '2026-08-31',
  ]);
});

test('week navigation preserves the selected weekday across any week', () => {
  assert.deepEqual(shiftWeekSelection('2026-10-12', '2026-10-15', 1), {
    weekStartDate: '2026-10-19',
    selectedDate: '2026-10-22',
  });
  assert.deepEqual(shiftWeekSelection('2026-01-05', '2026-01-11', -2), {
    weekStartDate: '2025-12-22',
    selectedDate: '2025-12-28',
  });
  assert.equal(relativeWeekOffset('2026-10-12', '2026-10-12'), 0);
  assert.equal(relativeWeekOffset('2026-10-12', '2026-10-05'), -1);
  assert.equal(relativeWeekOffset('2026-10-12', '2027-01-04'), 12);
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
      days: [
        {
          date: '2026-10-13T00:00:00.000Z',
          meals: [meal({ servings: 1.5 })],
        },
      ],
      version: 1,
    },
  ];
  const selected = selectEditablePlan(plans);
  assert.equal(selected._id, 'active');
  assert.equal(selected.weekStartDate, '2026-10-12');
  assert.equal(selected.days[0].date, '2026-10-13');
  assert.equal(selected.days[0].meals[0].servings, 2);
});

test('meal groups, calories and serving steps follow the UI rules', () => {
  const meals = [meal(), meal({ mealId: 'meal-2', type: 'dinner', servings: 2 })];
  const groups = groupMealsByType(meals);
  assert.equal(groups.breakfast.length, 1);
  assert.equal(groups.lunch.length, 0);
  assert.equal(groups.dinner.length, 1);
  assert.equal(plannedCalories(meals), 1260);
  assert.deepEqual(plannedNutrition(meals), {
    caloriesKcal: 1260,
    proteinG: 72,
    carbsG: 150,
    fatG: 36,
    fiberG: 24,
  });
  assert.equal(nextServingCount(1, 1), 2);
  assert.equal(nextServingCount(1, -1), 1);
  assert.equal(nextServingCount(100, 1), 100);
});
