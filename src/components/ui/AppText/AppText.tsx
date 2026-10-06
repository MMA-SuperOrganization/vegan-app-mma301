import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, textTokens } from '@/theme';

export type AppTextVariant = keyof typeof textTokens;
export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  color?: string;
}
/** Derived text styles or proposed semantic typography; no font scaling cap. */
export function AppText({
  variant = 'bodyDefault',
  color,
  style,
  ...props
}: AppTextProps) {
  const token: TextStyle = textTokens[variant];
  return (
    <Text
      {...props}
      style={[token, { color: color ?? token.color ?? colors.text.primary }, style]}
    />
  );
}
