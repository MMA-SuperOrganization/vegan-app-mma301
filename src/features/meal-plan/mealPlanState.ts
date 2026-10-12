import type { MealType } from '@/features/tracking/types';
import type { MealPlan, PlannedMeal } from './types';

const DAY_MS = 86_400_000;

export const PLANNED_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

export function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function startOfWeek(value: Date) {
  const start = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  return toIsoDate(start);
}

export function addCalendarDays(isoDate: string, days: number) {
  const value = new Date(`${isoDate}T12:00:00`);
  value.setTime(value.getTime() + days * DAY_MS);
  return toIsoDate(value);
}

export function weekDates(weekStartDate: string) {
  return Array.from({ length: 7 }, (_, index) =>
    addCalendarDays(weekStartDate, index)
  );
}

export function normalizeMealPlan(plan: MealPlan): MealPlan {
  return {
    ...plan,
    weekStartDate: plan.weekStartDate.slice(0, 10),
    days: plan.days.map((day) => ({ ...day, date: day.date.slice(0, 10) })),
  };
}

export function selectEditablePlan(plans: MealPlan[]) {
  const editable = plans.filter((plan) => plan.status !== 'archived');
  const selected =
    editable.find((plan) => plan.status === 'active') ??
    editable.find((plan) => plan.status === 'draft') ??
    null;
  return selected ? normalizeMealPlan(selected) : null;
}

export function mealsForDate(plan: MealPlan | null | undefined, date: string) {
  return plan?.days.find((day) => day.date === date)?.meals ?? [];
}

export function groupMealsByType(meals: PlannedMeal[]) {
  const groups: Record<MealType, PlannedMeal[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  for (const meal of meals) groups[meal.type].push(meal);
  return groups;
}

export function plannedCalories(meals: PlannedMeal[]) {
  return meals.reduce(
    (total, meal) =>
      total +
      (meal.recipeSnapshot.nutritionPerServing.caloriesKcal ?? 0) * meal.servings,
    0
  );
}

export function nextServingCount(current: number, delta: number) {
  return Math.min(100, Math.max(0.5, Math.round((current + delta) * 2) / 2));
}
