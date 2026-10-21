import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '@/features/auth';
import { storage } from '@/services/storage';
import { reminderApi } from './reminderApi';
import { pushRegistrationKey } from './deviceRegistration';

export function PushNotificationBridge() {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    if (Platform.OS !== 'android' || !userId) return;
    let active = true;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    const refresh = () => {
      void client.invalidateQueries({
        queryKey: ['account', userId, 'notifications'],
      });
    };
    const received = Notifications.addNotificationReceivedListener(refresh);
    const tapped = Notifications.addNotificationResponseReceivedListener(() => {
      refresh();
      router.push('/notifications');
    });
    const rotated = Notifications.addPushTokenListener((token) => {
      // Refresh tokens only for a device whose owner explicitly opted in.
      void storage
        .getItem(pushRegistrationKey(userId))
        .then(async (registration) => {
          if (!active || !registration) return;
          const result = await reminderApi.registerDevice(
            String(token.data),
            'Android'
          );
          if (active)
            await storage.setItem(pushRegistrationKey(userId), result.tokenId);
        })
        .catch(() => {
          /* Manual registration on the reminders screen remains retryable. */
        });
    });
    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!active || !response) return;
        refresh();
        router.push('/notifications');
        void Notifications.clearLastNotificationResponseAsync().catch(() => {});
      })
      .catch(() => {});
    return () => {
      active = false;
      received.remove();
      tapped.remove();
      rotated.remove();
    };
  }, [userId, client, router]);
  return null;
}
