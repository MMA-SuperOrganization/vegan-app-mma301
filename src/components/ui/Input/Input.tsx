import { FormField } from '../FormField';
import { AppText } from '../AppText';
import React from 'react';
import { useFieldState, useDisclosure } from '@/hooks';
import {
  View,
  Platform,
  TextInput,
  Pressable,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
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
export type InputType = 'text' | 'search' | 'password' | 'select';
export type InputState = 'default' | 'focus' | 'filled' | 'error' | 'disabled';
export interface InputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  helper?: string;
  required?: boolean;
  type?: InputType;
  state?: InputState;
  error?: string | null;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  onSelect?: () => void;
  preview?: boolean;
  preset?: ComponentPreset;
}
export function Input({
  label,
  helper,
  required,
  type,
  state,
  value,
  onChangeText,
  error,
  disabled = false,
  secureTextEntry = false,
  placeholder,
  style,
  inputStyle,
  preview = false,
  preset = 'master',
  onSelect,
  onFocus,
  onBlur,
  autoCapitalize = 'none',
  autoCorrect = false,
  ...props
}: InputProps) {
  const field = useFieldState();
  const visibility = useDisclosure();
  const focused = field.focused;
  const visible = visibility.isOpen;
  const kind = type ?? (secureTextEntry ? 'password' : 'text');
  const blocked = disabled || props.editable === false || state === 'disabled';
  const current = blocked
    ? 'disabled'
    : error
      ? 'error'
      : (state ?? (focused ? 'focus' : value ? 'filled' : 'default'));
  const node = variantNode(
    'Input /',
    `Type=${capitalize(kind)}, State=${capitalize(current)}`
  );
  const surface = child(node, 'Input surface');
  const valueNode = child(surface, 'Value');
  const icon = surface.children.find((c) => c.name === 'Trailing icon');
  const caption = label ?? (preview ? child(node, 'Field label').text : undefined);
  const surfaceStyle = [
    containerStyle(surface),
    {
      width: '100%' as const,
      flexShrink: 0,
      minHeight: componentPresets[preset].inputHeight,
    },
    preview && { height: surface.height },
  ];
  const webSemantics =
    Platform.OS === 'web'
      ? { 'aria-invalid': current === 'error', 'aria-required': required }
      : {};
  const a11y = props.accessibilityLabel ?? caption ?? placeholder;
  return (
    <FormField
      label={caption}
      helper={helper}
      error={error}
      required={required}
      labelStyle={child(node, 'Field label').style}
      style={[
        node.style,
        preview && { width: node.width, height: node.height },
        style,
      ]}
    >
      {kind === 'select' ? (
        <Pressable
          {...webSemantics}
          testID={props.testID}
          style={surfaceStyle}
          onPress={onSelect}
          disabled={blocked}
          accessibilityRole="button"
          accessibilityLabel={a11y}
          accessibilityHint="Mở lựa chọn"
          accessibilityState={{ disabled: blocked }}
          aria-disabled={blocked}
          onFocus={(e) => {
            field.onFocus();
            onFocus?.(e);
          }}
          onBlur={(e) => {
            field.onBlur();
            onBlur?.(e);
          }}
        >
          <AppText
            style={[
              valueNode.style,
              interactionTokens.flexibleText,
              { flex: 1 },
              inputStyle,
            ]}
          >
            {value || placeholder || valueNode.text}
          </AppText>
          {icon && (
            <AppText accessible={false} style={icon.style}>
              {icon.text}
            </AppText>
          )}
        </Pressable>
      ) : (
        <View style={surfaceStyle}>
          <TextInput
            {...props}
            {...webSemantics}
            accessibilityLabel={a11y}
            accessibilityState={{ disabled: blocked }}
            aria-disabled={blocked}
            accessibilityHint={error ?? props.accessibilityHint}
            style={[
              valueNode.style,
              interactionTokens.flexibleText,
              interactionTokens.inputReset,
              inputStyle,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder ?? (preview ? valueNode.text : undefined)}
            placeholderTextColor={valueNode.style.color}
            secureTextEntry={kind === 'password' && !visible}
            editable={!blocked}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            onFocus={(e) => {
              field.onFocus();
              onFocus?.(e);
            }}
            onBlur={(e) => {
              field.onBlur();
              onBlur?.(e);
            }}
          />
          {icon &&
            (kind === 'password' ? (
              <Pressable
                disabled={blocked}
                onPress={visibility.toggle}
                hitSlop={interactionTokens.iconHitSlop}
                accessibilityRole="button"
                accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                accessibilityState={{ disabled: blocked, selected: visible }}
                aria-pressed={visible}
                aria-disabled={blocked}
              >
                <AppText accessible={false} style={icon.style}>
                  {icon.text}
                </AppText>
              </Pressable>
            ) : (
              <AppText accessible={false} style={icon.style}>
                {icon.text}
              </AppText>
            ))}
        </View>
      )}
    </FormField>
  );
}
