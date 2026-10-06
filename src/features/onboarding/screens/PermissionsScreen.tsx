import { useRouter } from 'expo-router';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components';
import { appConfig } from '@/config';
import { spacing } from '@/theme';
import { useOnboardingStore } from '../onboardingStore';
import { InfoCard } from '../components/InfoCard';
import { OnboardingScreen } from '../components/OnboardingScreen';
import {
  permissionLabel,
  useDevicePermissions,
} from '../hooks/useDevicePermissions';

export function PermissionsScreen() {
  const router = useRouter();
  const complete = useOnboardingStore((state) => state.complete);
  const isSaving = useOnboardingStore((state) => state.isSaving);
  const error = useOnboardingStore((state) => state.error);
  const draft = useOnboardingStore((state) => state.draft);
  const setDraft = useOnboardingStore((state) => state.setDraft);
  const { camera, notifications, requestCamera, requestNotifications } =
    useDevicePermissions();

  const finish = async () => {
    if (await complete()) router.replace('/(tabs)');
  };

  const safelyRequest = async (request: () => Promise<unknown>) => {
    try {
      await request();
    } catch {
      Alert.alert(
        'Không thể xin quyền',
        'Thiết bị hiện không hỗ trợ yêu cầu quyền này.'
      );
    }
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
          onPress={() => void safelyRequest(requestCamera)}
        />
        <AppButton
          title={permissionLabel('thông báo', notifications)}
          variant="secondary"
          disabled={notifications === 'unsupported'}
          onPress={() => void safelyRequest(requestNotifications)}
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
