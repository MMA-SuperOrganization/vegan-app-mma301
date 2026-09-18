import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { styles } from './Button.styles';
import { colors } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
  testID,
}) => {
  const isDisabled = disabled || loading;

  const getVariantStyle = (pressed: boolean) => {
    if (isDisabled) return styles.disabled;
    switch (variant) {
      case 'secondary':
        return pressed ? styles.secondaryPressed : styles.secondary;
      case 'outline':
        return pressed ? styles.outlinePressed : styles.outline;
      case 'ghost':
        return pressed ? styles.ghostPressed : styles.ghost;
      case 'primary':
      default:
        return pressed ? styles.primaryPressed : styles.primary;
    }
  };

  const getTextStyle = () => {
    if (isDisabled) return styles.disabledText;
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  const loaderColor =
    variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        getVariantStyle(pressed),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={loaderColor} size="small" />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
};
