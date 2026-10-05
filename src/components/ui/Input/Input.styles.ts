import { child, variantNode, typography, colors, interactionTokens } from '@/theme';
const node = (s = 'Default') => variantNode('Input /', `Type=Text, State=${s}`);
const surface = (s = 'Default') => child(node(s), 'Input surface');
export const styles = {
  container: node().style,
  label: child(node(), 'Field label').style,
  inputWrapper: surface().style,
  inputWrapperFocused: surface('Focus').style,
  inputWrapperError: surface('Error').style,
  inputWrapperDisabled: surface('Disabled').style,
  input: child(surface(), 'Value').style,
  toggleButton: {
    minHeight: interactionTokens.minimumTouch,
    justifyContent: 'center' as const,
  },
  toggleText: child(surface(), 'Value').style,
  errorText: { ...typography.helper, color: colors.status.danger },
};
