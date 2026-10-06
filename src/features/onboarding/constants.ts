import type { ActivityLevel, DietType, NutritionGoal } from './types';

export const dietOptions: Array<{ value: DietType; label: string }> = [
  { value: 'vegan', label: 'Thuần chay' },
  { value: 'vegetarian', label: 'Ăn chay' },
  { value: 'lacto_vegetarian', label: 'Chay có sữa' },
  { value: 'ovo_vegetarian', label: 'Chay có trứng' },
  { value: 'lacto_ovo_vegetarian', label: 'Chay có sữa và trứng' },
  { value: 'pescatarian', label: 'Chay có cá' },
  { value: 'flexitarian', label: 'Ăn chay linh hoạt' },
  { value: 'other', label: 'Khác' },
];

export const goalOptions: Array<{ value: NutritionGoal; label: string }> = [
  { value: 'lose_weight', label: 'Giảm cân' },
  { value: 'maintain', label: 'Duy trì cân nặng' },
  { value: 'gain_weight', label: 'Tăng cân' },
  { value: 'improve_nutrition', label: 'Cải thiện dinh dưỡng' },
];

export const activityOptions: Array<{ value: ActivityLevel; label: string }> = [
  { value: 'sedentary', label: 'Ít vận động' },
  { value: 'light', label: 'Nhẹ' },
  { value: 'moderate', label: 'Vừa phải' },
  { value: 'active', label: 'Năng động' },
  { value: 'very_active', label: 'Rất năng động' },
];

export function optionLabel<T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T | null
) {
  return options.find((option) => option.value === value)?.label ?? '';
}
