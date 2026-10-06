import { AppText } from '../AppText';
import React from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type TextStyle,
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
export type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'ghost' | 'warning' | 'danger';
export type ButtonState = 'default' | 'pressed' | 'loading' | 'disabled';
export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  variant?: ButtonVariant;
  state?: ButtonState;
  loading?: boolean;
  loadingTitle?: string;
  fullWidth?: boolean;
  width?: ViewStyle['width'];
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  preview?: boolean;
  preset?: ComponentPreset;
}
export function Button({
  title,
  variant = 'primary',
  state,
  loading = false,
  loadingTitle = 'Đang xử lý',
  disabled = false,
  fullWidth = true,
  width,
  style,
  textStyle,
  preview = false,
  preset = 'master',
  ...props
}: ButtonProps) {
  const current =
    disabled || state === 'disabled'
      ? 'disabled'
      : loading || state === 'loading'
        ? 'loading'
        : state;
  const blocked = current === 'disabled' || current === 'loading';
  const token = (pressed: boolean) =>
    variantNode(
      'Button /',
      `Style=${capitalize(variant === 'outline' ? 'secondary' : variant)}, State=${capitalize(current ?? (pressed ? 'pressed' : 'default'))}`
    );
  return (
    <Pressable
      {...props}
      disabled={blocked}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? title}
      accessibilityState={{
        ...props.accessibilityState,
        disabled: blocked,
        busy: current === 'loading',
      }}
      aria-busy={current === 'loading'}
      aria-disabled={blocked}
      style={({ pressed }) => [
        containerStyle(token(pressed), preview),
        !preview && { minHeight: componentPresets[preset].buttonHeight },
        !preview && {
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          minWidth: token(pressed).width,
        },
        width !== undefined && { width },
        style,
      ]}
    >
      {({ pressed }) => (
        <AppText
          style={[
            child(token(pressed), 'Label').style,
            interactionTokens.flexibleText,
            textStyle,
          ]}
        >
          {current === 'loading' ? `•••  ${loadingTitle}` : title}
        </AppText>
      )}
    </Pressable>
  );
}
