import { child, variantNode } from '@/theme';
const n = (v: string, s = 'Default') =>
  variantNode('Button /', `Style=${v}, State=${s}`);
export const styles = {
  base: n('Primary').style,
  text: child(n('Primary'), 'Label').style,
  fullWidth: { alignSelf: 'stretch' as const },
  primary: n('Primary').style,
  primaryPressed: n('Primary', 'Pressed').style,
  primaryText: child(n('Primary'), 'Label').style,
  secondary: n('Secondary').style,
  secondaryPressed: n('Secondary', 'Pressed').style,
  secondaryText: child(n('Secondary'), 'Label').style,
  outline: n('Secondary').style,
  outlinePressed: n('Secondary', 'Pressed').style,
  outlineText: child(n('Secondary'), 'Label').style,
  ghost: n('Ghost').style,
  ghostPressed: n('Ghost', 'Pressed').style,
  ghostText: child(n('Ghost'), 'Label').style,
  disabled: n('Primary', 'Disabled').style,
  disabledText: child(n('Primary', 'Disabled'), 'Label').style,
};
