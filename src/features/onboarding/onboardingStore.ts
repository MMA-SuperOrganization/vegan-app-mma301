import { create } from 'zustand';
import { useAuthStore } from '@/features/auth/store/authStore';
import { completeOnboarding } from './onboardingCompletion';
import { onboardingDraftStorage } from './draftStorage';
import { onboardingApi } from './onboardingApi';
import { useProfileStore } from '@/features/profile/profileStore';
import {
  initialOnboardingDraft,
  type Allergen,
  type OnboardingDraft,
} from './types';
import { toggleAllergenSelection } from './validation';
import { translate } from '@/i18n';

interface OnboardingState {
  draft: OnboardingDraft;
  draftUserId: string | null;
  allergens: Allergen[];
  isHydrating: boolean;
  isLoadingAllergens: boolean;
  isSaving: boolean;
  error: string | null;
  hydrate: (userId: string) => Promise<void>;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  toggleAllergen: (id: string) => void;
  selectNoAllergens: () => void;
  loadAllergens: () => Promise<void>;
  complete: () => Promise<boolean>;
  clearError: () => void;
}

function persist(userId: string | null, draft: OnboardingDraft) {
  if (userId) onboardingDraftStorage.save(userId, draft);
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  draft: initialOnboardingDraft,
  draftUserId: null,
  allergens: [],
  isHydrating: true,
  isLoadingAllergens: false,
  isSaving: false,
  error: null,

  hydrate: async (userId) => {
    if (get().draftUserId === userId && !get().isHydrating) return;
    set({ isHydrating: true, draftUserId: userId, error: null });
    try {
      set({ draft: await onboardingDraftStorage.load(userId) });
    } catch {
      set({ draft: initialOnboardingDraft });
    } finally {
      set({ isHydrating: false });
    }
  },

  setDraft: (patch) =>
    set((state) => {
      const draft = { ...state.draft, ...patch };
      persist(state.draftUserId, draft);
      return { draft, error: null };
    }),

  toggleAllergen: (id) =>
    set((state) => {
      const draft = {
        ...state.draft,
        allergyAnswered: true,
        allergenIds: toggleAllergenSelection(state.draft.allergenIds, id),
      };
      persist(state.draftUserId, draft);
      return { draft, error: null };
    }),

  selectNoAllergens: () =>
    set((state) => {
      const draft = { ...state.draft, allergyAnswered: true, allergenIds: [] };
      persist(state.draftUserId, draft);
      return { draft, error: null };
    }),

  loadAllergens: async () => {
    if (get().isLoadingAllergens) return;
    set({ isLoadingAllergens: true, error: null });
    try {
      set({
        allergens: await onboardingApi.getAllergens(),
        isLoadingAllergens: false,
      });
    } catch (error) {
      set({
        isLoadingAllergens: false,
        error:
          error instanceof Error
            ? error.message
            : translate('onboarding.error.loadAllergens'),
      });
    }
  },

  complete: async () => {
    if (get().isSaving) return false;
    const { draft, draftUserId } = get();
    set({ isSaving: true, error: null });
    try {
      await completeOnboarding(draft, draftUserId);
      useAuthStore.getState().markOnboardingCompleted();
      if (draftUserId && !(await useProfileStore.getState().load(draftUserId, true))) {
        throw new Error(translate('onboarding.error.reloadProfile'));
      }
      set({ isSaving: false, draft: initialOnboardingDraft });
      return true;
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : translate('onboarding.error.saveProfile'),
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
