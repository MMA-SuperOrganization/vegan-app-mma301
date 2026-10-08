import type {
  DiaryEntry,
  FoodItemOption,
  FoodUnit,
  MealType,
  NutritionValues,
  TrackingData,
  TrackingOverview,
  WaterLog,
  WeightLog,
} from './types';

export const WEIGHT_TREND_DAYS = 30;
export const DAY_MS = 24 * 60 * 60 * 1000;

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
/** Meals always shown on the diary page; snack appears only when logged. */
export const PRIMARY_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

export const EMPTY_NUTRITION: NutritionValues = {
  caloriesKcal: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  fiberG: 0,
};

/** Accepts `1,5` and `1.5`; returns null for empty, invalid or negative input. */
export function parseDecimal(text: string) {
  const normalized = text.trim().replace(',', '.');
  if (!normalized || !/^\d*\.?\d+$|^\d+\.$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Parses `HH:MM` (24h). */
export function parseTimeOfDay(text: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60 ? { hours, minutes } : null;
}

export function formatTimeOfDay(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** ISO timestamp for a local `YYYY-MM-DD` day at the given time. */
export function combineDateAndTime(
  date: string,
  time: { hours: number; minutes: number }
) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day, time.hours, time.minutes).toISOString();
}

export function defaultMealTypeFor(date: Date): MealType {
  const hour = date.getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 17) return 'snack';
  return 'dinner';
}

export function toNutritionValues(
  facts: Partial<NutritionValues> | undefined
): NutritionValues {
  return {
    caloriesKcal: facts?.caloriesKcal ?? 0,
    proteinG: facts?.proteinG ?? 0,
    carbsG: facts?.carbsG ?? 0,
    fatG: facts?.fatG ?? 0,
    fiberG: facts?.fiberG ?? 0,
  };
}

/** Scales and rounds to one decimal, like the stored snapshot. */
export function scaleNutrition(
  values: NutritionValues,
  factor: number,
  round = true
): NutritionValues {
  const scale = (value: number) =>
    round ? Math.round(value * factor * 10) / 10 : value * factor;
  return {
    caloriesKcal: scale(values.caloriesKcal),
    proteinG: scale(values.proteinG),
    carbsG: scale(values.carbsG),
    fatG: scale(values.fatG),
    fiberG: scale(values.fiberG),
  };
}

const METRIC: Partial<Record<FoodUnit, ['mass' | 'volume', number]>> = {
  g: ['mass', 1],
  kg: ['mass', 1000],
  ml: ['volume', 1],
  l: ['volume', 1000],
};

function convertQuantity(quantity: number, from: FoodUnit, to: FoodUnit) {
  if (from === to) return quantity;
  const a = METRIC[from];
  const b = METRIC[to];
  return a && b && a[0] === b[0] ? (quantity * a[1]) / b[1] : null;
}

/**
 * Grams for a food quantity, mirroring the backend `quantityToGrams`: metric
 * mass converts directly, other units go through the food's default serving.
 */
export function quantityToGrams(
  quantity: number,
  unit: FoodUnit,
  defaultServing?: FoodItemOption['defaultServing']
) {
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  const mass = convertQuantity(quantity, unit, 'g');
  if (mass !== null) return mass;
  if (
    defaultServing &&
    defaultServing.amount > 0 &&
    defaultServing.gramEquivalent > 0
  ) {
    const amount = convertQuantity(quantity, unit, defaultServing.unit);
    if (amount !== null) {
      return (amount / defaultServing.amount) * defaultServing.gramEquivalent;
    }
  }
  return null;
}

/** Units a food can be logged in: grams, kilograms and its default serving unit. */
export function unitsForFood(food: FoodItemOption): FoodUnit[] {
  const units: FoodUnit[] = ['g', 'kg'];
  const servingUnit = food.defaultServing?.unit;
  if (servingUnit && !units.includes(servingUnit)) units.push(servingUnit);
  return units;
}

export function groupDiaryByMeal(entries: DiaryEntry[]) {
  const groups: Record<MealType, DiaryEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  for (const entry of entries) groups[entry.mealType].push(entry);
  return groups;
}

/** Local calendar day as `YYYY-MM-DD`. */
export function toLocalIsoDate(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function diaryEntriesForDate(entries: DiaryEntry[], date: string) {
  return entries
    .filter((entry) => entry.date === date)
    .sort((a, b) => a.consumedAt.localeCompare(b.consumedAt));
}

export function waterLogsForDate(logs: WaterLog[], date: string) {
  return logs
    .filter((log) => toLocalIsoDate(log.recordedAt) === date)
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
}

/** Newest first, as shown in the weight history list. */
export function sortWeightLogs(logs: WeightLog[]) {
  return [...logs].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

/** Whole local calendar days from `value` to `now` (0 = today, 1 = yesterday). */
export function daysAgo(value: Date | string, now: Date) {
  const day = new Date(typeof value === 'string' ? value : value.getTime());
  day.setHours(0, 0, 0, 0);
  const today = new Date(now.getTime());
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - day.getTime()) / DAY_MS);
}

export interface WeightChartPoint {
  date: string;
  weightKg: number;
  daysAgo: number;
}

/** One point per day (the day's latest log) inside the trend window, oldest first. */
export function weightChartPoints(
  logs: WeightLog[],
  now: Date,
  periodDays = WEIGHT_TREND_DAYS
): WeightChartPoint[] {
  const latestPerDay = new Map<string, WeightLog>();
  for (const log of logs) {
    const age = daysAgo(log.recordedAt, now);
    if (age < 0 || age > periodDays) continue;
    const date = toLocalIsoDate(log.recordedAt);
    const current = latestPerDay.get(date);
    if (!current || log.recordedAt > current.recordedAt) latestPerDay.set(date, log);
  }
  return [...latestPerDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, log]) => ({
      date,
      weightKg: log.weightKg,
      daysAgo: daysAgo(log.recordedAt, now),
    }));
}

export type WeightGoalDirection = 'lose' | 'gain' | 'maintain';

/** Within this many kg of the goal counts as maintaining it. */
export const WEIGHT_GOAL_TOLERANCE_KG = 0.5;

export function weightGoalDirection(
  currentKg: number,
  goalKg: number
): WeightGoalDirection {
  if (currentKg - goalKg > WEIGHT_GOAL_TOLERANCE_KG) return 'lose';
  if (goalKg - currentKg > WEIGHT_GOAL_TOLERANCE_KG) return 'gain';
  return 'maintain';
}

/**
 * Share of the way from the start weight to the goal, 0–1. When the start is
 * already at the goal, progress is full while staying within tolerance.
 */
export function weightGoalProgress(
  startKg: number,
  currentKg: number,
  goalKg: number
) {
  const total = startKg - goalKg;
  if (Math.abs(total) <= WEIGHT_GOAL_TOLERANCE_KG) {
    return Math.abs(currentKg - goalKg) <= WEIGHT_GOAL_TOLERANCE_KG ? 1 : 0;
  }
  return Math.min(1, Math.max(0, (startKg - currentKg) / total));
}

/** Parses `DD/MM/YYYY` into a local `YYYY-MM-DD`, rejecting impossible dates. */
export function parseDayMonthYear(text: string) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const [day, month, year] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return toLocalIsoDate(date);
}

/** Formats a local `YYYY-MM-DD` as `DD/MM/YYYY` for input fields. */
export function formatDayMonthYear(isoDate: string) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function sumNutrition(entries: DiaryEntry[]): NutritionValues {
  return entries.reduce<NutritionValues>(
    (total, entry) => ({
      caloriesKcal: total.caloriesKcal + entry.nutritionSnapshot.caloriesKcal,
      proteinG: total.proteinG + entry.nutritionSnapshot.proteinG,
      carbsG: total.carbsG + entry.nutritionSnapshot.carbsG,
      fatG: total.fatG + entry.nutritionSnapshot.fatG,
      fiberG: total.fiberG + entry.nutritionSnapshot.fiberG,
    }),
    EMPTY_NUTRITION
  );
}

export function sumWater(logs: WaterLog[]) {
  return logs.reduce((total, log) => total + log.amountMl, 0);
}

/**
 * Latest weight plus the change since the first chart point of the trend
 * window (calendar days, so any log from the first day counts). `changeKg` is
 * null when the window holds a single day.
 */
export function weightTrend(
  logs: WeightLog[],
  now: Date,
  periodDays = WEIGHT_TREND_DAYS
) {
  const latest = sortWeightLogs(logs)[0];
  if (!latest) return null;
  const points = weightChartPoints(logs, now, periodDays);
  const changeKg =
    points.length > 1
      ? Math.round((latest.weightKg - points[0].weightKg) * 10) / 10
      : null;
  return { latestWeightKg: latest.weightKg, changeKg, periodDays };
}

export function selectTrackingOverview(
  data: TrackingData,
  now: Date
): TrackingOverview {
  const date = toLocalIsoDate(now);
  const nutrition = sumNutrition(diaryEntriesForDate(data.diaryEntries, date));
  return {
    date,
    energy: {
      consumedKcal: nutrition.caloriesKcal,
      targetKcal: data.targets.energyKcal,
    },
    weight: weightTrend(data.weightLogs, now),
    water: {
      consumedMl: sumWater(waterLogsForDate(data.waterLogs, date)),
      targetMl: data.targets.waterMl,
    },
  };
}
