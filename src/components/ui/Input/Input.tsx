import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import {
  capitalize,
  child,
  containerStyle,
  interactionTokens,
  variantNode,
  typography,
  colors,
} from '@/theme';
export type InputType = 'text' | 'search' | 'password' | 'select';
export type InputState = 'default' | 'focus' | 'filled' | 'error' | 'disabled';
export interface InputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  type?: InputType;
  state?: InputState;
  error?: string | null;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  onSelect?: () => void;
  preview?: boolean;
}
export function Input({
  label,
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
  onSelect,
  onFocus,
  onBlur,
  autoCapitalize = 'none',
  autoCorrect = false,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
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
    { width: '100%' as const },
    !preview && { paddingVertical: 0 },
    preview && { height: surface.height },
  ];
  const a11y = props.accessibilityLabel ?? caption ?? placeholder;
  return (
    <View
      style={[
        node.style,
        preview && { width: node.width, height: node.height },
        style,
      ]}
    >
      {caption ? (
        <Text style={child(node, 'Field label').style}>{caption}</Text>
      ) : null}
      {kind === 'select' ? (
        <Pressable
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
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        >
          <Text
            style={[
              valueNode.style,
              interactionTokens.flexibleText,
              { flex: 1 },
              inputStyle,
            ]}
          >
            {value || placeholder || valueNode.text}
          </Text>
          {icon && (
            <Text accessible={false} style={icon.style}>
              {icon.text}
            </Text>
          )}
        </Pressable>
      ) : (
        <View style={surfaceStyle}>
          <TextInput
            {...props}
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
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
          />
          {icon &&
            (kind === 'password' ? (
              <Pressable
                disabled={blocked}
                onPress={() => setVisible((v) => !v)}
                hitSlop={interactionTokens.iconHitSlop}
                accessibilityRole="button"
                accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                accessibilityState={{ disabled: blocked, selected: visible }}
                aria-pressed={visible}
                aria-disabled={blocked}
              >
                <Text accessible={false} style={icon.style}>
                  {icon.text}
                </Text>
              </Pressable>
            ) : (
              <Text accessible={false} style={icon.style}>
                {icon.text}
              </Text>
            ))}
        </View>
      )}
      {error ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[typography.helper, { color: colors.status.danger }]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
