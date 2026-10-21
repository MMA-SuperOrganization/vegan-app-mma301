import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { AppButton, AppText } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { storage } from '@/services/storage';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
import { reminderApi } from './reminderApi';
import { pushRegistrationKey } from './deviceRegistration';
import { normalizePushRegistrationError } from './pushErrors';

export function DevicePushRegistration() {
  const vi = useTranslation().locale === 'vi';
  const userId = useAuthStore((state) => state.user?.id);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const key = pushRegistrationKey(userId || '');
  useEffect(() => {
    let active = true;
    void storage.getItem(key).then((value) => {
      if (active) setTokenId(value);
    });
    return () => {
      active = false;
    };
  }, [key]);
  const register = useMutation({
    mutationFn: async () => {
      await Notifications.setNotificationChannelAsync('default', {
        name: vi ? 'Nhắc lịch' : 'Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
      const permission = await Notifications.requestPermissionsAsync();
      if (!permission.granted) throw new Error('NOTIFICATION_PERMISSION_REQUIRED');
      const token = await Notifications.getDevicePushTokenAsync().catch(
        (error: unknown) => {
          throw normalizePushRegistrationError(error);
        }
      );
      const result = await reminderApi.registerDevice(String(token.data), 'Android');
      await storage.setItem(key, result.tokenId);
      setTokenId(result.tokenId);
    },
  });
  const unregister = useMutation({
    mutationFn: async () => {
      if (tokenId) await reminderApi.unregisterDevice(tokenId);
      await storage.removeItem(key);
      setTokenId(null);
    },
  });
  if (Platform.OS !== 'android')
    return (
      <AppText>
        {vi
          ? 'Đăng ký push FCM trên bản Android development/release. Nhắc lịch vẫn được lưu trong tài khoản.'
          : 'Register FCM push in the Android development/release app. Reminders are still stored in your account.'}
      </AppText>
    );
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText>
        {tokenId
          ? vi
            ? 'Thiết bị đã đăng ký nhận push.'
            : 'Device registered for push.'
          : vi
            ? 'Bật push để nhận nhắc lịch trên thiết bị này.'
            : 'Enable push to receive reminders on this device.'}
      </AppText>
      <AppButton
        title={
          tokenId
            ? vi
              ? 'Tắt push trên thiết bị này'
              : 'Unregister this device'
            : vi
              ? 'Đăng ký nhận push'
              : 'Register device push'
        }
        variant="outline"
        loading={register.isPending || unregister.isPending}
        onPress={() => (tokenId ? unregister.mutate() : register.mutate())}
      />
      <FeatureState error={register.error || unregister.error} />
    </View>
  );
}
