import type { ViewStyle } from 'react-native';
import { componentTokens } from './designTokens';
const card = componentTokens.find((f) => f.name.startsWith('Card /'))!.variants[0]
  .style;
const masterShadow = { boxShadow: card.boxShadow } satisfies ViewStyle;
/** Compatibility names all resolve to the single v2 card shadow. */
export const shadows = {
  none: {},
  sm: masterShadow,
  md: masterShadow,
  lg: masterShadow,
  modal: masterShadow,
} satisfies Record<string, ViewStyle>;
