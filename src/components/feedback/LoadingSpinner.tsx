import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type ActivityIndicatorProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, spacing } from '@/theme';

export interface LoadingSpinnerProps {
  size?: ActivityIndicatorProps['size'];
  color?: string;
  text?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function LoadingSpinner({
  size = 'large',
  color = colors.primary[700],
  text,
  style,
  testID,
}: LoadingSpinnerProps) {
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={text ?? 'Đang tải'}
      accessibilityLiveRegion="polite"
      style={[styles.container, style]}
    >
      <ActivityIndicator size={size} color={color} />
      {text ? (
        <AppText
          variant="bodySmall"
          color={colors.text.secondary}
          style={styles.text}
        >
          {text}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  text: { marginTop: spacing.sm, textAlign: 'center' },
});
