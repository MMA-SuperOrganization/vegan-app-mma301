import type { StyleProp, ViewStyle } from 'react-native';

export type CardVariant = 'default' | 'surface' | 'accent' | 'outlined';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  testID?: string;
}
