import { apiClient, unwrapApiRequest } from '@/services/api';
import type { Allergen } from '@/features/onboarding/types';
import type {
  DietaryPreferencesUpdate,
  NutritionTargetsUpdate,
  ProfileUpdate,
  UserProfile,
} from './types';
import { translate } from '@/i18n';

interface AccountDto {
  _id: string;
  userId: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  onboardingCompleted?: boolean | null;
}

interface ProfileSummaryDto {
  user: AccountDto;
  profile: UserProfile['profile'];
  nutritionProfile: UserProfile['nutritionProfile'];
}

export const profileApi = {
  getMe: async (): Promise<UserProfile> => {
    const summary = await unwrapApiRequest<ProfileSummaryDto>(() =>
      apiClient.get('/users/me')
    );
    let allergens: Allergen[] = [];
    let allergensLoadFailed = false;
    try {
      allergens = await unwrapApiRequest<Allergen[]>(() =>
        apiClient.get('/allergens', { params: { page: 1, limit: 50 } })
      );
    } catch {
      // Optional labels must not make the persisted profile unusable.
      allergensLoadFailed = true;
    }
    return {
      user: {
        id: summary.user.userId || summary.user._id,
        name:
          summary.user.displayName ||
          summary.user.email?.split('@')[0] ||
          translate('common.userFallback'),
        email: summary.user.email || '',
        avatarUrl: summary.user.avatarUrl || undefined,
        role: summary.user.role,
        status: summary.user.status,
        onboardingCompleted: summary.user.onboardingCompleted === true,
      },
      profile: summary.profile,
      nutritionProfile: summary.nutritionProfile
        ? {
            ...summary.nutritionProfile,
            allergenIds: summary.nutritionProfile.allergenIds ?? [],
            allergenSelectionCompleted:
              summary.nutritionProfile.allergenSelectionCompleted === true,
          }
        : null,
      allergens,
      allergensLoadFailed,
    };
  },

  async update(values: ProfileUpdate) {
    await unwrapApiRequest(() =>
      apiClient.patch('/users/me', { displayName: values.displayName.trim() })
    );
    await unwrapApiRequest(() =>
      apiClient.put('/profiles/me', {
        bio: values.bio?.trim() ?? '',
        dateOfBirth: values.dateOfBirth || null,
        timezone: values.timezone?.trim() || 'Asia/Ho_Chi_Minh',
      })
    );
    const nutrition = Object.fromEntries(
      Object.entries({
        heightCm: values.heightCm,
        currentWeightKg: values.currentWeightKg,
      }).filter(([, value]) => value !== undefined)
    );
    if (Object.keys(nutrition).length) {
      await unwrapApiRequest(() =>
        apiClient.put('/nutrition-profiles/me', nutrition)
      );
    }
  },

  updateDietaryPreferences: (values: DietaryPreferencesUpdate) =>
    Promise.all([
      unwrapApiRequest(() =>
        apiClient.put('/profiles/me', { dietType: values.dietType })
      ),
      unwrapApiRequest(() =>
        apiClient.put('/nutrition-profiles/me', {
          goal: values.goal,
          activityLevel: values.activityLevel,
        })
      ),
    ]),

  updateAllergens: (allergenIds: string[]) =>
    unwrapApiRequest(() => apiClient.put('/nutrition-profiles/me', { allergenIds })),

  updateNutritionTargets: (values: NutritionTargetsUpdate) =>
    unwrapApiRequest(() => apiClient.put('/nutrition-profiles/me', values)),

  recalculateNutrition: () =>
    unwrapApiRequest(() => apiClient.post('/nutrition-profiles/me/recalculate', {})),

  deleteAccount: () =>
    unwrapApiRequest<{ userId: string; status: 'deleted'; deletedAt: string }>(() =>
      apiClient.delete('/users/me', { data: {} })
    ),
};
