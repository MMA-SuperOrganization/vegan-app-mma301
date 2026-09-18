export const colors = {
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#81C784',

  secondary: '#8BC34A',

  red: '#F44336',
  redDark: '#D32F2F',
  redLight: '#FFCDD2',

  blue: '#2196F3',
  blueDark: '#1976D2',
  blueLight: '#BBDEFB',

  orange: '#FF9800',
  yellow: '#FFC107',

  black: '#000000',
  white: '#FFFFFF',

  gray900: '#212121',
  gray700: '#616161',
  gray500: '#9E9E9E',
  gray300: '#E0E0E0',
  gray200: '#EEEEEE',
  gray100: '#F5F5F5',

  background: '#FFFFFF',
  surface: '#FFFFFF',

  textPrimary: '#212121',
  textSecondary: '#616161',
  textDisabled: '#9E9E9E',

  border: '#E0E0E0',

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
} as const;

export type Colors = typeof colors;
