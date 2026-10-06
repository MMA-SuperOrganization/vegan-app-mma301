import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ScreenWrapper } from '@/components/layout';
import { LoadingSpinner } from './LoadingSpinner';

export interface LoadingScreenProps {
  message?: string;
  withinScreen?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function LoadingScreen({
  message = 'Đang tải…',
  withinScreen = false,
  style,
  testID,
}: LoadingScreenProps) {
  const spinner = (
    <View style={[styles.container, style]}>
      <LoadingSpinner text={message} testID={testID} />
    </View>
  );

  if (withinScreen) return spinner;

  return (
    <ScreenWrapper
      keyboardAvoiding={false}
      testID={testID ? `${testID}-screen` : undefined}
    >
      {spinner}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
