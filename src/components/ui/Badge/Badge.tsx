import { AppText } from '../AppText';
import React from 'react';
import { View } from 'react-native';
import { styles } from './Badge.styles';
import type { BadgeProps } from './Badge.types';

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  selected,
  size = 'md',
  style,
  textStyle,
  testID,
}) => {
  if (selected !== undefined) variant = selected ? 'primary' : 'neutral';
  const variantCapitalized = (variant.charAt(0).toUpperCase() + variant.slice(1)) as
    'Primary' | 'Secondary' | 'Success' | 'Warning' | 'Danger' | 'Neutral';
  const textVariantKey = `text${variantCapitalized}` as keyof typeof styles;

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        selected,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        styles[variant],
        style,
      ]}
    >
      <AppText style={[styles.text, styles[textVariantKey], textStyle]}>
        {label}
      </AppText>
    </View>
  );
};
