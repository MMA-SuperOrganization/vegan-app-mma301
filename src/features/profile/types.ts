import type { User } from '@/features/auth';
import type {
  ActivityLevel,
  Allergen,
  DietType,
  NutritionGoal,
} from '@/features/onboarding/types';

export interface PersonalProfile {
  dateOfBirth?: string;
  bio?: string;
  dietType?: DietType;
  timezone?: string;
  updatedAt?: string;
}

export interface NutritionProfile {
  heightCm?: number;
  currentWeightKg?: number;
  activityLevel?: ActivityLevel;
  goal?: NutritionGoal;
  dailyCalorieTarget?: number;
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
}

export interface ProfileUpdate {
  displayName: string;
  heightCm?: number;
  currentWeightKg?: number;
}
