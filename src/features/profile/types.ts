import type { User } from '@/features/auth';
import type {
  ActivityLevel,
  Allergen,
  DietType,
  NutritionGoal,
} from '@/features/onboarding/types';

export interface PersonalProfile {
  username?: string;
  dateOfBirth?: string | null;
  bio?: string;
  city?: string;
  country?: string;
  gender?: 'female' | 'male' | 'non_binary' | 'other' | 'prefer_not_to_say';
  dietType?: DietType;
  preferredCuisines?: string[];
  preferredFoodItemIds?: string[];
  dislikedFoodItemIds?: string[];
  excludedFoodItemIds?: string[];
  locale?: string;
  timezone?: string;
  updatedAt?: string;
}

export interface NutritionProfile {
  heightCm?: number;
  currentWeightKg?: number;
  activityLevel?: ActivityLevel;
  goal?: NutritionGoal;
  dailyCalorieTarget?: number;
  proteinTargetG?: number;
  carbTargetG?: number;
  fatTargetG?: number;
  fiberTargetG?: number;
  waterTargetMl?: number;
  bmi?: number;
  bmiCategory?: string;
  allergenIds: string[];
  allergenSelectionCompleted: boolean;
}

export interface UserProfile {
  user: User;
  profile: PersonalProfile | null;
  nutritionProfile: NutritionProfile | null;
  allergens: Allergen[];
  allergensLoadFailed: boolean;
}
export interface PublicProfile {
  _id?: string;
  userId?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  username?: string;
  dietType?: DietType;
  preferredCuisines?: string[];
}

export interface ProfileUpdate {
  displayName: string;
  avatarMediaId?: string;
  username?: string;
  city?: string;
  country?: string;
  gender?: PersonalProfile['gender'] | null;
  bio?: string;
  dateOfBirth?: string | null;
  timezone?: string;
  heightCm?: number;
  currentWeightKg?: number;
}

export interface DietaryPreferencesUpdate {
  dietType: DietType;
  goal: NutritionGoal;
  activityLevel: ActivityLevel;
  preferredFoodItemIds: string[];
  dislikedFoodItemIds: string[];
  excludedFoodItemIds: string[];
}

export interface NutritionTargetsUpdate {
  heightCm: number;
  currentWeightKg: number;
  dailyCalorieTarget?: number;
  proteinTargetG?: number;
  carbTargetG?: number;
  fatTargetG?: number;
  fiberTargetG?: number;
}
