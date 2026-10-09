import { create } from 'zustand';
import { translate } from '@/i18n';
import { useAuthStore } from '@/features/auth';
import { AppError } from '@/services/errors';
import { profileApi } from './profileApi';
import type {
  DietaryPreferencesUpdate,
  NutritionTargetsUpdate,
  ProfileUpdate,
  UserProfile,
} from './types';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

interface ProfileState {
  data: UserProfile | null;
  userId: string | null;
  status: LoadState;
  isSaving: boolean;
  error: string | null;
  load: (userId: string, force?: boolean) => Promise<boolean>;
  update: (values: ProfileUpdate) => Promise<boolean>;
  updateDietaryPreferences: (values: DietaryPreferencesUpdate) => Promise<boolean>;
  updateAllergens: (allergenIds: string[]) => Promise<boolean>;
  updateNutritionTargets: (values: NutritionTargetsUpdate) => Promise<boolean>;
  recalculateNutrition: () => Promise<boolean>;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  data: null,
  userId: null,
  status: 'idle',
  isSaving: false,
  error: null,

  load: async (userId, force = false) => {
    const current = get();
    if (!force && current.userId === userId && current.status === 'success')
      return true;
    if (current.status === 'loading') return false;
    set({
      data: current.userId === userId ? current.data : null,
      userId,
      status: 'loading',
      error: null,
    });
    try {
      const data = await profileApi.getMe();
      if (get().userId !== userId) return false;
      set({ data, status: 'success', error: null });
      useAuthStore.getState().syncUser(data.user);
      return true;
    } catch (error) {
      if (error instanceof AppError && error.status === 401) {
        await useAuthStore.getState().logout();
        get().reset();
        return false;
      }
      if (get().userId === userId) {
        set({
          status: 'error',
          error:
            error instanceof Error ? error.message : translate('profile.error.load'),
        });
      }
      return false;
    }
  },

  update: async (values) => {
    const userId = get().userId;
    if (!userId || get().isSaving) return false;
    set({ isSaving: true, error: null });
    try {
      await profileApi.update(values);
      const loaded = await get().load(userId, true);
      set({ isSaving: false });
      return loaded;
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error ? error.message : translate('profile.error.save'),
      });
      return false;
    }
  },

  updateDietaryPreferences: async (values) =>
    saveAndReload(set, get, () => profileApi.updateDietaryPreferences(values)),

  updateAllergens: async (allergenIds) =>
    saveAndReload(set, get, () => profileApi.updateAllergens(allergenIds)),

  updateNutritionTargets: async (values) =>
    saveAndReload(set, get, () => profileApi.updateNutritionTargets(values)),

  recalculateNutrition: async () =>
    saveAndReload(set, get, () => profileApi.recalculateNutrition()),

  reset: () =>
    set({ data: null, userId: null, status: 'idle', isSaving: false, error: null }),
}));

async function saveAndReload(
  set: (state: Partial<ProfileState>) => void,
  get: () => ProfileState,
  request: () => Promise<unknown>
) {
  const userId = get().userId;
  if (!userId || get().isSaving) return false;
  set({ isSaving: true, error: null });
  try {
    await request();
    const loaded = await get().load(userId, true);
    set({ isSaving: false });
    return loaded;
  } catch (error) {
    set({
      isSaving: false,
      error:
        error instanceof Error ? error.message : translate('profile.error.save'),
    });
    return false;
  }
}
