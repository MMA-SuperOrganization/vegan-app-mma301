import { globalTokens, fontNames, masterTypography } from './designTokens';
const t = globalTokens.typography;
import { type TextStyle } from 'react-native';

export const fontFamily = {
  sans: fontNames.Regular,
  regular: fontNames.Regular,
  medium: fontNames.Medium,
  italic: fontNames.Italic,
  semiBold: fontNames.SemiBold,
  bold: fontNames.Bold,
} as const;

export const typography = {
  display: {
    fontFamily: fontFamily.bold,
    fontSize: t['size/36'],
    lineHeight: t['line-height/44'],
  },
  heading1: {
    fontFamily: fontFamily.bold,
    fontSize: t['size/28'],
    lineHeight: t['line-height/36'],
  },
  heading2: {
    fontFamily: fontFamily.semiBold,
    fontSize: t['size/22'],
    lineHeight: t['line-height/30'],
  },
  heading3: {
    fontFamily: fontFamily.semiBold,
    fontSize: t['size/18'],
    lineHeight: t['line-height/26'],
  },
  heading4: {
    fontFamily: fontFamily.semiBold,
    fontSize: t['size/16'],
    lineHeight: t['line-height/24'],
  },
  heading5: {
    fontFamily: fontFamily.semiBold,
    fontSize: t['size/14'],
    lineHeight: t['line-height/20'],
  },
  heading6: {
    fontFamily: fontFamily.semiBold,
    fontSize: t['size/12'],
    lineHeight: t['line-height/16'],
  },
  titleLarge: {
    fontFamily: fontFamily.semiBold,
    fontSize: t['size/18'],
    lineHeight: t['line-height/26'],
  },
  titleSmall: {
    fontFamily: fontFamily.semiBold,
    fontSize: t['size/14'],
    lineHeight: t['line-height/20'],
  },
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: t['size/16'],
    lineHeight: t['line-height/24'],
  },
  bodyDefault: {
    fontFamily: fontFamily.regular,
    fontSize: t['size/14'],
    lineHeight: t['line-height/20'],
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: t['size/13'],
    lineHeight: t['line-height/18'],
  },
  bodyStrong: {
    fontFamily: fontFamily.semiBold,
    fontSize: t['size/14'],
    lineHeight: t['line-height/20'],
  },
  bodyItalic: {
    fontFamily: fontFamily.italic,
    fontSize: t['size/14'],
    lineHeight: t['line-height/20'],
  },
  button: {
    fontFamily: fontFamily.semiBold,
    fontSize: t['size/15'],
    lineHeight: masterTypography['line-height/22'],
  },
  inputLabel: {
    fontFamily: fontFamily.medium,
    fontSize: t['size/14'],
    lineHeight: masterTypography['line-height/22'],
    letterSpacing: 0.014,
  },
  chipLabel: {
    fontFamily: fontFamily.medium,
    fontSize: t['size/13'],
    lineHeight: t['line-height/18'],
  },
  helper: {
    fontFamily: fontFamily.regular,
    fontSize: t['size/12'],
    lineHeight: t['line-height/16'],
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: t['size/12'],
    lineHeight: t['line-height/16'],
  },
  tab: {
    fontFamily: fontFamily.semiBold,
    fontSize: t['size/11'],
    lineHeight: t['line-height/14'],
  },
  overline: {
    fontFamily: fontFamily.semiBold,
    fontSize: t['size/10'],
    lineHeight: t['line-height/14'],
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export type Typography = typeof typography;
