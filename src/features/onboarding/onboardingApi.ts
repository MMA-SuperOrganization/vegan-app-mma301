import { apiClient, unwrapApiRequest } from '@/services/api';
import type {
  ActivityLevel,
  Allergen,
  DietType,
  NutritionGoal,
  OnboardingStatus,
} from './types';

export interface OnboardingPayload {
  dietType: DietType;
  goal: NutritionGoal;
  activityLevel: ActivityLevel;
  heightCm: number;
  currentWeightKg: number;
  allergenIds: string[];
  timezone?: string;
}

export const onboardingApi = {
  getStatus: () =>
    unwrapApiRequest<OnboardingStatus>(() => apiClient.get('/onboarding/status')),
  getAllergens: () =>
    unwrapApiRequest<Allergen[]>(() =>
      apiClient.get('/allergens', { params: { page: 1, limit: 50 } })
    ),
  update: (payload: OnboardingPayload) =>
    unwrapApiRequest<OnboardingStatus>(() => apiClient.put('/onboarding', payload)),
  updateProfile: (dateOfBirth: string) =>
    unwrapApiRequest<unknown>(() => apiClient.put('/profiles/me', { dateOfBirth })),
  complete: () =>
    unwrapApiRequest<OnboardingStatus>(() =>
      apiClient.post('/onboarding/complete', {})
    ),
};
