import { getUserErrorMessage } from '@/services/errors';
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

export interface MealPlanAllergenConflict {
  mealId: string;
  mealName: string;
  mealType: string;
  allergens: { id: string; name: string }[];
}

export type AllergenUpdateResult =
  | { status: 'saved' }
  | { status: 'confirmation-required'; conflicts: MealPlanAllergenConflict[] }
  | { status: 'failed' };

interface ProfileState {
  data: UserProfile | null;
  userId: string | null;
  status: LoadState;
  isSaving: boolean;
  error: string | null;
  load: (userId: string, force?: boolean) => Promise<boolean>;
  update: (values: ProfileUpdate) => Promise<boolean>;
  updateDietaryPreferences: (values: DietaryPreferencesUpdate) => Promise<boolean>;
  updateAllergens: (
    allergenIds: string[],
    acknowledgeMealPlanAllergenConflicts?: boolean
  ) => Promise<AllergenUpdateResult>;
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
    const isBackgroundRefresh =
      current.userId === userId && current.status === 'success';
    set({
      data: current.userId === userId ? current.data : null,
      userId,
      // Keep the mounted navigation tree during saves. A forced profile
      // reload happens after editing nutrition values and should not reset
      // the current screen back to the app root.
      status: isBackgroundRefresh ? 'success' : 'loading',
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
          error: getUserErrorMessage(error, translate('profile.error.load')),
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
        error: getUserErrorMessage(error, translate('profile.error.save')),
      });
      return false;
    }
  },

  updateDietaryPreferences: async (values) =>
    saveAndReload(set, get, () => profileApi.updateDietaryPreferences(values)),

  updateAllergens: async (
    allergenIds,
    acknowledgeMealPlanAllergenConflicts = false
  ) => {
    const userId = get().userId;
    if (!userId || get().isSaving) return { status: 'failed' };
    set({ isSaving: true, error: null });
    try {
      const savedNutrition = await profileApi.updateAllergens(
        allergenIds,
        acknowledgeMealPlanAllergenConflicts
      );
      if (get().userId !== userId) {
        set({ isSaving: false });
        return { status: 'failed' };
      }
      set((state) => ({
        data: state.data
          ? {
              ...state.data,
              nutritionProfile: {
                ...(state.data.nutritionProfile ?? {}),
                ...savedNutrition,
                allergenIds: savedNutrition.allergenIds ?? allergenIds,
                allergenSelectionCompleted: true,
              },
            }
          : state.data,
        isSaving: false,
        error: null,
      }));
      return { status: 'saved' };
    } catch (error) {
      if (
        error instanceof AppError &&
        error.code === 'MEAL_PLAN_ALLERGEN_ACKNOWLEDGEMENT_REQUIRED'
      ) {
        set({ isSaving: false, error: null });
        return {
          status: 'confirmation-required',
          conflicts: parseMealPlanAllergenConflicts(error.details),
        };
      }
      set({
        isSaving: false,
        error: getUserErrorMessage(error, translate('profile.error.save')),
      });
      return { status: 'failed' };
    }
  },

  updateNutritionTargets: async (values) =>
    saveAndReload(set, get, () => profileApi.updateNutritionTargets(values)),

  recalculateNutrition: async () =>
    saveAndReload(set, get, () => profileApi.recalculateNutrition()),

  reset: () =>
    set({ data: null, userId: null, status: 'idle', isSaving: false, error: null }),
}));

function parseMealPlanAllergenConflicts(
  details: unknown
): MealPlanAllergenConflict[] {
  if (!Array.isArray(details)) return [];
  return details.flatMap((value) => {
    if (!value || typeof value !== 'object') return [];
    const conflict = value as Record<string, unknown>;
    if (
      typeof conflict.mealId !== 'string' ||
      typeof conflict.mealName !== 'string' ||
      typeof conflict.mealType !== 'string'
    )
      return [];
    const allergens = Array.isArray(conflict.allergens)
      ? conflict.allergens.flatMap((item) => {
          if (!item || typeof item !== 'object') return [];
          const allergen = item as Record<string, unknown>;
          return typeof allergen.id === 'string' &&
            typeof allergen.name === 'string'
            ? [{ id: allergen.id, name: allergen.name }]
            : [];
        })
      : [];
    return [{
      mealId: conflict.mealId,
      mealName: conflict.mealName,
      mealType: conflict.mealType,
      allergens,
    }];
  });
}

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
      error: getUserErrorMessage(error, translate('profile.error.save')),
    });
    return false;
  }
}
