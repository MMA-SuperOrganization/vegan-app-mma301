import { globalTokens } from './designTokens';
const r = globalTokens.radius;
export const radius = {
  none: 0,
  sm: r['radius/sm'],
  md: r['radius/md'],
  lg: r['radius/lg'],
  xl: r['radius/xl'],
  full: r['radius/full'],
} as const;
export type Radius = typeof radius;
