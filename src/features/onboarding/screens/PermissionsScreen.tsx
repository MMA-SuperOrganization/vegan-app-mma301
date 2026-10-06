import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { Camera } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import { AppButton } from '@/components';
import { appConfig } from '@/config';
import { spacing } from '@/theme';
import { useOnboardingStore } from '../onboardingStore';
import { InfoCard } from '../components/InfoCard';
import { OnboardingScreen } from '../components/OnboardingScreen';

type PermissionState = 'idle' | 'granted' | 'denied' | 'settings';

export function PermissionsScreen() {
  const router = useRouter();
  const complete = useOnboardingStore((state) => state.complete);
  const isSaving = useOnboardingStore((state) => state.isSaving);
  const error = useOnboardingStore((state) => state.error);
  const draft = useOnboardingStore((state) => state.draft);
  const setDraft = useOnboardingStore((state) => state.setDraft);
  const [camera, setCamera] = useState<PermissionState>('idle');
  const [notifications, setNotifications] = useState<PermissionState>('idle');

  useEffect(() => {
    void Camera.getCameraPermissionsAsync()
      .then((result) => {
        if (result.granted) setCamera('granted');
        else if (!result.canAskAgain) setCamera('settings');
      })
      .catch(() => setCamera('idle'));
    void Notifications.getPermissionsAsync()
      .then((result) => {
        if (result.granted) setNotifications('granted');
        else if (!result.canAskAgain) setNotifications('settings');
      })
      .catch(() => setNotifications('idle'));
  }, []);

  const requestCamera = async () => {
    if (camera === 'settings') return Linking.openSettings();
    try {
      const result = await Camera.requestCameraPermissionsAsync();
      setCamera(
        result.granted ? 'granted' : result.canAskAgain ? 'denied' : 'settings'
      );
    } catch {
      Alert.alert(
        'Không thể xin quyền',
        'Thiết bị hiện không hỗ trợ yêu cầu quyền máy ảnh.'
      );
    }
  };

  const requestNotifications = async () => {
    if (notifications === 'settings') return Linking.openSettings();
    try {
      const result = await Notifications.requestPermissionsAsync();
      setNotifications(
        result.granted ? 'granted' : result.canAskAgain ? 'denied' : 'settings'
      );
    } catch {
      Alert.alert(
        'Không thể xin quyền',
        'Thiết bị hiện không hỗ trợ yêu cầu quyền thông báo.'
      );
    }
  };

  const finish = async () => {
    if (await complete()) router.replace('/(tabs)');
  };

  const permissionLabel = (kind: string, state: PermissionState) => {
    if (state === 'granted') return `✓ Đã cho phép ${kind}`;
    if (state === 'settings') return `Mở Cài đặt cho ${kind}`;
    if (state === 'denied') return `Thử lại quyền ${kind}`;
    return `Cho phép ${kind}`;
  };

  return (
    <OnboardingScreen
      title="Quyền truy cập"
      subtitle="Có thể cấp quyền sau khi sử dụng tính năng"
      step={4}
      onBack={() => router.back()}
      onPrimary={finish}
      primaryLabel="Hoàn tất"
      loading={isSaving}
      error={error}
    >
      <View style={styles.actions}>
        <AppButton
          title={permissionLabel('máy ảnh khi nhận diện', camera)}
          variant="secondary"
          onPress={requestCamera}
        />
        <AppButton
          title={permissionLabel('thông báo', notifications)}
          variant="secondary"
          onPress={requestNotifications}
        />
        <AppButton
          title={
            draft.aiProfileConsent
              ? '✓ Đã cho phép dùng hồ sơ cho AI'
              : 'Cho phép dùng hồ sơ cho AI'
          }
          variant="secondary"
          onPress={() => setDraft({ aiProfileConsent: !draft.aiProfileConsent })}
        />
        <InfoCard
          title="Bạn có thể bỏ qua"
          description="Không cấp quyền máy ảnh vẫn có thể thêm nguyên liệu thủ công."
        />
        <AppButton
          title="Chính sách dữ liệu"
          variant="secondary"
          onPress={() =>
            appConfig.privacyPolicyUrl
              ? Linking.openURL(appConfig.privacyPolicyUrl)
              : Alert.alert(
                  'Chưa cấu hình đường dẫn',
                  'Thiết lập EXPO_PUBLIC_PRIVACY_POLICY_URL để mở chính sách dữ liệu.'
                )
          }
        />
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({ actions: { gap: spacing.lg } });
