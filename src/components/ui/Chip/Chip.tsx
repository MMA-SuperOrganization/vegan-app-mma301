import { AppText } from '../AppText';
import React from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  componentPresets,
  type ComponentPreset,
  capitalize,
  child,
  containerStyle,
  interactionTokens,
  variantNode,
} from '@/theme';

export type ChipKind = 'default' | 'selected' | 'danger';
export interface ChipProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  kind?: ChipKind;
  selected?: boolean;
  state?: 'default' | 'pressed';
  style?: StyleProp<ViewStyle>;
  preview?: boolean;
  preset?: ComponentPreset;
}
export function Chip({
  label,
  kind = 'default',
  selected,
  state,
  disabled,
  style,
  preview = false,
  preset = 'master',
  ...props
}: ChipProps) {
  const activeKind = selected ? 'selected' : kind;
  const token = (pressed: boolean) =>
    variantNode(
      'Chip /',
      `Kind=${capitalize(activeKind)}, State=${capitalize(state ?? (pressed ? 'pressed' : 'default'))}`
    );
  return (
    <Pressable
      {...props}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityState={{
        ...props.accessibilityState,
        selected: activeKind === 'selected',
        disabled: !!disabled,
      }}
      hitSlop={interactionTokens.chipHitSlop}
      aria-pressed={activeKind === 'selected'}
      aria-disabled={!!disabled}
      style={({ pressed }) => [
        containerStyle(token(pressed), preview),
        !preview && { minHeight: componentPresets[preset].chipHeight },
        { alignSelf: 'flex-start' },
        style,
      ]}
    >
      {({ pressed }) => (
        <AppText
          style={[
            child(token(pressed), 'Label').style,
            interactionTokens.flexibleText,
          ]}
        >
          {label}
        </AppText>
      )}
    </Pressable>
  );
}
