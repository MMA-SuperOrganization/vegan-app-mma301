import { StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing } from '@/theme';

export const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  default: {
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  surface: {
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  accent: {
    backgroundColor: colors.primary[100],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  outlined: {
    backgroundColor: colors.background.base,
    borderWidth: 1,
    borderColor: colors.border.strong,
  },
});
