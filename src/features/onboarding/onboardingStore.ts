import { create } from 'zustand';
import { storage, storageKeys } from '@/services/storage';
import { useAuthStore } from '@/features/auth/store/authStore';
import { onboardingDraftStorage } from './draftStorage';
import { onboardingApi } from './onboardingApi';
import {
  initialOnboardingDraft,
  type Allergen,
  type OnboardingDraft,
} from './types';
import { dateInputToIso, parseDecimal, toggleAllergenSelection } from './validation';

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
            : 'Không thể tải danh sách dị nguyên.',
      });
    }
  },

  complete: async () => {
    if (get().isSaving) return false;
    const { draft, draftUserId } = get();
    const dateOfBirth = dateInputToIso(draft.dateOfBirth);
    const heightCm = parseDecimal(draft.heightCm);
    const currentWeightKg = parseDecimal(draft.currentWeightKg);
    if (
      !draft.dietType ||
      !draft.goal ||
      !draft.activityLevel ||
      !draft.allergyAnswered ||
      !dateOfBirth ||
      heightCm === null ||
      currentWeightKg === null
    ) {
      set({ error: 'Thông tin onboarding chưa đầy đủ.' });
      return false;
    }

    set({ isSaving: true, error: null });
    try {
      await onboardingApi.updateProfile(dateOfBirth);
      await onboardingApi.update({
        dietType: draft.dietType,
        goal: draft.goal,
        activityLevel: draft.activityLevel,
        heightCm,
        currentWeightKg,
        allergenIds: draft.allergenIds,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      const status = await onboardingApi.complete();
      if (!status.completed)
        throw new Error('Máy chủ chưa xác nhận hoàn tất onboarding.');
      if (draftUserId) {
        await storage.setItem(
          `${storageKeys.aiProfileConsentPrefix}${draftUserId}`,
          String(draft.aiProfileConsent)
        );
        await onboardingDraftStorage.remove(draftUserId);
      }
      useAuthStore.getState().markOnboardingCompleted();
      set({ isSaving: false, draft: initialOnboardingDraft });
      return true;
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : 'Không thể lưu hồ sơ.',
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
