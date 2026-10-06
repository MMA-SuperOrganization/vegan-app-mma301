import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components';
import { colors, spacing } from '@/theme';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';
import { GoogleMark } from './GoogleMark';

export function GoogleSignInButton() {
  const { start, isLoading } = useGoogleSignIn();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Đăng nhập bằng Google"
      accessibilityState={{ busy: isLoading, disabled: isLoading }}
      disabled={isLoading}
      onPress={start}
      style={({ pressed }) => [
        styles.button,
        (pressed || isLoading) && styles.pressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary[700]} />
      ) : (
        <GoogleMark />
      )}
      <AppText variant="bodyStrong" color={colors.text.primary}>
        Google
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  pressed: { opacity: 0.65 },
});
