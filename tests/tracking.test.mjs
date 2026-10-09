import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockTrackingData } from '../src/features/tracking/mocks/trackingMocks.ts';
import {
  combineDateAndTime,
  daysAgo,
  formatDayMonthYear,
  parseDayMonthYear,
  weightChartPoints,
  weightGoalDirection,
  weightGoalProgress,
  defaultMealTypeFor,
  groupDiaryByMeal,
  parseDecimal,
  parseTimeOfDay,
  quantityToGrams,
  scaleNutrition,
  selectTrackingOverview,
  sumNutrition,
  toLocalIsoDate,
  unitsForFood,
  weightTrend,
} from '../src/features/tracking/trackingState.ts';

const now = new Date(2026, 9, 8, 15, 0);

test('tracking overview matches the Figma mock numbers', () => {
  const overview = selectTrackingOverview(createMockTrackingData(now), now);
  assert.equal(overview.date, '2026-10-08');
  assert.deepEqual(overview.energy, { consumedKcal: 800, targetKcal: 2000 });
  assert.deepEqual(overview.weight, {
    latestWeightKg: 65,
    changeKg: -1.1,
    periodDays: 30,
  });
  assert.deepEqual(overview.water, { consumedMl: 1250, targetMl: 2000 });
});

test('new water and diary logs for today change the overview; other days do not', () => {
  const data = createMockTrackingData(now);
  const yesterday = new Date(2026, 9, 7, 20, 0);
  data.waterLogs.push(
    {
      _id: 'w-today',
      amountMl: 250,
      recordedAt: new Date(2026, 9, 8, 14, 0).toISOString(),
    },
    { _id: 'w-yesterday', amountMl: 900, recordedAt: yesterday.toISOString() }
  );
  data.diaryEntries.push({
    ...data.diaryEntries[0],
    _id: 'd-yesterday',
    date: toLocalIsoDate(yesterday),
  });
  const overview = selectTrackingOverview(data, now);
  assert.equal(overview.water.consumedMl, 1500);
  assert.equal(overview.energy.consumedKcal, 800);
});

test('diary nutrition totals add every macro', () => {
  const { diaryEntries } = createMockTrackingData(now);
  assert.deepEqual(sumNutrition(diaryEntries), {
    caloriesKcal: 800,
    proteinG: 39,
    carbsG: 106,
    fatG: 22,
    fiberG: 14,
  });
});

test('weight trend handles empty, single and rising logs', () => {
  assert.equal(weightTrend([], now), null);
  const single = [{ _id: 'a', weightKg: 60, recordedAt: now.toISOString() }];
  assert.deepEqual(weightTrend(single, now), {
    latestWeightKg: 60,
    changeKg: null,
    periodDays: 30,
  });
  const rising = [
    ...single,
    { _id: 'b', weightKg: 59.2, recordedAt: new Date(2026, 9, 1).toISOString() },
    { _id: 'old', weightKg: 50, recordedAt: new Date(2026, 6, 1).toISOString() },
  ];
  assert.equal(weightTrend(rising, now).changeKg, 0.8);
});

test('decimal and time inputs accept Vietnamese formats and reject bad input', () => {
  assert.equal(parseDecimal('1,5'), 1.5);
  assert.equal(parseDecimal(' 2 '), 2);
  assert.equal(parseDecimal('.5'), 0.5);
  for (const bad of ['', 'abc', '-1', '1,2,3', '1e3']) {
    assert.equal(parseDecimal(bad), null, bad);
  }
  assert.deepEqual(parseTimeOfDay('7:05'), { hours: 7, minutes: 5 });
  assert.equal(parseTimeOfDay('24:00'), null);
  assert.equal(parseTimeOfDay('12:60'), null);
  assert.equal(parseTimeOfDay('1230'), null);
  const iso = combineDateAndTime('2026-10-08', { hours: 12, minutes: 30 });
  assert.equal(toLocalIsoDate(iso), '2026-10-08');
  assert.equal(new Date(iso).getHours(), 12);
});

test('default meal follows the time of day', () => {
  const at = (hours) => new Date(2026, 9, 8, hours, 0);
  assert.equal(defaultMealTypeFor(at(7)), 'breakfast');
  assert.equal(defaultMealTypeFor(at(12)), 'lunch');
  assert.equal(defaultMealTypeFor(at(16)), 'snack');
  assert.equal(defaultMealTypeFor(at(19)), 'dinner');
});

test('food quantities convert to grams like the backend', () => {
  const serving = { amount: 1, unit: 'piece', gramEquivalent: 120 };
  assert.equal(quantityToGrams(150, 'g'), 150);
  assert.equal(quantityToGrams(0.2, 'kg'), 200);
  assert.equal(quantityToGrams(2, 'piece', serving), 240);
  assert.equal(quantityToGrams(250, 'ml'), null);
  assert.equal(quantityToGrams(0, 'g'), null);
  assert.deepEqual(
    unitsForFood({
      _id: 'f',
      name: 'Apple',
      nutritionPer100g: {},
      defaultServing: serving,
    }),
    ['g', 'kg', 'piece']
  );
});

test('nutrition scales by servings and diary entries group by meal', () => {
  const perServing = {
    caloriesKcal: 154.6,
    proteinG: 6.67,
    carbsG: 20,
    fatG: 3,
    fiberG: 5,
  };
  assert.deepEqual(scaleNutrition(perServing, 2), {
    caloriesKcal: 309.2,
    proteinG: 13.3,
    carbsG: 40,
    fatG: 6,
    fiberG: 10,
  });
  const groups = groupDiaryByMeal(createMockTrackingData(now).diaryEntries);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(groups).map(([meal, items]) => [meal, items.length])
    ),
    { breakfast: 1, lunch: 1, dinner: 0, snack: 0 }
  );
});

test('weight chart keeps the latest log per day inside the window', () => {
  const at = (month, day, hours) => new Date(2026, month, day, hours).toISOString();
  const logs = [
    { _id: 'old', weightKg: 70, recordedAt: at(7, 1, 7) },
    { _id: 'a-morning', weightKg: 66.4, recordedAt: at(8, 8, 7) },
    { _id: 'a-evening', weightKg: 66.1, recordedAt: at(8, 8, 21) },
    { _id: 'b', weightKg: 65.4, recordedAt: at(9, 1, 7) },
    { _id: 'today', weightKg: 65, recordedAt: at(9, 8, 7) },
  ];
  assert.deepEqual(weightChartPoints(logs, now), [
    { date: '2026-09-08', weightKg: 66.1, daysAgo: 30 },
    { date: '2026-10-01', weightKg: 65.4, daysAgo: 7 },
    { date: '2026-10-08', weightKg: 65, daysAgo: 0 },
  ]);
  assert.equal(weightTrend(logs, now).changeKg, -1.1);
  assert.equal(daysAgo(at(9, 7, 23), now), 1);
});

test('weight goal direction and progress', () => {
  assert.equal(weightGoalDirection(66, 65), 'lose');
  assert.equal(weightGoalDirection(64, 65), 'gain');
  assert.equal(weightGoalDirection(65.3, 65), 'maintain');
  assert.equal(weightGoalProgress(70, 67.5, 65), 0.5);
  assert.equal(weightGoalProgress(70, 71, 65), 0);
  assert.equal(weightGoalProgress(70, 60, 65), 1);
  assert.equal(weightGoalProgress(65, 65.2, 65), 1);
  assert.equal(weightGoalProgress(65, 67, 65), 0);
});

test('DD/MM/YYYY dates round-trip and reject impossible days', () => {
  assert.equal(parseDayMonthYear('05/10/2026'), '2026-10-05');
  assert.equal(parseDayMonthYear('5/1/2026'), '2026-01-05');
  assert.equal(parseDayMonthYear('31/02/2026'), null);
  assert.equal(parseDayMonthYear('2026-10-05'), null);
  assert.equal(formatDayMonthYear('2026-10-05'), '05/10/2026');
});
