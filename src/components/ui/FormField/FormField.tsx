import React from 'react';
import { View, type ViewProps, type TextStyle, type StyleProp } from 'react-native';
import { coreTokens } from '@/theme';
import { AppText } from '../AppText';

export interface FormFieldProps extends ViewProps {
  label?: string;
  helper?: string;
  error?: string | null;
  required?: boolean;
  labelStyle?: StyleProp<TextStyle>;
}
/** Proposed form wrapper; caller supplies validation and native input semantics. */
export function FormField({
  label,
  helper,
  error,
  required = false,
  labelStyle,
  style,
  children,
  ...props
}: FormFieldProps) {
  const t = coreTokens.formField;
  return (
    <View {...props} style={[{ gap: t.gap }, style]}>
      {label ? (
        <AppText variant="fieldLabel" style={labelStyle}>
          {label}
          {required ? t.requiredMark : ''}
        </AppText>
      ) : null}
      {children}
      {error || helper ? (
        <AppText
          variant="helper"
          style={t.helper}
          color={error ? t.errorColor : t.helperColor}
          accessibilityRole={error ? 'alert' : undefined}
          accessibilityLiveRegion={error ? 'polite' : undefined}
        >
          {error || helper}
        </AppText>
      ) : null}
    </View>
  );
}
