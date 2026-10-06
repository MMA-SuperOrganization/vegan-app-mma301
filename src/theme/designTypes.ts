import type { TextStyle, ViewStyle } from 'react-native';

export interface DesignNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  width: number;
  height: number;
  text?: string;
  style: ViewStyle & TextStyle;
  children: DesignNode[];
}
