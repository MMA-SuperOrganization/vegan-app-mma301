export const dietTypes = [
  'vegan',
  'vegetarian',
  'lacto_vegetarian',
  'ovo_vegetarian',
  'lacto_ovo_vegetarian',
  'pescatarian',
  'flexitarian',
  'other',
] as const;

export const nutritionGoals = [
  'lose_weight',
  'maintain',
  'gain_weight',
  'improve_nutrition',
] as const;

export const activityLevels = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
] as const;

export type DietType = (typeof dietTypes)[number];
export type NutritionGoal = (typeof nutritionGoals)[number];
export type ActivityLevel = (typeof activityLevels)[number];

export interface Allergen {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface OnboardingDraft {
  dietType: DietType | null;
  goal: NutritionGoal | null;
  dateOfBirth: string;
  heightCm: string;
  currentWeightKg: string;
  activityLevel: ActivityLevel | null;
  allergenIds: string[];
  allergyAnswered: boolean;
  aiProfileConsent: boolean;
}

export interface OnboardingStatus {
  completed: boolean;
  readyToComplete: boolean;
  missingFields: string[];
  steps: Array<{ key: string; completed: boolean }>;
}

export const initialOnboardingDraft: OnboardingDraft = {
  dietType: null,
  goal: null,
  dateOfBirth: '',
  heightCm: '',
  currentWeightKg: '',
  activityLevel: null,
  allergenIds: [],
  allergyAnswered: false,
  aiProfileConsent: false,
};

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[]
): value is T {
  return typeof value === 'string' && allowed.includes(value as T);
}

export function parseOnboardingDraft(raw: string | null): OnboardingDraft {
  if (!raw) return { ...initialOnboardingDraft };

  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    return {
      dietType: isOneOf<DietType>(value.dietType, dietTypes) ? value.dietType : null,
      goal: isOneOf<NutritionGoal>(value.goal, nutritionGoals) ? value.goal : null,
      dateOfBirth: typeof value.dateOfBirth === 'string' ? value.dateOfBirth : '',
      heightCm: typeof value.heightCm === 'string' ? value.heightCm : '',
      currentWeightKg:
        typeof value.currentWeightKg === 'string' ? value.currentWeightKg : '',
      activityLevel: isOneOf<ActivityLevel>(value.activityLevel, activityLevels)
        ? value.activityLevel
        : null,
      allergenIds: Array.isArray(value.allergenIds)
        ? value.allergenIds.filter(
            (item): item is string => typeof item === 'string'
          )
        : [],
      allergyAnswered:
        typeof value.allergyAnswered === 'boolean' ? value.allergyAnswered : false,
      aiProfileConsent:
        typeof value.aiProfileConsent === 'boolean' ? value.aiProfileConsent : false,
    };
  } catch {
    return { ...initialOnboardingDraft };
  }
}
