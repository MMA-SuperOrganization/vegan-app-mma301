import { semantic as s } from './designTokens';
/** v2 semantic colors; old public keys remain aliases for compatibility. */
export const colors = {
  primary: {
    50: s['primary/100'],
    100: s['primary/100'],
    300: s['primary/300'],
    500: s['primary/500'],
    600: s['primary/600'],
    700: s['primary/700'],
    800: s['primary/800'],
    900: s['primary/800'],
  },
  accent: { orange: s['accent/orange'], soft: s['accent/soft'] },
  background: {
    base: s['bg/base'],
    surface: s['bg/surface'],
    elevated: s['bg/elevated'],
    muted: s['bg/muted'],
    selected: s['primary/100'],
    disabled: s['bg/muted'],
  },
  text: {
    primary: s['text/primary'],
    secondary: s['text/secondary'],
    tertiary: s['text/secondary'],
    disabled: s['text/disabled'],
    inverse: s['text/inverse'],
    link: s['primary/700'],
  },
  border: {
    default: s['border/default'],
    subtle: s['border/default'],
    strong: s['border/strong'],
    focus: s['border/focus'],
    disabled: s['border/default'],
  },
  icon: { default: s['icon/default'] },
  status: {
    success: s['status/success'],
    warning: s['status/warning'],
    danger: s['status/danger'],
    info: s['status/info'],
  },
  overlay: { modal: 'rgba(24,60,43,0.4)', image: 'rgba(0,0,0,0.24)' },
  rating: { active: s['status/warning'], inactive: s['border/default'] },
  common: { white: s['bg/white'], black: '#000000', transparent: 'transparent' },
} as const;
export type Colors = typeof colors;
