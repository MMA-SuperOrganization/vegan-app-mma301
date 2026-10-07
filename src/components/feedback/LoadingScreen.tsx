import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ScreenWrapper } from '@/components/layout';
import { LoadingSpinner } from './LoadingSpinner';
import { useTranslation } from '@/i18n';

export interface LoadingScreenProps {
  message?: string;
  withinScreen?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function LoadingScreen({
  message,
  withinScreen = false,
  style,
  testID,
}: LoadingScreenProps) {
  const { t } = useTranslation();
  const visibleMessage = message ?? t('common.loading');
  const spinner = (
    <View style={[styles.container, style]}>
      <LoadingSpinner text={visibleMessage} testID={testID} />
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
