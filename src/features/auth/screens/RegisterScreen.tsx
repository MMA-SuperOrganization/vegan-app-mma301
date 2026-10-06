import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppIcon,
  AppText,
  CustomHeader,
  ScreenWrapper,
} from '@/components';
import { colors, spacing } from '@/theme';

/** Registration API is not available yet; this screen keeps the auth route complete. */
export function RegisterScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <CustomHeader title="Đăng ký" showBack backFallbackHref="/(auth)/login" />
      <View style={styles.content}>
        <AppIcon name="mam-companion" size={120} accessibilityLabel="Linh vật Mầm" />
        <AppText variant="heading2" style={styles.title}>
          Tạo tài khoản VEGETA
        </AppText>
        <AppText
          variant="bodyDefault"
          color={colors.text.secondary}
          style={styles.description}
        >
          Luồng đăng ký đang chờ API backend. Bạn vẫn có thể quay lại đăng nhập bằng
          tài khoản thử nghiệm hiện có.
        </AppText>
        <AppButton
          title="Quay lại đăng nhập"
          variant="secondary"
          onPress={() => router.replace('/(auth)/login')}
          style={styles.action}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
  },
  title: { marginTop: spacing.lg, color: colors.text.primary, textAlign: 'center' },
  description: { marginTop: spacing.sm, textAlign: 'center' },
  action: { marginTop: spacing.xl },
});
