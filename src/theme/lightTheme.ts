import { componentTokens, globalTokens, palette, semantic } from './designTokens';
import { colors } from './colors';
import { radius } from './radius';
import { shadows } from './shadows';
import { sizes } from './sizes';
import { spacing } from './spacing';
import { typography } from './typography';

export const lightTheme = {
  colors,
  palette,
  semantic,
  globalTokens,
  componentTokens,
  spacing,
  radius,
  typography,
  shadows,
  sizes,
} as const;
