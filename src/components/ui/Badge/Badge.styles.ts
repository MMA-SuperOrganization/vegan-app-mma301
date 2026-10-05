import { StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.full,
  },
  // Sizes
  sizeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  sizeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  // Variants
  primary: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[300],
    borderWidth: 1,
  },
  secondary: {
    backgroundColor: colors.background.surface,
    borderColor: colors.border.default,
    borderWidth: 1,
  },
  success: {
    backgroundColor: colors.primary[50],
    borderColor: colors.status.success,
    borderWidth: 1,
  },
  warning: {
    backgroundColor: colors.background.base,
    borderColor: colors.status.warning,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: colors.background.base,
    borderColor: colors.status.danger,
    borderWidth: 1,
  },
  neutral: {
    backgroundColor: colors.background.selected,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  // Text
  text: {
    ...typography.overline,
  },
  textPrimary: {
    color: colors.primary[700],
  },
  textSecondary: {
    color: colors.text.secondary,
  },
  textSuccess: {
    color: colors.status.success,
  },
  textWarning: {
    color: colors.status.warning,
  },
  textDanger: {
    color: colors.status.danger,
  },
  textNeutral: {
    color: colors.text.primary,
  },
});
