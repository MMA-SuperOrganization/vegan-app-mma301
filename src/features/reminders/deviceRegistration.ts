import { storage } from '@/services/storage';
import { reminderApi } from './reminderApi';
export const pushRegistrationKey = (userId: string) => 'push_registration_' + userId;
export async function unregisterStoredDevice(userId: string) {
  const key = pushRegistrationKey(userId);
  const tokenId = await storage.getItem(key);
  if (!tokenId) return;
  try {
    await reminderApi.unregisterDevice(tokenId);
  } catch (error) {
    // Inactive/deleted accounts cannot receive pushes and may no longer call owner endpoints.
    const status = (error as { status?: number })?.status;
    if (![401, 403, 404].includes(status ?? 0)) throw error;
  }
  await storage.removeItem(key);
}
