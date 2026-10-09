/** Field names follow the backend diary, weight-logs and water-logs modules. */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type DiarySourceType = 'recipe' | 'food' | 'custom';
export type FoodUnit =
  'g' | 'kg' | 'ml' | 'l' | 'piece' | 'tbsp' | 'tsp' | 'cup' | 'serving';

/** `GET /food-items` row, limited to the fields the diary uses. */
export interface FoodItemOption {
  _id: string;
  name: string;
  imageUrl?: string;
  defaultServing?: { amount: number; unit: FoodUnit; gramEquivalent: number };
  nutritionPer100g: Partial<NutritionValues>;
}

export interface NutritionValues {
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface DiaryEntry {
  _id: string;
  /** Local calendar day, `YYYY-MM-DD`. */
  date: string;
  mealType: MealType;
  sourceType: DiarySourceType;
  recipeId?: string;
  foodItemId?: string;
  nameSnapshot: string;
  servings?: number;
  quantity?: number;
  unit?: FoodUnit;
  /** Nutrition at the time of logging; never recomputed from the source. */
  nutritionSnapshot: NutritionValues;
  /** ISO timestamp. */
  consumedAt: string;
  note?: string;
}

export interface WeightLog {
  _id: string;
  weightKg: number;
  /** ISO timestamp. */
  recordedAt: string;
  note?: string;
}

export interface WaterLog {
  _id: string;
  amountMl: number;
  /** ISO timestamp. */
  recordedAt: string;
  note?: string;
}

export interface TrackingTargets {
  energyKcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  waterMl: number | null;
  /** Goal weight; maintain when it equals the current weight. */
  weightKg: number | null;
}

export interface TrackingData {
  diaryEntries: DiaryEntry[];
  weightLogs: WeightLog[];
  waterLogs: WaterLog[];
  targets: TrackingTargets;
}

export type NewDiaryEntry = Omit<DiaryEntry, '_id'>;
export type NewWeightLog = Omit<WeightLog, '_id'>;
export type NewWaterLog = Omit<WaterLog, '_id'>;

/** Today's overview for the diary tab hub. */
export interface TrackingOverview {
  /** Local calendar day, `YYYY-MM-DD`. */
  date: string;
  energy: {
    consumedKcal: number;
    targetKcal: number | null;
  };
  weight: {
    latestWeightKg: number;
    /** Negative when weight went down over `periodDays`. */
    changeKg: number | null;
    periodDays: number;
  } | null;
  water: {
    consumedMl: number;
    targetMl: number | null;
  };
}
