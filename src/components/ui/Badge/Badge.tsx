import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './Badge.styles';
import type { BadgeProps } from './Badge.types';

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  testID,
}) => {
  const variantCapitalized = (variant.charAt(0).toUpperCase() +
    variant.slice(1)) as 'Primary' | 'Secondary' | 'Success' | 'Warning' | 'Danger' | 'Neutral';
  const textVariantKey = `text${variantCapitalized}` as keyof typeof styles;

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        styles[variant],
        style,
      ]}
    >
      <Text style={[styles.text, styles[textVariantKey], textStyle]}>
        {label}
      </Text>
    </View>
  );
};
