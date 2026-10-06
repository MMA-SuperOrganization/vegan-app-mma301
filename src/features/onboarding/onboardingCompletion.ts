import { storage, storageKeys } from '@/services/storage';
import { onboardingApi, type OnboardingPayload } from './onboardingApi';
import { onboardingDraftStorage } from './draftStorage';
import type { OnboardingDraft } from './types';
import { dateInputToIso, parseDecimal } from './validation';

interface ValidatedOnboarding {
  dateOfBirth: string;
  payload: OnboardingPayload;
}

function validateDraft(draft: OnboardingDraft): ValidatedOnboarding {
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
    throw new Error('Thông tin onboarding chưa đầy đủ.');
  }

  return {
    dateOfBirth,
    payload: {
      dietType: draft.dietType,
      goal: draft.goal,
      activityLevel: draft.activityLevel,
      heightCm,
      currentWeightKg,
      allergenIds: draft.allergenIds,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };
}

export async function completeOnboarding(
  draft: OnboardingDraft,
  userId: string | null
) {
  const { dateOfBirth, payload } = validateDraft(draft);
  await onboardingApi.updateProfile(dateOfBirth);
  await onboardingApi.update(payload);

  const status = await onboardingApi.complete();
  if (!status.completed) {
    throw new Error('Máy chủ chưa xác nhận hoàn tất onboarding.');
  }

  if (userId) {
    await storage.setItem(
      `${storageKeys.aiProfileConsentPrefix}${userId}`,
      String(draft.aiProfileConsent)
    );
    await onboardingDraftStorage.remove(userId);
  }
}
