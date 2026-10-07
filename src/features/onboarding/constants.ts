import type { TranslationKey, TranslationParams } from '@/i18n';
import type { ActivityLevel, DietType, NutritionGoal } from './types';

type Translator = (key: TranslationKey, params?: TranslationParams) => string;
type OptionDefinition<T extends string> = { value: T; labelKey: TranslationKey };

const dietDefinitions: Array<OptionDefinition<DietType>> = [
  { value: 'vegan', labelKey: 'onboarding.diet.vegan' },
  { value: 'vegetarian', labelKey: 'onboarding.diet.vegetarian' },
  { value: 'lacto_vegetarian', labelKey: 'onboarding.diet.lacto' },
  { value: 'ovo_vegetarian', labelKey: 'onboarding.diet.ovo' },
  { value: 'lacto_ovo_vegetarian', labelKey: 'onboarding.diet.lactoOvo' },
  { value: 'pescatarian', labelKey: 'onboarding.diet.pescatarian' },
  { value: 'flexitarian', labelKey: 'onboarding.diet.flexitarian' },
  { value: 'other', labelKey: 'onboarding.diet.other' },
];

const goalDefinitions: Array<OptionDefinition<NutritionGoal>> = [
  { value: 'lose_weight', labelKey: 'onboarding.goal.lose' },
  { value: 'maintain', labelKey: 'onboarding.goal.maintain' },
  { value: 'gain_weight', labelKey: 'onboarding.goal.gain' },
  { value: 'improve_nutrition', labelKey: 'onboarding.goal.improve' },
];

const activityDefinitions: Array<OptionDefinition<ActivityLevel>> = [
  { value: 'sedentary', labelKey: 'onboarding.activity.sedentary' },
  { value: 'light', labelKey: 'onboarding.activity.light' },
  { value: 'moderate', labelKey: 'onboarding.activity.moderate' },
  { value: 'active', labelKey: 'onboarding.activity.active' },
  { value: 'very_active', labelKey: 'onboarding.activity.veryActive' },
];

function localizeOptions<T extends string>(definitions: Array<OptionDefinition<T>>, t: Translator) {
  return definitions.map(({ value, labelKey }) => ({ value, label: t(labelKey) }));
}

export const getDietOptions = (t: Translator) => localizeOptions(dietDefinitions, t);
export const getGoalOptions = (t: Translator) => localizeOptions(goalDefinitions, t);
export const getActivityOptions = (t: Translator) => localizeOptions(activityDefinitions, t);

export function optionLabel<T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T | null
) {
  return options.find((option) => option.value === value)?.label ?? '';
}
