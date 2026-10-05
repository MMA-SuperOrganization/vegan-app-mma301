import { variantNode } from '@/theme';
const base = variantNode('Card /', 'Type=Recipe, State=Default').style;
const selected = variantNode('Card /', 'Type=Recipe, State=Selected').style;
export const styles = {
  base,
  default: base,
  surface: base,
  accent: selected,
  outlined: base,
};
