export {
  activityLevels,
  dietTypes,
  initialOnboardingDraft,
  nutritionGoals,
} from './draftSchema';
export type {
  ActivityLevel,
  DietType,
  NutritionGoal,
  OnboardingDraft,
} from './draftSchema';

export interface Allergen {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface OnboardingStatus {
  completed: boolean;
  readyToComplete: boolean;
  missingFields: string[];
  steps: Array<{ key: string; completed: boolean }>;
}
