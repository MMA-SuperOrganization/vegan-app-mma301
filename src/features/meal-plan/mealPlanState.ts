import type { MealType } from '@/features/tracking/types';
import type { NutritionValues } from '@/features/tracking/types';
import type { NutritionFacts } from '@/features/recipes/types';
import type { MealPlan, PlannedMeal, UpdateMealInput } from './types';

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

export function monthStart(isoDate: string) {
  return `${isoDate.slice(0, 7)}-01`;
}

export function shiftMonth(monthStartDate: string, monthDelta: number) {
  const value = new Date(`${monthStartDate}T12:00:00`);
  value.setMonth(value.getMonth() + monthDelta, 1);
  return toIsoDate(value);
}

export function weeksIntersectingMonth(monthStartDate: string) {
  const firstDay = new Date(`${monthStart(monthStartDate)}T12:00:00`);
  const lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0, 12);
  const firstWeek = startOfWeek(firstDay);
  const lastWeek = startOfWeek(lastDay);
  const weeks: string[] = [];
  for (let week = firstWeek; week <= lastWeek; week = addCalendarDays(week, 7)) {
    weeks.push(week);
  }
  return weeks;
}

export function relativeWeekOffset(referenceWeek: string, targetWeek: string) {
  const reference = new Date(`${referenceWeek}T12:00:00`).getTime();
  const target = new Date(`${targetWeek}T12:00:00`).getTime();
  return Math.round((target - reference) / (DAY_MS * 7));
}

export function shiftWeekSelection(
  weekStartDate: string,
  selectedDate: string,
  weekDelta: number
) {
  const selectedDayIndex = Math.max(
    weekDates(weekStartDate).indexOf(selectedDate),
    0
  );
  const nextWeekStartDate = addCalendarDays(weekStartDate, weekDelta * 7);
  return {
    weekStartDate: nextWeekStartDate,
    selectedDate: addCalendarDays(nextWeekStartDate, selectedDayIndex),
  };
}

export function normalizeMealPlan(plan: MealPlan): MealPlan {
  return {
    ...plan,
    weekStartDate: plan.weekStartDate.slice(0, 10),
    days: plan.days.map((day) => ({
      ...day,
      date: day.date.slice(0, 10),
      meals: day.meals.map((meal) => ({
        ...meal,
        servings: Math.min(100, Math.max(1, Math.round(meal.servings))),
      })),
    })),
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
  return plannedNutrition(meals).caloriesKcal;
}

export function plannedNutrition(meals: PlannedMeal[]): NutritionValues {
  return meals.reduce<NutritionValues>(
    (total, meal) => {
      const nutrition = meal.recipeSnapshot.nutritionPerServing;
      return {
        caloriesKcal:
          total.caloriesKcal + (nutrition.caloriesKcal ?? 0) * meal.servings,
        proteinG: total.proteinG + (nutrition.proteinG ?? 0) * meal.servings,
        carbsG: total.carbsG + (nutrition.carbsG ?? 0) * meal.servings,
        fatG: total.fatG + (nutrition.fatG ?? 0) * meal.servings,
        fiberG: total.fiberG + (nutrition.fiberG ?? 0) * meal.servings,
      };
    },
    { caloriesKcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 }
  );
}

export function completeNutritionSnapshot(
  nutrition: NutritionFacts | undefined
): Required<NutritionFacts> {
  return {
    caloriesKcal: nutrition?.caloriesKcal ?? 0,
    proteinG: nutrition?.proteinG ?? 0,
    carbsG: nutrition?.carbsG ?? 0,
    fatG: nutrition?.fatG ?? 0,
    fiberG: nutrition?.fiberG ?? 0,
    sugarG: nutrition?.sugarG ?? 0,
    sodiumMg: nutrition?.sodiumMg ?? 0,
    calciumMg: nutrition?.calciumMg ?? 0,
    ironMg: nutrition?.ironMg ?? 0,
    vitaminB12Mcg: nutrition?.vitaminB12Mcg ?? 0,
    vitaminDMcg: nutrition?.vitaminDMcg ?? 0,
  };
}

export function nextServingCount(current: number, delta: number) {
  return Math.min(100, Math.max(1, Math.round(current) + Math.sign(delta)));
}

export function updatePlannedMeal(
  plan: MealPlan,
  mealId: string,
  input: UpdateMealInput,
  optimisticMeal?: PlannedMeal
): MealPlan {
  return {
    ...plan,
    days: plan.days.map((day) => ({
      ...day,
      meals: day.meals.map((meal) =>
        meal.mealId === mealId
          ? optimisticMeal ?? { ...meal, ...input }
          : meal
      ),
    })),
  };
}

export function removePlannedMeal(plan: MealPlan, mealId: string): MealPlan {
  return {
    ...plan,
    days: plan.days.map((day) => ({
      ...day,
      meals: day.meals.filter((meal) => meal.mealId !== mealId),
    })),
  };
}

export function addPlannedMeal(
  plan: MealPlan,
  date: string,
  meal: PlannedMeal
): MealPlan {
  const existingDay = plan.days.some((day) => day.date === date);
  return {
    ...plan,
    days: existingDay
      ? plan.days.map((day) =>
          day.date === date
            ? { ...day, meals: [...day.meals, meal] }
            : day
        )
      : [...plan.days, { date, meals: [meal] }].sort((left, right) =>
          left.date.localeCompare(right.date)
        ),
  };
}
