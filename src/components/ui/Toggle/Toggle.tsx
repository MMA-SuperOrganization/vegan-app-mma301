import { AppText } from '../AppText';
import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import {
  capitalize,
  child,
  containerStyle,
  interactionTokens,
  variantNode,
} from '@/theme';
import { DesignNode } from '../DesignNode';

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  state?: 'off' | 'on' | 'disabled';
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  preview?: boolean;
}
export function Toggle({
  value,
  onValueChange,
  label,
  disabled = false,
  state,
  style,
  testID,
  accessibilityLabel,
  preview = false,
}: ToggleProps) {
  const current = disabled ? 'disabled' : (state ?? (value ? 'on' : 'off'));
  const node = variantNode('Control /', `State=${capitalize(current)}`);
  const checked = current === 'on';
  const text = label ?? child(node, 'Label').text;
  return (
    <Pressable
      testID={testID}
      disabled={current === 'disabled'}
      onPress={() => onValueChange(!checked)}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel ?? text}
      accessibilityState={{ checked, disabled: current === 'disabled' }}
      aria-checked={checked}
      aria-disabled={current === 'disabled'}
      style={[
        containerStyle(node, preview),
        { minHeight: interactionTokens.minimumTouch, alignSelf: 'flex-start' },
        style,
      ]}
    >
      <DesignNode node={child(node, 'Track')} fixed={preview} />
      <AppText style={[child(node, 'Label').style, interactionTokens.flexibleText]}>
        {text}
      </AppText>
    </Pressable>
  );
}
