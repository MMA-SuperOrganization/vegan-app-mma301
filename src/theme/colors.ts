/** Semantic light-theme colors from Figma node 158:542. */
export const colors = {
  primary: {
    50: '#F7F9F3',
    100: '#EFF2E8',
    300: '#C4CDB3',
    500: '#8B9A6E',
    600: '#78875C',
    700: '#66734D',
    900: '#3A432D',
  },
  accent: { orange: '#D98B5F' },
  background: {
    base: '#F7F2EB',
    surface: '#EAE2D6',
    elevated: '#FFFFFF',
    selected: '#EFF2E8',
    disabled: '#F0EEE9',
  },
  text: {
    primary: '#2F3627',
    secondary: '#6F745F',
    tertiary: '#8C8F82',
    disabled: '#A9AA9F',
    inverse: '#FFFFFF',
    link: '#66734D',
  },
  border: {
    default: '#DDD7CC',
    subtle: '#EAE2D6',
    strong: '#B9B3A7',
    focus: '#8B9A6E',
    disabled: '#E6E2DA',
  },
  status: {
    success: '#5D7A3A',
    warning: '#D89A3D',
    danger: '#B5533C',
    info: '#4D7C8A',
  },
  overlay: {
    modal: 'rgba(47, 54, 39, 0.4)',
    image: 'rgba(0, 0, 0, 0.24)',
  },
  rating: { active: '#D89A3D', inactive: '#DDD7CC' },
  common: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
} as const;

export type Colors = typeof colors;
