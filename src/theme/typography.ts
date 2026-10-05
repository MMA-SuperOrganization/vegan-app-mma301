import { Platform, type TextStyle } from 'react-native';

const sansFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'sans-serif',
});

export const fontFamily = {
  sans: sansFont,
  regular: sansFont,
  italic: sansFont,
  semiBold: sansFont,
  bold: sansFont,
} as const;

export const typography = {
  display: {
    fontFamily: fontFamily.sans,
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.3,
  },
  heading1: {
    fontFamily: fontFamily.sans,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.6,
  },
  heading2: {
    fontFamily: fontFamily.sans,
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  heading3: {
    fontFamily: fontFamily.sans,
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 26,
  },
  heading4: {
    fontFamily: fontFamily.sans,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
  },
  heading5: {
    fontFamily: fontFamily.sans,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
  heading6: {
    fontFamily: fontFamily.sans,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
  },
  titleLarge: {
    fontFamily: fontFamily.sans,
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 26,
  },
  titleSmall: {
    fontFamily: fontFamily.sans,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
  bodyLarge: {
    fontFamily: fontFamily.sans,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyDefault: {
    fontFamily: fontFamily.sans,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: fontFamily.sans,
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 18,
  },
  bodyStrong: {
    fontFamily: fontFamily.sans,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
  bodyItalic: {
    fontFamily: fontFamily.sans,
    fontWeight: '400',
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontFamily: fontFamily.sans,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
  },
  inputLabel: {
    fontFamily: fontFamily.sans,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
  },
  chipLabel: {
    fontFamily: fontFamily.sans,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
  },
  helper: {
    fontFamily: fontFamily.sans,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
  },
  tab: {
    fontFamily: fontFamily.sans,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
  },
  overline: {
    fontFamily: fontFamily.sans,
    fontWeight: '600',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export type Typography = typeof typography;
