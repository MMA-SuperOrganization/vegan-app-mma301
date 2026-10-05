import { globalTokens } from './designTokens';
const s = globalTokens.spacing;
export const spacing = {
  none: 0,
  xs: s['space/4'],
  sm: s['space/8'],
  md: s['space/12'],
  lg: s['space/16'],
  xl: s['space/20'],
  '2xl': s['space/24'],
  '3xl': s['space/32'],
  '4xl': s['space/40'],
  '5xl': s['space/24'] * 2,
  '6xl': s['space/32'] * 2,
} as const;
export type Spacing = typeof spacing;
