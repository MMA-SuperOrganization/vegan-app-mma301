import React from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { coreTokens, type AssetName } from '@/theme';
import { AppIcon } from '../AppIcon';

export interface IconButtonProps extends Omit<
  PressableProps,
  'style' | 'children' | 'accessibilityLabel'
> {
  icon: AssetName;
  accessibilityLabel: string;
  size?: number;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
}
/** Screen-pattern back target; callback owns navigation. Other icons reuse its proposed presentation. */
export function IconButton({
  icon,
  size,
  iconSize,
  style,
  disabled = false,
  accessibilityLabel,
  ...props
}: IconButtonProps) {
  const target = coreTokens.back;
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      accessibilityState={{ disabled: !!disabled }}
      aria-disabled={!!disabled}
      style={[
        target.style,
        { width: size ?? target.width, height: size ?? target.height },
        style,
      ]}
    >
      <AppIcon name={icon} size={iconSize ?? target.children[0].width} decorative />
    </Pressable>
  );
}
export function BackButton({
  accessibilityLabel = 'Quay lại',
  ...props
}: Omit<IconButtonProps, 'icon' | 'accessibilityLabel'> & {
  accessibilityLabel?: string;
}) {
  return (
    <IconButton {...props} icon="back" accessibilityLabel={accessibilityLabel} />
  );
}
