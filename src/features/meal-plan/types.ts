import type { NutritionFacts } from '@/features/recipes/types';
import type { MealType } from '@/features/tracking/types';

export type MealPlanStatus = 'draft' | 'active' | 'archived' | 'completed';

export interface PlannedMeal {
  mealId: string;
  type: MealType;
  recipeId: string;
  servings: number;
  note?: string;
  completed: boolean;
  recipeSnapshot: {
    title: string;
    servings: number;
    nutritionPerServing: Required<NutritionFacts>;
  };
}

export interface MealPlanDay {
  /** Local calendar day, `YYYY-MM-DD`. */
  date: string;
  meals: PlannedMeal[];
}

export interface MealPlan {
  _id: string;
  title: string;
  /** Monday represented as `YYYY-MM-DD`. */
  weekStartDate: string;
  status: MealPlanStatus;
  days: MealPlanDay[];
  version: number;
}

export interface AddMealInput {
  date: string;
  type: MealType;
  recipeId: string;
  servings: number;
}

export interface UpdateMealInput {
  recipeId?: string;
  servings?: number;
  completed?: boolean;
}
