import { storage, storageKeys } from '@/services/storage';
import { parseOnboardingDraft, type OnboardingDraft } from './draftSchema';

const draftKey = (userId: string) => `${storageKeys.onboardingDraftPrefix}${userId}`;

let writeQueue: Promise<void> = Promise.resolve();

export const onboardingDraftStorage = {
  save(userId: string, draft: OnboardingDraft) {
    writeQueue = writeQueue
      .catch(() => undefined)
      .then(() => storage.setItem(draftKey(userId), JSON.stringify(draft)));
  },

  async load(userId: string) {
    await writeQueue.catch(() => undefined);
    return parseOnboardingDraft(await storage.getItem(draftKey(userId)));
  },

  async remove(userId: string) {
    await writeQueue.catch(() => undefined);
    await storage.removeItem(draftKey(userId));
  },
};
