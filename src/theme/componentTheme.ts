import type { TextStyle, ViewStyle } from 'react-native';
import { componentTokens } from './designTokens';
import type { DesignNode } from './designTypes';
export function family(prefix: string) {
  const result = componentTokens.find((f) => f.name.startsWith(prefix));
  if (!result) throw new Error(`Unknown design family: ${prefix}`);
  return result;
}
export function variantNode(prefix: string, name: string): DesignNode {
  const result = family(prefix).variants.find((n) => n.name === name);
  if (!result) throw new Error(`Unknown design variant: ${prefix} / ${name}`);
  return result;
}
export function child(node: DesignNode, name: string): DesignNode {
  const result = node.children.find((c) => c.name === name);
  if (!result) throw new Error(`Missing child: ${node.name} / ${name}`);
  return result;
}
export const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);
/** Behavior extensions, distinct from extracted design values. */
export const interactionTokens = {
  minimumTouch: 48,
  chipHitSlop: 4,
  iconHitSlop: 10,
  flexibleText: { flexShrink: 1, minWidth: 0 } satisfies ViewStyle,
  inputReset: { flex: 1, padding: 0, outlineWidth: 0 } satisfies TextStyle,
};
export function containerStyle(node: DesignNode, fixed = false): ViewStyle {
  return {
    ...node.style,
    ...(fixed
      ? { width: node.width, height: node.height }
      : { minHeight: node.height }),
  };
}
