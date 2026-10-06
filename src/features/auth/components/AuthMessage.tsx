import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';

export function AuthMessage({
  message,
  success = false,
}: {
  message: string;
  success?: boolean;
}) {
  return (
    <View style={[styles.container, success ? styles.success : styles.error]}>
      <AppText
        variant="bodySmall"
        color={success ? colors.status.success : colors.status.danger}
        style={styles.text}
      >
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  error: {
    borderColor: colors.status.danger,
    backgroundColor: colors.background.surface,
  },
  success: {
    borderColor: colors.status.success,
    backgroundColor: colors.background.selected,
  },
  text: { textAlign: 'center' },
});
