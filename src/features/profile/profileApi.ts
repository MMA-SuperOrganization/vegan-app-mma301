import { apiClient, unwrapApiRequest } from '@/services/api';
import type { Allergen } from '@/features/onboarding/types';
import type { ProfileUpdate, UserProfile } from './types';
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
    try {
      allergens = await unwrapApiRequest<Allergen[]>(() =>
        apiClient.get('/allergens', { params: { page: 1, limit: 50 } })
      );
    } catch {
      // Optional labels must not make the persisted profile unusable.
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
    };
  },

  async update(values: ProfileUpdate) {
    await unwrapApiRequest(() =>
      apiClient.patch('/users/me', { displayName: values.displayName.trim() })
    );
    const nutrition = Object.fromEntries(
      Object.entries({
        heightCm: values.heightCm,
        currentWeightKg: values.currentWeightKg,
      }).filter(([, value]) => value !== undefined)
    );
    if (Object.keys(nutrition).length) {
      await unwrapApiRequest(() => apiClient.put('/nutrition-profiles/me', nutrition));
    }
  },
};
