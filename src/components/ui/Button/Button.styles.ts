import { StyleSheet } from 'react-native';
import { colors, radius, sizes, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    minHeight: sizes.button.md,
  },
  fullWidth: {
    width: '100%',
  },

  // Variants
  primary: {
    backgroundColor: colors.primary[700],
  },
  primaryPressed: {
    backgroundColor: colors.primary[900],
  },

  secondary: {
    backgroundColor: colors.accent.orange,
  },
  secondaryPressed: {
    backgroundColor: colors.primary[700],
  },

  outline: {
    backgroundColor: colors.common.transparent,
    borderWidth: 1,
    borderColor: colors.primary[700],
  },
  outlinePressed: {
    backgroundColor: colors.background.selected,
  },

  ghost: {
    backgroundColor: colors.common.transparent,
  },
  ghostPressed: {
    backgroundColor: colors.background.selected,
  },

  disabled: {
    backgroundColor: colors.background.disabled,
    borderColor: colors.border.disabled,
  },

  // Text styles
  text: {
    ...typography.button,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.text.inverse,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  outlineText: {
    color: colors.primary[700],
  },
  ghostText: {
    color: colors.primary[700],
  },
  disabledText: {
    color: colors.text.disabled,
  },
});
