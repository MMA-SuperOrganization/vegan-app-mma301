import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppIcon, AppText, ScreenWrapper } from '@/components';
import { colors, radius, spacing } from '@/theme';

export function WelcomeScreen() {
  const router = useRouter();
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={styles.screen}
      keyboardAvoiding={false}
    >
      <View>
        <View style={styles.hero}>
          <AppIcon
            name="mam-companion"
            size={190}
            accessibilityLabel="Linh vật Mầm"
          />
          <AppText
            variant="heading4"
            color={colors.primary[700]}
            style={styles.tagline}
          >
            ĂN XANH · SỐNG LÀNH
          </AppText>
        </View>
        <AppText variant="display" style={styles.title}>
          Ăn chay dễ dàng hơn cùng Mầm
        </AppText>
        <AppText
          variant="bodyLarge"
          color={colors.text.secondary}
          style={styles.description}
        >
          Khám phá công thức, quản lý nguyên liệu và lên thực đơn phù hợp với cơ thể
          bạn.
        </AppText>
      </View>
      <View style={styles.actions}>
        <AppButton
          title="Bắt đầu"
          preset="screen"
          onPress={() => router.push('/(auth)/register')}
        />
        <AppButton
          title="Tôi đã có tài khoản"
          variant="secondary"
          preset="screen"
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'space-between', padding: spacing.xl },
  hero: {
    minHeight: 290,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    backgroundColor: colors.background.selected,
    marginBottom: spacing.xl,
  },
  tagline: { marginTop: spacing.md },
  title: { color: colors.text.primary, marginBottom: spacing.md },
  description: { lineHeight: 28 },
  actions: { gap: spacing.lg, marginTop: spacing['2xl'] },
});
