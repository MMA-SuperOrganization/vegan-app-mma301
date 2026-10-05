import type { StyleProp, ViewStyle } from 'react-native';
export type CardKind = 'recipe' | 'ingredient' | 'nutrition' | 'reminder';
export type CardVariant = 'default' | 'surface' | 'accent' | 'outlined' | CardKind;
export interface CardProps {
  children?: React.ReactNode;
  variant?: CardVariant;
  type?: CardKind;
  selected?: boolean;
  state?: 'default' | 'selected';
  title?: string;
  subtitle?: string;
  badge?: string;
  thumbnail?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  testID?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  preview?: boolean;
}
