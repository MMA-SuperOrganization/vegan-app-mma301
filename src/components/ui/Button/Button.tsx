import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
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
  type AssetName,
} from '@/theme';
import { useTranslation } from '@/i18n';
import { inferButtonIcon } from './buttonIcon';
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
  icon?: AssetName | false;
  iconPosition?: 'start' | 'end';
}
export function Button({
  title,
  variant = 'primary',
  state,
  loading = false,
  loadingTitle,
  disabled = false,
  fullWidth = true,
  width,
  style,
  textStyle,
  preview = false,
  preset = 'master',
  icon,
  iconPosition = 'start',
  ...props
}: ButtonProps) {
  const { t } = useTranslation();
  const visibleLoadingTitle = loadingTitle ?? t('common.processing');
  const current =
    disabled || state === 'disabled'
      ? 'disabled'
      : loading || state === 'loading'
        ? 'loading'
        : state;
  const blocked = current === 'disabled' || current === 'loading';
  const visibleIcon = icon === false ? undefined : icon ?? inferButtonIcon(title);
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
      {({ pressed }) => {
        const labelStyle = child(token(pressed), 'Label').style;
        const iconColor = StyleSheet.flatten(labelStyle)?.color;
        const iconNode =
          visibleIcon && current !== 'loading' ? (
            <AppIcon
              name={visibleIcon}
              size={20}
              color={typeof iconColor === 'string' ? iconColor : undefined}
              decorative
            />
          ) : null;
        return (
          <View style={styles.content}>
            {iconPosition === 'start' ? iconNode : null}
            <AppText
              numberOfLines={2}
              style={[labelStyle, interactionTokens.flexibleText, textStyle]}
            >
              {current === 'loading' ? `•••  ${visibleLoadingTitle}` : title}
            </AppText>
            {iconPosition === 'end' ? iconNode : null}
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 0,
  },
});
