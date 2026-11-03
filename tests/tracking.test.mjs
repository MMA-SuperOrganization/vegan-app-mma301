import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTrackingFixture } from './fixtures/trackingFixtures.ts';
import {
  EMPTY_NUTRITION,
  MEAL_TYPES,
  PRIMARY_MEAL_TYPES,
  addDays,
  diaryEntriesForDate,
  formatTimeOfDay,
  sortWeightLogs,
  sumWater,
  toNutritionValues,
  waterLogsForDate,
  combineDateAndTime,
  daysAgo,
  formatDayMonthYear,
  parseDayMonthYear,
  weightChartPoints,
  weightGoalDirection,
  weightGoalProgress,
  defaultMealTypeFor,
  groupDiaryByMeal,
  isLocalIsoDate,
  macroEnergyShares,
  mealCalorieTotals,
  monthGrid,
  normalizeDiaryEntry,
  parseDecimal,
  parseTimeOfDay,
  quantityToGrams,
  scaleNutrition,
  selectTrackingOverview,
  sumNutrition,
  toLocalIsoDate,
  unitsForFood,
  waterGlasses,
  weekDays,
  weightTrend,
} from '../src/features/tracking/trackingState.ts';

const now = new Date(2026, 9, 8, 15, 0);
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('tracking hub prioritizes the meal timeline and keeps secondary metrics compact', () => {
  const screen = read('../src/features/tracking/screens/TrackingHubScreen.tsx');
  const timeline = read('../src/features/tracking/components/DailyDiaryCard.tsx');
  const navigator = read(
    '../src/features/tracking/components/DiaryDayNavigator.tsx'
  );
  const metric = read(
    '../src/features/tracking/components/TrackingQuickMetricCard.tsx'
  );

  assert.match(screen, /useDiary\(date\)/);
  assert.match(screen, /<DailyDiaryCard/);
  assert.match(screen, /<DiaryDayNavigator/);
  assert.match(screen, /<CalendarDatePicker/);
  assert.match(screen, /params: \{ date \}/);
  assert.match(screen, /styles\.quickMetrics/);
  assert.match(timeline, /formatTime\(entry\.consumedAt\)/);
  assert.match(timeline, /mealLabel\(entry\.mealType\)/);
  assert.match(metric, /<AppIcon name=\{icon\}/);
  assert.match(metric, /flex:\s*1/);
  assert.match(navigator, /addDays\(date, -1\)/);
  assert.match(navigator, /addDays\(date, 1\)/);
  assert.match(navigator, /disabled=\{isToday\}/);
  assert.doesNotMatch(screen, /styles\.metricStack/);
});

test('every tracking date flow uses the shared branded calendar picker', () => {
  const screens = [
    '../src/features/tracking/screens/TrackingHubScreen.tsx',
    '../src/features/tracking/screens/FoodDiaryScreen.tsx',
    '../src/features/tracking/screens/NutritionSummaryScreen.tsx',
    '../src/features/tracking/screens/WaterTrackingScreen.tsx',
  ].map(read);

  for (const screen of screens) {
    assert.match(screen, /CalendarDatePicker/);
    assert.doesNotMatch(screen, /CalendarSheet/);
    assert.match(screen, /TRACKING_MINIMUM_DATE/);
    assert.match(screen, /maximumDate=\{localIsoDateToDate\(today\)\}/);
  }
});

test('tracking overview matches the Figma mock numbers', () => {
  const overview = selectTrackingOverview(createTrackingFixture(now), now);
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
  const data = createTrackingFixture(now);
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
  const { diaryEntries } = createTrackingFixture(now);
  assert.deepEqual(sumNutrition(diaryEntries), {
    caloriesKcal: 800,
    proteinG: 39,
    carbsG: 106,
    fatG: 22,
    fiberG: 14,
  });
});

test('API diary timestamps normalize to the calendar date used by screens', () => {
  const entry = createTrackingFixture(now).diaryEntries[0];
  assert.equal(
    normalizeDiaryEntry({ ...entry, date: '2026-10-08T00:00:00.000Z' }).date,
    '2026-10-08'
  );
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
  const groups = groupDiaryByMeal(createTrackingFixture(now).diaryEntries);
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

test('water glasses follow the goal and cap when it is passed', () => {
  assert.deepEqual(waterGlasses(1250, 2000), { total: 8, filled: 5 });
  assert.deepEqual(waterGlasses(1400, 2000), { total: 8, filled: 5 });
  assert.deepEqual(waterGlasses(3000, 2000), { total: 8, filled: 8 });
  assert.deepEqual(waterGlasses(0, 2500), { total: 10, filled: 0 });
  assert.deepEqual(waterGlasses(500, null), { total: 8, filled: 2 });
  assert.deepEqual(waterGlasses(0, 9000), { total: 16, filled: 0 });
  assert.deepEqual(waterGlasses(0, 100), { total: 1, filled: 0 });
});

test('day navigation shifts calendar days and validates route dates', () => {
  assert.equal(addDays('2026-10-12', -1), '2026-10-11');
  assert.equal(addDays('2026-10-01', -1), '2026-09-30');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2028-03-01', -1), '2028-02-29');
  assert.equal(isLocalIsoDate('2026-10-12'), true);
  for (const bad of ['2026-02-30', '12/10/2026', '2026-1-5', '', undefined, 42]) {
    assert.equal(isLocalIsoDate(bad), false, String(bad));
  }
});

test('week strip shows the Monday-to-Sunday week of the selected day', () => {
  assert.deepEqual(weekDays('2026-10-14'), [
    '2026-10-12',
    '2026-10-13',
    '2026-10-14',
    '2026-10-15',
    '2026-10-16',
    '2026-10-17',
    '2026-10-18',
  ]);
  assert.equal(weekDays('2026-10-11')[0], '2026-10-05');
  assert.equal(weekDays('2026-11-01')[6], '2026-11-01');
});

test('macro energy shares add up to 100 and handle empty days', () => {
  const shares = macroEnergyShares({ carbsG: 106, proteinG: 39, fatG: 22 });
  assert.deepEqual(shares, { carbs: 55, protein: 20, fat: 25 });
  assert.equal(shares.carbs + shares.protein + shares.fat, 100);
  const thirds = macroEnergyShares({ carbsG: 9, proteinG: 9, fatG: 4 });
  assert.equal(thirds.carbs + thirds.protein + thirds.fat, 100);
  assert.equal(macroEnergyShares({ carbsG: 0, proteinG: 0, fatG: 0 }), null);
});

test('meal calorie totals follow meal order and skip empty meals', () => {
  const entry = (mealType, caloriesKcal) => ({
    _id: mealType + caloriesKcal,
    date: '2026-10-12',
    mealType,
    sourceType: 'custom',
    nameSnapshot: 'x',
    nutritionSnapshot: { caloriesKcal, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
    consumedAt: '2026-10-12T05:00:00.000Z',
  });
  assert.deepEqual(
    mealCalorieTotals([
      entry('snack', 100),
      entry('breakfast', 380),
      entry('breakfast', 20),
    ]),
    [
      { mealType: 'breakfast', kcal: 400 },
      { mealType: 'snack', kcal: 100 },
    ]
  );
  assert.deepEqual(mealCalorieTotals([]), []);
});

test('month calendar grid starts on Monday and covers every day', () => {
  const october = monthGrid(2026, 10);
  assert.deepEqual(october.slice(0, 4), [null, null, null, '2026-10-01']);
  assert.equal(october.at(-1), '2026-10-31');
  assert.equal(october.filter(Boolean).length, 31);
  const february = monthGrid(2028, 2);
  assert.equal(february.filter(Boolean).length, 29);
  assert.equal(monthGrid(2026, 6)[0], '2026-06-01');
});

test('time of day formats with two digits from dates and ISO strings', () => {
  assert.equal(formatTimeOfDay(new Date(2026, 9, 8, 7, 5)), '07:05');
  assert.equal(formatTimeOfDay(new Date(2026, 9, 8, 23, 59)), '23:59');
  const iso = new Date(2026, 9, 8, 0, 0).toISOString();
  assert.equal(formatTimeOfDay(iso), '00:00');
  // Round-trips with the parser used by the diary time field.
  assert.deepEqual(parseTimeOfDay(formatTimeOfDay(new Date(2026, 9, 8, 9, 30))), {
    hours: 9,
    minutes: 30,
  });
});

test('missing nutrition facts become zeros without touching known values', () => {
  assert.deepEqual(toNutritionValues(undefined), EMPTY_NUTRITION);
  assert.deepEqual(toNutritionValues({}), EMPTY_NUTRITION);
  assert.deepEqual(toNutritionValues({ caloriesKcal: 120, proteinG: 0 }), {
    caloriesKcal: 120,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    fiberG: 0,
  });
  // The shared empty value must not be mutated by callers.
  const values = toNutritionValues(undefined);
  values.caloriesKcal = 99;
  assert.equal(EMPTY_NUTRITION.caloriesKcal, 0);
});

test('diary entries for a day keep only that day, ordered by time eaten', () => {
  const { diaryEntries } = createTrackingFixture(now);
  const today = toLocalIsoDate(now);
  const late = {
    ...diaryEntries[0],
    _id: 'late-snack',
    mealType: 'snack',
    consumedAt: new Date(2026, 9, 8, 21, 0).toISOString(),
  };
  const yesterday = { ...diaryEntries[1], _id: 'yesterday', date: addDays(today, -1) };
  const result = diaryEntriesForDate([late, yesterday, ...diaryEntries], today);

  assert.deepEqual(
    result.map((entry) => entry._id),
    ['mock-diary-1', 'mock-diary-2', 'late-snack']
  );
  assert.deepEqual(diaryEntriesForDate(diaryEntries, addDays(today, 1)), []);
});

test('water logs for a day use the local calendar date and stay in order', () => {
  const { waterLogs } = createTrackingFixture(now);
  const today = toLocalIsoDate(now);
  const yesterdayLog = {
    _id: 'yesterday-water',
    amountMl: 300,
    recordedAt: new Date(2026, 9, 7, 22, 0).toISOString(),
  };
  const shuffled = [waterLogs[2], yesterdayLog, waterLogs[0], waterLogs[1]];

  assert.deepEqual(
    waterLogsForDate(shuffled, today).map((log) => log._id),
    ['mock-water-1', 'mock-water-2', 'mock-water-3']
  );
  assert.deepEqual(
    waterLogsForDate(shuffled, '2026-10-07').map((log) => log._id),
    ['yesterday-water']
  );
});

test('daily water total adds every log and is zero for an empty day', () => {
  const { waterLogs } = createTrackingFixture(now);
  assert.equal(sumWater(waterLogs), 1250);
  assert.equal(sumWater([]), 0);
  assert.equal(sumWater(waterLogsForDate(waterLogs, '2026-10-01')), 0);
});

test('weight history lists the newest log first without mutating the input', () => {
  const { weightLogs } = createTrackingFixture(now);
  const input = [weightLogs[1], weightLogs[2], weightLogs[0]];
  const sorted = sortWeightLogs(input);

  assert.deepEqual(
    sorted.map((log) => log._id),
    ['mock-weight-3', 'mock-weight-2', 'mock-weight-1']
  );
  assert.equal(input[0]._id, 'mock-weight-2');
  assert.deepEqual(sortWeightLogs([]), []);
});

test('meal type lists keep the diary order used by the screens', () => {
  assert.deepEqual(MEAL_TYPES, ['breakfast', 'lunch', 'dinner', 'snack']);
  assert.deepEqual(PRIMARY_MEAL_TYPES, ['breakfast', 'lunch', 'dinner']);
  assert.ok(PRIMARY_MEAL_TYPES.every((type) => MEAL_TYPES.includes(type)));
});
