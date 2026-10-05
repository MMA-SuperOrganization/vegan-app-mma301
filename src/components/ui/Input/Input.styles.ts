import { StyleSheet } from 'react-native';
import { colors, radius, sizes, spacing, typography } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.inputLabel,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    minHeight: sizes.input.md,
  },
  inputWrapperFocused: {
    borderColor: colors.border.focus,
  },
  inputWrapperError: {
    borderColor: colors.status.danger,
  },
  inputWrapperDisabled: {
    backgroundColor: colors.background.disabled,
    borderColor: colors.border.disabled,
  },
  input: {
    flex: 1,
    ...typography.bodyDefault,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  toggleButton: {
    paddingLeft: spacing.sm,
    paddingVertical: spacing.xs,
  },
  toggleText: {
    ...typography.chipLabel,
    color: colors.primary[700],
  },
  errorText: {
    ...typography.helper,
    color: colors.status.danger,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
