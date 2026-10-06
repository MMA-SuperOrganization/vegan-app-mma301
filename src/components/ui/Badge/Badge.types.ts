import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type BadgeVariant =
  'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}
